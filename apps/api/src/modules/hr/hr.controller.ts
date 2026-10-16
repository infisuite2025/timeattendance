import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth-guard.js';
import { listRecords, replaceRecord, saveRecord } from '../../database/live-records.js';
import { pool } from '../../database/db.js';
import type { RowDataPacket } from 'mysql2';

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../uploads');
const allowedExtensions = new Set(['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx']);

export const hrRouter = Router();

function tenant(req: AuthenticatedRequest) {
  return req.user?.tenantId || 'ten_acme_001';
}

hrRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  const tenantId = tenant(req);
  const [employees] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM tp_employees WHERE tenant_id = ? AND deleted_at IS NULL`,
    [tenantId]
  );
  const candidates = await listRecords<any>(tenantId, 'hr_candidate');
  const assets = await listRecords<any>(tenantId, 'hr_asset');
  const documents = await listRecords<any>(tenantId, 'hr_document');
  const reviews = await listRecords<any>(tenantId, 'hr_review');
  const tickets = await listRecords<any>(tenantId, 'hr_ticket');
  res.json({
    success: true,
    data: {
      totalActiveEmployees: Number(employees[0]?.total || 0),
      activeOnboardings: candidates.filter((item) => item.stage !== 'completed').length,
      completedOnboardingsThisMonth: candidates.filter((item) => item.stage === 'completed').length,
      totalAssetsManaged: assets.length,
      allocatedAssets: assets.filter((item) => item.status === 'allocated').length,
      availableAssets: assets.filter((item) => item.status === 'available').length,
      expiringDocumentsNext30Days: documents.filter((item) => item.expiryStatus === 'expiring_soon' || item.expiryStatus === 'expired').length,
      activeAppraisalCycles: reviews.filter((item) => item.cycleStatus !== 'completed').length,
      openHelpdeskTickets: tickets.filter((item) => item.status === 'open' || item.status === 'in_progress').length,
      averageResolutionHours: 0,
    },
  });
});

hrRouter.get('/onboarding', async (req: AuthenticatedRequest, res: Response) => {
  const stage = String(req.query.stage || '');
  let data = await listRecords<any>(tenant(req), 'hr_candidate');
  if (stage && stage !== 'all') data = data.filter((item) => item.stage === stage);
  res.json({ success: true, data });
});

hrRouter.post('/onboarding', async (req: AuthenticatedRequest, res: Response) => {
  const data = await saveRecord(tenant(req), 'hr_candidate', { stage: 'documentation', progressPercent: 0, tasks: [], ...req.body });
  res.status(201).json({ success: true, data });
});

hrRouter.post('/onboarding/candidates/:candidateId/tasks/:taskId/toggle', async (req: AuthenticatedRequest, res: Response) => {
  const candidates = await listRecords<any>(tenant(req), 'hr_candidate');
  const candidate = candidates.find((item) => item.id === req.params.candidateId);
  if (!candidate) return res.status(404).json({ success: false, error: { message: 'Candidate not found' } });
  candidate.tasks = (candidate.tasks || []).map((task: any) => task.id === req.params.taskId ? { ...task, completed: !task.completed } : task);
  const done = candidate.tasks.filter((task: any) => task.completed).length;
  candidate.progressPercent = candidate.tasks.length ? Math.round((done / candidate.tasks.length) * 100) : 0;
  const data = await replaceRecord(tenant(req), 'hr_candidate', candidate.id, candidate);
  res.json({ success: true, data });
});

hrRouter.get('/documents', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'hr_document') });
});

hrRouter.post('/documents', async (req: AuthenticatedRequest, res: Response) => {
  const encoded = String(req.body?.fileBase64 || '');
  const originalName = String(req.body?.fileName || 'document.pdf');
  const extension = (originalName.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!encoded) {
    return res.status(400).json({ success: false, error: { message: 'Choose a file to store on the server.' } });
  }
  if (!allowedExtensions.has(extension)) {
    return res.status(400).json({ success: false, error: { message: 'Use a PDF, Word, or image file.' } });
  }
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length || bytes.length > 8 * 1024 * 1024) {
    return res.status(400).json({ success: false, error: { message: 'The file must be under 8 MB.' } });
  }
  fs.mkdirSync(uploadDir, { recursive: true });
  const storedName = `${crypto.randomUUID()}.${extension}`;
  fs.writeFileSync(path.join(uploadDir, storedName), bytes);
  const { fileBase64: _ignored, ...details } = req.body || {};
  const data = await saveRecord(tenant(req), 'hr_document', {
    uploadedAt: new Date().toISOString(),
    expiryStatus: 'valid',
    ...details,
    fileName: originalName,
    storedName,
  });
  res.status(201).json({ success: true, data, message: 'Document saved on the server.' });
});

hrRouter.get('/documents/:id/file', async (req: AuthenticatedRequest, res: Response) => {
  const documents = await listRecords<any>(tenant(req), 'hr_document');
  const document = documents.find((item) => item.id === req.params.id);
  const storedName = String(document?.storedName || '');
  if (!document || !storedName || storedName.includes('..') || storedName.includes('/') || storedName.includes('\\')) {
    return res.status(404).json({ success: false, error: { message: 'File not found.' } });
  }
  const fullPath = path.join(uploadDir, storedName);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ success: false, error: { message: 'File not found.' } });
  }
  res.download(fullPath, String(document.fileName || storedName));
});

hrRouter.get('/assets', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'hr_asset') });
});

hrRouter.post('/assets', async (req: AuthenticatedRequest, res: Response) => {
  const data = await saveRecord(tenant(req), 'hr_asset', { status: 'available', ...req.body });
  res.status(201).json({ success: true, data });
});

hrRouter.post('/assets/:assetId/allocate', async (req: AuthenticatedRequest, res: Response) => {
  const assets = await listRecords<any>(tenant(req), 'hr_asset');
  const asset = assets.find((item) => item.id === req.params.assetId);
  if (!asset) return res.status(404).json({ success: false, error: { message: 'Asset not found' } });
  const data = await replaceRecord(tenant(req), 'hr_asset', asset.id, { ...asset, status: 'allocated', ...req.body });
  res.json({ success: true, data });
});

hrRouter.post('/assets/:assetId/return', async (req: AuthenticatedRequest, res: Response) => {
  const assets = await listRecords<any>(tenant(req), 'hr_asset');
  const asset = assets.find((item) => item.id === req.params.assetId);
  if (!asset) return res.status(404).json({ success: false, error: { message: 'Asset not found' } });
  const data = await replaceRecord(tenant(req), 'hr_asset', asset.id, { ...asset, status: 'available', condition: req.body?.condition || 'good' });
  res.json({ success: true, data });
});

hrRouter.get('/performance', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'hr_review') });
});

hrRouter.get('/helpdesk', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: await listRecords(tenant(req), 'hr_ticket') });
});

hrRouter.post('/helpdesk', async (req: AuthenticatedRequest, res: Response) => {
  const data = await saveRecord(tenant(req), 'hr_ticket', { status: 'open', createdAt: new Date().toISOString(), ...req.body });
  res.status(201).json({ success: true, data });
});

hrRouter.post('/helpdesk/:id/resolve', async (req: AuthenticatedRequest, res: Response) => {
  const tickets = await listRecords<any>(tenant(req), 'hr_ticket');
  const ticket = tickets.find((item) => item.id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
  const data = await replaceRecord(tenant(req), 'hr_ticket', ticket.id, { ...ticket, status: 'resolved', resolutionNotes: req.body?.notes || '' });
  res.json({ success: true, data });
});
