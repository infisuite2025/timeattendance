import { Router, Response } from 'express';
import { ExceptionsService } from './exceptions.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const exceptionsRouter = Router();

// GET /api/v1/exceptions
exceptionsRouter.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const filter = {
      type: req.query.type as string,
      severity: req.query.severity as string,
      status: req.query.status as string,
      search: req.query.search as string
    };
    const data = await ExceptionsService.getExceptions(tenantId, filter);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'EXCEPTIONS_QUERY_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/exceptions/resolve
exceptionsRouter.post('/resolve', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const resolvedBy = req.user?.email || 'admin@infitimepro.com';
    const data = await ExceptionsService.resolveException(tenantId, req.body, resolvedBy);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'RESOLVE_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/exceptions/regularisations
exceptionsRouter.get('/regularisations', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const employeeId = req.query.employeeId as string;
    const data = await ExceptionsService.getRegularisations(tenantId, employeeId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'REGULARISATION_QUERY_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/exceptions/regularisations
exceptionsRouter.post('/regularisations', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const employeeId = req.user?.id || 'emp-001';
    const data = await ExceptionsService.createRegularisation(tenantId, employeeId, req.body);
    res.status(201).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_REGULARISATION_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/exceptions/regularisations/:id/action
exceptionsRouter.post('/regularisations/:id/action', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, comments } = req.body;
    const approverName = req.user?.email || 'Sarah Jenkins';
    const data = await ExceptionsService.actOnRegularisation(req.params.id, action, approverName, comments);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ACTION_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/exceptions/overtime-requests
exceptionsRouter.get('/overtime-requests', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-demo-001';
    const data = await ExceptionsService.getOvertimeRequests(tenantId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'OVERTIME_QUERY_ERROR', message: error.message }
    });
  }
});
