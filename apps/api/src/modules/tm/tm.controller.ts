import { Router, Request, Response } from 'express';
import { TMService } from './tm.service.js';

const router = Router();

// ─── Dashboard ───────────────────────────────────────────────────────────────
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const summary = await TMService.getDashboardSummary(tenantId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Clients ─────────────────────────────────────────────────────────────────
router.get('/clients', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const clients = await TMService.getClients(tenantId);
    res.json({ success: true, data: clients, total: clients.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const client = await TMService.getClientById(tenantId, req.params.clientId);
    if (!client) return res.status(404).json({ success: false, error: { message: 'Client not found' } });
    res.json({ success: true, data: client });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { clientId } = req.query;
    const projects = await TMService.getProjects(tenantId, clientId as string);
    res.json({ success: true, data: projects, total: projects.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/projects/:projectId', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const project = await TMService.getProjectById(tenantId, req.params.projectId);
    if (!project) return res.status(404).json({ success: false, error: { message: 'Project not found' } });
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/projects/:projectId/tasks', async (req: Request, res: Response) => {
  try {
    const tasks = await TMService.getTasksByProject(req.params.projectId);
    res.json({ success: true, data: tasks, total: tasks.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Rate Cards ───────────────────────────────────────────────────────────────
router.get('/rate-cards', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { clientId } = req.query;
    const cards = await TMService.getRateCards(tenantId, clientId as string);
    res.json({ success: true, data: cards, total: cards.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/rate-cards', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const card = await TMService.createRateCard(tenantId, req.body);
    res.status(201).json({ success: true, data: card, message: 'Rate card created successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.put('/rate-cards/:rateCardId', async (req: Request, res: Response) => {
  try {
    const card = await TMService.updateRateCard(req.params.rateCardId, req.body);
    res.json({ success: true, data: card, message: 'Rate card updated successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Timesheets ───────────────────────────────────────────────────────────────
router.get('/timesheets', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { employeeId, projectId, status } = req.query;
    const timesheets = await TMService.getTimesheets(tenantId, employeeId as string, projectId as string, status as string);
    res.json({ success: true, data: timesheets, total: timesheets.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/timesheets', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const entry = await TMService.submitTimesheet(tenantId, req.body);
    res.status(201).json({ success: true, data: entry, message: 'Timesheet entry submitted successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/timesheets/:timesheetId/approve', async (req: Request, res: Response) => {
  try {
    const { approverName } = req.body;
    const entry = await TMService.approveTimesheet(req.params.timesheetId, approverName || 'System');
    res.json({ success: true, data: entry, message: 'Timesheet approved successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/timesheets/:timesheetId/reject', async (req: Request, res: Response) => {
  try {
    const { approverName, rejectionNotes } = req.body;
    const entry = await TMService.rejectTimesheet(req.params.timesheetId, approverName || 'System', rejectionNotes || '');
    res.json({ success: true, data: entry, message: 'Timesheet rejected' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// ─── Invoices ─────────────────────────────────────────────────────────────────
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { clientId, status } = req.query;
    const invoices = await TMService.getInvoices(tenantId, clientId as string, status as string);
    res.json({ success: true, data: invoices, total: invoices.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/invoices/generate', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'tenant-001';
    const { clientId, periodFrom, periodTo } = req.body;
    if (!clientId || !periodFrom || !periodTo) {
      return res.status(400).json({ success: false, error: { message: 'clientId, periodFrom and periodTo are required' } });
    }
    const invoice = await TMService.generateInvoice(tenantId, clientId, periodFrom, periodTo);
    res.status(201).json({ success: true, data: invoice, message: 'Invoice generated successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export const tmRouter = router;
