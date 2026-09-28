import { Router, Request, Response } from 'express';
import { SuperAdminService } from './superadmin.service.js';

export const superadminRouter = Router();

superadminRouter.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await SuperAdminService.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

superadminRouter.get('/tenants', async (req: Request, res: Response) => {
  try {
    const tenants = await SuperAdminService.getTenants();
    res.json({ success: true, data: tenants });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

superadminRouter.get('/tenants/:id', async (req: Request, res: Response) => {
  try {
    const tenant = await SuperAdminService.getTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, error: { message: 'Tenant not found' } });
    res.json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

superadminRouter.post('/tenants', async (req: Request, res: Response) => {
  try {
    const newTenant = await SuperAdminService.createTenant(req.body);
    res.status(201).json({ success: true, data: newTenant, message: 'Tenant successfully provisioned with dedicated partition' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

superadminRouter.post('/tenants/:id/status', async (req: Request, res: Response) => {
  try {
    const updated = await SuperAdminService.updateStatus({
      tenantId: req.params.id,
      status: req.body.status,
      reason: req.body.reason
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

superadminRouter.post('/tenants/:id/features', async (req: Request, res: Response) => {
  try {
    const { featureKey, enabled } = req.body;
    const updated = await SuperAdminService.toggleFeature(req.params.id, featureKey, enabled);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
