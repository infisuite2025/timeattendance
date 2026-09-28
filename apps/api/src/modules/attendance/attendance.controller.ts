import { Router, Response } from 'express';
import { attendanceService } from './attendance.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const attendanceRouter = Router();

attendanceRouter.get('/recent-punches', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = attendanceService.getRecentPunches();
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

attendanceRouter.get('/live-stream', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = attendanceService.getLiveAttendanceList();
  res.json({
    success: true,
    data,
    meta: {
      page: 1,
      limit: 12,
      total: 1248,
      totalPages: 104,
    },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
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
attendanceRouter.get('/my-attendance', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.user?.id || 'emp-001';
  const month = (req.query.month as string) || 'September';
  const year = req.query.year ? parseInt(req.query.year as string, 10) : 2026;
  const data = attendanceService.getMyAttendance(employeeId, month, year);

  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

// GET /api/v1/attendance/team-attendance
attendanceRouter.get('/team-attendance', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user?.id || 'emp-001';
  const date = (req.query.date as string) || '2026-09-14';
  const department = req.query.department as string;
  const data = attendanceService.getTeamAttendance(managerId, date, department);

  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

