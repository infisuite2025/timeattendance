import { describe, it, expect } from 'vitest';
import { FinalisationService } from '../src/modules/finalisation/finalisation.service.js';

describe('InfiTimePro Payroll Finalisation & Cryptographic Locking', () => {
  it('should fetch reconciliation summary and check departmental readiness', async () => {
    const reconciliation = await FinalisationService.getReconciliation('prd-002');

    expect(reconciliation.period).toBeDefined();
    expect(reconciliation.period.periodCode).toBe('PAY-2026-SEP');
    expect(reconciliation.departments.length).toBeGreaterThan(0);
    expect(reconciliation.checkpoints.length).toBe(4);

    const engDept = reconciliation.departments.find(d => d.departmentId === 'dept-eng');
    expect(engDept).toBeDefined();
    expect(engDept?.status).toBe('action_required');
  });

  it('should calculate simulated period recalculations successfully', async () => {
    const recalc = await FinalisationService.recalculatePeriod('prd-002');

    expect(recalc.success).toBe(true);
    expect(recalc.recalculatedRecords).toBeGreaterThan(0);
  });

  it('should cryptographically seal and lock an open attendance period with SHA-256 signature', async () => {
    const lockedPeriod = await FinalisationService.lockPeriod({
      periodId: 'prd-002',
      overrideExceptions: true,
      notes: 'Finalised with HR Executive sign-off'
    }, 'Anita Desai (Head of HR)');

    expect(lockedPeriod.status).toBe('locked');
    expect(lockedPeriod.lockSignature).toBeDefined();
    expect(lockedPeriod.lockSignature?.startsWith('0x')).toBe(true);
    expect(lockedPeriod.lockSignature?.length).toBe(66); // '0x' + 64 hex chars
    expect(lockedPeriod.readinessPercentage).toBe(100);
    expect(lockedPeriod.lockedBy).toBe('Anita Desai (Head of HR)');
  });

  it('should generate payroll export batch referencing cryptographic lock hash', async () => {
    const exportBatch = await FinalisationService.exportPayroll({
      periodId: 'prd-002',
      format: 'xlsx',
      includeOvertimeBreakdown: true,
      includeLopDetails: true
    }, 'Anita Desai (Head of HR)');

    expect(exportBatch.batchId).toBeDefined();
    expect(exportBatch.format).toBe('xlsx');
    expect(exportBatch.lockHash).toBeDefined();
    expect(exportBatch.downloadUrl).toContain('payroll_PAY-2026-SEP_xlsx.xlsx');

    const history = await FinalisationService.getExportHistory();
    expect(history.some(h => h.batchId === exportBatch.batchId)).toBe(true);
  });
});
