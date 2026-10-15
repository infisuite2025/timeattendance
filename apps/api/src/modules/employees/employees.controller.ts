import { Router, Response } from 'express';
import { employeesService } from './employees.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { sendDatabaseError } from '../../database/core-repository.js';

export const employeesRouter = Router();

employeesRouter.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, departmentId, locationId, status } = req.query as {
      search?: string;
      departmentId?: string;
      locationId?: string;
      status?: string;
    };

    const data = await employeesService.getEmployees(req.user?.tenantId || 'ten_acme_001', { search, departmentId, locationId, status });
    res.json({
      success: true,
      data,
      meta: {
        total: data.length,
        page: 1,
        limit: 50,
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

employeesRouter.get('/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  let data;
  try {
    data = await employeesService.getEmployeeById(req.user?.tenantId || 'ten_acme_001', req.params.id);
  } catch (err) {
    if (!sendDatabaseError(res, err)) {
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: (err as Error).message } });
    }
    return;
  }
  if (!data) {
    return res.status(404).json({
      success: false,
      error: { code: 'ERR_NOT_FOUND', message: 'Employee not found' },
    });
  }
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

employeesRouter.post('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await employeesService.createEmployee(req.user?.tenantId || 'ten_acme_001', req.body);
    res.status(201).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err: any) {
    const status = err.message?.includes('Duplicate') ? 409 : 400;
    res.status(status).json({
      success: false,
      error: {
        code: status === 409 ? 'ERR_DUPLICATE_PROFILE' : 'ERR_VALIDATION_FAILED',
        message: err.message || 'Failed to create employee profile',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

employeesRouter.put('/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await employeesService.updateEmployee(req.user?.tenantId || 'ten_acme_001', req.params.id, req.body);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'ERR_UPDATE_FAILED',
        message: err.message || 'Failed to update employee profile',
      },
      timestamp: new Date().toISOString(),
    });
  }
});
