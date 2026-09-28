import { Router, Request, Response } from 'express';
import { HRService } from './hr.service.js';
import { DocumentCategory, AssetCategory, TicketCategory } from '@infi-timepro/shared-types';

export const hrRouter = Router();

// Dashboard summary
hrRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const summary = await HRService.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Onboarding
hrRouter.get('/onboarding', async (req: Request, res: Response) => {
  try {
    const stage = req.query.stage as string;
    const candidates = await HRService.getCandidates(stage);
    res.json({ success: true, data: candidates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

hrRouter.post('/onboarding/candidates/:candidateId/tasks/:taskId/toggle', async (req: Request, res: Response) => {
  try {
    const { candidateId, taskId } = req.params;
    const updated = await HRService.toggleCandidateTask(candidateId, taskId);
    res.json({ success: true, data: updated, message: 'Onboarding task updated' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Documents Vault
hrRouter.get('/documents', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as DocumentCategory;
    const search = req.query.search as string;
    const docs = await HRService.getDocuments(category, search);
    res.json({ success: true, data: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

hrRouter.post('/documents', async (req: Request, res: Response) => {
  try {
    const doc = await HRService.uploadDocument(req.body);
    res.status(201).json({ success: true, data: doc, message: 'Document uploaded and verified' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Assets Management
hrRouter.get('/assets', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as AssetCategory;
    const status = req.query.status as string;
    const assets = await HRService.getAssets(category, status);
    res.json({ success: true, data: assets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

hrRouter.post('/assets/:assetId/allocate', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { employeeId, employeeName, employeeCode } = req.body;
    const asset = await HRService.allocateAsset(assetId, employeeId, employeeName, employeeCode);
    res.json({ success: true, data: asset, message: 'Asset allocated successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

hrRouter.post('/assets/:assetId/return', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { condition } = req.body;
    const asset = await HRService.returnAsset(assetId, condition || 'good');
    res.json({ success: true, data: asset, message: 'Asset return recorded' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Performance Reviews
hrRouter.get('/performance', async (req: Request, res: Response) => {
  try {
    const reviews = await HRService.getPerformanceReviews();
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Helpdesk Tickets
hrRouter.get('/helpdesk', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const category = req.query.category as TicketCategory;
    const tickets = await HRService.getTickets(status, category);
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

hrRouter.post('/helpdesk', async (req: Request, res: Response) => {
  try {
    const ticket = await HRService.createTicket(req.body);
    res.status(201).json({ success: true, data: ticket, message: 'HR service ticket submitted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

hrRouter.post('/helpdesk/:ticketId/resolve', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { resolutionNotes } = req.body;
    const ticket = await HRService.resolveTicket(ticketId, resolutionNotes);
    res.json({ success: true, data: ticket, message: 'Ticket resolved' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});
