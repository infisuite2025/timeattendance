import { Router, Response } from 'express';
import { ApprovalsService } from './approvals.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const approvalsRouter = Router();

// GET /api/v1/approvals/inbox
approvalsRouter.get('/inbox', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filter = {
      category: req.query.category as string,
      status: req.query.status as string,
      search: req.query.search as string
    };
    const data = await ApprovalsService.getInbox(filter);
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
    const data = await ApprovalsService.getMetrics();
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
    const approverName = req.user?.email || 'Sarah Jenkins';
    const data = await ApprovalsService.submitDecision(req.body, approverName);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DECISION_ERROR', message: error.message }
    });
  }
});

// POST /api/v1/approvals/bulk-decision
approvalsRouter.post('/bulk-decision', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const approverName = req.user?.email || 'Sarah Jenkins';
    const data = await ApprovalsService.bulkDecision(req.body, approverName);
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
    const data = await ApprovalsService.getHistory();
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
