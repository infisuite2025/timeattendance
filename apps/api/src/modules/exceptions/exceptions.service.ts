import {
  AttendanceExceptionDTO,
  ResolveExceptionRequestDTO,
  RegularisationDetailDTO,
  CreateRegularisationRequestDTO,
  OvertimeRequestDTO,
  ExceptionType,
  ExceptionSeverity,
  ExceptionStatus
} from '@infi-timepro/shared-types';

export class ExceptionsService {
  private static exceptions: AttendanceExceptionDTO[] = [
    {
      id: 'exc-001',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-006',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      date: '2026-09-14',
      shiftName: 'Night Shift',
      shiftTiming: '10:00 PM - 06:30 AM',
      exceptionType: 'missing_out_punch',
      severity: 'critical',
      description: 'Employee logged IN at 10:02 PM but no OUT punch recorded before shift window closed.',
      firstIn: '10:02 PM',
      lastOut: undefined,
      shortfallMinutes: 508,
      status: 'open',
      createdAt: '2026-09-14T07:00:00.000Z'
    },
    {
      id: 'exc-002',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      date: '2026-09-14',
      shiftName: 'Morning Shift',
      shiftTiming: '07:00 AM - 03:30 PM',
      exceptionType: 'late_arrival',
      severity: 'warning',
      description: 'Arrival at 07:35 AM exceeds 15-minute grace threshold by 20 minutes (Late penalty tier 1).',
      firstIn: '07:35 AM',
      lastOut: '03:40 PM',
      shortfallMinutes: 0,
      status: 'in_review',
      createdAt: '2026-09-14T07:36:00.000Z'
    },
    {
      id: 'exc-003',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      date: '2026-09-14',
      shiftName: 'Morning Shift',
      shiftTiming: '07:00 AM - 03:30 PM',
      exceptionType: 'geofence_breach',
      severity: 'critical',
      description: 'Mobile GPS punch registered 520m outside authorized Bengaluru HQ perimeter.',
      firstIn: '07:35 AM',
      shortfallMinutes: 0,
      status: 'open',
      createdAt: '2026-09-14T07:35:10.000Z'
    },
    {
      id: 'exc-004',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'Elena Rostova',
      department: 'Marketing',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      date: '2026-09-14',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      exceptionType: 'mock_gps_detected',
      severity: 'critical',
      description: 'Device sensor telemetry reported Mock GPS Location App active during check-in.',
      firstIn: '09:00 AM',
      shortfallMinutes: 0,
      status: 'open',
      createdAt: '2026-09-14T09:00:15.000Z'
    },
    {
      id: 'exc-005',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      date: '2026-09-11',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      exceptionType: 'missing_in_punch',
      severity: 'warning',
      description: 'Check-in punch missing; employee punched OUT at 06:20 PM.',
      firstIn: undefined,
      lastOut: '06:20 PM',
      shortfallMinutes: 240,
      status: 'resolved',
      resolutionAction: 'regularised',
      resolvedBy: 'Sarah Jenkins',
      resolvedAt: '2026-09-12T10:15:00.000Z',
      resolutionNotes: 'Regularisation request #REG-8091 approved by L1 Manager.',
      createdAt: '2026-09-11T19:00:00.000Z'
    }
  ];

  private static regularisations: RegularisationDetailDTO[] = [
    {
      id: 'reg-001',
      requestCode: 'REG-8092',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      attendanceDate: '2026-09-14',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      requestType: 'check_in',
      originalIn: '--',
      originalOut: '06:25 PM',
      requestedIn: '09:00 AM',
      requestedOut: '06:25 PM',
      reasonCategory: 'Biometric Device Failure',
      reasonText: 'Main gate facial terminal showed timeout error during 9 AM morning rush.',
      status: 'pending',
      currentTier: 1,
      maxTiers: 2,
      approvers: [
        { tier: 1, approverName: 'Sarah Jenkins', role: 'Reporting Manager', status: 'pending' },
        { tier: 2, approverName: 'Anita Desai', role: 'Head of HR', status: 'pending' }
      ],
      submittedAt: '2026-09-14T09:30:00.000Z'
    },
    {
      id: 'reg-002',
      requestCode: 'REG-8093',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      attendanceDate: '2026-09-14',
      shiftName: 'Morning Shift',
      shiftTiming: '07:00 AM - 03:30 PM',
      requestType: 'client_visit',
      originalIn: '07:35 AM',
      originalOut: '03:40 PM',
      requestedIn: '07:00 AM',
      requestedOut: '03:40 PM',
      reasonCategory: 'On-Duty Client Visit',
      reasonText: 'Directly reported to vendor logistics hub in Whitefield for dispatch inspection.',
      status: 'pending',
      currentTier: 1,
      maxTiers: 1,
      approvers: [
        { tier: 1, approverName: 'Sarah Jenkins', role: 'Reporting Manager', status: 'pending' }
      ],
      submittedAt: '2026-09-14T08:00:00.000Z'
    }
  ];

  private static overtimeRequests: OvertimeRequestDTO[] = [
    {
      id: 'ot-001',
      requestCode: 'OT-4102',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      attendanceDate: '2026-09-13',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      claimedMinutes: 120,
      systemCalculatedMinutes: 110,
      approvedMinutes: 110,
      projectCode: 'PRJ-INFITIME-CORE',
      reason: 'Release 2.4 production deployment and sanity verification window.',
      status: 'approved',
      approverName: 'David Rodriguez',
      submittedAt: '2026-09-13T18:30:00.000Z',
      decidedAt: '2026-09-14T08:15:00.000Z'
    },
    {
      id: 'ot-002',
      requestCode: 'OT-4103',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-006',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      attendanceDate: '2026-09-14',
      shiftName: 'Night Shift',
      shiftTiming: '10:00 PM - 06:30 AM',
      claimedMinutes: 90,
      systemCalculatedMinutes: 90,
      projectCode: 'PRJ-DB-OPTIMIZE',
      reason: 'Database index rebuild and high volume stress testing.',
      status: 'pending',
      submittedAt: '2026-09-14T06:45:00.000Z'
    }
  ];

  static async getExceptions(tenantId: string, filter?: { type?: string; severity?: string; status?: string; search?: string }): Promise<AttendanceExceptionDTO[]> {
    let list = [...this.exceptions];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(e => e.employeeName.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (filter?.type && filter.type !== 'all') {
      list = list.filter(e => e.exceptionType === filter.type);
    }
    if (filter?.severity && filter.severity !== 'all') {
      list = list.filter(e => e.severity === filter.severity);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(e => e.status === filter.status);
    }
    return list;
  }

  static async resolveException(tenantId: string, payload: ResolveExceptionRequestDTO, resolvedBy: string): Promise<AttendanceExceptionDTO> {
    const item = this.exceptions.find(e => e.id === payload.exceptionId);
    if (!item) throw new Error('Exception record not found');

    item.status = payload.action === 'waive' ? 'waived' : 'resolved';
    item.resolutionAction = payload.action === 'waive' ? 'waived' : (payload.action === 'apply_penalty' ? 'penalty_applied' : 'manual_punch');
    item.resolvedBy = resolvedBy;
    item.resolvedAt = new Date().toISOString();
    item.resolutionNotes = payload.reason;

    return item;
  }

  static async getRegularisations(tenantId: string, employeeId?: string): Promise<RegularisationDetailDTO[]> {
    if (employeeId) {
      return this.regularisations.filter(r => r.employeeId === employeeId);
    }
    return this.regularisations;
  }

  static async createRegularisation(tenantId: string, employeeId: string, payload: CreateRegularisationRequestDTO): Promise<RegularisationDetailDTO> {
    const newReq: RegularisationDetailDTO = {
      id: `reg-${Date.now()}`,
      requestCode: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId,
      employeeId,
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      attendanceDate: payload.attendanceDate,
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      requestType: payload.requestType,
      requestedIn: payload.requestedIn,
      requestedOut: payload.requestedOut,
      reasonCategory: payload.reasonCategory,
      reasonText: payload.reasonText,
      attachmentUrl: payload.attachmentUrl,
      status: 'pending',
      currentTier: 1,
      maxTiers: 2,
      approvers: [
        { tier: 1, approverName: 'Manager Sarah Jenkins', role: 'Reporting Manager', status: 'pending' },
        { tier: 2, approverName: 'Anita Desai', role: 'Head of HR', status: 'pending' }
      ],
      submittedAt: new Date().toISOString()
    };

    this.regularisations.unshift(newReq);
    return newReq;
  }

  static async actOnRegularisation(id: string, action: 'approve' | 'reject' | 'send_back', approverName: string, comments?: string): Promise<RegularisationDetailDTO> {
    const item = this.regularisations.find(r => r.id === id);
    if (!item) throw new Error('Regularisation request not found');

    if (action === 'approve') {
      item.status = 'approved';
    } else if (action === 'reject') {
      item.status = 'rejected';
    } else {
      item.status = 'sent_back';
    }

    if (item.approvers.length > 0) {
      item.approvers[0].status = action === 'approve' ? 'approved' : 'rejected';
      item.approvers[0].comments = comments;
      item.approvers[0].actionAt = new Date().toISOString();
    }

    return item;
  }

  static async getOvertimeRequests(tenantId: string): Promise<OvertimeRequestDTO[]> {
    return this.overtimeRequests;
  }
}
