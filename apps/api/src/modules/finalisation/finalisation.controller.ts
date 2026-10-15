import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth-guard.js';
import { listRecords, musterRoll, payPeriod, saveRecord } from '../../database/live-records.js';

export const finalisationRouter = Router();

function tenant(req: AuthenticatedRequest) {
  return req.user?.tenantId || 'ten_acme_001';
}

finalisationRouter.get('/periods', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: [await payPeriod(tenant(req))] });
});

finalisationRouter.get('/reconciliation/:periodId', async (req: AuthenticatedRequest, res: Response) => {
  const period = await payPeriod(tenant(req));
  res.json({ success: true, data: { periodId: req.params.periodId, departments: [], summary: period } });
});

finalisationRouter.post('/recalculate/:periodId', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await payPeriod(tenant(req)) });
});

finalisationRouter.post('/lock', async (req: AuthenticatedRequest, res: Response) => {
  const period = await payPeriod(tenant(req));
  const data = await saveRecord(tenant(req), 'pay_lock', { ...period, status: 'locked', lockedAt: new Date().toISOString() });
  res.json({ success: true, data, message: 'This month is marked locked in InfiTimePro. It does not pay salaries.' });
});

finalisationRouter.post('/export', async (req: AuthenticatedRequest, res: Response) => {
  const period = await payPeriod(tenant(req));
  const roll = await musterRoll(tenant(req), period.startDate, period.endDate);
  const data = await saveRecord(tenant(req), 'payroll_export', {
    periodCode: period.periodCode,
    generatedAt: new Date().toISOString(),
    employeeCount: roll.records.length,
    records: roll.records,
    format: req.body?.format || 'json',
  });
  res.json({ success: true, data, message: 'Attendance export saved. This file is not sent to a bank or payroll vendor.' });
});

finalisationRouter.get('/export-history', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'payroll_export') });
});
