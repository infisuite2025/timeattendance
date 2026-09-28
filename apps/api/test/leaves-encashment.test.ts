import { describe, it, expect } from 'vitest';
import { LeavesService } from '../src/modules/leaves/leaves.service.js';

describe('InfiTimePro Universal Leave, Accrual & Encashment Engine', () => {
  it('should retrieve statutory global leave types including GCC and India models', async () => {
    const types = await LeavesService.getLeaveTypes('tenant-demo-001');

    expect(types.length).toBeGreaterThanOrEqual(6);
    
    const el = types.find(t => t.code === 'EL');
    expect(el).toBeDefined();
    expect(el?.allowCarryforward).toBe(true);
    expect(el?.maxCarryforwardDays).toBe(30);
    expect(el?.encashmentCalculationDivisor).toBe(26);

    const gccAl = types.find(t => t.code === 'AL_GCC');
    expect(gccAl).toBeDefined();
    expect(gccAl?.calculationBasis).toBe('CALENDAR_DAYS');
    expect(gccAl?.annualEntitlementDays).toBe(30);

    const gccSick = types.find(t => t.code === 'SL_GCC');
    expect(gccSick).toBeDefined();
    expect(gccSick?.tieredPayStructure?.tier1PayPercentage).toBe(100);
    expect(gccSick?.tieredPayStructure?.tier2PayPercentage).toBe(50);
  });

  it('should calculate leave encashment payout with divisor 26 and retention balance guard', () => {
    const calculation = LeavesService.calculateEncashment({
      employeeId: 'emp-001',
      employeeName: 'Aarav Sharma',
      leaveTypeCode: 'EL',
      availableBalance: 23.5, // 23.5 days in balance
      requestedDays: 10,      // requests 10 days
      monthlyBasicSalary: 65000,
      calculationDivisor: 26,
      minRetentionDays: 15    // must retain 15 days -> max encashable = 23.5 - 15 = 8.5 days
    });

    expect(calculation.eligibleEncashmentDays).toBe(8.5);
    expect(calculation.retainedBalanceAfterEncashment).toBe(15);
    expect(calculation.perDayRate).toBe(2500); // 65000 / 26 = 2500
    expect(calculation.totalPayoutAmount).toBe(21250); // 8.5 * 2500 = 21250
    expect(calculation.explanation).toContain('Retains 15 days in balance');
  });

  it('should calculate GCC calendar day leave encashment with divisor 30', () => {
    const calculation = LeavesService.calculateEncashment({
      employeeId: 'emp-002',
      employeeName: 'Tariq Al-Mansoor',
      leaveTypeCode: 'AL_GCC',
      availableBalance: 25.0,
      requestedDays: 10,
      monthlyBasicSalary: 15000, // AED 15,000
      calculationDivisor: 30,
      minRetentionDays: 10
    });

    expect(calculation.eligibleEncashmentDays).toBe(10);
    expect(calculation.retainedBalanceAfterEncashment).toBe(15);
    expect(calculation.perDayRate).toBe(500); // 15000 / 30 = 500
    expect(calculation.totalPayoutAmount).toBe(5000); // 10 * 500 = 5000
  });

  it('should retrieve executive attendance exemption profiles', async () => {
    const profiles = await LeavesService.getExemptionProfiles('tenant-demo-001');

    expect(profiles.length).toBe(4);
    
    const cSuite = profiles.find(p => p.trackingMode === 'NEGATIVE_100_PERCENT_EXEMPT');
    expect(cSuite).toBeDefined();
    expect(cSuite?.allowMissingPunchTolerance).toBe(true);

    const singlePunch = profiles.find(p => p.trackingMode === 'SINGLE_PUNCH_FULL_DAY_CREDIT');
    expect(singlePunch).toBeDefined();
    expect(singlePunch?.autoCreditHoursOnSinglePunch).toBe(8.0);
  });
});
