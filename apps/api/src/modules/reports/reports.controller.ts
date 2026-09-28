import { Router, Request, Response } from 'express';
import { ReportsService } from './reports.service.js';

export const reportsRouter = Router();

reportsRouter.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await ReportsService.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

reportsRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { reportType, ...filters } = req.body;
    const reportData = await ReportsService.generateReport(reportType || 'muster_roll', filters);
    res.json({ success: true, data: reportData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

reportsRouter.post('/generate/muster-roll', async (req: Request, res: Response) => {
  try {
    const filters = req.body;
    const reportData = await ReportsService.generateMusterRoll(filters);
    res.json({ success: true, data: reportData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

reportsRouter.post('/generate/:reportType', async (req: Request, res: Response) => {
  try {
    const { reportType } = req.params;
    const filters = req.body;
    const reportData = await ReportsService.generateReport(reportType, filters);
    res.json({ success: true, data: reportData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

reportsRouter.get('/schedules', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'tenant-demo-001';
    const schedules = await ReportsService.getSchedules(tenantId);
    res.json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

reportsRouter.post('/schedules', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'tenant-demo-001';
    const schedule = await ReportsService.createSchedule({ ...req.body, tenantId });
    res.json({ success: true, data: schedule, message: 'Automated report schedule created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

reportsRouter.delete('/schedules/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string) || 'tenant-001';
    const ok = await ReportsService.deleteSchedule(req.params.id, tenantId);
    if (!ok) return res.status(404).json({ success: false, error: { message: 'Schedule not found or tenant unauthorized' } });
    res.json({ success: true, message: 'Automated report schedule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
