import { Router, Response } from 'express';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { createRegularisation, decideRegularisation, listExceptions, listRegularisations, resolveException } from '../../database/core-repository.js';

export const exceptionsRouter = Router();

// GET /api/v1/exceptions
exceptionsRouter.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listExceptions(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId);
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
    if (req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, error: { code: 'ERR_FORBIDDEN', message: 'Employees cannot resolve exceptions.' } });
    }
    const exceptionId = String(req.body?.exceptionId || req.body?.id || '');
    const data = await resolveException(req.user?.tenantId || 'ten_acme_001', exceptionId, String(req.body?.action || 'resolve'), req.body?.notes, req.user?.id);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error: any) {
    const status = Number(error.statusCode) || 500;
    res.status(status).json({ success: false, error: { code: status === 404 ? 'ERR_NOT_FOUND' : 'RESOLVE_ERROR', message: error.message } });
  }
});

// GET /api/v1/exceptions/regularisations
exceptionsRouter.get('/regularisations', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listRegularisations(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId);
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
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, error: { code: 'ERR_NO_EMPLOYEE', message: 'This login is not linked to an employee record.' } });
    }
    const data = await createRegularisation(req.user?.tenantId || 'ten_acme_001', employeeId, req.body);
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
    if (req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, error: { code: 'ERR_FORBIDDEN', message: 'Employees cannot approve regularisation requests.' } });
    }
    const data = await decideRegularisation(req.user?.tenantId || 'ten_acme_001', req.params.id, action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent_back', req.user?.id, req.user?.role, comments);
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
    const data: unknown[] = [];
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
