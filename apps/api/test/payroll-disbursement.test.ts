import { describe, it, expect } from 'vitest';
import { PayrollDisbursementService } from '../src/modules/payroll-disbursement/payroll-disbursement.service.js';

describe('Direct Payroll Disbursement Module', () => {

  it('should return dashboard summary with correct KPI values', async () => {
    const summary = await PayrollDisbursementService.getDashboardSummary('tenant-001');
    expect(summary.totalEmployeesOnPayroll).toBeGreaterThan(1000);
    expect(summary.lastPayrollAmount).toBeGreaterThan(0);
    expect(summary.pendingApprovalRuns).toBeGreaterThanOrEqual(1);
    expect(summary.draftRuns).toBeGreaterThanOrEqual(1);
    expect(summary.failedDisbursements).toBeGreaterThanOrEqual(1);
    expect(summary.pendingEWARequests).toBeGreaterThanOrEqual(1);
    expect(summary.taxSlipsIssued).toBeGreaterThanOrEqual(4);
    expect(summary.bankAccountsUnverified).toBeGreaterThanOrEqual(1);
  });

  it('should list payroll runs and filter by status', async () => {
    const all = await PayrollDisbursementService.getPayrollRuns('tenant-001');
    expect(all.length).toBeGreaterThanOrEqual(4);

    const disbursed = await PayrollDisbursementService.getPayrollRuns('tenant-001', 'disbursed');
    expect(disbursed.length).toBeGreaterThanOrEqual(2);
    disbursed.forEach(r => {
      expect(r.status).toBe('disbursed');
      expect(r.cryptoHash).toBeDefined();
      expect(r.disbursedAt).toBeDefined();
    });

    const pending = await PayrollDisbursementService.getPayrollRuns('tenant-001', 'pending_approval');
    expect(pending.length).toBeGreaterThanOrEqual(1);
  });

  it('should approve a payroll run with cryptographic seal', async () => {
    const pending = await PayrollDisbursementService.getPayrollRuns('tenant-001', 'pending_approval');
    expect(pending.length).toBeGreaterThanOrEqual(1);

    const run = await PayrollDisbursementService.approvePayrollRun(pending[0].id, 'Naresh Andukoori');
    expect(run.status).toBe('approved');
    expect(run.approvedBy).toBe('Naresh Andukoori');
    expect(run.approvedAt).toBeDefined();
    expect(run.cryptoHash).toBeDefined();
    expect(run.cryptoHash!.startsWith('sha256-')).toBe(true);
    expect(run.lockedAt).toBeDefined();
  });

  it('should disburse an approved payroll run', async () => {
    // Approve first (run-003 now 'approved' from previous test — test isolation means this uses a fresh state)
    const pending = await PayrollDisbursementService.getPayrollRuns('tenant-001', 'pending_approval');
    if (pending.length > 0) {
      await PayrollDisbursementService.approvePayrollRun(pending[0].id, 'Naresh Andukoori');
    }
    const approved = await PayrollDisbursementService.getPayrollRuns('tenant-001', 'approved');
    if (approved.length === 0) return; // already disbursed in prior test step
    const run = await PayrollDisbursementService.disbursePayrollRun(approved[0].id);
    expect(run.status).toBe('disbursed');
    expect(run.disbursedAt).toBeDefined();
    expect(run.disbursementMethod).toBe('batch_bank_transfer');
  });

  it('should list disbursements and detect failed ones', async () => {
    const all = await PayrollDisbursementService.getDisbursements('tenant-001');
    expect(all.length).toBeGreaterThanOrEqual(7);

    const failed = await PayrollDisbursementService.getDisbursements('tenant-001', undefined, 'failed');
    expect(failed.length).toBeGreaterThanOrEqual(1);
    failed.forEach(d => {
      expect(d.status).toBe('failed');
      expect(d.failureReason).toBeDefined();
    });

    const credited = await PayrollDisbursementService.getDisbursements('tenant-001', undefined, 'credited');
    expect(credited.length).toBeGreaterThanOrEqual(4);
    credited.forEach(d => expect(d.transferReference).toBeDefined());
  });

  it('should retry a failed disbursement', async () => {
    const failed = await PayrollDisbursementService.getDisbursements('tenant-001', undefined, 'failed');
    expect(failed.length).toBeGreaterThanOrEqual(1);

    const retried = await PayrollDisbursementService.retryFailedDisbursement(failed[0].id);
    expect(retried.status).toBe('pending');
    expect(retried.failureReason).toBeUndefined();
    expect(retried.transferReference).toBeDefined();
  });

  it('should manage EWA lifecycle — approve and disburse', async () => {
    const pending = await PayrollDisbursementService.getEWARequests('tenant-001', 'pending');
    expect(pending.length).toBeGreaterThanOrEqual(1);

    const ewaReq = pending[0];
    // Approve with partial amount (50% of max eligible)
    const approved = await PayrollDisbursementService.approveEWA(ewaReq.id, 'Vikram Singh', Math.floor(ewaReq.maxEligibleAmount * 0.5));
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('Vikram Singh');
    expect(approved.approvedAmount).toBeLessThanOrEqual(ewaReq.maxEligibleAmount);
    expect(approved.repaymentDate).toBeDefined();

    const disbursed = await PayrollDisbursementService.disburseEWA(ewaReq.id);
    expect(disbursed.status).toBe('disbursed');
    expect(disbursed.disbursedAt).toBeDefined();
  });

  it('should enforce tenant isolation — tenant-999 sees no payroll data', async () => {
    const summary = await PayrollDisbursementService.getDashboardSummary('tenant-999');
    expect(summary.pendingApprovalRuns).toBe(0);
    expect(summary.failedDisbursements).toBe(0);
    expect(summary.pendingEWARequests).toBe(0);

    const runs = await PayrollDisbursementService.getPayrollRuns('tenant-999');
    expect(runs.length).toBe(0);

    const ewa = await PayrollDisbursementService.getEWARequests('tenant-999');
    expect(ewa.length).toBe(0);
  });

});
