import { Router, Response } from 'express';
import { shiftsService } from './shifts.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const shiftsRouter = Router();

shiftsRouter.get('/', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.getShifts();
  res.json({
    success: true,
    data,
    meta: { total: data.length },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
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

shiftsRouter.get('/swaps', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.getShiftSwaps();
  res.json({
    success: true,
    data,
    meta: { total: data.length },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

shiftsRouter.post('/swaps', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.createShiftSwap(req.body);
  res.status(201).json({
    success: true,
    data,
    message: 'Shift swap request submitted successfully',
    timestamp: new Date().toISOString(),
  });
});

shiftsRouter.patch('/swaps/:id/approve', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.approveShiftSwap(req.params.id);
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

shiftsRouter.patch('/swaps/:id/reject', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.rejectShiftSwap(req.params.id);
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

shiftsRouter.get('/schedule-matrix', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = shiftsService.getScheduleMatrix();
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
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
