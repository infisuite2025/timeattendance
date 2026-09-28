// =========================================================================
// InfiTimePro - Enterprise Shared Types & Domain Contracts
// =========================================================================

export type TenantPlanTier = 'starter' | 'growth' | 'enterprise' | 'custom';
export type TenantStatus = 'trial' | 'active' | 'suspended' | 'archived' | 'provisioning';

export interface TenantDTO {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  logoUrl?: string;
  planTier: TenantPlanTier;
  maxSeats: number;
  usedSeats: number;
  maxDevices: number;
  activeDevices: number;
  dataRegion: 'ap-south-1' | 'us-east-1' | 'eu-central-1' | 'ap-southeast-1';
  status: TenantStatus;
  primaryAdminEmail: string;
  primaryAdminName: string;
  features: {
    geofencing: boolean;
    biometrics: boolean;
    rosterScheduling: boolean;
    multiTierApprovals: boolean;
    payrollExport: boolean;
    antiSpoofingSensors: boolean;
  };
  createdAt: string;
  renewalDate: string;
  defaultTimezone?: string;
  defaultCurrency?: string;
  defaultLanguage?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'LOCATION_HR'
  | 'CORPORATE_HR'
  | 'EMPLOYEE'
  | 'PAYROLL_ADMIN'
  | 'DEVICE_ADMIN'
  | 'AUDITOR'
  | 'DATA_PROTECTION_OFFICER';

export interface UserProfileDTO {
  id: string;
  tenantId: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  employeeId?: string;
  departmentName?: string;
  locationName?: string;
  permissions: string[];
}

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contractor'
  | 'consultant'
  | 'intern'
  | 'daily_wage';

export type EmploymentStatus =
  | 'active'
  | 'probation'
  | 'notice_period'
  | 'terminated'
  | 'resigned';

export interface EmployeeSummaryDTO {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  jobTitle: string;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  biometricId?: string;
  joiningDate: string;
  overtimeEligible: boolean;
  remoteWorkEligible: boolean;
}

export interface EmployeeDetailDTO extends EmployeeSummaryDTO {
  email: string;
  phoneNumber?: string;
  currentShift: {
    id: string;
    code: string;
    name: string;
    timing: string;
  };
  attendanceSummary: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    wfhDays: number;
    totalHours: string;
    attendanceRate: number;
  };
}

export interface DepartmentDTO {
  id: string;
  code: string;
  name: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  employeeCount: number;
  isActive: boolean;
}

export interface LocationDTO {
  id: string;
  code: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  employeeCount: number;
  activeDevicesCount: number;
  status: 'operational' | 'alert' | 'offline';
}

// -------------------------------------------------------------------------
// Shifts & Rostering DTOs
// -------------------------------------------------------------------------

export type ShiftType = 'fixed' | 'flexible' | 'rotational' | 'night' | 'cross_midnight' | 'split';
export type ShiftStatus = 'active' | 'draft' | 'archived';

export interface ShiftDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  shiftType: ShiftType;
  shiftCategory: string;
  colorHex: string;
  startTime: string;
  endTime: string;
  duration: string;
  breakDuration: string;
  isBreakPaid: boolean;
  graceRules: string;
  graceInMinutes: number;
  graceOutMinutes: number;
  halfDayThreshold: string;
  fullDayThreshold: string;
  overtimeThreshold: string;
  autoDetectEnabled: boolean;
  status: ShiftStatus;
}

export interface ShiftGroupDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  includedShifts: string[];
  locations: string;
  employeeCount: number;
  patternType: 'Fixed' | 'Rotational' | 'Flexible';
  status: 'active' | 'inactive';
}

export interface ShiftAssignmentDTO {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  currentShift: string;
  shiftTiming: string;
  effectiveFrom: string;
  effectiveTo: string;
  assignedBy: string;
  status: 'active' | 'scheduled' | 'not_assigned';
}

export interface ShiftSwapRequestDTO {
  id: string;
  requestCode: string;
  requesterId: string;
  requesterName: string;
  requesterDept: string;
  requesterAvatar?: string;
  swapWithId: string;
  swapWithName: string;
  swapWithDept: string;
  swapWithAvatar?: string;
  date: string;
  currentShift: string;
  currentShiftTiming: string;
  requestedShift: string;
  requestedShiftTiming: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedOn: string;
}

export interface ScheduleMatrixDTO {
  weekRange: string;
  metrics: {
    scheduledEmployees: number;
    totalEmployees: number;
    openShifts: number;
    unassignedShifts: number;
    coveragePercentage: number;
  };
  schedule: {
    employeeId: string;
    employeeName: string;
    department: string;
    avatarUrl?: string;
    shifts: {
      date: string;
      dayName: string;
      shiftCode?: string;
      shiftName?: string;
      timing?: string;
      colorHex?: string;
      isOff?: boolean;
      isLeave?: boolean;
    }[];
  }[];
}

// -------------------------------------------------------------------------
// Policy & Rules Engine DTOs
// -------------------------------------------------------------------------

export interface AttendancePolicyDTO {
  id: string;
  code: string;
  name: string;
  description: string;
  version: string;
  effectiveFrom: string;
  effectiveTo: string;
  isDefault: boolean;
  status: 'active' | 'draft' | 'archived';
  assignedLocations: string[];
  assignedDepartments: string[];
  rules: {
    graceInMinutes: number;
    graceOutMinutes: number;
    monthlyLateGraceCount: number;
    lateDeductionAction: 'NONE' | 'HALF_DAY' | 'LOP_DEDUCTION';
    fullDayThresholdMinutes: number;
    halfDayThresholdMinutes: number;
    breakDeductionType: 'FIXED' | 'FLEXIBLE' | 'AUTO_EXCLUDED';
    autoLunchDeductionMinutes: number;
    otMinQualificationMinutes: number;
    otRoundingMinutes: number;
    compOffQualifyingHours: number;
    compOffValidityDays: number;
    wfhAllowedDaysPerMonth: number;
  };
}

export interface PolicyEvaluationInputDTO {
  firstInTime: string; // "09:12:00"
  lastOutTime: string; // "18:08:00"
  shiftStartTime: string; // "09:00:00"
  shiftEndTime: string; // "18:00:00"
  recordedBreakMinutes: number;
  policyId?: string;
}

export interface PolicyEvaluationResultDTO {
  grossDurationMinutes: number;
  appliedBreakMinutes: number;
  netWorkDurationMinutes: number;
  isLate: boolean;
  lateByMinutes: number;
  isEarlyExit: boolean;
  earlyExitByMinutes: number;
  dayStatus: DayStatus;
  overtimeMinutes: number;
  shortfallMinutes: number;
  explanation: string;
}

export type DayStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'late'
  | 'early_departure'
  | 'on_leave'
  | 'wfh'
  | 'field_duty'
  | 'weekly_off'
  | 'holiday'
  | 'missing_punch'
  | 'unscheduled';

export type EventType = 'IN' | 'OUT' | 'BREAK_OUT' | 'BREAK_IN' | 'MANUAL';

export type EventSource =
  | 'biometric'
  | 'face_recognition'
  | 'rfid'
  | 'mobile_app'
  | 'web_portal'
  | 'geofence'
  | 'admin_manual';

export interface RawPunchDTO {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  avatarUrl?: string;
  timestampUtc: string;
  timeDisplay: string;
  eventType: EventType;
  source: EventSource;
  locationName: string;
  deviceId?: string;
  status: 'accepted' | 'flagged';
  flagReason?: string;
}

export interface AttendanceDayDTO {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  location: string;
  jobTitle?: string;
  attendanceDate: string;
  shiftName: string;
  shiftCode: string;
  shiftTiming: string;
  status: DayStatus;
  firstInTime?: string;
  lastOutTime?: string;
  workDuration: string;
  breakDuration: string;
  netHours: string;
  regularHours: string;
  overtimeHours: string;
  shortfallHours: string;
  isLate: boolean;
  lateByMinutes: number;
  punches: {
    time: string;
    event: string;
    source: string;
    location: string;
    status: string;
  }[];
  remarks?: {
    date: string;
    author: string;
    avatarUrl?: string;
    text: string;
    badge: string;
  }[];
}

export interface DashboardKPISummaryDTO {
  totalEmployees: { count: number; changeVsLastMonth: string };
  present: { count: number; percentage: number };
  notArrived: { count: number; percentage: number };
  late: { count: number; percentage: number };
  onLeave: { count: number; percentage: number };
  wfh: { count: number; percentage: number };
  fieldDuty: { count: number; percentage: number };
  missingPunch: { count: number; percentage: number };
}

export interface HourlyAttendanceTrendItem {
  hour: string;
  present: number;
  expected: number;
}

export interface LocationDistributionItem {
  location: string;
  count: number;
  percentage: number;
  color: string;
}

export interface SystemStatusItem {
  serviceName: string;
  status: 'Operational' | 'Degraded' | 'Offline';
  uptimePercentage: number;
}

export interface RegularisationRequestDTO {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  attendanceDate: string;
  requestType: 'Check In' | 'Check Out' | 'Full Day' | 'Half Day' | 'WFH' | 'Missed Punch';
  reason: string;
  requestedValues: string;
  submittedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back';
}

// -------------------------------------------------------------------------
// Time Event Ingestion & Raw Punch DTOs (Phase 5)
// -------------------------------------------------------------------------

export type PunchSource = 
  | 'biometric' 
  | 'face_recognition' 
  | 'rfid' 
  | 'mobile_app' 
  | 'web_portal' 
  | 'geofence' 
  | 'admin_manual'
  | 'qr_kiosk';

export type PunchType = 'IN' | 'OUT' | 'BREAK_OUT' | 'BREAK_IN' | 'AUTO';

export type IngestionStatus = 'accepted' | 'flagged' | 'duplicate' | 'rejected';

export interface RawPunchEventDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  avatarUrl?: string;
  timestamp: string; // ISO 8601 UTC
  deviceTimezone: string;
  eventType: PunchType;
  source: PunchSource;
  deviceId?: string;
  deviceName?: string;
  locationId?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  distanceFromGeofenceMeters?: number;
  isFlagged: boolean;
  flagReason?: string;
  idempotencyHash: string;
  syncLatencyMs: number;
  offlineQueuedAt?: string;
  ipAddress?: string;
  batteryLevel?: number;
  photoUrl?: string;
  isMockLocation?: boolean;
  rawPayload?: Record<string, any>;
  createdAt: string;
}

export interface IngestPunchRequestDTO {
  employeeId: string;
  timestamp: string;
  eventType: PunchType;
  source: PunchSource;
  deviceId?: string;
  deviceIdentifier?: string;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  photoUrl?: string;
  isMockLocation?: boolean;
  batteryLevel?: number;
  offlineQueuedAt?: string;
  notes?: string;
}

export interface IngestPunchResponseDTO {
  success: boolean;
  punchId: string;
  status: IngestionStatus;
  flagReason?: string;
  idempotencyHash: string;
  processedDayId?: string;
  evaluatedDayStatus?: DayStatus;
  message: string;
}

export interface BatchIngestPunchRequestDTO {
  deviceId: string;
  deviceIdentifier: string;
  syncBatchId: string;
  punches: IngestPunchRequestDTO[];
}

export interface BatchIngestResponseDTO {
  totalReceived: number;
  acceptedCount: number;
  flaggedCount: number;
  duplicateCount: number;
  results: IngestPunchResponseDTO[];
}

export interface RawPunchFilterDTO {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  departmentId?: string;
  locationId?: string;
  source?: PunchSource | 'all';
  eventType?: PunchType | 'all';
  isFlagged?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PunchMetricsSummaryDTO {
  totalToday: number;
  mobileGpsCount: number;
  biometricCount: number;
  webKioskCount: number;
  flaggedCount: number;
  avgSyncLatencyMs: number;
  geofenceCompliancePercentage: number;
}

// -------------------------------------------------------------------------
// My Attendance & Team Attendance Views (Phase 6)
// -------------------------------------------------------------------------

export interface MyAttendanceSummaryDTO {
  month: string;
  year: number;
  totalWorkingDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
  holidayDays: number;
  weeklyOffDays: number;
  totalWorkDurationHours: number;
  totalOvertimeHours: number;
  totalShortfallHours: number;
  attendancePercentage: number;
  regularisedDaysCount: number;
}

export interface MyAttendanceDayRecordDTO {
  id: string;
  date: string;
  dayOfWeek: string;
  shiftCode: string;
  shiftName: string;
  shiftTiming: string;
  firstIn?: string;
  lastOut?: string;
  grossDurationMinutes: number;
  breakDurationMinutes: number;
  netWorkDurationMinutes: number;
  regularDurationMinutes: number;
  overtimeMinutes: number;
  status: DayStatus;
  isLate: boolean;
  lateByMinutes: number;
  isEarlyOut: boolean;
  earlyOutByMinutes: number;
  isRegularised: boolean;
  isSandwichPenalty: boolean;
  punches: {
    id: string;
    time: string;
    type: PunchType;
    source: PunchSource;
    locationName?: string;
    isFlagged: boolean;
  }[];
}

export interface MyAttendanceMonthViewDTO {
  summary: MyAttendanceSummaryDTO;
  days: MyAttendanceDayRecordDTO[];
}

export interface TeamAttendanceMemberDTO {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  designation: string;
  shiftName: string;
  shiftTiming: string;
  todayStatus: DayStatus;
  firstIn?: string;
  lastOut?: string;
  netWorkDurationMinutes: number;
  isLate: boolean;
  lateByMinutes: number;
  pendingRequestsCount: number;
  locationName: string;
  lastPunchChannel?: PunchSource;
}

export interface TeamAttendanceSummaryDTO {
  date: string;
  totalTeamSize: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  onLeaveCount: number;
  missingPunchCount: number;
  pendingRegularisationsCount: number;
  teamCompliancePercentage: number;
  members: TeamAttendanceMemberDTO[];
}

// -------------------------------------------------------------------------
// Attendance Exceptions & Regularisations DTOs (Phase 7)
// -------------------------------------------------------------------------

export type ExceptionType = 
  | 'missing_in_punch' 
  | 'missing_out_punch' 
  | 'late_arrival' 
  | 'early_departure' 
  | 'geofence_breach' 
  | 'mock_gps_detected' 
  | 'excessive_break' 
  | 'unscheduled_shift' 
  | 'sandwich_rule_penalty';

export type ExceptionSeverity = 'critical' | 'warning' | 'info';

export type ExceptionStatus = 'open' | 'in_review' | 'resolved' | 'waived';

export interface AttendanceExceptionDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  avatarUrl?: string;
  date: string;
  shiftName: string;
  shiftTiming: string;
  exceptionType: ExceptionType;
  severity: ExceptionSeverity;
  description: string;
  firstIn?: string;
  lastOut?: string;
  shortfallMinutes: number;
  status: ExceptionStatus;
  resolutionAction?: 'waived' | 'regularised' | 'manual_punch' | 'penalty_applied';
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface ResolveExceptionRequestDTO {
  exceptionId: string;
  action: 'waive' | 'request_employee' | 'manual_punch' | 'apply_penalty';
  reason: string;
  manualIn?: string;
  manualOut?: string;
  penaltyDurationMinutes?: number;
}

export type RegularisationType = 
  | 'check_in' 
  | 'check_out' 
  | 'full_day' 
  | 'wfh' 
  | 'client_visit' 
  | 'missed_punch' 
  | 'half_day';

export interface RegularisationDetailDTO {
  id: string;
  requestCode: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  avatarUrl?: string;
  attendanceDate: string;
  shiftName: string;
  shiftTiming: string;
  requestType: RegularisationType;
  originalIn?: string;
  originalOut?: string;
  requestedIn?: string;
  requestedOut?: string;
  reasonCategory: string;
  reasonText: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent_back';
  currentTier: number;
  maxTiers: number;
  approvers: {
    tier: number;
    approverName: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    actionAt?: string;
  }[];
  submittedAt: string;
}

export interface CreateRegularisationRequestDTO {
  attendanceDate: string;
  requestType: RegularisationType;
  requestedIn?: string;
  requestedOut?: string;
  reasonCategory: string;
  reasonText: string;
  attachmentUrl?: string;
}

export interface OvertimeRequestDTO {
  id: string;
  requestCode: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  avatarUrl?: string;
  attendanceDate: string;
  shiftName: string;
  shiftTiming: string;
  claimedMinutes: number;
  systemCalculatedMinutes: number;
  approvedMinutes?: number;
  projectCode?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverName?: string;
  submittedAt: string;
  decidedAt?: string;
}

// -------------------------------------------------------------------------
// Unified Approvals Workflow Engine DTOs (Phase 8)
// -------------------------------------------------------------------------

export type ApprovalCategory = 'regularisation' | 'overtime' | 'shift_swap' | 'leave';

export type ApprovalDecision = 'approved' | 'rejected' | 'sent_back' | 'delegated';

export interface UnifiedApprovalItemDTO {
  id: string;
  requestCode: string;
  category: ApprovalCategory;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  avatarUrl?: string;
  targetDate: string;
  title: string;
  summaryDetails: string;
  originalValues?: string;
  requestedValues: string;
  reasonCategory?: string;
  reasonText: string;
  currentTier: number;
  maxTiers: number;
  priority: 'high' | 'medium' | 'low';
  slaHoursRemaining: number;
  status: 'pending' | 'approved' | 'rejected' | 'sent_back';
  swapPartnerName?: string;
  swapPartnerAvatar?: string;
  restPeriodCompliance?: boolean;
  claimedDurationMinutes?: number;
  policyCalculatedMinutes?: number;
  submittedAt: string;
}

export interface ApprovalDecisionRequestDTO {
  approvalId: string;
  category: ApprovalCategory;
  decision: ApprovalDecision;
  comments: string;
  adjustedDurationMinutes?: number;
  delegateToUserId?: string;
}

export interface BulkApprovalDecisionRequestDTO {
  approvalIds: string[];
  decision: 'approved' | 'rejected';
  comments: string;
}

export interface ApprovalHistoryLogDTO {
  id: string;
  requestCode: string;
  category: ApprovalCategory;
  employeeName: string;
  employeeCode: string;
  avatarUrl?: string;
  decision: ApprovalDecision;
  approverName: string;
  approverRole: string;
  decisionTimestamp: string;
  comments: string;
  impactSummary: string;
}

export interface ApprovalInboxMetricsDTO {
  pendingMyActionCount: number;
  escalatedCount: number;
  approvalsCompletedThisMonth: number;
  avgTurnaroundHours: number;
  regularisationsPending: number;
  overtimePending: number;
  shiftSwapsPending: number;
}

// -------------------------------------------------------------------------
// Device Management & Geofencing Operations DTOs (Phase 9)
// -------------------------------------------------------------------------

export type DeviceType = 
  | 'biometric_terminal' 
  | 'face_recognition' 
  | 'rfid_reader' 
  | 'mobile_kiosk' 
  | 'web_kiosk';

export type DeviceHealthStatus = 'online' | 'offline' | 'warning' | 'maintenance';

export interface DeviceDTO {
  id: string;
  tenantId: string;
  deviceIdentifier: string;
  name: string;
  deviceType: DeviceType;
  locationId: string;
  locationName: string;
  ipAddress?: string;
  port?: number;
  macAddress?: string;
  status: DeviceHealthStatus;
  lastHeartbeatAt: string;
  enrolledTemplatesCount: number;
  firmwareVersion: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  storageUsagePercent: number;
  lastSyncLatencyMs: number;
  serialNumber: string;
  installedAtZone: string;
  createdAt: string;
}

export interface CreateDeviceRequestDTO {
  deviceIdentifier: string;
  name: string;
  deviceType: DeviceType;
  locationId: string;
  ipAddress?: string;
  port?: number;
  serialNumber: string;
  installedAtZone: string;
  firmwareVersion?: string;
}

export interface GeofenceConfigDTO {
  id: string;
  locationId: string;
  locationName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  polygonCoordinates?: { lat: number; lng: number }[];
  enableAntiMockGps: boolean;
  minGpsAccuracyMeters: number;
  autoPunchOnEntry: boolean;
  activeWorkersCount: number;
  complianceRatePercentage: number;
  dailyPunchesCount: number;
}

export interface DeviceCommandRequestDTO {
  deviceId: string;
  command: 'reboot' | 'sync_templates' | 'fetch_logs' | 'ping' | 'clear_cache';
}

export interface DeviceCommandResponseDTO {
  success: boolean;
  commandId: string;
  deviceId: string;
  outputMessage: string;
  executedAt: string;
}

// -------------------------------------------------------------------------
// Attendance Finalisation & Payroll Handoff DTOs (Phase 10)
// -------------------------------------------------------------------------

export type PayPeriodStatus = 'draft' | 'reconciling' | 'ready_to_lock' | 'locked';

export type PayrollExportFormat = 'csv' | 'xlsx' | 'sap_json' | 'adp' | 'workday' | 'workday_xml';

export interface PayPeriodDTO {
  id: string;
  tenantId: string;
  periodCode: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PayPeriodStatus;
  totalEmployees: number;
  totalPayableDays: number;
  totalPresentDays: number;
  totalPaidLeaves: number;
  totalLopDays: number;
  totalOvertimeHours: number;
  pendingExceptionsCount: number;
  pendingRegularisationsCount: number;
  readinessPercentage: number;
  lockSignature?: string;
  lockedBy?: string;
  lockedAt?: string;
  createdAt: string;
}

export interface DepartmentReconciliationDTO {
  departmentId: string;
  departmentName: string;
  headcount: number;
  expectedDays: number;
  presentDays: number;
  paidLeaves: number;
  lopDays: number;
  overtimeHours: number;
  shortfallHours: number;
  openExceptionsCount: number;
  status: 'ready' | 'action_required' | 'locked';
}

export interface PeriodReconciliationSummaryDTO {
  period: PayPeriodDTO;
  departments: DepartmentReconciliationDTO[];
  checkpoints: {
    name: string;
    description: string;
    passed: boolean;
    count: number;
    actionRequiredMessage?: string;
  }[];
}

export interface LockPeriodRequestDTO {
  periodId: string;
  lockReason: string;
  supervisorPin: string;
}

export interface PayrollExportRequestDTO {
  periodId: string;
  format: PayrollExportFormat;
  includeOvertimeBreakdown: boolean;
  includeShiftAllowance: boolean;
  includeLateDeductions: boolean;
  costCenterFilter?: string;
}

export interface PayrollExportBatchDTO {
  batchId: string;
  periodId: string;
  periodName: string;
  format: PayrollExportFormat;
  recordCount: number;
  exportedBy: string;
  exportedAt: string;
  downloadUrl: string;
  fileSizeBytes: number;
  lockHash: string;
}

export interface StandardApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
  requestId: string;
}

// -------------------------------------------------------------------------
// Reports & Analytics DTOs (Phase 11)
// -------------------------------------------------------------------------

export type ReportType =
  | 'muster_roll'
  | 'daily_summary'
  | 'lateness_trend'
  | 'overtime_cost'
  | 'geofence_audit'
  | 'leave_utilization';

export type ReportExportFormat = 'xlsx' | 'pdf' | 'csv' | 'json';

export interface ReportTemplateDTO {
  id: string;
  reportType: ReportType;
  title: string;
  category: 'Attendance & Time' | 'Exceptions & Compliance' | 'Payroll & Cost' | 'Operations';
  description: string;
  icon: string;
  popular: boolean;
  defaultFormat: ReportExportFormat;
  supportedFormats: ReportExportFormat[];
}

export interface MusterRollRecordDTO {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  totalDays: number;
  presentDays: number;
  weeklyOffs: number;
  paidLeaves: number;
  holidays: number;
  lopDays: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  dailyStatus: Record<number, string>; // day 1 to 31 status codes ('P', 'A', 'L', 'WO', 'H', 'HD', 'WFH')
}

export interface ReportFilterParametersDTO {
  reportType: ReportType;
  dateFrom: string;
  dateTo: string;
  departmentId?: string;
  locationId?: string;
  shiftId?: string;
  employeeId?: string;
  search?: string;
  statusFilter?: string;
  format?: ReportExportFormat;
}

export interface ReportScheduleDTO {
  id: string;
  tenantId: string;
  reportType: ReportType;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: ReportExportFormat;
  status: 'active' | 'paused';
  nextRunAt: string;
  lastSentAt?: string;
  createdAt: string;
}

// -------------------------------------------------------------------------
// Superadmin & Multi-Tenancy DTOs (Phase 12)
// -------------------------------------------------------------------------

export interface SuperAdminMetricsDTO {
  totalTenants: number;
  activeTenants: number;
  totalSeatsUtilized: number;
  totalLicensedSeats: number;
  totalGlobalDevices: number;
  globalIngestionRateRps: number;
  systemHealthScore: number;
}

export interface CreateTenantRequestDTO {
  name: string;
  code: string;
  subdomain: string;
  planTier: TenantPlanTier;
  maxSeats: number;
  maxDevices: number;
  dataRegion: 'ap-south-1' | 'us-east-1' | 'eu-central-1' | 'ap-southeast-1';
  adminEmail: string;
  adminName: string;
  enabledModules: string[];
}

export interface UpdateTenantStatusRequestDTO {
  tenantId: string;
  status: TenantStatus;
  reason?: string;
}

// -------------------------------------------------------------------------
// Audit Trail & Compliance Explorer DTOs (Phase 13)
// -------------------------------------------------------------------------

export type AuditEventCategory =
  | 'authentication'
  | 'attendance'
  | 'policy'
  | 'hardware'
  | 'security'
  | 'payroll'
  | 'superadmin';

export type AuditEventSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntryDTO {
  id: string;
  tenantId: string;
  timestamp: string;
  eventCode: string;
  category: AuditEventCategory;
  severity: AuditEventSeverity;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  targetEntity: string;
  targetId: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  description: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  hashSignature: string;
  previousHash: string;
}

export interface AuditFilterParametersDTO {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  severity?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface AuditMetricsDTO {
  totalLogsCount: number;
  highRiskEventsCount: number;
  tamperProofStatus: boolean;
  retentionDays: number;
  latestBlockHeight: number;
  lastVerifiedAt: string;
}

// -------------------------------------------------------------------------
// Integrations & Webhooks Engine DTOs (Phase 15)
// -------------------------------------------------------------------------

export type IntegrationCategory = 'hrms' | 'payroll' | 'hardware_bridge' | 'identity_scim' | 'webhook';
export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface IntegrationConnectorDTO {
  id: string;
  code: string;
  name: string;
  category: IntegrationCategory;
  icon: string;
  status: IntegrationStatus;
  description: string;
  lastSyncAt?: string;
  nextSyncAt?: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  recordsCount?: number;
  config?: Record<string, any>;
}

export interface WebhookSubscriptionDTO {
  id: string;
  tenantId: string;
  url: string;
  description: string;
  secretKey: string;
  events: string[];
  status: 'active' | 'paused' | 'failing';
  successRate: number;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface WebhookDeliveryLogDTO {
  id: string;
  webhookId: string;
  eventType: string;
  timestamp: string;
  statusCode: number;
  durationMs: number;
  payload: Record<string, any>;
  responseBody?: string;
  status: 'success' | 'failed';
}

export interface TriggerWebhookTestRequestDTO {
  webhookId: string;
  eventType: string;
  samplePayload?: Record<string, any>;
}

// -------------------------------------------------------------------------
// Universal Leave Management & Executive Exemption Engine (Phase 17 Extension)
// -------------------------------------------------------------------------

export type LeaveAccrualMode = 'FRONT_LOADED' | 'MONTHLY_PRO_RATA' | 'WORK_DAYS_BASED' | 'TENURE_ESCALATION';
export type LeaveCalculationBasis = 'WORKING_DAYS' | 'CALENDAR_DAYS';
export type LeaveCategory = 'ANNUAL' | 'CASUAL' | 'SICK' | 'COMPENSATORY' | 'STATUTORY' | 'UNPAID';
export type ExecutiveTrackingArchetype =
  | 'NEGATIVE_100_PERCENT_EXEMPT'
  | 'SINGLE_PUNCH_FULL_DAY_CREDIT'
  | 'CORE_HOURS_EXCEPTION_ONLY'
  | 'POSITIVE_STRICT_IN_OUT';

export interface UniversalLeaveTypeDefinitionDTO {
  id: string;
  tenantId: string;
  code: string; // 'EL', 'CL', 'SL', 'AL_GCC', 'PTO', 'COMP_OFF', 'HAJJ'
  name: string;
  category: LeaveCategory;
  description: string;
  color: string;
  
  // 1. Accrual & Allocation
  accrualMode: LeaveAccrualMode;
  annualEntitlementDays: number;
  accrualFrequency: 'ANNUAL' | 'MONTHLY' | 'BI_WEEKLY' | 'QUARTERLY';
  tenureEscalations?: { minTenureMonths: number; additionalDays: number }[];
  
  // 2. Day Calculation Physics
  calculationBasis: LeaveCalculationBasis;
  allowHalfDay: boolean;
  allowQuarterDay: boolean;
  minConsecutiveDays: number;
  maxConsecutiveDays: number;

  // 3. Carryforward & Lapsing
  allowCarryforward: boolean;
  maxCarryforwardDays: number;
  carryforwardExpiryMonths?: number; // e.g. 3 months (March 31st lapse)

  // 4. Encashment Rules
  allowEncashment: boolean;
  minRetentionDaysBeforeEncashment: number;
  encashmentCalculationDivisor: 26 | 30;
  encashmentSalaryBasis: 'BASIC_ONLY' | 'GROSS_SALARY';

  // 5. Inter-Leave & Sandwich Rules
  canClubWithLeaveTypes: string[];
  enforceSandwichRule: boolean;

  // 6. Tiered Pay (GCC Sick Leave Model)
  tieredPayStructure?: {
    tier1Days: number; tier1PayPercentage: number;
    tier2Days: number; tier2PayPercentage: number;
    tier3Days: number; tier3PayPercentage: number;
  };
}

export interface ExecutiveAttendanceExemptionProfileDTO {
  id: string;
  tenantId: string;
  profileName: string;
  trackingMode: ExecutiveTrackingArchetype;
  description: string;
  allowMissingPunchTolerance: boolean;
  autoWaiveLatenessGrace: boolean;
  autoCreditHoursOnSinglePunch: number; // e.g. 8.0
  coreHoursWindow?: { start: string; end: string };
  assignedDesignations: string[];
  assignedDepartments: string[];
  headcountCount: number;
}

export interface LeaveBalanceRecordDTO {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  annualQuota: number;
  accruedDays: number;
  usedDays: number;
  pendingApprovalDays: number;
  carriedForwardDays: number;
  availableBalance: number;
  encashableBalance: number;
}

export interface LeaveEncashmentCalculationDTO {
  employeeId: string;
  employeeName: string;
  leaveTypeCode: string;
  availableBalance: number;
  requestedEncashmentDays: number;
  eligibleEncashmentDays: number;
  retainedBalanceAfterEncashment: number;
  monthlyBasicSalary: number;
  calculationDivisor: number;
  perDayRate: number;
  totalPayoutAmount: number;
  currency: string;
  explanation: string;
}

// =========================================================================
// Addon Marketplace & Subscription Contracts
// =========================================================================

export type TenantAddonModule =
  | 'hr_suite'
  | 'time_and_materials'
  | 'ai_anti_spoofing'
  | 'payroll_disbursement';

export interface AddonCatalogItemDTO {
  id: TenantAddonModule;
  name: string;
  tagline: string;
  description: string;
  category: 'Core HR' | 'Productivity' | 'Security & Biometrics' | 'Financial & Payroll';
  pricePerSeatMonthly: number;
  pricePerSeatAnnual: number;
  trialDays: number;
  badge?: string;
  features: string[];
  popular?: boolean;
  iconName: string;
}

export type AddonSubscriptionStatus = 'inactive' | 'trial' | 'active' | 'cancelled';

export interface TenantAddonSubscriptionDTO {
  id: string;
  tenantId: string;
  addonId: TenantAddonModule;
  status: AddonSubscriptionStatus;
  billingCycle: 'monthly' | 'annual';
  subscribedSeats: number;
  unitPrice: number;
  monthlyTotal: number;
  trialEndsAt?: string;
  renewsAt?: string;
  activatedAt: string;
  autoRenew: boolean;
}

export interface SubscribeAddonRequestDTO {
  addonId: TenantAddonModule;
  billingCycle: 'monthly' | 'annual';
  seats?: number;
  paymentMethodId?: string;
  startAsTrial?: boolean;
}

// =========================================================================
// Core HR Module Domain Contracts
// =========================================================================

export type OnboardingStage =
  | 'invited'
  | 'docs_pending'
  | 'it_provisioning'
  | 'induction'
  | 'completed';

export interface OnboardingTaskDTO {
  id: string;
  title: string;
  category: 'documentation' | 'it_setup' | 'hr_induction' | 'training';
  assignedToRole: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  required: boolean;
}

export interface OnboardingCandidateDTO {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  reportingManager: string;
  location: string;
  stage: OnboardingStage;
  progressPercent: number;
  tasks: OnboardingTaskDTO[];
  buddyName?: string;
  contractSigned: boolean;
  avatarUrl?: string;
}

export type DocumentCategory =
  | 'identity'
  | 'contract'
  | 'visa'
  | 'certification'
  | 'tax'
  | 'nda';

export type DocumentExpiryStatus = 'valid' | 'expiring_soon' | 'expired' | 'not_applicable';

export interface EmployeeDocumentDTO {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  expiryStatus: DocumentExpiryStatus;
  daysUntilExpiry?: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  downloadUrl: string;
  createdAt: string;
}

export type AssetCategory =
  | 'laptop'
  | 'monitor'
  | 'mobile_sim'
  | 'access_card'
  | 'vehicle'
  | 'uniform';

export type AssetStatus = 'available' | 'allocated' | 'maintenance' | 'retired';

export interface CompanyAssetDTO {
  id: string;
  assetTag: string; // e.g., AST-LT-042
  name: string; // e.g., MacBook Pro 16" M3 Max
  category: AssetCategory;
  model: string;
  serialNumber: string;
  specifications: string;
  status: AssetStatus;
  allocatedToEmployeeId?: string;
  allocatedToEmployeeName?: string;
  allocatedToEmployeeCode?: string;
  allocatedDate?: string;
  condition: 'brand_new' | 'good' | 'fair' | 'damaged';
  purchaseDate: string;
  warrantyExpiry: string;
  estimatedValueUsd: number;
  location: string;
}

export type PerformanceCycleStatus = 'planning' | 'in_review' | 'calibration' | 'completed';

export interface EmployeeGoalDTO {
  id: string;
  title: string;
  description: string;
  category: 'delivery' | 'quality' | 'leadership' | 'learning';
  weightagePercent: number;
  targetMetric: string;
  progressPercent: number;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
}

export interface PerformanceReviewDTO {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  reviewerManagerId: string;
  reviewerManagerName: string;
  cycleName: string; // e.g. "H1 2026 Appraisal Cycle"
  cycleStatus: PerformanceCycleStatus;
  selfRating?: number; // 1-5 scale
  managerRating?: number; // 1-5 scale
  finalRating?: number;
  managerFeedback?: string;
  strengths?: string[];
  growthAreas?: string[];
  goals: EmployeeGoalDTO[];
  completedAt?: string;
}

export type TicketCategory =
  | 'general_hr'
  | 'letter_request'
  | 'payroll_query'
  | 'policy_clarification'
  | 'grievance';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_employee'
  | 'resolved'
  | 'closed';

export interface HRHelpdeskTicketDTO {
  id: string;
  ticketNumber: string; // e.g., TKT-HR-1094
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToHRName?: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  requestedLetterType?: 'bonafide' | 'experience' | 'salary_certificate' | 'visa_invitation';
}

export interface HRDashboardSummaryDTO {
  totalActiveEmployees: number;
  activeOnboardings: number;
  completedOnboardingsThisMonth: number;
  totalAssetsManaged: number;
  allocatedAssets: number;
  availableAssets: number;
  expiringDocumentsNext30Days: number;
  activeAppraisalCycles: number;
  openHelpdeskTickets: number;
  averageResolutionHours: number;
}

// =========================================================================
// Time & Materials (T&M) / Project Billing Module Domain Contracts
// Boundary: tm_ prefix. References employeeId as FK only.
// =========================================================================

export type TMProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TMTimesheetStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type TMInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type TMBillingType = 'time_and_materials' | 'fixed_price' | 'milestone';

export interface TMClientDTO {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingCurrency: string;
  country: string;
  status: 'active' | 'inactive';
  contractStartDate: string;
  contractEndDate: string;
  totalBudget: number;
  invoicedToDate: number;
  createdAt: string;
}

export interface TMProjectDTO {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  name: string;
  code: string;
  description: string;
  status: TMProjectStatus;
  budget: number;
  budgetCurrency: string;
  billedToDate: number;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  projectManagerId: string;
  projectManagerName: string;
  teamSize: number;
  totalBillableHours: number;
  totalNonBillableHours: number;
  utilizationPercent: number;
  completionPercent: number;
  rateCardId?: string;
}

export interface TMTaskDTO {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  billable: boolean;
  estimatedHours: number;
  loggedHours: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  dueDate?: string;
  createdAt: string;
}

export interface TMRateCardDTO {
  id: string;
  tenantId: string;
  name: string;
  roleTitle: string;
  clientId?: string;
  clientName?: string;
  currency: string;
  hourlyRate: number;
  overtimeMultiplier: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  billingType: TMBillingType;
}

export interface TMTimesheetEntryDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  clientId?: string;
  taskId?: string;
  taskName?: string;
  date: string;
  hoursLogged: number;
  isBillable: boolean;
  rateCardId?: string;
  hourlyRate: number;
  billedAmount: number;
  description: string;
  status: TMTimesheetStatus;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface TMInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  billable: boolean;
}

export interface TMInvoiceDTO {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectIds: string[];
  periodFrom: string;
  periodTo: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: TMInvoiceStatus;
  dueDate: string;
  paidDate?: string;
  lineItems: TMInvoiceLineItem[];
  notes?: string;
  createdAt: string;
  sentAt?: string;
}

export interface TMDashboardSummaryDTO {
  totalActiveClients: number;
  totalActiveProjects: number;
  totalProjectBudgetUSD: number;
  totalBilledUSD: number;
  pendingTimesheetApprovals: number;
  currentWeekBillableHours: number;
  currentWeekNonBillableHours: number;
  overallUtilizationPercent: number;
  outstandingInvoiceAmount: number;
  outstandingInvoiceCount: number;
  overdueInvoiceCount: number;
  totalInvoicedThisMonth: number;
}

// =========================================================================
// Advanced AI Biometric Anti-Spoofing Module Domain Contracts
// Boundary: sec_ prefix. References employeeId & deviceId as FKs only.
// =========================================================================

export type SecThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type SecLivenessResult = 'passed' | 'failed' | 'warning' | 'skipped';
export type SecSpoofEventType = 'gps_spoof' | 'photo_replay' | 'deepfake_face' | 'root_bypass' | 'screen_replay' | 'mask_attack';
export type SecSpoofEventStatus = 'detected' | 'confirmed' | 'under_review' | 'false_positive' | 'resolved';
export type SecAttestationStatus = 'passed' | 'warning' | 'failed' | 'pending';
export type SecBlacklistThreatCategory = 'gps_spoof' | 'root_jailbreak' | 'deepfake' | 'screen_replay' | 'vpn_proxy';

export interface SecLivenessCheckDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  deviceId: string;
  checkType: '3d_passive' | 'blink_challenge' | 'head_turn_challenge' | 'deepfake_scan';
  result: SecLivenessResult;
  confidenceScore: number;   // 0-100
  livenessScore: number;     // 0-100
  challengeType: string;
  timestamp: string;
  processingTimeMs: number;
  modelVersion: string;
  failureReason?: string;
  actionRequired: boolean;
  spoofEventId?: string;
}

export interface SecSpoofEventDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  eventType: SecSpoofEventType;
  threatLevel: SecThreatLevel;
  detectedAt: string;
  deviceId: string;
  deviceModel: string;
  latitude: number;
  longitude: number;
  detectionMethod: string;
  description: string;
  evidenceImageUrl?: string;
  punchBlocked: boolean;
  hrAlerted: boolean;
  managerAlerted: boolean;
  status: SecSpoofEventStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  mlModelConfidence: number;
  falsePositiveProbability: number;
}

export interface SecDeviceAttestationDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  deviceId: string;
  deviceModel: string;
  platform: 'android' | 'ios';
  osVersion: string;
  appVersion: string;
  attestationStatus: SecAttestationStatus;
  isRooted: boolean;
  isMockLocationEnabled: boolean;
  isEmulator: boolean;
  safetyNetStatus: 'passed' | 'failed' | 'unavailable';
  playIntegrityStatus: 'strong' | 'basic' | 'failed';
  blacklistedAppsFound: string[];
  lastCheckedAt: string;
  firstRegisteredAt: string;
  warningReason?: string;
}

export interface SecBlacklistedAppDTO {
  id: string;
  tenantId: string;
  appPackageName: string;
  appDisplayName: string;
  platform: 'android' | 'ios' | 'both';
  threatCategory: SecBlacklistThreatCategory;
  severity: SecThreatLevel;
  detectedCount: number;
  addedAt: string;
  addedBy: string;
  isActive: boolean;
  description: string;
}

export interface SecThreatSummaryDTO {
  totalDevicesRegistered: number;
  devicesPassedAttestation: number;
  devicesWithWarning: number;
  devicesBlocked: number;
  totalSpoofEventsLast30Days: number;
  criticalThreatCount: number;
  highThreatCount: number;
  punchesBlockedLast30Days: number;
  livenessPassRate: number;
  avgLivenessScore: number;
  blacklistedAppsActive: number;
  totalBlacklistDetections: number;
  overallThreatLevel: SecThreatLevel;
}

// =========================================================================
// Automated Direct Payroll Disbursement Module Domain Contracts
// Boundary: fin_ prefix. References employeeId & tenantId as FKs only.
// Never modifies attendance, HR, or T&M records.
// =========================================================================

export type FinPayrollRunStatus = 'draft' | 'pending_approval' | 'approved' | 'disbursed' | 'failed' | 'cancelled';
export type FinDisbursementStatus = 'pending' | 'processing' | 'credited' | 'failed' | 'reversed';
export type FinTransferMethod = 'neft' | 'rtgs' | 'upi' | 'ach' | 'sepa' | 'wps' | 'swift';
export type FinTaxSlipType = 'form16' | 'w2' | 'p60' | 'uae_salary_certificate' | 'generic';
export type FinEWAStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';

export interface FinPayrollRunDTO {
  id: string;
  tenantId: string;
  runName: string;
  periodFrom: string;
  periodTo: string;
  paymentDate: string;
  currency: string;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetPayout: number;
  totalEmployerPF: number;
  totalTax: number;
  employeeCount: number;
  status: FinPayrollRunStatus;
  approvedBy?: string;
  approvedAt?: string;
  disbursedAt?: string;
  disbursementMethod?: string;
  cryptoHash?: string;
  lockedAt?: string;
  createdAt: string;
}

export interface FinEmployeeBankAccountDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;        // masked e.g. ****4892
  ifscCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  accountType: 'savings' | 'current' | 'checking';
  currency: string;
  country: string;
  transferMethod: FinTransferMethod;
  upiId?: string;
  wpsLabourCardNumber?: string;
  isVerified: boolean;
  isPrimary: boolean;
  verifiedAt?: string;
}

export interface FinDisbursementDTO {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  grossSalary: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  otherAllowances: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  totalDeductions: number;
  netPayout: number;
  currency: string;
  bankAccountId: string;
  transferMethod: FinTransferMethod;
  transferReference?: string;
  status: FinDisbursementStatus;
  creditedAt?: string;
  failureReason?: string;
  paymentDate: string;
}

export interface FinTaxSlipDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  financialYear: string;
  slipType: FinTaxSlipType;
  grossSalary: number;
  totalTaxableIncome: number;
  totalTaxDeducted: number;
  surcharge: number;
  educationCess: number;
  netTaxPayable: number;
  status: 'draft' | 'issued' | 'amended';
  issuedAt?: string;
  downloadUrl: string;
}

export interface FinEWARequestDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  requestedAmount: number;
  approvedAmount?: number;
  currency: string;
  reason: string;
  status: FinEWAStatus;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  disbursedAt?: string;
  repaymentDate?: string;
  rejectionReason?: string;
  feePercent: number;
  earnedWageToDate: number;
  maxEligibleAmount: number;
}

export interface FinPayrollDashboardSummaryDTO {
  totalEmployeesOnPayroll: number;
  lastPayrollAmount: number;
  lastPayrollCurrency: string;
  lastPayrollDate: string;
  pendingApprovalRuns: number;
  draftRuns: number;
  failedDisbursements: number;
  pendingEWARequests: number;
  totalEWADisbursedThisMonth: number;
  taxSlipsIssued: number;
  taxSlipsPending: number;
  bankAccountsUnverified: number;
  nextPayrollDate: string;
  nextPayrollEstimatedAmount: number;
}

// =========================================================================
// Field Force Management Module Domain Contracts
// Boundary: ff_ prefix. References employeeId, tenantId, locationId as FKs.
// Never modifies HR, T&M, Payroll, Security, or Attendance records.
// =========================================================================

export type FFJobStatus = 'scheduled' | 'dispatched' | 'en_route' | 'on_site' | 'completed' | 'cancelled' | 'failed';
export type FFSiteStatus = 'active' | 'inactive' | 'suspended';
export type FFVehicleStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type FFExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
export type FFTerritoryType = 'zone' | 'district' | 'region' | 'country';
export type FFJobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface FFJobSiteDTO {
  id: string;
  tenantId: string;
  siteName: string;
  siteCode: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  clientName: string;
  clientContactName: string;
  clientContactPhone: string;
  territory: string;
  status: FFSiteStatus;
  totalJobsCompleted: number;
  averageJobDurationMins: number;
  lastVisitedAt?: string;
  createdAt: string;
}

export interface FFFieldEngineerDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  skills: string[];
  currentStatus: 'available' | 'dispatched' | 'on_site' | 'off_duty' | 'on_leave';
  currentJobId?: string;
  currentSiteId?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdatedAt?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  totalJobsThisMonth: number;
  completionRate: number;
  avgRating: number;
  territory: string;
}

export interface FFJobOrderDTO {
  id: string;
  tenantId: string;
  jobCode: string;
  title: string;
  description: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  clientName: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  priority: FFJobPriority;
  status: FFJobStatus;
  scheduledAt: string;
  estimatedDurationMins: number;
  actualDurationMins?: number;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  customerSignatureUrl?: string;
  completionPhotoUrl?: string;
  completionNotes?: string;
  partsUsed?: string[];
  customerRating?: number;
  createdAt: string;
}

export interface FFSiteCheckInDTO {
  id: string;
  tenantId: string;
  jobId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  siteId: string;
  siteName: string;
  checkInLatitude: number;
  checkInLongitude: number;
  distanceFromSiteMeters: number;
  isWithinGeofence: boolean;
  checkInPhotoUrl?: string;
  checkInAt: string;
  checkOutAt?: string;
  durationMins?: number;
  gpsAccuracyMeters: number;
  verificationStatus: 'verified' | 'outside_geofence' | 'pending' | 'disputed';
}

export interface FFVehicleDTO {
  id: string;
  tenantId: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: 'car' | 'van' | 'truck' | 'motorcycle' | 'electric';
  status: FFVehicleStatus;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  currentOdometerKm: number;
  lastServiceKm: number;
  nextServiceKm: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  insuranceExpiryDate: string;
  registrationExpiryDate: string;
  territory: string;
}

export interface FFMileageClaimDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  jobId: string;
  jobCode: string;
  vehicleId?: string;
  vehicleNumber?: string;
  tripDate: string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  ratePerKm: number;
  claimAmount: number;
  currency: string;
  status: FFExpenseStatus;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  payrollRunId?: string;
}

export interface FFDashboardSummaryDTO {
  totalFieldEngineers: number;
  engineersOnSite: number;
  engineersAvailable: number;
  engineersOffDuty: number;
  totalJobSites: number;
  activeJobSites: number;
  jobsScheduledToday: number;
  jobsCompletedToday: number;
  jobsInProgress: number;
  jobsOverdue: number;
  avgCompletionRate: number;
  avgCustomerRating: number;
  pendingMileageClaims: number;
  totalMileageClaimAmountPending: number;
  fleetAvailable: number;
  fleetAssigned: number;
  fleetInMaintenance: number;
}

// =========================================================================
// Global Payroll Engine  Domain Contracts (gpr_ prefix)
// Boundary: References employeeId + tenantId as FKs only.
// Cluster-based design: 7 engines, 15+ country rate-table configs.
// Feeds calculated results into fin_ module for actual disbursement.
// =========================================================================

export type GprCluster =
  | 'SOUTH_ASIA'
  | 'GCC'
  | 'EU_CONTINENTAL'
  | 'UK_COMMONWEALTH'
  | 'AMERICAS'
  | 'EAST_ASIA'
  | 'NORDIC';

export type GprPayrollRunStatus = 'draft' | 'calculated' | 'approved' | 'submitted' | 'closed';
export type GprComplianceStatus = 'upcoming' | 'due_soon' | 'overdue' | 'filed' | 'na';
export type GprFilingFrequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export interface GprTaxBracket {
  from: number;
  to: number | null;   // null = unlimited
  rate: number;        // 0.20 = 20%
  label: string;
}

export interface GprContributionDef {
  name: string;
  code: string;
  rate: number;
  cap?: number;               // monthly cap in local currency
  annualCap?: number;         // annual wage base cap
  basis: 'gross' | 'basic' | 'earned_wage_base';
  isEmployer: boolean;
  description: string;
  taxable?: boolean;          // does this contribution reduce taxable income?
}

export interface GprSalaryComponentDef {
  code: string;
  name: string;
  typicalPercentOfGross: number;   // e.g. 0.40 for basic = 40% of gross
  taxExempt: boolean;
  mandatory: boolean;
  description: string;
}

export interface GprEOSBConfig {
  applicable: boolean;
  basis: 'basic' | 'gross';
  daysPerYear_first5: number;   // days of salary per year for first 5 years
  daysPerYear_after5: number;   // days of salary per year after 5 years
  cap?: number;                 // max months of salary (UAE: 2 years total)
  description: string;
}

export interface GprComplianceFilingDef {
  code: string;
  name: string;
  authority: string;
  frequency: GprFilingFrequency;
  description: string;
  penaltyNote?: string;
}

export interface GprCountryProfile {
  code: string;                   // ISO 2-letter
  name: string;
  flag: string;                   // emoji
  currency: string;
  currencySymbol: string;
  cluster: GprCluster;
  taxSystem: string;
  hasTax: boolean;
  taxBrackets: GprTaxBracket[];
  standardDeduction: number;      // annual, in local currency
  personalAllowance: number;      // annual, reduces taxable income
  employeeContributions: GprContributionDef[];
  employerContributions: GprContributionDef[];
  salaryComponents: GprSalaryComponentDef[];
  eosb: GprEOSBConfig;
  complianceFilings: GprComplianceFilingDef[];
  specialNotes: string[];
  keyFacts: {
    taxRange: string;
    employeeSSRate: string;
    employerSSRate: string;
    noTax: boolean;
    mandatoryComponents: string[];
  };
}

export interface GprCalculationInput {
  tenantId: string;
  employeeId: string;
  countryCode: string;
  grossAnnual: number;
  basicSalaryPercent?: number;    // as fraction of gross e.g. 0.40 for 40%
  yearsOfService?: number;        // for EOSB calculation
  isNational?: boolean;           // UAE/Saudi: affects social security applicability
}

export interface GprTaxBracketResult {
  label: string;
  taxableAmount: number;
  rate: number;
  tax: number;
}

export interface GprContributionResult {
  name: string;
  code: string;
  rate: number;
  monthlyAmount: number;
  annualAmount: number;
  isEmployer: boolean;
}

export interface GprCalculationResult {
  input: GprCalculationInput;
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  cluster: GprCluster;

  // Salary breakdown
  grossAnnual: number;
  grossMonthly: number;
  basicAnnual: number;
  basicMonthly: number;

  // Tax
  standardDeduction: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTaxAnnual: number;
  incomeTaxMonthly: number;
  taxBracketBreakdown: GprTaxBracketResult[];
  effectiveTaxRate: number;

  // Employee deductions
  employeeContributions: GprContributionResult[];
  totalEmployeeContributionsAnnual: number;
  totalEmployeeContributionsMonthly: number;

  // Net take-home
  netAnnual: number;
  netMonthly: number;
  effectiveTotalDeductionRate: number;

  // Employer cost
  employerContributions: GprContributionResult[];
  totalEmployerContributionsAnnual: number;
  totalEmployerCostAnnual: number;
  totalEmployerCostMonthly: number;

  // EOSB / Gratuity accrual
  eosbAnnualAccrual: number;
  eosbMonthlyAccrual: number;
  eosbDescription: string;

  // Compliance notes
  complianceNotes: string[];
  generatedAt: string;
}

export interface GprPayrollRunDTO {
  id: string;
  tenantId: string;
  runName: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  currency: string;
  periodFrom: string;
  periodTo: string;
  paymentDate: string;
  employeeCount: number;
  totalGrossPayroll: number;
  totalTaxWithheld: number;
  totalEmployeeDeductions: number;
  totalNetPayroll: number;
  totalEmployerContributions: number;
  totalEmployerCost: number;
  status: GprPayrollRunStatus;
  approvedBy?: string;
  approvedAt?: string;
  complianceFilingsDue: string[];
  createdAt: string;
}

export interface GprComplianceItemDTO {
  id: string;
  tenantId: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  filingCode: string;
  filingName: string;
  authority: string;
  frequency: GprFilingFrequency;
  periodCovered: string;
  dueDate: string;
  status: GprComplianceStatus;
  penaltyNote?: string;
  filedAt?: string;
  referenceNumber?: string;
}

export interface GprGlobalDashboardDTO {
  countriesActive: number;
  totalPayrollRuns: number;
  totalGrossPayrollAllCountries: number;
  totalEmployeesGlobally: number;
  pendingComplianceFilings: number;
  overdueComplianceFilings: number;
  payrollRunsByCountry: { countryCode: string; countryName: string; flag: string; currency: string; runs: number; totalGross: number }[];
  upcomingFilings: GprComplianceItemDTO[];
}

// =========================================================================
// Super Admin Payment Gateway, Pricing & Billing Domain Contracts (bill_ prefix)
// =========================================================================

export type PaymentGatewayProvider = 'stripe' | 'razorpay' | 'paypal' | 'upi_wire';

export interface PaymentGatewayConfigDTO {
  provider: PaymentGatewayProvider;
  environment: 'live' | 'sandbox';
  currency: string;
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantVpa?: string;
  bankAccountRouting?: string;
  processingFeePercent: number;
  isActive: boolean;
  updatedAt: string;
}

export interface PlatformPricingTierDTO {
  id: string;
  tierName: 'starter' | 'growth' | 'enterprise';
  baseSeatPriceMonthly: number;
  baseSeatPriceAnnual: number;
  maxDeviceQuota: number;
  includedModules: string[];
  discountPercentAnnual: number;
}

export type TenantInvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED';

export interface TenantInvoiceDTO {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  billingPeriodFrom: string;
  billingPeriodTo: string;
  basePlanFee: number;
  addonFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: TenantInvoiceStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethodUsed?: string;
  transactionId?: string;
  downloadUrl?: string;
}

export interface GlobalRevenueSummaryDTO {
  mrr: number;
  arr: number;
  totalTenantsCount: number;
  activePaidTenants: number;
  pastDueTenants: number;
  totalInvoicesPaidCount: number;
  totalRevenueCollected: number;
  recentTransactions: TenantInvoiceDTO[];
}

// =========================================================================
// Tenant Administration & Organization Settings Domain Contracts
// =========================================================================

export interface TenantOrganizationSettingsDTO {
  id: string;
  tenantId: string;
  organizationName: string;
  subdomain: string;
  logoUrl?: string;
  primaryAdminName: string;
  primaryAdminEmail: string;
  primaryAdminPhone: string;
  taxRegistrationId: string;
  corporateAddress: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  fiscalYearStartMonth: number;
  workWeekDays: string[];
  mfaEnforced: boolean;
  passwordRotationDays: number;
  sessionTimeoutMinutes: number;
  ipWhitelistingEnabled: boolean;
  allowedIpRanges: string[];
  updatedAt: string;
}

export interface AdminUserDTO {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  status: 'active' | 'invited' | 'disabled';
  lastActiveAt?: string;
  invitedAt: string;
}

export interface TenantQuotaUsageDTO {
  tenantId: string;
  maxSeats: number;
  usedSeats: number;
  maxDevices: number;
  usedDevices: number;
  maxStorageGb: number;
  usedStorageGb: number;
  lastCalculatedAt: string;
}

// =========================================================================
// Digital Personal Data Protection Act 2023 (DPDPA India) Contracts
// =========================================================================

export type DpdpaConsentType =
  | 'biometric_face_scan'
  | 'gps_geofence_location'
  | 'mobile_device_uuid'
  | 'personal_contact_data'
  | 'tax_government_id';

export interface DpdpaConsentItemDTO {
  id: string;
  consentType: DpdpaConsentType;
  title: string;
  description: string;
  isMandatory: boolean;
  isGranted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  statutoryBasis: string;
}

export interface DpdpaOfficerInfoDTO {
  dpoName: string;
  dpoTitle: string;
  dpoEmail: string;
  dpoPhone: string;
  dpoOfficeAddress: string;
  dpbiRegistrationCode: string;
  dataResidencyRegion: 'ap-south-1' | 'eu-central-1' | 'us-east-1';
  dataResidencyLocation: string;
  encryptionStandard: string;
  lastSecurityAuditDate: string;
}

export interface DpdpaPersonalDataSummaryDTO {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  biometricEnrolled: boolean;
  biometricType?: string;
  registeredDeviceUuid?: string;
  totalPunchesLogged: number;
  totalLeavesRecorded: number;
  totalPayPeriodSummaries: number;
  consentsGranted: DpdpaConsentItemDTO[];
  generatedAt: string;
  digitalSealHash: string;
}

export interface DpdpaPrivacyGrievanceDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  category: 'data_access' | 'data_correction' | 'consent_withdrawal' | 'unauthorized_processing' | 'erasure_request';
  description: string;
  status: 'filed' | 'under_review' | 'resolved' | 'escalated_to_dpbi';
  filedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  dpoAssigned: string;
}

export interface DpdpaDpoStatsDTO {
  openGrievancesCount: number;
  slaBreachWarningCount: number;
  pendingErasureCount: number;
  totalConsentsManaged: number;
  consentOptInRatePercentage: number;
  dpbiIncidentsCount: number;
  lastAuditTimestamp: string;
}

export interface DpdpaErasureRequestDTO {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  reason: string;
  requestedAt: string;
  employmentStatus: 'separated' | 'active';
  statutoryRetentionCheck: 'passed_safe_to_purge' | 'wage_audit_lockout_active';
  status: 'pending_dpo_approval' | 'anonymized_and_purged' | 'rejected_statutory_hold';
  purgedAt?: string;
  anonymizedByDpo?: string;
}

export interface DpdpaAuditTrailLogDTO {
  id: string;
  timestamp: string;
  eventType: 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'SUMMARY_EXPORTED' | 'GRIEVANCE_FILED' | 'ERASURE_EXECUTED' | 'DATA_ACCESSED';
  actorId: string;
  actorName: string;
  actorRole: string;
  targetSubject: string;
  ipAddress: string;
  sha256VerificationSeal: string;
}




