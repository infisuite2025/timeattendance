import { Router, Response, Request } from 'express';
import { organizationService } from './organization.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { listDepartments, listLocations, sendDatabaseError } from '../../database/core-repository.js';

export const organizationRouter = Router();

organizationRouter.get('/locations', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as AuthenticatedRequest).user?.tenantId || 'ten_acme_001';
    const data = await listLocations(tenantId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

organizationRouter.get('/departments', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as AuthenticatedRequest).user?.tenantId || 'ten_acme_001';
    const data = await listDepartments(tenantId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

organizationRouter.get('/settings', (req: Request, res: Response) => {
  try {
    const data = organizationService.getSettings();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

organizationRouter.post('/settings', (req: Request, res: Response) => {
  try {
    const data = organizationService.updateSettings(req.body);
    res.json({ success: true, data, message: 'Organization settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

organizationRouter.get('/admin-users', (req: Request, res: Response) => {
  try {
    const data = organizationService.getAdminUsers();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

organizationRouter.post('/admin-users', (req: Request, res: Response) => {
  try {
    const data = organizationService.inviteAdminUser(req.body);
    res.json({ success: true, data, message: 'Administrative user invitation sent' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

organizationRouter.put('/admin-users/:id', (req: Request, res: Response) => {
  try {
    const { role, status } = req.body;
    const data = organizationService.updateAdminUserRole(req.params.id, role, status);
    res.json({ success: true, data, message: 'User role & permissions updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

organizationRouter.get('/quotas', (req: Request, res: Response) => {
  try {
    const data = organizationService.getQuotas();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

organizationRouter.post('/quotas', (req: Request, res: Response) => {
  try {
    const data = organizationService.updateQuotas(req.body);
    res.json({ success: true, data, message: 'Tenant quota capacity parameters updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});


