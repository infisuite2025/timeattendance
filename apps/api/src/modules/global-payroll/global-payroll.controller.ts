import { Router, Request, Response } from 'express';
import { GlobalPayrollService } from './global-payroll.service.js';

const router = Router();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const summary = GlobalPayrollService.getDashboardSummary(tenantId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Countries & Profiles ─────────────────────────────────────────────────────
router.get('/countries', async (req: Request, res: Response) => {
  try {
    const { cluster } = req.query;
    const countries = GlobalPayrollService.getCountries(cluster as any);
    res.json({ success: true, data: countries, total: countries.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/countries/:code', async (req: Request, res: Response) => {
  try {
    const profile = GlobalPayrollService.getCountryProfile(req.params.code);
    if (!profile) {
      return res.status(404).json({ success: false, error: { message: `Country code ${req.params.code} not supported` } });
    }
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Interactive Payroll Calculator ──────────────────────────────────────────
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { countryCode, grossAnnual, employeeId, basicSalaryPercent, yearsOfService, isNational } = req.body;

    if (!countryCode || grossAnnual === undefined) {
      return res.status(400).json({ success: false, error: { message: 'countryCode and grossAnnual are required' } });
    }

    const result = GlobalPayrollService.calculatePayroll({
      tenantId,
      employeeId: employeeId || 'EMP-TEMP',
      countryCode,
      grossAnnual: Number(grossAnnual),
      basicSalaryPercent: basicSalaryPercent ? Number(basicSalaryPercent) : undefined,
      yearsOfService: yearsOfService ? Number(yearsOfService) : undefined,
      isNational: isNational !== undefined ? Boolean(isNational) : false,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Payroll Runs ─────────────────────────────────────────────────────────────
router.get('/runs', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { countryCode } = req.query;
    const runs = GlobalPayrollService.getPayrollRuns(tenantId, countryCode as string);
    res.json({ success: true, data: runs, total: runs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/runs/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approvedBy } = req.body;
    const run = GlobalPayrollService.approvePayrollRun(req.params.id, approvedBy || 'Admin');
    res.json({ success: true, data: run, message: 'Global payroll run approved successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Statutory Compliance Calendar ───────────────────────────────────────────
router.get('/compliance', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { countryCode } = req.query;
    const calendar = GlobalPayrollService.getComplianceCalendar(tenantId, countryCode as string);
    res.json({ success: true, data: calendar, total: calendar.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/compliance/:id/file', async (req: Request, res: Response) => {
  try {
    const { filedBy } = req.body;
    const item = GlobalPayrollService.fileComplianceItem(req.params.id, filedBy || 'Admin');
    res.json({ success: true, data: item, message: 'Compliance return filed successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export const globalPayrollRouter = router;
