import { Router, Response } from 'express';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { approvalMetrics, decideRegularisation, listApprovalHistory, listApprovalInbox } from '../../database/core-repository.js';

export const approvalsRouter = Router();

// GET /api/v1/approvals/inbox
approvalsRouter.get('/inbox', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listApprovalInbox(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INBOX_QUERY_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/approvals/metrics
approvalsRouter.get('/metrics', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await approvalMetrics(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'METRICS_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/approvals/decision
approvalsRouter.post('/decision', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, error: { code: 'ERR_FORBIDDEN', message: 'Employees cannot approve requests.' } });
    }
    const data = await decideRegularisation(
      req.user?.tenantId || 'ten_acme_001',
      req.body.approvalId,
      req.body.decision,
      req.user?.id,
      req.user?.role,
      req.body.comments
    );
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    const status = Number(error.statusCode) || 500;
    res.status(status).json({
      success: false,
      error: { code: status === 404 ? 'ERR_NOT_FOUND' : 'DECISION_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/approvals/bulk-decision
approvalsRouter.post('/bulk-decision', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, error: { code: 'ERR_FORBIDDEN', message: 'Employees cannot approve requests.' } });
    }
    const ids: string[] = Array.isArray(req.body?.approvalIds) ? req.body.approvalIds : [];
    let count = 0;
    for (const id of ids) {
      await decideRegularisation(req.user?.tenantId || 'ten_acme_001', id, req.body.decision, req.user?.id, req.user?.role, req.body.comments);
      count += 1;
    }
    const data = { count };
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'BULK_DECISION_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/approvals/history
approvalsRouter.get('/history', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listApprovalHistory(req.user?.tenantId || 'ten_acme_001', req.user?.role, req.user?.employeeId);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'HISTORY_ERROR', message: error.message }
    });
  }
});
