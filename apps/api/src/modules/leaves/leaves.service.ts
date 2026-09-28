import {
  UniversalLeaveTypeDefinitionDTO,
  ExecutiveAttendanceExemptionProfileDTO,
  LeaveBalanceRecordDTO,
  LeaveEncashmentCalculationDTO
} from '@infi-timepro/shared-types';

export class LeavesService {
  private static leaveTypes: UniversalLeaveTypeDefinitionDTO[] = [
    {
      id: 'lt-001',
      tenantId: 'tenant-demo-001',
      code: 'EL',
      name: 'Earned / Privilege Leave (EL)',
      category: 'ANNUAL',
      description: 'Statutory annual leave accrued at 1.5 days per month (or 1 day per 20 worked days). Carryforward up to 30 days.',
      color: '#3B82F6',
      accrualMode: 'MONTHLY_PRO_RATA',
      annualEntitlementDays: 18,
      accrualFrequency: 'MONTHLY',
      calculationBasis: 'WORKING_DAYS',
      allowHalfDay: true,
      allowQuarterDay: false,
      minConsecutiveDays: 1,
      maxConsecutiveDays: 15,
      allowCarryforward: true,
      maxCarryforwardDays: 30,
      carryforwardExpiryMonths: 3,
      allowEncashment: true,
      minRetentionDaysBeforeEncashment: 15,
      encashmentCalculationDivisor: 26,
      encashmentSalaryBasis: 'BASIC_ONLY',
      canClubWithLeaveTypes: ['SL', 'COMP_OFF'],
      enforceSandwichRule: false
    },
    {
      id: 'lt-002',
      tenantId: 'tenant-demo-001',
      code: 'CL',
      name: 'Casual Leave (CL)',
      category: 'CASUAL',
      description: 'Short-notice leave for urgent personal affairs. Front-loaded on Jan 1st. Max 3 consecutive days. Lapses at year end.',
      color: '#10B981',
      accrualMode: 'FRONT_LOADED',
      annualEntitlementDays: 10,
      accrualFrequency: 'ANNUAL',
      calculationBasis: 'WORKING_DAYS',
      allowHalfDay: true,
      allowQuarterDay: false,
      minConsecutiveDays: 0.5,
      maxConsecutiveDays: 3,
      allowCarryforward: false,
      maxCarryforwardDays: 0,
      allowEncashment: false,
      minRetentionDaysBeforeEncashment: 0,
      encashmentCalculationDivisor: 26,
      encashmentSalaryBasis: 'BASIC_ONLY',
      canClubWithLeaveTypes: ['COMP_OFF'],
      enforceSandwichRule: false
    },
    {
      id: 'lt-003',
      tenantId: 'tenant-demo-001',
      code: 'SL',
      name: 'Sick / Medical Leave (SL)',
      category: 'SICK',
      description: 'Paid medical leave for illness or recovery. Medical certificate required for 3 or more consecutive days.',
      color: '#F59E0B',
      accrualMode: 'FRONT_LOADED',
      annualEntitlementDays: 12,
      accrualFrequency: 'ANNUAL',
      calculationBasis: 'WORKING_DAYS',
      allowHalfDay: true,
      allowQuarterDay: false,
      minConsecutiveDays: 0.5,
      maxConsecutiveDays: 30,
      allowCarryforward: true,
      maxCarryforwardDays: 15,
      allowEncashment: false,
      minRetentionDaysBeforeEncashment: 0,
      encashmentCalculationDivisor: 26,
      encashmentSalaryBasis: 'BASIC_ONLY',
      canClubWithLeaveTypes: ['EL', 'COMP_OFF'],
      enforceSandwichRule: false
    },
    {
      id: 'lt-004',
      tenantId: 'tenant-demo-001',
      code: 'AL_GCC',
      name: 'GCC Statutory Annual Leave (30 Days)',
      category: 'ANNUAL',
      description: 'UAE & Saudi Labour Law 30-day statutory leave evaluated strictly on CALENDAR DAYS (inclusive of weekends).',
      color: '#8B5CF6',
      accrualMode: 'MONTHLY_PRO_RATA',
      annualEntitlementDays: 30,
      accrualFrequency: 'MONTHLY',
      calculationBasis: 'CALENDAR_DAYS',
      allowHalfDay: false,
      allowQuarterDay: false,
      minConsecutiveDays: 5,
      maxConsecutiveDays: 30,
      allowCarryforward: true,
      maxCarryforwardDays: 15,
      allowEncashment: true,
      minRetentionDaysBeforeEncashment: 10,
      encashmentCalculationDivisor: 30,
      encashmentSalaryBasis: 'GROSS_SALARY',
      canClubWithLeaveTypes: ['SL_GCC'],
      enforceSandwichRule: true
    },
    {
      id: 'lt-005',
      tenantId: 'tenant-demo-001',
      code: 'SL_GCC',
      name: 'GCC Tiered Sick Leave (90 Days)',
      category: 'SICK',
      description: 'GCC tiered statutory sick leave: First 15 days @ 100% full pay, next 30 days @ 50% half pay, next 45 days @ 0% unpaid.',
      color: '#EC4899',
      accrualMode: 'FRONT_LOADED',
      annualEntitlementDays: 90,
      accrualFrequency: 'ANNUAL',
      calculationBasis: 'CALENDAR_DAYS',
      allowHalfDay: false,
      allowQuarterDay: false,
      minConsecutiveDays: 1,
      maxConsecutiveDays: 90,
      allowCarryforward: false,
      maxCarryforwardDays: 0,
      allowEncashment: false,
      minRetentionDaysBeforeEncashment: 0,
      encashmentCalculationDivisor: 30,
      encashmentSalaryBasis: 'BASIC_ONLY',
      canClubWithLeaveTypes: ['AL_GCC'],
      enforceSandwichRule: true,
      tieredPayStructure: {
        tier1Days: 15, tier1PayPercentage: 100,
        tier2Days: 30, tier2PayPercentage: 50,
        tier3Days: 45, tier3PayPercentage: 0
      }
    },
    {
      id: 'lt-006',
      tenantId: 'tenant-demo-001',
      code: 'COMP_OFF',
      name: 'Compensatory Off (Comp-Off)',
      category: 'COMPENSATORY',
      description: 'Accrued when working on weekly offs, weekends, or statutory holidays. Must be redeemed within 90 days.',
      color: '#06B6D4',
      accrualMode: 'WORK_DAYS_BASED',
      annualEntitlementDays: 0,
      accrualFrequency: 'MONTHLY',
      calculationBasis: 'WORKING_DAYS',
      allowHalfDay: true,
      allowQuarterDay: false,
      minConsecutiveDays: 0.5,
      maxConsecutiveDays: 2,
      allowCarryforward: false,
      maxCarryforwardDays: 0,
      carryforwardExpiryMonths: 3,
      allowEncashment: false,
      minRetentionDaysBeforeEncashment: 0,
      encashmentCalculationDivisor: 26,
      encashmentSalaryBasis: 'BASIC_ONLY',
      canClubWithLeaveTypes: ['EL', 'CL', 'SL'],
      enforceSandwichRule: false
    }
  ];

  private static exemptionProfiles: ExecutiveAttendanceExemptionProfileDTO[] = [
    {
      id: 'exp-001',
      tenantId: 'tenant-demo-001',
      profileName: 'Executive & C-Suite Exemption (100% Negative)',
      trackingMode: 'NEGATIVE_100_PERCENT_EXEMPT',
      description: 'Zero swipes required. Automatically marked 100% Present every working day. Only approved leave applications deducted.',
      allowMissingPunchTolerance: true,
      autoWaiveLatenessGrace: true,
      autoCreditHoursOnSinglePunch: 8.0,
      assignedDesignations: ['Chief Executive Officer', 'Chief Technology Officer', 'Vice President', 'Managing Director', 'Partner'],
      assignedDepartments: ['Executive Leadership', 'Board of Directors'],
      headcountCount: 8
    },
    {
      id: 'exp-002',
      tenantId: 'tenant-demo-001',
      profileName: 'Field & Sales Single-Punch Credit (8.0 Hours)',
      trackingMode: 'SINGLE_PUNCH_FULL_DAY_CREDIT',
      description: 'A single swipe anytime during the day automatically credits full 8.0 hours work duration without missing punch errors.',
      allowMissingPunchTolerance: true,
      autoWaiveLatenessGrace: true,
      autoCreditHoursOnSinglePunch: 8.0,
      assignedDesignations: ['Sales Manager', 'Field Engineer', 'Client Partner', 'Technical Consultant'],
      assignedDepartments: ['Sales & Business Development', 'Client Services'],
      headcountCount: 24
    },
    {
      id: 'exp-003',
      tenantId: 'tenant-demo-001',
      profileName: 'R&D & Engineering Core-Hours Fulfillment',
      trackingMode: 'CORE_HOURS_EXCEPTION_ONLY',
      description: 'Physical or remote presence during core window (11:00 AM - 03:30 PM) guarantees full-day credit regardless of total hours.',
      allowMissingPunchTolerance: false,
      autoWaiveLatenessGrace: true,
      autoCreditHoursOnSinglePunch: 8.0,
      coreHoursWindow: { start: '11:00', end: '15:30' },
      assignedDesignations: ['Staff Architect', 'Principal Engineer', 'Tech Lead', 'Senior Researcher'],
      assignedDepartments: ['Engineering', 'Product Design'],
      headcountCount: 65
    },
    {
      id: 'exp-004',
      tenantId: 'tenant-demo-001',
      profileName: 'Factory & Plant Strict Attendance (Positive FILO)',
      trackingMode: 'POSITIVE_STRICT_IN_OUT',
      description: 'Strict biometric turnstile pairing for both IN and OUT. Overtime and shortfall calculated to exact minute.',
      allowMissingPunchTolerance: false,
      autoWaiveLatenessGrace: false,
      autoCreditHoursOnSinglePunch: 0,
      assignedDesignations: ['Plant Operator', 'Assembly Technician', 'Logistics Executive', 'Security Officer'],
      assignedDepartments: ['Manufacturing & Production', 'Operations & Logistics', 'Facilities'],
      headcountCount: 157
    }
  ];

  private static employeeBalances: LeaveBalanceRecordDTO[] = [
    {
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Aarav Sharma',
      department: 'Engineering',
      leaveTypeCode: 'EL',
      leaveTypeName: 'Earned / Privilege Leave',
      annualQuota: 18,
      accruedDays: 13.5,
      usedDays: 2.0,
      pendingApprovalDays: 0,
      carriedForwardDays: 12.0,
      availableBalance: 23.5,
      encashableBalance: 8.5
    },
    {
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Aarav Sharma',
      department: 'Engineering',
      leaveTypeCode: 'CL',
      leaveTypeName: 'Casual Leave',
      annualQuota: 10,
      accruedDays: 10.0,
      usedDays: 3.0,
      pendingApprovalDays: 0,
      carriedForwardDays: 0,
      availableBalance: 7.0,
      encashableBalance: 0
    },
    {
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Human Resources',
      leaveTypeCode: 'EL',
      leaveTypeName: 'Earned / Privilege Leave',
      annualQuota: 18,
      accruedDays: 13.5,
      usedDays: 1.0,
      pendingApprovalDays: 0,
      carriedForwardDays: 15.0,
      availableBalance: 27.5,
      encashableBalance: 12.5
    },
    {
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      leaveTypeCode: 'EL',
      leaveTypeName: 'Earned / Privilege Leave',
      annualQuota: 18,
      accruedDays: 13.5,
      usedDays: 4.0,
      pendingApprovalDays: 1.0,
      carriedForwardDays: 8.0,
      availableBalance: 17.5,
      encashableBalance: 2.5
    }
  ];

  static async getLeaveTypes(tenantId: string): Promise<UniversalLeaveTypeDefinitionDTO[]> {
    return this.leaveTypes;
  }

  static async createLeaveType(payload: UniversalLeaveTypeDefinitionDTO): Promise<UniversalLeaveTypeDefinitionDTO> {
    const newType: UniversalLeaveTypeDefinitionDTO = {
      ...payload,
      id: `lt-${Date.now().toString(36)}`
    };
    this.leaveTypes.push(newType);
    return newType;
  }

  static async updateLeaveType(id: string, payload: Partial<UniversalLeaveTypeDefinitionDTO>): Promise<UniversalLeaveTypeDefinitionDTO | null> {
    const idx = this.leaveTypes.findIndex(t => t.id === id || t.code === id);
    if (idx === -1) return null;
    this.leaveTypes[idx] = { ...this.leaveTypes[idx], ...payload };
    return this.leaveTypes[idx];
  }

  static async deleteLeaveType(id: string): Promise<boolean> {
    const idx = this.leaveTypes.findIndex(t => t.id === id || t.code === id);
    if (idx === -1) return false;
    this.leaveTypes.splice(idx, 1);
    return true;
  }

  static async getExemptionProfiles(tenantId: string): Promise<ExecutiveAttendanceExemptionProfileDTO[]> {
    return this.exemptionProfiles;
  }

  static async createExemptionProfile(payload: ExecutiveAttendanceExemptionProfileDTO): Promise<ExecutiveAttendanceExemptionProfileDTO> {
    const newProfile: ExecutiveAttendanceExemptionProfileDTO = {
      ...payload,
      id: `exp-${Date.now().toString(36)}`
    };
    this.exemptionProfiles.push(newProfile);
    return newProfile;
  }

  static async updateExemptionProfile(id: string, payload: Partial<ExecutiveAttendanceExemptionProfileDTO>): Promise<ExecutiveAttendanceExemptionProfileDTO | null> {
    const idx = this.exemptionProfiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.exemptionProfiles[idx] = { ...this.exemptionProfiles[idx], ...payload };
    return this.exemptionProfiles[idx];
  }

  static async deleteExemptionProfile(id: string): Promise<boolean> {
    const idx = this.exemptionProfiles.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.exemptionProfiles.splice(idx, 1);
    return true;
  }

  static async getBalances(tenantId: string): Promise<LeaveBalanceRecordDTO[]> {
    return this.employeeBalances;
  }

  static calculateEncashment(params: {
    employeeId: string;
    employeeName: string;
    leaveTypeCode: string;
    availableBalance: number;
    requestedDays: number;
    monthlyBasicSalary: number;
    calculationDivisor?: number;
    minRetentionDays?: number;
  }): LeaveEncashmentCalculationDTO {
    const divisor = params.calculationDivisor || 26;
    const minRetention = params.minRetentionDays !== undefined ? params.minRetentionDays : 15;
    const maxEncashable = Math.max(0, params.availableBalance - minRetention);
    const eligibleDays = Math.min(params.requestedDays, maxEncashable);
    const retainedBalance = params.availableBalance - eligibleDays;

    const perDayRate = Math.round((params.monthlyBasicSalary / divisor) * 100) / 100;
    const totalPayout = Math.round(eligibleDays * perDayRate);

    return {
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      leaveTypeCode: params.leaveTypeCode,
      availableBalance: params.availableBalance,
      requestedEncashmentDays: params.requestedDays,
      eligibleEncashmentDays: eligibleDays,
      retainedBalanceAfterEncashment: retainedBalance,
      monthlyBasicSalary: params.monthlyBasicSalary,
      calculationDivisor: divisor,
      perDayRate,
      totalPayoutAmount: totalPayout,
      currency: 'INR',
      explanation: `${eligibleDays} eligible days encashed at ₹${perDayRate}/day (Monthly basic: ₹${params.monthlyBasicSalary.toLocaleString()} ÷ ${divisor} days divisor). Retains ${retainedBalance} days in balance (Min required: ${minRetention} days).`
    };
  }
}
