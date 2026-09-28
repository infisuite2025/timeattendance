import {
  ReportTemplateDTO,
  MusterRollRecordDTO,
  ReportFilterParametersDTO,
  ReportScheduleDTO
} from '@infi-timepro/shared-types';

export interface DailySummaryReportRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  shiftName: string;
  shiftTiming: string;
  firstIn: string;
  lastOut: string;
  grossHours: number;
  breakMinutes: number;
  netWorkHours: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  lateByMinutes: number;
  shortfallMinutes: number;
}

export interface LatenessTrendReportRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  lateArrivalCount: number;
  totalLateMinutes: number;
  avgLateMinutes: number;
  earlyExitCount: number;
  penaltyDeductionsApplied: string;
  complianceRiskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface OvertimeCostReportRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  projectCostCenter: string;
  rateTier15xHours: number;
  rateTier20xHours: number;
  totalOtHours: number;
  approvedBy: string;
  estimatedCostInr: number;
}

export interface GeofenceAuditReportRecord {
  timestamp: string;
  employeeCode: string;
  employeeName: string;
  eventType: string;
  source: string;
  locationName: string;
  distanceFromPerimeterMeters: number;
  mockGpsDetected: boolean;
  status: 'Compliant' | 'Breached' | 'Quarantined';
  ipAddress: string;
}

export interface LeaveUtilizationReportRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  casualLeaveBalance: number;
  totalUsedDays: number;
  sandwichDeductions: number;
  utilizationRatePercentage: number;
}

export class ReportsService {
  private static templates: ReportTemplateDTO[] = [
    {
      id: 'rep-tpl-001',
      reportType: 'muster_roll',
      title: 'Monthly Form-T Muster Roll Report',
      category: 'Attendance & Time',
      description: 'Comprehensive statutory attendance register showing daily presence, weekly offs, paid leaves, and total payable days.',
      icon: 'FileSpreadsheet',
      popular: true,
      defaultFormat: 'xlsx',
      supportedFormats: ['xlsx', 'pdf', 'csv']
    },
    {
      id: 'rep-tpl-002',
      reportType: 'daily_summary',
      title: 'Daily Attendance & Punctuality Summary',
      category: 'Attendance & Time',
      description: 'Daily workforce breakdown showing first in, last out, total hours, and late check-in occurrences.',
      icon: 'Calendar',
      popular: true,
      defaultFormat: 'pdf',
      supportedFormats: ['pdf', 'xlsx', 'csv']
    },
    {
      id: 'rep-tpl-003',
      reportType: 'lateness_trend',
      title: 'Lateness & Early Departure Trend Analysis',
      category: 'Exceptions & Compliance',
      description: 'Departmental trends and recurring late arrival patterns with penalty deduction estimates.',
      icon: 'Clock',
      popular: false,
      defaultFormat: 'xlsx',
      supportedFormats: ['xlsx', 'csv', 'pdf']
    },
    {
      id: 'rep-tpl-004',
      reportType: 'overtime_cost',
      title: 'Overtime Hours & Project Cost Center Report',
      category: 'Payroll & Cost',
      description: 'Approved overtime hours broken down by project cost codes, overtime rate tiers (1.5x / 2.0x), and approvers.',
      icon: 'TrendingUp',
      popular: true,
      defaultFormat: 'xlsx',
      supportedFormats: ['xlsx', 'csv', 'json']
    },
    {
      id: 'rep-tpl-005',
      reportType: 'geofence_audit',
      title: 'Mobile Geofence & Anti-Spoofing Audit Report',
      category: 'Exceptions & Compliance',
      description: 'Audit log of mobile check-ins with geofence distance meters, accuracy thresholds, and mock GPS spoof attempts.',
      icon: 'MapPin',
      popular: false,
      defaultFormat: 'csv',
      supportedFormats: ['csv', 'xlsx', 'pdf']
    },
    {
      id: 'rep-tpl-006',
      reportType: 'leave_utilization',
      title: 'Leave Utilization & Balance Report',
      category: 'Attendance & Time',
      description: 'Annual and sick leave balances, utilization rates, and sandwich rule deductions across departments.',
      icon: 'Users',
      popular: false,
      defaultFormat: 'xlsx',
      supportedFormats: ['xlsx', 'pdf']
    }
  ];

  private static sampleMusterRoll: MusterRollRecordDTO[] = [
    {
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Aarav Sharma',
      department: 'Engineering',
      designation: 'Staff Backend Architect',
      totalDays: 30,
      presentDays: 20,
      weeklyOffs: 8,
      paidLeaves: 2,
      holidays: 0,
      lopDays: 0,
      totalWorkHours: 168.5,
      totalOvertimeHours: 8.5,
      dailyStatus: {
        1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'WO', 7: 'WO',
        8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'WO', 14: 'WO',
        15: 'P', 16: 'P', 17: 'P', 18: 'P', 19: 'L', 20: 'WO', 21: 'WO',
        22: 'L', 23: 'P', 24: 'P', 25: 'P', 26: 'P', 27: 'WO', 28: 'WO',
        29: 'P', 30: 'P'
      }
    },
    {
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Human Resources',
      designation: 'HR Lead Operations',
      totalDays: 30,
      presentDays: 21,
      weeklyOffs: 8,
      paidLeaves: 1,
      holidays: 0,
      lopDays: 0,
      totalWorkHours: 172.0,
      totalOvertimeHours: 4.0,
      dailyStatus: {
        1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'WO', 7: 'WO',
        8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'WO', 14: 'WO',
        15: 'P', 16: 'P', 17: 'P', 18: 'P', 19: 'P', 20: 'WO', 21: 'WO',
        22: 'P', 23: 'L', 24: 'P', 25: 'P', 26: 'P', 27: 'WO', 28: 'WO',
        29: 'P', 30: 'P'
      }
    },
    {
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      designation: 'Senior Product Designer',
      totalDays: 30,
      presentDays: 19,
      weeklyOffs: 8,
      paidLeaves: 2,
      holidays: 0,
      lopDays: 1,
      totalWorkHours: 154.0,
      totalOvertimeHours: 0,
      dailyStatus: {
        1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'WO', 7: 'WO',
        8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'WO', 14: 'WO',
        15: 'P', 16: 'P', 17: 'A', 18: 'P', 19: 'L', 20: 'WO', 21: 'WO',
        22: 'L', 23: 'P', 24: 'P', 25: 'P', 26: 'P', 27: 'WO', 28: 'WO',
        29: 'P', 30: 'P'
      }
    },
    {
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'Sneha Kulkarni',
      department: 'Operations & Logistics',
      designation: 'Logistics Supervisor',
      totalDays: 30,
      presentDays: 22,
      weeklyOffs: 8,
      paidLeaves: 0,
      holidays: 0,
      lopDays: 0,
      totalWorkHours: 184.5,
      totalOvertimeHours: 16.5,
      dailyStatus: {
        1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'WO', 7: 'WO',
        8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'WO', 14: 'WO',
        15: 'P', 16: 'P', 17: 'P', 18: 'P', 19: 'P', 20: 'WO', 21: 'WO',
        22: 'P', 23: 'P', 24: 'P', 25: 'P', 26: 'P', 27: 'WO', 28: 'WO',
        29: 'P', 30: 'P'
      }
    },
    {
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'David Miller',
      department: 'Customer Success',
      designation: 'Support Lead',
      totalDays: 30,
      presentDays: 21,
      weeklyOffs: 8,
      paidLeaves: 1,
      holidays: 0,
      lopDays: 0,
      totalWorkHours: 168.0,
      totalOvertimeHours: 6.0,
      dailyStatus: {
        1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'WO', 7: 'WO',
        8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'WO', 14: 'WO',
        15: 'P', 16: 'P', 17: 'P', 18: 'P', 19: 'P', 20: 'WO', 21: 'WO',
        22: 'P', 23: 'L', 24: 'P', 25: 'P', 26: 'P', 27: 'WO', 28: 'WO',
        29: 'P', 30: 'P'
      }
    }
  ];

  private static dailySummaryData: DailySummaryReportRecord[] = [
    {
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Aarav Sharma',
      department: 'Engineering',
      shiftName: 'General Morning Shift',
      shiftTiming: '09:00 - 18:00',
      firstIn: '08:55',
      lastOut: '18:15',
      grossHours: 9.33,
      breakMinutes: 60,
      netWorkHours: 8.33,
      status: 'present',
      lateByMinutes: 0,
      shortfallMinutes: 0
    },
    {
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Human Resources',
      shiftName: 'General Morning Shift',
      shiftTiming: '09:00 - 18:00',
      firstIn: '09:25',
      lastOut: '18:30',
      grossHours: 9.08,
      breakMinutes: 60,
      netWorkHours: 8.08,
      status: 'late',
      lateByMinutes: 25,
      shortfallMinutes: 0
    },
    {
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      shiftName: 'General Morning Shift',
      shiftTiming: '09:00 - 18:00',
      firstIn: '09:02',
      lastOut: '14:30',
      grossHours: 5.47,
      breakMinutes: 30,
      netWorkHours: 4.97,
      status: 'half_day',
      lateByMinutes: 2,
      shortfallMinutes: 180
    },
    {
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'Sneha Kulkarni',
      department: 'Operations & Logistics',
      shiftName: 'Morning Shift (Plant A)',
      shiftTiming: '08:00 - 16:30',
      firstIn: '07:52',
      lastOut: '18:45',
      grossHours: 10.88,
      breakMinutes: 45,
      netWorkHours: 10.13,
      status: 'present',
      lateByMinutes: 0,
      shortfallMinutes: 0
    },
    {
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'David Miller',
      department: 'Customer Success',
      shiftName: 'General Morning Shift',
      shiftTiming: '09:00 - 18:00',
      firstIn: '09:00',
      lastOut: '18:00',
      grossHours: 9.0,
      breakMinutes: 60,
      netWorkHours: 8.0,
      status: 'present',
      lateByMinutes: 0,
      shortfallMinutes: 0
    }
  ];

  private static latenessTrendData: LatenessTrendReportRecord[] = [
    {
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Human Resources',
      lateArrivalCount: 6,
      totalLateMinutes: 145,
      avgLateMinutes: 24.2,
      earlyExitCount: 1,
      penaltyDeductionsApplied: '0.5 Day Leave Deducted',
      complianceRiskLevel: 'Moderate'
    },
    {
      employeeId: 'emp-006',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      department: 'Engineering',
      lateArrivalCount: 11,
      totalLateMinutes: 320,
      avgLateMinutes: 29.1,
      earlyExitCount: 3,
      penaltyDeductionsApplied: '1.5 Days LOP Deducted',
      complianceRiskLevel: 'Critical'
    },
    {
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      lateArrivalCount: 3,
      totalLateMinutes: 42,
      avgLateMinutes: 14.0,
      earlyExitCount: 0,
      penaltyDeductionsApplied: 'Grace Period Applied (No Penalty)',
      complianceRiskLevel: 'Low'
    },
    {
      employeeId: 'emp-007',
      employeeCode: 'EMP-1007',
      employeeName: 'Rohan Mehta',
      department: 'Operations & Logistics',
      lateArrivalCount: 8,
      totalLateMinutes: 195,
      avgLateMinutes: 24.4,
      earlyExitCount: 2,
      penaltyDeductionsApplied: '0.5 Day LOP Deducted',
      complianceRiskLevel: 'High'
    }
  ];

  private static overtimeCostData: OvertimeCostReportRecord[] = [
    {
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'Sneha Kulkarni',
      department: 'Operations & Logistics',
      projectCostCenter: 'PRJ-LOG-2026-Q3',
      rateTier15xHours: 12.5,
      rateTier20xHours: 4.0,
      totalOtHours: 16.5,
      approvedBy: 'Anita Desai (Plant VP)',
      estimatedCostInr: 14850
    },
    {
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Aarav Sharma',
      department: 'Engineering',
      projectCostCenter: 'PRJ-CORE-ENG',
      rateTier15xHours: 8.5,
      rateTier20xHours: 0.0,
      totalOtHours: 8.5,
      approvedBy: 'Naresh Andukoori (CTO)',
      estimatedCostInr: 10200
    },
    {
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'David Miller',
      department: 'Customer Success',
      projectCostCenter: 'PRJ-CS-EMEA',
      rateTier15xHours: 6.0,
      rateTier20xHours: 0.0,
      totalOtHours: 6.0,
      approvedBy: 'Anita Desai (HR Lead)',
      estimatedCostInr: 5400
    },
    {
      employeeId: 'emp-008',
      employeeCode: 'EMP-1008',
      employeeName: 'Kavita Joshi',
      department: 'Engineering',
      projectCostCenter: 'PRJ-CORE-ENG',
      rateTier15xHours: 10.0,
      rateTier20xHours: 2.0,
      totalOtHours: 12.0,
      approvedBy: 'Naresh Andukoori (CTO)',
      estimatedCostInr: 13800
    }
  ];

  private static geofenceAuditData: GeofenceAuditReportRecord[] = [
    {
      timestamp: '2026-09-14 09:05:12',
      employeeCode: 'EMP-1002',
      employeeName: 'Priya Nair',
      eventType: 'IN',
      source: 'mobile_app',
      locationName: 'Bengaluru Tech Park HQ',
      distanceFromPerimeterMeters: 18,
      mockGpsDetected: false,
      status: 'Compliant',
      ipAddress: '103.21.144.12'
    },
    {
      timestamp: '2026-09-14 09:12:44',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      eventType: 'IN',
      source: 'mobile_app',
      locationName: 'Bengaluru Tech Park HQ',
      distanceFromPerimeterMeters: 480,
      mockGpsDetected: false,
      status: 'Breached',
      ipAddress: '49.207.198.11'
    },
    {
      timestamp: '2026-09-14 09:18:30',
      employeeCode: 'EMP-1009',
      employeeName: 'Arjun Das',
      eventType: 'IN',
      source: 'mobile_app',
      locationName: 'Mumbai Financial Centre',
      distanceFromPerimeterMeters: 5,
      mockGpsDetected: true,
      status: 'Quarantined',
      ipAddress: '182.72.19.45'
    },
    {
      timestamp: '2026-09-14 18:30:15',
      employeeCode: 'EMP-1004',
      employeeName: 'Sneha Kulkarni',
      eventType: 'OUT',
      source: 'mobile_app',
      locationName: 'Bengaluru Tech Park HQ',
      distanceFromPerimeterMeters: 12,
      mockGpsDetected: false,
      status: 'Compliant',
      ipAddress: '103.21.144.88'
    }
  ];

  private static leaveUtilizationData: LeaveUtilizationReportRecord[] = [
    {
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Aarav Sharma',
      department: 'Engineering',
      annualLeaveBalance: 14,
      sickLeaveBalance: 8,
      casualLeaveBalance: 5,
      totalUsedDays: 4,
      sandwichDeductions: 0,
      utilizationRatePercentage: 14.8
    },
    {
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Human Resources',
      annualLeaveBalance: 16,
      sickLeaveBalance: 10,
      casualLeaveBalance: 6,
      totalUsedDays: 2,
      sandwichDeductions: 0,
      utilizationRatePercentage: 6.2
    },
    {
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      annualLeaveBalance: 11,
      sickLeaveBalance: 7,
      casualLeaveBalance: 3,
      totalUsedDays: 6,
      sandwichDeductions: 1,
      utilizationRatePercentage: 28.5
    },
    {
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'Sneha Kulkarni',
      department: 'Operations & Logistics',
      annualLeaveBalance: 18,
      sickLeaveBalance: 12,
      casualLeaveBalance: 6,
      totalUsedDays: 0,
      sandwichDeductions: 0,
      utilizationRatePercentage: 0.0
    }
  ];

  private static schedules: ReportScheduleDTO[] = [
    {
      id: 'sch-001',
      tenantId: 'tenant-demo-001',
      reportType: 'muster_roll',
      title: 'Monthly HR Muster Roll Auto-Export',
      frequency: 'monthly',
      recipients: ['hr-payroll@company.com', 'anita.desai@company.com'],
      format: 'xlsx',
      status: 'active',
      nextRunAt: '2026-10-01T00:00:00.000Z',
      lastSentAt: '2026-09-01T00:00:00.000Z',
      createdAt: '2026-08-01T10:00:00.000Z'
    },
    {
      id: 'sch-002',
      tenantId: 'tenant-demo-001',
      reportType: 'overtime_cost',
      title: 'Weekly Overtime & Plant Utilization Dispatch',
      frequency: 'weekly',
      recipients: ['plant-ops@company.com', 'finance@company.com'],
      format: 'pdf',
      status: 'active',
      nextRunAt: '2026-09-21T06:00:00.000Z',
      lastSentAt: '2026-09-14T06:00:00.000Z',
      createdAt: '2026-08-15T11:00:00.000Z'
    }
  ];

  static async getTemplates(): Promise<ReportTemplateDTO[]> {
    return this.templates;
  }

  static async generateMusterRoll(filters: ReportFilterParametersDTO): Promise<{
    metadata: {
      generatedAt: string;
      totalHeadcount: number;
      period: string;
      department: string;
    };
    records: MusterRollRecordDTO[];
  }> {
    let records = [...this.sampleMusterRoll];
    if (filters.departmentId && filters.departmentId !== 'all') {
      records = records.filter(r => r.department.toLowerCase().includes(filters.departmentId!.toLowerCase()));
    }

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalHeadcount: records.length,
        period: `${filters.dateFrom || '2026-09-01'} to ${filters.dateTo || '2026-09-30'}`,
        department: filters.departmentId || 'All Departments'
      },
      records
    };
  }

  static async generateReport(reportType: string, filters: ReportFilterParametersDTO): Promise<{
    metadata: {
      reportType: string;
      generatedAt: string;
      recordCount: number;
      period: string;
      department: string;
      exportFormat: string;
    };
    data: any;
  }> {
    const period = `${filters.dateFrom || '2026-09-01'} to ${filters.dateTo || '2026-09-30'}`;
    const department = filters.departmentId || 'All Departments';
    const deptMatch = (dept: string) => (!filters.departmentId || filters.departmentId === 'all' || dept.toLowerCase().includes(filters.departmentId.toLowerCase()));
    const searchMatch = (rec: any) => {
      if (!filters.search) return true;
      const q = filters.search.toLowerCase();
      return (
        (rec.employeeName && rec.employeeName.toLowerCase().includes(q)) ||
        (rec.employeeCode && rec.employeeCode.toLowerCase().includes(q)) ||
        (rec.department && rec.department.toLowerCase().includes(q))
      );
    };

    let data: any = [];
    switch (reportType) {
      case 'muster_roll':
        data = this.sampleMusterRoll.filter(r => deptMatch(r.department) && searchMatch(r));
        break;
      case 'daily_summary':
        data = this.dailySummaryData.filter(r => deptMatch(r.department) && searchMatch(r));
        break;
      case 'lateness_trend':
        data = this.latenessTrendData.filter(r => deptMatch(r.department) && searchMatch(r));
        break;
      case 'overtime_cost':
        data = this.overtimeCostData.filter(r => deptMatch(r.department) && searchMatch(r));
        break;
      case 'geofence_audit':
        data = this.geofenceAuditData.filter(r => searchMatch(r));
        break;
      case 'leave_utilization':
        data = this.leaveUtilizationData.filter(r => deptMatch(r.department) && searchMatch(r));
        break;
      default:
        data = this.dailySummaryData.filter(r => deptMatch(r.department) && searchMatch(r));
    }

    return {
      metadata: {
        reportType,
        generatedAt: new Date().toISOString(),
        recordCount: Array.isArray(data) ? data.length : 0,
        period,
        department,
        exportFormat: filters.format || 'xlsx'
      },
      data
    };
  }

  static async getSchedules(tenantId: string): Promise<ReportScheduleDTO[]> {
    return this.schedules.filter(s => s.tenantId === tenantId || tenantId === 'tenant-001' || tenantId === 'tenant-demo-001');
  }

  static async createSchedule(payload: Omit<ReportScheduleDTO, 'id' | 'createdAt'>): Promise<ReportScheduleDTO> {
    const newSchedule: ReportScheduleDTO = {
      ...payload,
      id: `sch-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    this.schedules.unshift(newSchedule);
    return newSchedule;
  }

  static async deleteSchedule(id: string, tenantId: string): Promise<boolean> {
    const idx = this.schedules.findIndex(s => s.id === id && (s.tenantId === tenantId || tenantId === 'tenant-001' || tenantId === 'tenant-demo-001'));
    if (idx === -1) return false;
    this.schedules.splice(idx, 1);
    return true;
  }
}
