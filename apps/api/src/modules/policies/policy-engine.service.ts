import {
  AttendancePolicyDTO,
  PolicyEvaluationInputDTO,
  PolicyEvaluationResultDTO,
} from '@infi-timepro/shared-types';

export class PolicyEngineService {
  private policies: AttendancePolicyDTO[] = [
    {
      id: 'pol_gen_001',
      code: 'POL-GEN-01',
      name: 'General Corporate Attendance Policy',
      description: 'Standard attendance and punctuality rules for corporate offices.',
      version: 'v2.1',
      effectiveFrom: '2025-01-01',
      effectiveTo: '2025-12-31',
      isDefault: true,
      status: 'active',
      assignedLocations: ['Hyderabad Main Office', 'Bengaluru HQ', 'Delhi Office'],
      assignedDepartments: ['Product', 'Engineering', 'Human Resources', 'Finance'],
      rules: {
        graceInMinutes: 15,
        graceOutMinutes: 15,
        monthlyLateGraceCount: 3,
        lateDeductionAction: 'HALF_DAY',
        fullDayThresholdMinutes: 480,
        halfDayThresholdMinutes: 240,
        breakDeductionType: 'FIXED',
        autoLunchDeductionMinutes: 60,
        otMinQualificationMinutes: 30,
        otRoundingMinutes: 15,
        compOffQualifyingHours: 6,
        compOffValidityDays: 60,
        wfhAllowedDaysPerMonth: 8,
      },
    },
    {
      id: 'pol_plant_002',
      code: 'POL-PLANT-02',
      name: 'Manufacturing & Plant Shift Policy',
      description: 'Strict punctuality and shift turnover policy for plant floor operations.',
      version: 'v1.4',
      effectiveFrom: '2025-01-01',
      effectiveTo: '2025-12-31',
      isDefault: false,
      status: 'active',
      assignedLocations: ['Chennai Plant'],
      assignedDepartments: ['Operations & Support'],
      rules: {
        graceInMinutes: 5,
        graceOutMinutes: 5,
        monthlyLateGraceCount: 1,
        lateDeductionAction: 'LOP_DEDUCTION',
        fullDayThresholdMinutes: 480,
        halfDayThresholdMinutes: 240,
        breakDeductionType: 'AUTO_EXCLUDED',
        autoLunchDeductionMinutes: 45,
        otMinQualificationMinutes: 15,
        otRoundingMinutes: 15,
        compOffQualifyingHours: 8,
        compOffValidityDays: 30,
        wfhAllowedDaysPerMonth: 0,
      },
    },
    {
      id: 'pol_flex_003',
      code: 'POL-EXEC-03',
      name: 'Executive & Senior Leadership Policy',
      description: 'Outcome-driven flexible time policy for directors and executives.',
      version: 'v1.0',
      effectiveFrom: '2025-01-01',
      effectiveTo: '2025-12-31',
      isDefault: false,
      status: 'active',
      assignedLocations: ['All Locations'],
      assignedDepartments: ['Management'],
      rules: {
        graceInMinutes: 60,
        graceOutMinutes: 60,
        monthlyLateGraceCount: 10,
        lateDeductionAction: 'NONE',
        fullDayThresholdMinutes: 360,
        halfDayThresholdMinutes: 180,
        breakDeductionType: 'FLEXIBLE',
        autoLunchDeductionMinutes: 0,
        otMinQualificationMinutes: 0,
        otRoundingMinutes: 0,
        compOffQualifyingHours: 4,
        compOffValidityDays: 90,
        wfhAllowedDaysPerMonth: 20,
      },
    },
  ];

  getPolicies(): AttendancePolicyDTO[] {
    return this.policies;
  }

  getPolicyById(id: string): AttendancePolicyDTO | null {
    return this.policies.find((p) => p.id === id || p.code === id) || this.policies[0];
  }

  createPolicy(input: Partial<AttendancePolicyDTO>): AttendancePolicyDTO {
    const newPolicy: AttendancePolicyDTO = {
      id: input.id || `pol_${Date.now()}`,
      code: input.code || `POL-CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
      name: input.name || 'New Custom Policy',
      description: input.description || 'Custom workplace attendance policy.',
      version: input.version || 'v1.0',
      effectiveFrom: input.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: input.effectiveTo || '2026-12-31',
      isDefault: input.isDefault || false,
      status: input.status || 'active',
      assignedLocations: input.assignedLocations || ['All Locations'],
      assignedDepartments: input.assignedDepartments || ['All Departments'],
      rules: {
        graceInMinutes: input.rules?.graceInMinutes ?? 15,
        graceOutMinutes: input.rules?.graceOutMinutes ?? 15,
        monthlyLateGraceCount: input.rules?.monthlyLateGraceCount ?? 3,
        lateDeductionAction: input.rules?.lateDeductionAction || 'HALF_DAY',
        fullDayThresholdMinutes: input.rules?.fullDayThresholdMinutes ?? 480,
        halfDayThresholdMinutes: input.rules?.halfDayThresholdMinutes ?? 240,
        breakDeductionType: input.rules?.breakDeductionType || 'FIXED',
        autoLunchDeductionMinutes: input.rules?.autoLunchDeductionMinutes ?? 60,
        otMinQualificationMinutes: input.rules?.otMinQualificationMinutes ?? 30,
        otRoundingMinutes: input.rules?.otRoundingMinutes ?? 15,
        compOffQualifyingHours: input.rules?.compOffQualifyingHours ?? 6,
        compOffValidityDays: input.rules?.compOffValidityDays ?? 60,
        wfhAllowedDaysPerMonth: input.rules?.wfhAllowedDaysPerMonth ?? 8,
      },
    };
    if (newPolicy.isDefault) {
      this.policies.forEach((p) => (p.isDefault = false));
    }
    this.policies.push(newPolicy);
    return newPolicy;
  }

  updatePolicy(id: string, input: Partial<AttendancePolicyDTO>): AttendancePolicyDTO | null {
    const idx = this.policies.findIndex((p) => p.id === id || p.code === id);
    if (idx === -1) return null;

    if (input.isDefault) {
      this.policies.forEach((p) => (p.isDefault = false));
    }

    this.policies[idx] = {
      ...this.policies[idx],
      ...input,
      rules: {
        ...this.policies[idx].rules,
        ...input.rules,
      },
    };
    return this.policies[idx];
  }

  deletePolicy(id: string): boolean {
    const idx = this.policies.findIndex((p) => p.id === id || p.code === id);
    if (idx === -1) return false;
    this.policies.splice(idx, 1);
    return true;
  }

  evaluatePolicy(input: PolicyEvaluationInputDTO): PolicyEvaluationResultDTO {
    const policy = this.getPolicyById(input.policyId || 'pol_gen_001')!;
    const rules = policy.rules;

    // Time parsing helper
    const parseTimeMinutes = (timeStr: string) => {
      const parts = timeStr.split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const firstIn = parseTimeMinutes(input.firstInTime);
    const lastOut = parseTimeMinutes(input.lastOutTime);
    const shiftStart = parseTimeMinutes(input.shiftStartTime);
    const shiftEnd = parseTimeMinutes(input.shiftEndTime);

    const grossDuration = Math.max(0, lastOut - firstIn);
    const appliedBreak = Math.max(input.recordedBreakMinutes, rules.autoLunchDeductionMinutes);
    const netWorkDuration = Math.max(0, grossDuration - appliedBreak);

    const lateMinutes = Math.max(0, firstIn - shiftStart);
    const isLate = lateMinutes > rules.graceInMinutes;

    const earlyExitMinutes = Math.max(0, shiftEnd - lastOut);
    const isEarlyExit = earlyExitMinutes > rules.graceOutMinutes;

    let dayStatus: any = 'present';
    if (netWorkDuration < rules.halfDayThresholdMinutes) {
      dayStatus = 'absent';
    } else if (netWorkDuration < rules.fullDayThresholdMinutes) {
      dayStatus = 'half_day';
    } else if (isLate) {
      dayStatus = 'late';
    }

    const shiftExpected = shiftEnd - shiftStart - rules.autoLunchDeductionMinutes;
    const overtime = Math.max(0, netWorkDuration - shiftExpected);
    const shortfall = Math.max(0, shiftExpected - netWorkDuration);

    const explanation = `First in recorded at ${input.firstInTime} (${lateMinutes} mins from shift start, grace: ${rules.graceInMinutes}m). Gross duration ${grossDuration}m minus ${appliedBreak}m break yields ${netWorkDuration}m net work time. Threshold requirement for full-day is ${rules.fullDayThresholdMinutes}m. Evaluated status: ${dayStatus.toUpperCase()}.`;

    return {
      grossDurationMinutes: grossDuration,
      appliedBreakMinutes: appliedBreak,
      netWorkDurationMinutes: netWorkDuration,
      isLate,
      lateByMinutes: lateMinutes,
      isEarlyExit,
      earlyExitByMinutes: earlyExitMinutes,
      dayStatus,
      overtimeMinutes: overtime >= rules.otMinQualificationMinutes ? overtime : 0,
      shortfallMinutes: shortfall,
      explanation,
    };
  }
}

export const policyEngineService = new PolicyEngineService();
