import { Router, Response } from 'express';
import { analyticsService } from './analytics.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard-summary', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const location = req.query.location as string | undefined;
  const date = req.query.date as string | undefined;
  const data = analyticsService.getDashboardSummary(location, date);
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

analyticsRouter.get('/hourly-trend', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const location = req.query.location as string | undefined;
  const data = analyticsService.getHourlyTrend(location);
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

analyticsRouter.get('/location-distribution', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = analyticsService.getLocationDistribution();
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
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
