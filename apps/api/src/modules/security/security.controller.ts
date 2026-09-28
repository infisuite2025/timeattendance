import { Router, Request, Response } from 'express';
import { SecurityService } from './security.service.js';

const router = Router();

// ─── Threat Dashboard ─────────────────────────────────────────────────────────
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const summary = await SecurityService.getThreatSummary(tenantId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Liveness Checks ─────────────────────────────────────────────────────────
router.get('/liveness', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { employeeId, result } = req.query;
    const checks = await SecurityService.getLivenessChecks(tenantId, employeeId as string, result as string);
    res.json({ success: true, data: checks, total: checks.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Spoof Events ─────────────────────────────────────────────────────────────
router.get('/spoof-events', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { status, threatLevel } = req.query;
    const events = await SecurityService.getSpoofEvents(tenantId, status as string, threatLevel as string);
    res.json({ success: true, data: events, total: events.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/spoof-events/:eventId/resolve', async (req: Request, res: Response) => {
  try {
    const { resolvedBy, resolutionNotes } = req.body;
    const event = await SecurityService.resolveSpoofEvent(req.params.eventId, resolvedBy || 'Admin', resolutionNotes || '');
    res.json({ success: true, data: event, message: 'Spoof event resolved successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Device Attestations ──────────────────────────────────────────────────────
router.get('/devices', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { status } = req.query;
    const attestations = await SecurityService.getDeviceAttestations(tenantId, status as string);
    res.json({ success: true, data: attestations, total: attestations.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/devices/:deviceId/revoke', async (req: Request, res: Response) => {
  try {
    const { revokedBy } = req.body;
    const attestation = await SecurityService.revokeDevice(req.params.deviceId, revokedBy || 'Admin');
    res.json({ success: true, data: attestation, message: 'Device revoked from mobile punch registry' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── App Blacklist ─────────────────────────────────────────────────────────────
router.get('/blacklist', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const apps = await SecurityService.getBlacklistedApps(tenantId);
    res.json({ success: true, data: apps, total: apps.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/blacklist', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const app = await SecurityService.addToBlacklist(tenantId, req.body);
    res.status(201).json({ success: true, data: app, message: 'App added to blacklist' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

const handleToggleApp = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const app = await SecurityService.toggleBlacklistEntry(req.params.appId, isActive);
    res.json({ success: true, data: app, message: `App ${isActive ? 'reactivated' : 'deactivated'} in blacklist` });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

router.patch('/blacklist/:appId/toggle', handleToggleApp);
router.post('/blacklist/:appId/toggle', handleToggleApp);

export const securityRouter = router;
