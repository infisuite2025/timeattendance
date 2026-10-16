import { Router, Response } from 'express';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { listRecords, removeRecord, replaceRecord, saveRecord } from '../../database/live-records.js';

export const policiesRouter = Router();

function tenant(req: AuthenticatedRequest) {
  return req.user?.tenantId || 'ten_acme_001';
}

policiesRouter.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  const data = await listRecords(tenant(req), 'policy');
  res.json({ success: true, data, meta: { total: data.length }, timestamp: new Date().toISOString() });
});

policiesRouter.get('/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  const data = (await listRecords<any>(tenant(req), 'policy')).find((item) => item.id === req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Policy not found' });
  res.json({ success: true, data, timestamp: new Date().toISOString() });
});

policiesRouter.post('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  const data = await saveRecord(tenant(req), 'policy', {
    ...req.body,
    status: req.body.status || 'active',
    code: req.body.code || `POL-${Date.now().toString().slice(-6)}`,
    name: req.body.name || 'Attendance policy',
  });
  res.status(201).json({ success: true, data, message: 'Policy created successfully' });
});

policiesRouter.put('/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  const existing = (await listRecords<any>(tenant(req), 'policy')).find((item) => item.id === req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Policy not found' });
  const data = await replaceRecord(tenant(req), 'policy', req.params.id, { ...existing, ...req.body });
  res.json({ success: true, data, message: 'Policy updated successfully' });
});

policiesRouter.delete('/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  const ok = await removeRecord(tenant(req), 'policy', req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Policy not found' });
  res.json({ success: true, message: 'Policy deleted successfully' });
});
