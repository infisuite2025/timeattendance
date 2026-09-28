import { Router, Request, Response } from 'express';
import { LeavesService } from './leaves.service.js';

export const leavesRouter = Router();

leavesRouter.get('/types', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-demo-001';
    const data = await LeavesService.getLeaveTypes(tenantId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.post('/types', async (req: Request, res: Response) => {
  try {
    const data = await LeavesService.createLeaveType(req.body);
    res.json({ success: true, data, message: 'Leave policy type created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.put('/types/:id', async (req: Request, res: Response) => {
  try {
    const data = await LeavesService.updateLeaveType(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, error: { message: 'Leave type not found' } });
    }
    res.json({ success: true, data, message: 'Leave policy type updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.delete('/types/:id', async (req: Request, res: Response) => {
  try {
    const ok = await LeavesService.deleteLeaveType(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: { message: 'Leave type not found' } });
    }
    res.json({ success: true, message: 'Leave policy type deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.get('/exemption-profiles', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-demo-001';
    const data = await LeavesService.getExemptionProfiles(tenantId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.post('/exemption-profiles', async (req: Request, res: Response) => {
  try {
    const data = await LeavesService.createExemptionProfile(req.body);
    res.json({ success: true, data, message: 'Executive attendance exemption profile created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.put('/exemption-profiles/:id', async (req: Request, res: Response) => {
  try {
    const data = await LeavesService.updateExemptionProfile(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, error: { message: 'Exemption profile not found' } });
    }
    res.json({ success: true, data, message: 'Executive exemption profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.delete('/exemption-profiles/:id', async (req: Request, res: Response) => {
  try {
    const ok = await LeavesService.deleteExemptionProfile(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: { message: 'Exemption profile not found' } });
    }
    res.json({ success: true, message: 'Executive exemption profile deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.get('/balances', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-demo-001';
    const data = await LeavesService.getBalances(tenantId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

leavesRouter.post('/encashment/calculate', async (req: Request, res: Response) => {
  try {
    const calculation = LeavesService.calculateEncashment(req.body);
    res.json({ success: true, data: calculation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
