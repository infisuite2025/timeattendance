import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth-guard.js';
import { listRecords, removeRecord, replaceRecord, saveRecord } from '../../database/live-records.js';

export const leavesRouter = Router();

function tenant(req: AuthenticatedRequest) {
  return req.user?.tenantId || 'ten_acme_001';
}

leavesRouter.get('/types', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'leave_type') });
});

leavesRouter.post('/types', async (req: AuthenticatedRequest, res: Response) => {
  const data = await saveRecord(tenant(req), 'leave_type', req.body);
  res.json({ success: true, data, message: 'Leave type saved' });
});

leavesRouter.put('/types/:id', async (req: AuthenticatedRequest, res: Response) => {
  const existing = (await listRecords<any>(tenant(req), 'leave_type')).find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: { message: 'Leave type not found' } });
  const data = await replaceRecord(tenant(req), 'leave_type', req.params.id, { ...existing, ...req.body });
  res.json({ success: true, data });
});

leavesRouter.delete('/types/:id', async (req: AuthenticatedRequest, res: Response) => {
  const ok = await removeRecord(tenant(req), 'leave_type', req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: { message: 'Leave type not found' } });
  res.json({ success: true });
});

leavesRouter.get('/exemption-profiles', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'leave_exemption') });
});

leavesRouter.post('/exemption-profiles', async (req: AuthenticatedRequest, res: Response) => {
  const data = await saveRecord(tenant(req), 'leave_exemption', req.body);
  res.json({ success: true, data });
});

leavesRouter.put('/exemption-profiles/:id', async (req: AuthenticatedRequest, res: Response) => {
  const existing = (await listRecords<any>(tenant(req), 'leave_exemption')).find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
  res.json({ success: true, data: await replaceRecord(tenant(req), 'leave_exemption', req.params.id, { ...existing, ...req.body }) });
});

leavesRouter.delete('/exemption-profiles/:id', async (req: AuthenticatedRequest, res: Response) => {
  const ok = await removeRecord(tenant(req), 'leave_exemption', req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
  res.json({ success: true });
});

leavesRouter.get('/balances', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'leave_balance') });
});

leavesRouter.post('/encashment/calculate', async (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      amount: 0,
      message: 'Leave encashment needs a salary rate for each employee. No salary rates are stored yet, so the cash value is 0.',
    },
  });
});
