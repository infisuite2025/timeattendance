import { Router, Request, Response } from 'express';
import { FieldForceService } from './field-force.service.js';

const router = Router();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const summary = await FieldForceService.getDashboardSummary(tenantId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Job Sites ────────────────────────────────────────────────────────────────
router.get('/sites', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const sites = await FieldForceService.getJobSites(tenantId, req.query.status as string);
    res.json({ success: true, data: sites, total: sites.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Field Engineers ──────────────────────────────────────────────────────────
router.get('/engineers', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const engineers = await FieldForceService.getFieldEngineers(tenantId, req.query.status as string);
    res.json({ success: true, data: engineers, total: engineers.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Job Orders ───────────────────────────────────────────────────────────────
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { status, assignedEngineerId } = req.query;
    const jobs = await FieldForceService.getJobOrders(tenantId, status as string, assignedEngineerId as string);
    res.json({ success: true, data: jobs, total: jobs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/jobs/:jobId/dispatch', async (req: Request, res: Response) => {
  try {
    const { engineerId, engineerName } = req.body;
    const job = await FieldForceService.dispatchEngineer(req.params.jobId, engineerId, engineerName);
    res.json({ success: true, data: job, message: 'Engineer dispatched and notified via mobile app' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/jobs/:jobId/complete', async (req: Request, res: Response) => {
  try {
    const { notes, rating, partsUsed } = req.body;
    const job = await FieldForceService.completeJob(req.params.jobId, notes || '', rating || 5, partsUsed || []);
    res.json({ success: true, data: job, message: 'Job marked as completed' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Site Check-Ins ───────────────────────────────────────────────────────────
router.get('/check-ins', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const checkIns = await FieldForceService.getSiteCheckIns(tenantId, req.query.jobId as string);
    res.json({ success: true, data: checkIns, total: checkIns.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Vehicles ─────────────────────────────────────────────────────────────────
router.get('/vehicles', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const vehicles = await FieldForceService.getVehicles(tenantId, req.query.status as string);
    res.json({ success: true, data: vehicles, total: vehicles.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Mileage Claims ───────────────────────────────────────────────────────────
router.get('/mileage', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { status, employeeId } = req.query;
    const claims = await FieldForceService.getMileageClaims(tenantId, status as string, employeeId as string);
    res.json({ success: true, data: claims, total: claims.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/mileage/:claimId/approve', async (req: Request, res: Response) => {
  try {
    const { approvedBy } = req.body;
    const claim = await FieldForceService.approveMileageClaim(req.params.claimId, approvedBy || 'Admin');
    res.json({ success: true, data: claim, message: 'Mileage claim approved for reimbursement' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/mileage/:claimId/reject', async (req: Request, res: Response) => {
  try {
    const { approvedBy, rejectionReason } = req.body;
    const claim = await FieldForceService.rejectMileageClaim(req.params.claimId, approvedBy || 'Admin', rejectionReason || '');
    res.json({ success: true, data: claim, message: 'Mileage claim rejected' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export const fieldForceRouter = router;
