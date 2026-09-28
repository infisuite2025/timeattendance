import { Router, Request, Response } from 'express';
import { PayrollDisbursementService } from './payroll-disbursement.service.js';

const router = Router();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const summary = await PayrollDisbursementService.getDashboardSummary(tenantId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Payroll Runs ─────────────────────────────────────────────────────────────
router.get('/runs', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const runs = await PayrollDisbursementService.getPayrollRuns(tenantId, req.query.status as string);
    res.json({ success: true, data: runs, total: runs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/runs/:runId/approve', async (req: Request, res: Response) => {
  try {
    const { approvedBy } = req.body;
    const run = await PayrollDisbursementService.approvePayrollRun(req.params.runId, approvedBy || 'Admin');
    res.json({ success: true, data: run, message: 'Payroll run approved and cryptographically sealed' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/runs/:runId/disburse', async (req: Request, res: Response) => {
  try {
    const run = await PayrollDisbursementService.disbursePayrollRun(req.params.runId);
    res.json({ success: true, data: run, message: 'Payroll disbursement initiated via batch bank transfer' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Disbursements ────────────────────────────────────────────────────────────
router.get('/disbursements', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { payrollRunId, status, employeeId } = req.query;
    const disbursements = await PayrollDisbursementService.getDisbursements(tenantId, payrollRunId as string, status as string, employeeId as string);
    res.json({ success: true, data: disbursements, total: disbursements.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/disbursements/:disbursementId/retry', async (req: Request, res: Response) => {
  try {
    const disb = await PayrollDisbursementService.retryFailedDisbursement(req.params.disbursementId);
    res.json({ success: true, data: disb, message: 'Disbursement queued for retry' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Bank Accounts ────────────────────────────────────────────────────────────
router.get('/bank-accounts', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const accounts = await PayrollDisbursementService.getBankAccounts(tenantId);
    res.json({ success: true, data: accounts, total: accounts.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Tax Slips ────────────────────────────────────────────────────────────────
router.get('/tax-slips', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const slips = await PayrollDisbursementService.getTaxSlips(tenantId, req.query.financialYear as string);
    res.json({ success: true, data: slips, total: slips.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/tax-slips/:slipId/issue', async (req: Request, res: Response) => {
  try {
    const slip = await PayrollDisbursementService.issueTaxSlip(req.params.slipId);
    res.json({ success: true, data: slip, message: 'Tax slip issued and available for download' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── EWA (Early Wage Access) ──────────────────────────────────────────────────
router.get('/ewa', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const requests = await PayrollDisbursementService.getEWARequests(tenantId, req.query.status as string);
    res.json({ success: true, data: requests, total: requests.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/ewa/:ewaId/approve', async (req: Request, res: Response) => {
  try {
    const { approvedBy, approvedAmount } = req.body;
    const request = await PayrollDisbursementService.approveEWA(req.params.ewaId, approvedBy || 'Admin', approvedAmount);
    res.json({ success: true, data: request, message: 'EWA request approved' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/ewa/:ewaId/reject', async (req: Request, res: Response) => {
  try {
    const { approvedBy, rejectionReason } = req.body;
    const request = await PayrollDisbursementService.rejectEWA(req.params.ewaId, approvedBy || 'Admin', rejectionReason || '');
    res.json({ success: true, data: request, message: 'EWA request rejected' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/ewa/:ewaId/disburse', async (req: Request, res: Response) => {
  try {
    const request = await PayrollDisbursementService.disburseEWA(req.params.ewaId);
    res.json({ success: true, data: request, message: 'EWA amount disbursed to employee bank account' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export const payrollDisbursementRouter = router;
