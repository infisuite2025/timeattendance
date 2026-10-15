import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth-guard.js';
import { listRecords, musterRoll, removeRecord, saveRecord } from '../../database/live-records.js';

export const reportsRouter = Router();

const templates = [
  { id: 'muster_roll', name: 'Muster roll', description: 'Present, leave, and hours from saved attendance.' },
  { id: 'late_report', name: 'Late arrivals', description: 'Uses the same saved attendance days.' },
];

function tenant(req: AuthenticatedRequest) {
  return req.user?.tenantId || 'ten_acme_001';
}

reportsRouter.get('/templates', async (_req, res: Response) => {
  res.json({ success: true, data: templates });
});

reportsRouter.post('/generate', async (req: AuthenticatedRequest, res: Response) => {
  const from = String(req.body?.dateFrom || new Date().toISOString().slice(0, 8) + '01');
  const to = String(req.body?.dateTo || new Date().toISOString().slice(0, 10));
  res.json({ success: true, data: await musterRoll(tenant(req), from, to) });
});

reportsRouter.post('/generate/muster-roll', async (req: AuthenticatedRequest, res: Response) => {
  const from = String(req.body?.dateFrom || new Date().toISOString().slice(0, 8) + '01');
  const to = String(req.body?.dateTo || new Date().toISOString().slice(0, 10));
  res.json({ success: true, data: await musterRoll(tenant(req), from, to) });
});

reportsRouter.post('/generate/:reportType', async (req: AuthenticatedRequest, res: Response) => {
  const from = String(req.body?.dateFrom || new Date().toISOString().slice(0, 8) + '01');
  const to = String(req.body?.dateTo || new Date().toISOString().slice(0, 10));
  res.json({ success: true, data: await musterRoll(tenant(req), from, to) });
});

reportsRouter.get('/schedules', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'report_schedule') });
});

reportsRouter.post('/schedules', async (req: AuthenticatedRequest, res: Response) => {
  const data = await saveRecord(tenant(req), 'report_schedule', {
    status: 'saved',
    ...req.body,
    note: 'The schedule is saved. Email delivery is not connected, so it will not send by itself.',
  });
  res.json({ success: true, data });
});

reportsRouter.delete('/schedules/:id', async (req: AuthenticatedRequest, res: Response) => {
  const ok = await removeRecord(tenant(req), 'report_schedule', req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: { message: 'Schedule not found' } });
  res.json({ success: true });
});
