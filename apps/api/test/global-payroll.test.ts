import { describe, it, expect } from 'vitest';
import { GlobalPayrollService } from '../src/modules/global-payroll/global-payroll.service.js';

describe('Global Payroll Engine Add-on Module', () => {

  it('should list all 15 country profiles across 7 framework clusters', () => {
    const countries = GlobalPayrollService.getCountries();
    expect(countries.length).toBeGreaterThanOrEqual(15);

    const clusters = [...new Set(countries.map(c => c.cluster))];
    expect(clusters).toContain('SOUTH_ASIA');
    expect(clusters).toContain('GCC');
    expect(clusters).toContain('EU_CONTINENTAL');
    expect(clusters).toContain('UK_COMMONWEALTH');
    expect(clusters).toContain('AMERICAS');
    expect(clusters).toContain('EAST_ASIA');
    expect(clusters).toContain('NORDIC');

    const gccCountries = GlobalPayrollService.getCountries('GCC');
    expect(gccCountries.map(c => c.code)).toEqual(expect.arrayContaining(['AE', 'SA', 'QA']));
  });

  it('should accurately calculate India TDS, EPF, and Gratuity', () => {
    const calc = GlobalPayrollService.calculatePayroll({
      tenantId: 'tenant-001',
      employeeId: 'EMP-1001',
      countryCode: 'IN',
      grossAnnual: 1200000, // ₹12 LPA
      basicSalaryPercent: 0.40, // 40% basic = ₹4.8 LPA = ₹40k/mo
      yearsOfService: 6,
    });

    expect(calc.countryCode).toBe('IN');
    expect(calc.currency).toBe('INR');
    expect(calc.grossMonthly).toBe(100000);
    expect(calc.basicMonthly).toBe(40000);
    expect(calc.taxableIncome).toBe(1200000 - 75000); // Standard deduction ₹75k
    expect(calc.incomeTaxAnnual).toBeGreaterThan(0);
    expect(calc.netMonthly).toBeLessThan(100000);
    expect(calc.eosbAnnualAccrual).toBeGreaterThan(0);
  });

  it('should calculate UAE expat payroll with 0% tax, 0% employee SS, and EOSB gratuity', () => {
    const calc = GlobalPayrollService.calculatePayroll({
      tenantId: 'tenant-001',
      employeeId: 'EXP-9901',
      countryCode: 'AE',
      grossAnnual: 240000, // AED 240k/year = AED 20k/month
      basicSalaryPercent: 0.60, // AED 12k basic/month
      yearsOfService: 3,
      isNational: false,
    });

    expect(calc.countryCode).toBe('AE');
    expect(calc.incomeTaxAnnual).toBe(0);
    expect(calc.effectiveTaxRate).toBe(0);
    expect(calc.totalEmployeeContributionsAnnual).toBe(0);
    expect(calc.netMonthly).toBe(20000); // 100% net take-home for expat
    expect(calc.eosbAnnualAccrual).toBeGreaterThan(0); // Gratuity accrued
  });

  it('should calculate UK PAYE, National Insurance, and Workplace Pension', () => {
    const calc = GlobalPayrollService.calculatePayroll({
      tenantId: 'tenant-001',
      employeeId: 'UK-8001',
      countryCode: 'GB',
      grossAnnual: 60000, // £60k annual
    });

    expect(calc.countryCode).toBe('GB');
    expect(calc.currency).toBe('GBP');
    expect(calc.incomeTaxAnnual).toBeGreaterThan(0);
    expect(calc.employeeContributions.length).toBeGreaterThanOrEqual(2);
    expect(calc.employerContributions.length).toBeGreaterThanOrEqual(2);
    expect(calc.netAnnual).toBeLessThan(60000);
  });

  it('should enforce Singapore CPF OW ceiling capping', () => {
    const calc = GlobalPayrollService.calculatePayroll({
      tenantId: 'tenant-001',
      employeeId: 'SG-7001',
      countryCode: 'SG',
      grossAnnual: 180000, // S$15,000/month (exceeds S$7,400 OW cap)
      isNational: true,
    });

    expect(calc.countryCode).toBe('SG');
    const cpfEmp = calc.employeeContributions.find(c => c.code === 'CPF_EMP');
    expect(cpfEmp).toBeDefined();
    // 20% of S$7,400 OW cap = S$1,480 monthly
    expect(cpfEmp?.monthlyAmount).toBe(1480);
  });

  it('should calculate Germany Lohnsteuer and 4 social security pillars with caps', () => {
    const calc = GlobalPayrollService.calculatePayroll({
      tenantId: 'tenant-001',
      employeeId: 'DE-6001',
      countryCode: 'DE',
      grossAnnual: 80000, // €80k annual
    });

    expect(calc.countryCode).toBe('DE');
    expect(calc.currency).toBe('EUR');
    expect(calc.incomeTaxAnnual).toBeGreaterThan(0);
    expect(calc.employeeContributions.length).toBe(4); // RV, KV, AV, PV
    expect(calc.employerContributions.length).toBe(5); // RV, KV, AV, PV, BG
    expect(calc.totalEmployerCostAnnual).toBeGreaterThan(80000);
  });

  it('should return statutory compliance calendar items for tenant', () => {
    const items = GlobalPayrollService.getComplianceCalendar('tenant-001');
    expect(items.length).toBeGreaterThanOrEqual(5);

    const indiaItems = GlobalPayrollService.getComplianceCalendar('tenant-001', 'IN');
    expect(indiaItems.length).toBeGreaterThanOrEqual(3);
    expect(indiaItems.map(i => i.filingCode)).toContain('TDS_24Q');
  });

  it('should enforce tenant isolation for global payroll runs and compliance', () => {
    const summary = GlobalPayrollService.getDashboardSummary('tenant-999');
    expect(summary.totalPayrollRuns).toBe(0);
    expect(summary.totalEmployeesGlobally).toBe(0);
    expect(summary.pendingComplianceFilings).toBe(0);

    const runs = GlobalPayrollService.getPayrollRuns('tenant-999');
    expect(runs.length).toBe(0);

    const calendar = GlobalPayrollService.getComplianceCalendar('tenant-999');
    expect(calendar.length).toBe(0);
  });

});
