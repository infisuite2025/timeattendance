import { Router, Request, Response } from 'express';
import { FinalisationService } from './finalisation.service.js';

export const finalisationRouter = Router();

finalisationRouter.get('/periods', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'tenant-demo-001';
    const periods = await FinalisationService.getPeriods(tenantId);
    res.json({ success: true, data: periods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

finalisationRouter.get('/reconciliation/:periodId', async (req: Request, res: Response) => {
  try {
    const { periodId } = req.params;
    const reconciliation = await FinalisationService.getReconciliation(periodId);
    res.json({ success: true, data: reconciliation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

finalisationRouter.post('/recalculate/:periodId', async (req: Request, res: Response) => {
  try {
    const { periodId } = req.params;
    const result = await FinalisationService.recalculatePeriod(periodId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

finalisationRouter.post('/lock', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user?.name || 'Anita Desai (Head of HR)';
    const result = await FinalisationService.lockPeriod(req.body, user);
    res.json({ success: true, data: result, message: 'Pay period successfully locked with cryptographic signature' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

finalisationRouter.post('/export', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user?.name || 'Anita Desai (Head of HR)';
    const result = await FinalisationService.exportPayroll(req.body, user);
    res.json({ success: true, data: result, message: 'Payroll export batch generated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

finalisationRouter.get('/export-history', async (req: Request, res: Response) => {
  try {
    const history = await FinalisationService.getExportHistory();
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
