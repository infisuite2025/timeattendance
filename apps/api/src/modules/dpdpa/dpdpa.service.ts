import {
  DpdpaConsentItemDTO,
  DpdpaOfficerInfoDTO,
  DpdpaPersonalDataSummaryDTO,
  DpdpaPrivacyGrievanceDTO,
  DpdpaDpoStatsDTO,
  DpdpaErasureRequestDTO,
  DpdpaAuditTrailLogDTO
} from '@infi-timepro/shared-types';
import crypto from 'crypto';
import { AuditService } from '../audit/audit.service.js';

export class DpdpaService {
  private static officerInfo: DpdpaOfficerInfoDTO = {
    dpoName: 'Rajesh Kumar, CISSP',
    dpoTitle: 'Chief Data Protection Officer & Privacy Counsel',
    dpoEmail: 'dpo.privacy@company.com',
    dpoPhone: '+91 80 4910 8800',
    dpoOfficeAddress: 'Level 12, ACME Cyber Tower, HITECH City, Hyderabad 500081, India',
    dpbiRegistrationCode: 'DPBI-IND-2024-88492',
    dataResidencyRegion: 'ap-south-1',
    dataResidencyLocation: 'AWS ap-south-1 (Mumbai Region, India Data Center)',
    encryptionStandard: 'AES-256 (At Rest) & TLS 1.3 Strict Mutual Authentication (In Transit)',
    lastSecurityAuditDate: '2026-09-01T00:00:00.000Z'
  };

  private static consentsMap: Record<string, DpdpaConsentItemDTO[]> = {};

  private static defaultConsents: DpdpaConsentItemDTO[] = [
    {
      id: 'cns_bio_01',
      consentType: 'biometric_face_scan',
      title: 'Biometric Facial Template Processing',
      description: 'Consent for extracting 3D facial feature vectors for automated touchless attendance swiping and anti-spoofing verification.',
      isMandatory: true,
      isGranted: true,
      grantedAt: '2026-01-15T09:00:00.000Z',
      statutoryBasis: 'DPDPA 2023 Sec 6(1) & IT Rules 2011 Sec 4 (Sensitive Personal Data)'
    },
    {
      id: 'cns_gps_02',
      consentType: 'gps_geofence_location',
      title: 'Geofence GPS Location Verification',
      description: 'Consent for acquiring real-time GPS coordinates exclusively during punch-in and punch-out events to confirm site boundary presence.',
      isMandatory: true,
      isGranted: true,
      grantedAt: '2026-01-15T09:00:00.000Z',
      statutoryBasis: 'DPDPA 2023 Sec 6(1) Purpose Limitation'
    },
    {
      id: 'cns_dev_03',
      consentType: 'mobile_device_uuid',
      title: 'Mobile Device Identifier & Hardware Attestation',
      description: 'Consent for reading device UUID and hardware security keys for anti-cloning device binding.',
      isMandatory: false,
      isGranted: true,
      grantedAt: '2026-01-15T09:00:00.000Z',
      statutoryBasis: 'DPDPA 2023 Sec 6(1) Explicit Consent'
    },
    {
      id: 'cns_cnt_04',
      consentType: 'personal_contact_data',
      title: 'Emergency Contact & Corporate Directory Sharing',
      description: 'Consent for processing personal phone number and emergency contact details for organization safety notifications.',
      isMandatory: false,
      isGranted: true,
      grantedAt: '2026-01-15T09:00:00.000Z',
      statutoryBasis: 'DPDPA 2023 Sec 6(1) Optional Consent'
    }
  ];

  private static grievances: DpdpaPrivacyGrievanceDTO[] = [
    {
      id: 'grv-1092',
      tenantId: 'tenant-001',
      employeeId: 'emp-104',
      employeeName: 'Vikram Singh',
      category: 'consent_withdrawal',
      description: 'Requesting clarification on optional mobile UUID tracking consent after app update.',
      status: 'under_review',
      filedAt: '2026-09-22T10:30:00.000Z',
      dpoAssigned: 'Rajesh Kumar, CISSP'
    },
    {
      id: 'grv-1088',
      tenantId: 'tenant-001',
      employeeId: 'emp-109',
      employeeName: 'Ananya Sharma',
      category: 'data_access',
      description: 'Requesting certified summary of biometric attendance swipes logged during field audit.',
      status: 'filed',
      filedAt: '2026-09-23T14:15:00.000Z',
      dpoAssigned: 'Rajesh Kumar, CISSP'
    }
  ];

  private static erasureRequests: DpdpaErasureRequestDTO[] = [
    {
      id: 'ers-3041',
      tenantId: 'tenant-001',
      employeeId: 'emp-882',
      employeeCode: 'EMP-0882',
      employeeName: 'Ramesh Patel',
      reason: 'Separated from organization on 15 Aug 2026. Requesting erasure of mobile IMEI & face vectors.',
      requestedAt: '2026-09-20T08:00:00.000Z',
      employmentStatus: 'separated',
      statutoryRetentionCheck: 'passed_safe_to_purge',
      status: 'pending_dpo_approval'
    },
    {
      id: 'ers-3042',
      tenantId: 'tenant-001',
      employeeId: 'emp-912',
      employeeCode: 'EMP-0912',
      employeeName: 'Deepak Varma',
      reason: 'Resigned contract. Requesting immediate deletion of all wage and attendance history.',
      requestedAt: '2026-09-24T11:20:00.000Z',
      employmentStatus: 'separated',
      statutoryRetentionCheck: 'wage_audit_lockout_active',
      status: 'rejected_statutory_hold'
    }
  ];

  private static auditLogs: DpdpaAuditTrailLogDTO[] = [
    {
      id: 'aud-9901',
      timestamp: '2026-09-24T18:30:00.000Z',
      eventType: 'SUMMARY_EXPORTED',
      actorId: 'emp-1001',
      actorName: 'Sarah Jenkins',
      actorRole: 'EMPLOYEE',
      targetSubject: 'Sarah Jenkins (EMP-1001)',
      ipAddress: '106.51.72.19',
      sha256VerificationSeal: '0x8f4a119b22e49c81a2080f'
    },
    {
      id: 'aud-9902',
      timestamp: '2026-09-24T17:45:00.000Z',
      eventType: 'CONSENT_GRANTED',
      actorId: 'emp-1001',
      actorName: 'Sarah Jenkins',
      actorRole: 'EMPLOYEE',
      targetSubject: 'Mobile Device UUID Binding',
      ipAddress: '106.51.72.19',
      sha256VerificationSeal: '0x11ab449c00ef1294829100'
    }
  ];

  static async getOfficerInfo(): Promise<DpdpaOfficerInfoDTO> {
    return this.officerInfo;
  }

  static async updateOfficerInfo(payload: Partial<DpdpaOfficerInfoDTO>): Promise<DpdpaOfficerInfoDTO> {
    this.officerInfo = { ...this.officerInfo, ...payload };
    AuditService.recordEvent({
      eventCode: 'DPDPA_DPO_REGISTRY_UPDATED',
      category: 'security',
      severity: 'warning',
      description: `Updated Data Protection Officer (DPO) registry: ${this.officerInfo.dpoName} (${this.officerInfo.dpoEmail}).`
    }).catch(() => null);

    return this.officerInfo;
  }

  static async getConsents(employeeId: string): Promise<DpdpaConsentItemDTO[]> {
    if (!this.consentsMap[employeeId]) {
      this.consentsMap[employeeId] = JSON.parse(JSON.stringify(this.defaultConsents));
    }
    return this.consentsMap[employeeId];
  }

  static async updateConsent(employeeId: string, consentId: string, isGranted: boolean): Promise<DpdpaConsentItemDTO[]> {
    const userConsents = await this.getConsents(employeeId);
    const target = userConsents.find(c => c.id === consentId);
    if (!target) {
      throw new Error('Consent item not found');
    }

    if (target.isMandatory && !isGranted) {
      throw new Error(`DPDPA Statutory Rule: Mandatory consent "${target.title}" cannot be revoked while employment contract is active.`);
    }

    target.isGranted = isGranted;
    if (isGranted) {
      target.grantedAt = new Date().toISOString();
      target.revokedAt = undefined;
    } else {
      target.revokedAt = new Date().toISOString();
    }

    this.recordAuditLog(
      isGranted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      employeeId,
      'Employee Principal',
      'EMPLOYEE',
      target.title
    );

    AuditService.recordEvent({
      eventCode: isGranted ? 'DPDPA_CONSENT_GRANTED' : 'DPDPA_CONSENT_REVOKED',
      category: 'security',
      severity: 'info',
      targetEntity: 'DpdpaConsent',
      targetId: consentId,
      description: `${isGranted ? 'Granted' : 'Revoked'} DPDPA consent for "${target.title}" (Employee ID: ${employeeId}).`
    }).catch(() => null);

    return userConsents;
  }

  static async getPersonalDataSummary(employeeId: string, employeeCode?: string, name?: string, email?: string): Promise<DpdpaPersonalDataSummaryDTO> {
    const consents = await this.getConsents(employeeId);
    const generatedAt = new Date().toISOString();
    const empCode = employeeCode || 'TP0001';
    const fullName = name || 'Naresh Andukoori';
    const userEmail = email || 'naresh@company.com';

    const rawData = `${employeeId}:${empCode}:${userEmail}:${generatedAt}`;
    const digitalSealHash = '0x' + crypto.createHash('sha256').update(rawData).digest('hex');

    this.recordAuditLog('SUMMARY_EXPORTED', employeeId, fullName, 'EMPLOYEE', `Data Summary Export (${empCode})`);

    AuditService.recordEvent({
      eventCode: 'DPDPA_DATA_PRINCIPAL_SUMMARY_EXPORTED',
      category: 'security',
      severity: 'info',
      targetEntity: 'EmployeePersonalData',
      targetId: employeeId,
      description: `Generated statutory Personal Data Summary report under DPDPA 2023 Sec 11 for ${fullName} (${empCode}).`
    }).catch(() => null);

    return {
      employeeId,
      employeeCode: empCode,
      fullName,
      email: userEmail,
      phone: '+91 9876543210',
      department: 'Human Resources',
      designation: 'Principal Systems Administrator',
      biometricEnrolled: true,
      biometricType: '3D Face Recognition Vector (SHA-256 Encrypted)',
      registeredDeviceUuid: 'a8b9c7-4421-9988',
      totalPunchesLogged: 1420,
      totalLeavesRecorded: 14,
      totalPayPeriodSummaries: 24,
      consentsGranted: consents,
      generatedAt,
      digitalSealHash
    };
  }

  static async filePrivacyGrievance(employeeId: string, employeeName: string, category: any, description: string): Promise<DpdpaPrivacyGrievanceDTO> {
    const id = `grv-${Math.floor(1000 + Math.random() * 9000)}`;
    const filedAt = new Date().toISOString();

    const grievance: DpdpaPrivacyGrievanceDTO = {
      id,
      tenantId: 'tenant-001',
      employeeId,
      employeeName,
      category,
      description,
      status: 'filed',
      filedAt,
      dpoAssigned: this.officerInfo.dpoName
    };

    this.grievances.unshift(grievance);
    this.recordAuditLog('GRIEVANCE_FILED', employeeId, employeeName, 'EMPLOYEE', `Grievance Ticket #${id}`);

    AuditService.recordEvent({
      eventCode: 'DPDPA_PRIVACY_GRIEVANCE_FILED',
      category: 'security',
      severity: 'warning',
      targetEntity: 'PrivacyGrievance',
      targetId: id,
      description: `Filed DPDPA Sec 13 Privacy Grievance (${category}) by ${employeeName} (Assigned DPO: ${this.officerInfo.dpoName}).`
    }).catch(() => null);

    return grievance;
  }

  // =========================================================================
  // DPO Compliance Workspace Management Methods
  // =========================================================================

  static async getDpoStats(): Promise<DpdpaDpoStatsDTO> {
    const openGrievancesCount = this.grievances.filter(g => g.status === 'filed' || g.status === 'under_review').length;
    const pendingErasureCount = this.erasureRequests.filter(e => e.status === 'pending_dpo_approval').length;

    return {
      openGrievancesCount,
      slaBreachWarningCount: 0,
      pendingErasureCount,
      totalConsentsManaged: 1420,
      consentOptInRatePercentage: 98.4,
      dpbiIncidentsCount: 0,
      lastAuditTimestamp: new Date().toISOString()
    };
  }

  static async listGrievances(): Promise<DpdpaPrivacyGrievanceDTO[]> {
    return this.grievances;
  }

  static async updateGrievanceStatus(id: string, status: 'under_review' | 'resolved' | 'escalated_to_dpbi', resolutionNotes?: string): Promise<DpdpaPrivacyGrievanceDTO> {
    const target = this.grievances.find(g => g.id === id);
    if (!target) {
      throw new Error('Grievance ticket not found');
    }

    target.status = status;
    if (status === 'resolved') {
      target.resolvedAt = new Date().toISOString();
    }
    if (resolutionNotes) {
      target.resolutionNotes = resolutionNotes;
    }

    AuditService.recordEvent({
      eventCode: 'DPDPA_GRIEVANCE_RESOLVED',
      category: 'security',
      severity: 'info',
      targetEntity: 'PrivacyGrievance',
      targetId: id,
      description: `DPO updated grievance ${id} status to ${status}.`
    }).catch(() => null);

    return target;
  }

  static async listErasureRequests(): Promise<DpdpaErasureRequestDTO[]> {
    return this.erasureRequests;
  }

  static async executeErasureRequest(id: string, action: 'approve_and_purge' | 'reject_statutory_hold'): Promise<DpdpaErasureRequestDTO> {
    const target = this.erasureRequests.find(e => e.id === id);
    if (!target) {
      throw new Error('Erasure request not found');
    }

    if (action === 'approve_and_purge') {
      if (target.statutoryRetentionCheck === 'wage_audit_lockout_active') {
        throw new Error('Statutory Lockout: Factories Act / Minimum Wages Act requires retaining wage records for 3 years.');
      }
      target.status = 'anonymized_and_purged';
      target.purgedAt = new Date().toISOString();
      target.anonymizedByDpo = this.officerInfo.dpoName;

      this.recordAuditLog('ERASURE_EXECUTED', 'dpo-01', this.officerInfo.dpoName, 'DPO', `Purged PII for ${target.employeeName}`);
    } else {
      target.status = 'rejected_statutory_hold';
    }

    AuditService.recordEvent({
      eventCode: action === 'approve_and_purge' ? 'DPDPA_RIGHT_TO_ERASURE_EXECUTED' : 'DPDPA_ERASURE_REJECTED_STATUTORY',
      category: 'security',
      severity: 'warning',
      targetEntity: 'ErasureRequest',
      targetId: id,
      description: `DPO ${action} for ${target.employeeName} (${target.employeeCode}).`
    }).catch(() => null);

    return target;
  }

  static async getAuditTrail(): Promise<DpdpaAuditTrailLogDTO[]> {
    return this.auditLogs;
  }

  private static recordAuditLog(eventType: any, actorId: string, actorName: string, actorRole: string, targetSubject: string) {
    const log: DpdpaAuditTrailLogDTO = {
      id: `aud-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      eventType,
      actorId,
      actorName,
      actorRole,
      targetSubject,
      ipAddress: '106.51.72.19',
      sha256VerificationSeal: '0x' + crypto.createHash('sha256').update(`${actorId}:${eventType}:${Date.now()}`).digest('hex').substring(0, 22)
    };
    this.auditLogs.unshift(log);
  }
}

