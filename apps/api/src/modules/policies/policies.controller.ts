import { Router, Response } from 'express';
import { policyEngineService } from './policy-engine.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const policiesRouter = Router();

policiesRouter.get('/', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = policyEngineService.getPolicies();
  res.json({
    success: true,
    data,
    meta: { total: data.length },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

policiesRouter.get('/:id', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = policyEngineService.getPolicyById(req.params.id);
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

policiesRouter.post('/', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = policyEngineService.createPolicy(req.body);
  res.status(201).json({
    success: true,
    data,
    message: 'Policy created successfully',
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

policiesRouter.put('/:id', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const data = policyEngineService.updatePolicy(req.params.id, req.body);
  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  }
  res.json({
    success: true,
    data,
    message: 'Policy updated successfully',
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

policiesRouter.delete('/:id', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const ok = policyEngineService.deletePolicy(req.params.id);
  if (!ok) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  }
  res.json({
    success: true,
    message: 'Policy deleted successfully',
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});

policiesRouter.post('/evaluate', authGuard, (req: AuthenticatedRequest, res: Response) => {
  const result = policyEngineService.evaluatePolicy(req.body);
  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  });
});
