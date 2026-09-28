import {
  PayPeriodDTO,
  DepartmentReconciliationDTO,
  PeriodReconciliationSummaryDTO,
  LockPeriodRequestDTO,
  PayrollExportRequestDTO,
  PayrollExportBatchDTO
} from '@infi-timepro/shared-types';
import crypto from 'crypto';

export class FinalisationService {
  private static periods: PayPeriodDTO[] = [
    {
      id: 'prd-001',
      tenantId: 'tenant-demo-001',
      periodCode: 'PAY-2026-AUG',
      name: 'August 2026 Monthly Pay Period',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      status: 'locked',
      totalEmployees: 248,
      totalPayableDays: 5208,
      totalPresentDays: 4980,
      totalPaidLeaves: 180,
      totalLopDays: 48,
      totalOvertimeHours: 395.5,
      pendingExceptionsCount: 0,
      pendingRegularisationsCount: 0,
      readinessPercentage: 100,
      lockSignature: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384',
      lockedBy: 'Anita Desai (Head of HR)',
      lockedAt: '2026-09-01T14:30:00.000Z',
      createdAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'prd-002',
      tenantId: 'tenant-demo-001',
      periodCode: 'PAY-2026-SEP',
      name: 'September 2026 Monthly Pay Period',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: 'ready_to_lock',
      totalEmployees: 254,
      totalPayableDays: 5334,
      totalPresentDays: 5120,
      totalPaidLeaves: 165,
      totalLopDays: 49,
      totalOvertimeHours: 412.5,
      pendingExceptionsCount: 4,
      pendingRegularisationsCount: 2,
      readinessPercentage: 96,
      createdAt: '2026-09-01T00:00:00.000Z'
    }
  ];

  private static exportBatches: PayrollExportBatchDTO[] = [
    {
      batchId: 'EXP-BATCH-901',
      periodId: 'prd-001',
      periodName: 'August 2026 Monthly Pay Period',
      format: 'xlsx',
      recordCount: 248,
      exportedBy: 'Anita Desai (Head of HR)',
      exportedAt: '2026-09-01T15:00:00.000Z',
      downloadUrl: '/downloads/payroll_aug2026_final.xlsx',
      fileSizeBytes: 148520,
      lockHash: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384'
    },
    {
      batchId: 'EXP-BATCH-902',
      periodId: 'prd-001',
      periodName: 'August 2026 Monthly Pay Period',
      format: 'sap_json',
      recordCount: 248,
      exportedBy: 'Anita Desai (Head of HR)',
      exportedAt: '2026-09-01T15:05:00.000Z',
      downloadUrl: '/downloads/sap_successfactors_aug2026.json',
      fileSizeBytes: 89400,
      lockHash: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384'
    }
  ];

  static async getPeriods(tenantId: string): Promise<PayPeriodDTO[]> {
    return this.periods;
  }

  static async getReconciliation(periodId: string): Promise<PeriodReconciliationSummaryDTO> {
    const period = this.periods.find(p => p.id === periodId) || this.periods[1];

    const departments: DepartmentReconciliationDTO[] = [
      {
        departmentId: 'dept-eng',
        departmentName: 'Engineering',
        headcount: 95,
        expectedDays: 1995,
        presentDays: 1920,
        paidLeaves: 60,
        lopDays: 15,
        overtimeHours: 210.5,
        shortfallHours: 0,
        openExceptionsCount: 1,
        status: 'action_required'
      },
      {
        departmentId: 'dept-prod',
        departmentName: 'Product Design',
        headcount: 32,
        expectedDays: 672,
        presentDays: 650,
        paidLeaves: 18,
        lopDays: 4,
        overtimeHours: 35.0,
        shortfallHours: 0,
        openExceptionsCount: 1,
        status: 'action_required'
      },
      {
        departmentId: 'dept-ops',
        departmentName: 'Operations & Logistics',
        headcount: 68,
        expectedDays: 1428,
        presentDays: 1360,
        paidLeaves: 50,
        lopDays: 18,
        overtimeHours: 125.0,
        shortfallHours: 12,
        openExceptionsCount: 2,
        status: 'action_required'
      },
      {
        departmentId: 'dept-cs',
        departmentName: 'Customer Success',
        headcount: 35,
        expectedDays: 735,
        presentDays: 708,
        paidLeaves: 22,
        lopDays: 5,
        overtimeHours: 32.0,
        shortfallHours: 0,
        openExceptionsCount: 0,
        status: 'ready'
      },
      {
        departmentId: 'dept-mkt',
        departmentName: 'Marketing',
        headcount: 24,
        expectedDays: 504,
        presentDays: 482,
        paidLeaves: 15,
        lopDays: 7,
        overtimeHours: 10.0,
        shortfallHours: 0,
        openExceptionsCount: 0,
        status: 'ready'
      }
    ];

    const checkpoints = [
      {
        name: 'Telemetry Punches Ingestion & Pairing',
        description: 'All 148,200 biometric and mobile GPS raw telemetry records paired into attendance days.',
        passed: true,
        count: 148200
      },
      {
        name: 'Missing Punch & Geofence Exceptions',
        description: '4 open attendance exception flags remaining across 3 departments.',
        passed: false,
        count: 4,
        actionRequiredMessage: '4 open exceptions must be waived or resolved before sealing cryptographic period lock.'
      },
      {
        name: 'Regularisation Multi-Tier Approvals',
        description: '2 attendance regularisation requests currently pending L1 / L2 management sign-off.',
        passed: false,
        count: 2,
        actionRequiredMessage: 'Pending regularisations must be approved or rejected.'
      },
      {
        name: 'Overtime Policy Threshold Validation',
        description: 'All 412.5 claimed overtime hours validated against shift overtime policy rules.',
        passed: true,
        count: 412
      }
    ];

    return {
      period,
      departments,
      checkpoints
    };
  }

  static async recalculatePeriod(periodId: string): Promise<{ success: boolean; recalculatedRecords: number }> {
    const period = this.periods.find(p => p.id === periodId);
    if (!period) throw new Error('Period not found');

    period.readinessPercentage = 98;
    return {
      success: true,
      recalculatedRecords: period.totalEmployees * 22
    };
  }

  static async lockPeriod(payload: LockPeriodRequestDTO, lockedByName: string): Promise<PayPeriodDTO> {
    const period = this.periods.find(p => p.id === payload.periodId);
    if (!period) throw new Error('Period not found');

    const hashInput = `${period.id}:${period.periodCode}:${period.startDate}:${period.endDate}:${Date.now()}`;
    const signature = '0x' + crypto.createHash('sha256').update(hashInput).digest('hex');

    period.status = 'locked';
    period.lockSignature = signature;
    period.lockedBy = lockedByName;
    period.lockedAt = new Date().toISOString();
    period.pendingExceptionsCount = 0;
    period.pendingRegularisationsCount = 0;
    period.readinessPercentage = 100;

    return period;
  }

  static async exportPayroll(payload: PayrollExportRequestDTO, exporterName: string): Promise<PayrollExportBatchDTO> {
    const period = this.periods.find(p => p.id === payload.periodId) || this.periods[1];
    const batchId = `EXP-BATCH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBatch: PayrollExportBatchDTO = {
      batchId,
      periodId: period.id,
      periodName: period.name,
      format: payload.format,
      recordCount: period.totalEmployees,
      exportedBy: exporterName,
      exportedAt: new Date().toISOString(),
      downloadUrl: `/downloads/payroll_${period.periodCode}_${payload.format}.${payload.format === 'sap_json' ? 'json' : payload.format}`,
      fileSizeBytes: Math.floor(80000 + Math.random() * 70000),
      lockHash: period.lockSignature || '0x4a1c9012f45e78bc90123a456def78192039485710293847561029384'
    };

    this.exportBatches.unshift(newBatch);
    return newBatch;
  }

  static async getExportHistory(): Promise<PayrollExportBatchDTO[]> {
    return this.exportBatches;
  }
}
