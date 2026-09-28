import { Router, Response } from 'express';
import { DpdpaService } from './dpdpa.service.js';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';

export const dpdpaRouter = Router();

dpdpaRouter.get('/officer-info', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await DpdpaService.getOfficerInfo();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.put('/officer-info', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await DpdpaService.updateOfficerInfo(req.body);
    res.json({ success: true, data, message: 'Updated Data Protection Officer (DPO) registry successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.get('/consents', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const empId = (req.query.employeeId as string) || req.user?.employeeId || 'emp_naresh_001';
    const data = await DpdpaService.getConsents(empId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.put('/consents/:consentId', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const empId = req.user?.employeeId || 'emp_naresh_001';
    const { isGranted } = req.body;
    const data = await DpdpaService.updateConsent(empId, req.params.consentId, Boolean(isGranted));
    res.json({ success: true, data, message: 'Consent status updated under DPDPA 2023 Rules' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.get('/personal-data-summary', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const empId = (req.query.employeeId as string) || req.user?.employeeId || 'emp_naresh_001';
    const empCode = req.user?.employeeId ? 'TP0001' : 'TP0001';
    const name = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Naresh Andukoori';
    const email = req.user?.email || 'naresh@company.com';

    const data = await DpdpaService.getPersonalDataSummary(empId, empCode, name, email);
    res.json({ success: true, data, message: 'Statutory DPDPA Sec 11 Data Principal Summary generated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.post('/privacy-grievance', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const empId = req.user?.employeeId || 'emp_naresh_001';
    const empName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Naresh Andukoori';
    const { category, description } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Grievance description is required' } });
    }

    const data = await DpdpaService.filePrivacyGrievance(empId, empName, category || 'data_access', description.trim());
    res.status(201).json({ success: true, data, message: 'Privacy grievance ticket registered under DPDPA 2023 Sec 13' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// =========================================================================
// DPO Workspace Endpoints
// =========================================================================

dpdpaRouter.get('/dpo/stats', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await DpdpaService.getDpoStats();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.get('/dpo/grievances', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await DpdpaService.listGrievances();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.put('/dpo/grievances/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, resolutionNotes } = req.body;
    const data = await DpdpaService.updateGrievanceStatus(req.params.id, status, resolutionNotes);
    res.json({ success: true, data, message: `Privacy grievance status updated to ${status}` });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.get('/dpo/erasure-requests', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await DpdpaService.listErasureRequests();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.post('/dpo/erasure-requests/:id/execute', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action } = req.body;
    const data = await DpdpaService.executeErasureRequest(req.params.id, action || 'approve_and_purge');
    res.json({ success: true, data, message: 'Processed Right to Erasure request under DPDPA 2023 Sec 12' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

dpdpaRouter.get('/dpo/audit-trail', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await DpdpaService.getAuditTrail();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});
