import { Router, Response } from 'express';
import { shiftsService } from './shifts.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { createShiftSwap, decideShiftSwap, getLiveSchedule, listShiftSwaps, listShifts, sendDatabaseError } from '../../database/core-repository.js';

export const shiftsRouter = Router();

shiftsRouter.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listShifts(req.user?.tenantId || 'ten_acme_001');
    res.json({
      success: true,
      data,
      meta: { total: data.length },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

shiftsRouter.post('/', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.createShift(req.body);
  res.status(201).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

shiftsRouter.patch('/:id/status', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const data = shiftsService.updateShiftStatus(req.params.id, status);
  if (!data) {
    return res.status(404).json({ success: false, error: { message: 'Shift not found' } });
  }
  res.json({
    success: true,
    data,
    message: `Shift status updated to ${status}`,
    timestamp: new Date().toISOString(),
  });
});

shiftsRouter.delete('/:id', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const ok = shiftsService.deleteShift(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: { message: 'Shift not found' } });
  }
  res.json({
    success: true,
    message: 'Shift deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

shiftsRouter.get('/groups', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.getShiftGroups();
  res.json({
    success: true,
    data,
    meta: { total: data.length },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

shiftsRouter.post('/groups', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.createShiftGroup(req.body);
  res.status(201).json({
    success: true,
    data,
    message: 'Shift group created successfully',
    timestamp: new Date().toISOString(),
  });
});

shiftsRouter.get('/assignments', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.getShiftAssignments();
  res.json({
    success: true,
    data,
    meta: { total: data.length },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

shiftsRouter.post('/assignments', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.assignShift(req.body);
  res.status(201).json({
    success: true,
    data,
    message: 'Shift assignment saved successfully',
    timestamp: new Date().toISOString(),
  });
});

shiftsRouter.get('/swaps', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listShiftSwaps(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId);
    res.json({
      success: true,
      data,
      meta: { total: data.length },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

shiftsRouter.post('/swaps', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, error: { message: 'This login is not linked to an employee record.' } });
    }
    const data = await createShiftSwap(req.user?.tenantId || 'ten_acme_001', employeeId, req.body);
    res.status(201).json({
      success: true,
      data,
      message: 'Shift swap request submitted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
  }
});

shiftsRouter.patch('/swaps/:id/approve', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === 'EMPLOYEE') {
    return res.status(403).json({ success: false, error: { message: 'Employees cannot decide shift swaps.' } });
  }
  const data = await decideShiftSwap(req.user?.tenantId || 'ten_acme_001', req.params.id, 'approved');
  if (!data) {
    return res.status(404).json({ success: false, error: { message: 'Swap request not found' } });
  }
  res.json({
    success: true,
    data,
    message: 'Shift swap approved successfully',
    timestamp: new Date().toISOString(),
  });
});

shiftsRouter.patch('/swaps/:id/reject', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === 'EMPLOYEE') {
    return res.status(403).json({ success: false, error: { message: 'Employees cannot decide shift swaps.' } });
  }
  const data = await decideShiftSwap(req.user?.tenantId || 'ten_acme_001', req.params.id, 'rejected');
  if (!data) {
    return res.status(404).json({ success: false, error: { message: 'Swap request not found' } });
  }
  res.json({
    success: true,
    data,
    message: 'Shift swap rejected successfully',
    timestamp: new Date().toISOString(),
  });
});

shiftsRouter.get('/schedule-matrix', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await getLiveSchedule(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (error: any) {
    if (sendDatabaseError(res, error)) return;
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

shiftsRouter.put('/schedule-matrix/cell', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const { employeeId, date, shiftCode } = req.body;
  const ok = shiftsService.updateScheduleCell(employeeId, date, shiftCode);
  res.json({
    success: ok,
    message: ok ? 'Schedule updated successfully' : 'Employee or date not found',
    timestamp: new Date().toISOString(),
  });
});
