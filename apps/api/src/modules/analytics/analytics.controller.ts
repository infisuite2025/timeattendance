import { Router, Response } from 'express';
import { analyticsService } from './analytics.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { getDashboardSummary, getHourlyTrend, getLocationDistribution, sendDatabaseError } from '../../database/core-repository.js';

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard-summary', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const location = req.query.location as string | undefined;
    const date = req.query.date as string | undefined;
    const data = await getDashboardSummary(req.user?.tenantId || 'ten_acme_001', location, date);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

analyticsRouter.get('/hourly-trend', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const location = req.query.location as string | undefined;
    const data = await getHourlyTrend(req.user?.tenantId || 'ten_acme_001', location, req.query.date as string | undefined);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

analyticsRouter.get('/location-distribution', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await getLocationDistribution(req.user?.tenantId || 'ten_acme_001');
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

analyticsRouter.get('/attention-required', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = analyticsService.getAttentionRequired();
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

analyticsRouter.get('/system-status', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = analyticsService.getSystemStatus();
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});
