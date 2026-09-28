import {
  AuditLogEntryDTO,
  AuditMetricsDTO,
  AuditFilterParametersDTO
} from '@infi-timepro/shared-types';
import crypto from 'crypto';

export class AuditService {
  private static logs: AuditLogEntryDTO[] = [
    {
      id: 'aud-9801',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T17:45:12.000Z',
      eventCode: 'PAYROLL_PERIOD_LOCKED',
      category: 'payroll',
      severity: 'critical',
      actorId: 'usr-002',
      actorName: 'Anita Desai',
      actorEmail: 'anita.desai@company.com',
      actorRole: 'Head of HR & Payroll',
      targetEntity: 'PayPeriod',
      targetId: 'PAY-2026-AUG',
      ipAddress: '106.51.72.19',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0',
      location: 'Bengaluru, India',
      description: 'Applied immutable cryptographic lock and generated SHA-256 seal for August 2026 Monthly Pay Period.',
      beforeState: { status: 'ready_to_lock', totalEmployees: 248 },
      afterState: { status: 'locked', lockSignature: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384' },
      hashSignature: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384',
      previousHash: '0x8e7a12b093d8f701c20879fb102e789fcd0e6781920394857102938475610293'
    },
    {
      id: 'aud-9802',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T16:20:00.000Z',
      eventCode: 'ATTENDANCE_OVERRIDE',
      category: 'attendance',
      severity: 'warning',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'Administrator',
      targetEntity: 'AttendanceDay',
      targetId: 'att-20260914-emp002',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Approved manual check-in regularisation of 09:00 AM for Michael Chang (EMP-1002) due to gate terminal sync lag.',
      beforeState: { firstIn: null, status: 'missing_punch' },
      afterState: { firstIn: '09:00 AM', status: 'present' },
      hashSignature: '0x8e7a12b093d8f701c20879fb102e789fcd0e6781920394857102938475610293',
      previousHash: '0x7d6f01a982c7e6f0b19768ea0f1d678ebc9d5670819283746501928374650192'
    },
    {
      id: 'aud-9803',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T14:10:35.000Z',
      eventCode: 'GEOFENCE_RADIUS_ALTERED',
      category: 'hardware',
      severity: 'warning',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'Administrator',
      targetEntity: 'GeofenceZone',
      targetId: 'geo-001',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Updated geofence radius boundary for Bengaluru Tech Park campus from 100m to 120m.',
      beforeState: { radiusMeters: 100 },
      afterState: { radiusMeters: 120 },
      hashSignature: '0x7d6f01a982c7e6f0b19768ea0f1d678ebc9d5670819283746501928374650192',
      previousHash: '0x6c5e90f871b6d5e9a08657d90e0c567dab8c4569708172635490817263549081'
    },
    {
      id: 'aud-9804',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T11:00:00.000Z',
      eventCode: 'SUPERADMIN_FEATURE_FLAG_TOGGLE',
      category: 'superadmin',
      severity: 'critical',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'SuperAdmin',
      targetEntity: 'TenantFeatureFlag',
      targetId: 'tenant-002:antiSpoofingSensors',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Enabled hardware mock-GPS anti-spoofing sensor heuristics for TechNova Cloud Solutions instance.',
      beforeState: { antiSpoofingSensors: false },
      afterState: { antiSpoofingSensors: true },
      hashSignature: '0x6c5e90f871b6d5e9a08657d90e0c567dab8c4569708172635490817263549081',
      previousHash: '0x5b4d8f0760a5c4d89f7546c8fd9b456c9a7b34586f706152438f706152438f70'
    },
    {
      id: 'aud-9805',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T09:00:15.000Z',
      eventCode: 'AUTH_LOGIN_SUCCESS',
      category: 'authentication',
      severity: 'info',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'Administrator',
      targetEntity: 'UserSession',
      targetId: 'sess-89021',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Successful administrative login with 2-Factor Authentication (TOTP).',
      hashSignature: '0x5b4d8f0760a5c4d89f7546c8fd9b456c9a7b34586f706152438f706152438f70',
      previousHash: '0x4a3c7e965f94b3c78e6435b7ec8a345b896a23475e6f5041327e5f5041327e5f'
    }
  ];

  static async getMetrics(): Promise<AuditMetricsDTO> {
    return {
      totalLogsCount: 14820,
      highRiskEventsCount: 12,
      tamperProofStatus: true,
      retentionDays: 365,
      latestBlockHeight: 9805,
      lastVerifiedAt: new Date().toISOString()
    };
  }

  static async getLogs(filters?: AuditFilterParametersDTO): Promise<{
    logs: AuditLogEntryDTO[];
    total: number;
    integrityVerified: boolean;
  }> {
    let result = [...this.logs];

    if (filters?.category && filters.category !== 'all') {
      result = result.filter(l => l.category === filters.category);
    }
    if (filters?.severity && filters.severity !== 'all') {
      result = result.filter(l => l.severity === filters.severity);
    }
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(l =>
        l.eventCode.toLowerCase().includes(term) ||
        l.actorName.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term) ||
        l.ipAddress.includes(term)
      );
    }

    return {
      logs: result,
      total: result.length,
      integrityVerified: true
    };
  }

  static async verifyIntegrity(): Promise<{
    valid: boolean;
    chainLength: number;
    merkleRoot: string;
    verifiedAt: string;
  }> {
    return {
      valid: true,
      chainLength: 14820,
      merkleRoot: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384',
      verifiedAt: new Date().toISOString()
    };
  }

  static async recordEvent(event: Partial<AuditLogEntryDTO>): Promise<AuditLogEntryDTO> {
    const previousHash = this.logs.length > 0 ? this.logs[0].hashSignature : '0x0000000000000000000000000000000000000000000000000000000000000000';
    const id = `aud-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();
    
    const rawContent = `${id}:${timestamp}:${event.eventCode}:${event.actorEmail}:${event.description}:${previousHash}`;
    const hashSignature = '0x' + crypto.createHash('sha256').update(rawContent).digest('hex');

    const newLog: AuditLogEntryDTO = {
      id,
      tenantId: event.tenantId || 'tenant-001',
      timestamp,
      eventCode: event.eventCode || 'SYSTEM_MUTATION',
      category: event.category || 'security',
      severity: event.severity || 'info',
      actorId: event.actorId || 'usr-001',
      actorName: event.actorName || 'Naresh Andukoori',
      actorEmail: event.actorEmail || 'naresh@company.com',
      actorRole: event.actorRole || 'Administrator',
      targetEntity: event.targetEntity || 'SystemResource',
      targetId: event.targetId || 'res-001',
      ipAddress: event.ipAddress || '183.82.112.44',
      userAgent: event.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: event.location || 'Hyderabad, India',
      description: event.description || 'Audit log event captured.',
      beforeState: event.beforeState,
      afterState: event.afterState,
      hashSignature,
      previousHash
    };

    this.logs.unshift(newLog);
    return newLog;
  }
}
