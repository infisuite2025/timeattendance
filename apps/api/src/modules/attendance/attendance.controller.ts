import { Router, Response } from 'express';
import { attendanceService } from './attendance.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { getLiveAttendance, getMyAttendance, getRecentPunches, getTeamAttendance, sendDatabaseError } from '../../database/core-repository.js';

export const attendanceRouter = Router();

attendanceRouter.get('/recent-punches', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await getRecentPunches(req.user?.tenantId || 'ten_acme_001', req.user?.employeeId, req.user?.role);
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

attendanceRouter.get('/live-stream', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await getLiveAttendance(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId, req.query.date as string | undefined);
    res.json({
      success: true,
      data,
      meta: {
        page: 1,
        limit: 12,
        total: data.length,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

attendanceRouter.get('/days/:id', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = attendanceService.getDayDetail(req.params.id);
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

// GET /api/v1/attendance/my-attendance
attendanceRouter.get('/my-attendance', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId || req.user?.id || '';
    const month = (req.query.month as string) || 'October';
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
    const data = await getMyAttendance(req.user?.tenantId || 'ten_acme_001', employeeId, month, year);

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

// GET /api/v1/attendance/team-attendance
attendanceRouter.get('/team-attendance', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const department = req.query.department as string;
    const data = await getTeamAttendance({
      tenantId: req.user?.tenantId || 'ten_acme_001',
      employeeId: req.user?.employeeId,
      role: req.user?.role,
      date,
      department,
    });

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

