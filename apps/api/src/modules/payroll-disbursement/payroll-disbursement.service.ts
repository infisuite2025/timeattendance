import {
  FinPayrollRunDTO,
  FinEmployeeBankAccountDTO,
  FinDisbursementDTO,
  FinTaxSlipDTO,
  FinEWARequestDTO,
  FinPayrollDashboardSummaryDTO,
} from '@infi-timepro/shared-types';

export class PayrollDisbursementService {

  // ─── Employee Bank Accounts ─────────────────────────────────────────────────
  private static bankAccounts: FinEmployeeBankAccountDTO[] = [
    { id: 'bank-001', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', employeeCode: 'EMP-1001', department: 'Engineering & Quality', accountHolderName: 'Sarah Jenkins', bankName: 'HDFC Bank', accountNumber: '****4892', ifscCode: 'HDFC0001234', accountType: 'savings', currency: 'INR', country: 'India', transferMethod: 'upi', upiId: 'sarahj@hdfcbank', isVerified: true, isPrimary: true, verifiedAt: '2025-01-20T09:00:00.000Z' },
    { id: 'bank-002', tenantId: 'tenant-001', employeeId: 'EMP-1003', employeeName: 'David Park', employeeCode: 'EMP-1003', department: 'Operations & Assembly', accountHolderName: 'David Park', bankName: 'ICICI Bank', accountNumber: '****7234', ifscCode: 'ICIC0004567', accountType: 'savings', currency: 'INR', country: 'India', transferMethod: 'neft', isVerified: true, isPrimary: true, verifiedAt: '2025-02-10T09:00:00.000Z' },
    { id: 'bank-003', tenantId: 'tenant-001', employeeId: 'EMP-1005', employeeName: 'Ananya Krishnan', employeeCode: 'EMP-1005', department: 'Technology', accountHolderName: 'Ananya Krishnan', bankName: 'SBI', accountNumber: '****1156', ifscCode: 'SBIN0002345', accountType: 'savings', currency: 'INR', country: 'India', transferMethod: 'upi', upiId: 'ananyak@oksbi', isVerified: true, isPrimary: true, verifiedAt: '2025-03-15T09:00:00.000Z' },
    { id: 'bank-004', tenantId: 'tenant-001', employeeId: 'EMP-1006', employeeName: 'Fatima Al-Zaabi', employeeCode: 'EMP-1006', department: 'Technology', accountHolderName: 'Fatima Al-Zaabi', bankName: 'Emirates NBD', accountNumber: '****8821', swiftCode: 'EBILAEAD', accountType: 'current', currency: 'AED', country: 'UAE', transferMethod: 'wps', wpsLabourCardNumber: 'LC-AE-20250618-001', isVerified: true, isPrimary: true, verifiedAt: '2025-06-18T09:00:00.000Z' },
    { id: 'bank-005', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201', department: 'Manufacturing', accountHolderName: 'Ramesh Gupta', bankName: 'Axis Bank', accountNumber: '****3309', ifscCode: 'UTIB0003456', accountType: 'savings', currency: 'INR', country: 'India', transferMethod: 'neft', isVerified: false, isPrimary: true },
    { id: 'bank-006', tenantId: 'tenant-001', employeeId: 'EMP-3350', employeeName: 'Khalid Hassan', employeeCode: 'EMP-3350', department: 'Field Operations', accountHolderName: 'Khalid Hassan', bankName: 'Abu Dhabi Commercial Bank', accountNumber: '****4417', swiftCode: 'ADCBAEAA', accountType: 'savings', currency: 'AED', country: 'UAE', transferMethod: 'wps', wpsLabourCardNumber: 'LC-AE-20250601-002', isVerified: true, isPrimary: true, verifiedAt: '2025-06-01T09:00:00.000Z' },
  ];

  // ─── Payroll Runs ───────────────────────────────────────────────────────────
  private static payrollRuns: FinPayrollRunDTO[] = [
    {
      id: 'run-001', tenantId: 'tenant-001', runName: 'August 2025 Payroll', periodFrom: '2025-08-01', periodTo: '2025-08-31',
      paymentDate: '2025-09-05', currency: 'INR', totalGrossSalary: 12480000, totalDeductions: 1872000,
      totalNetPayout: 10608000, totalEmployerPF: 748800, totalTax: 936000, employeeCount: 1248,
      status: 'disbursed', approvedBy: 'Naresh Andukoori', approvedAt: '2025-09-03T14:00:00.000Z',
      disbursedAt: '2025-09-05T09:30:00.000Z', disbursementMethod: 'batch_bank_transfer',
      createdAt: '2025-09-01T09:00:00.000Z', cryptoHash: 'sha256-a3f8c2d1e94b7f0c3a2d1e5f8b9c4a7d2e1f3c5a8b9d2e4f7c0a3d6e9f2b5c8',
      lockedAt: '2025-09-03T14:00:00.000Z',
    },
    {
      id: 'run-002', tenantId: 'tenant-001', runName: 'July 2025 Payroll', periodFrom: '2025-07-01', periodTo: '2025-07-31',
      paymentDate: '2025-08-05', currency: 'INR', totalGrossSalary: 12350000, totalDeductions: 1852500,
      totalNetPayout: 10497500, totalEmployerPF: 741000, totalTax: 926250, employeeCount: 1248,
      status: 'disbursed', approvedBy: 'Naresh Andukoori', approvedAt: '2025-08-03T11:00:00.000Z',
      disbursedAt: '2025-08-05T10:00:00.000Z', disbursementMethod: 'batch_bank_transfer',
      createdAt: '2025-08-01T09:00:00.000Z', cryptoHash: 'sha256-b4g9d3e2f05c8g1d4b3e2f6c0b0d5e8f3c6d9g2e5h8i1j4k7l0m3n6o9p2q5r',
      lockedAt: '2025-08-03T11:00:00.000Z',
    },
    {
      id: 'run-003', tenantId: 'tenant-001', runName: 'September 2025 Payroll', periodFrom: '2025-09-01', periodTo: '2025-09-30',
      paymentDate: '2025-10-05', currency: 'INR', totalGrossSalary: 12650000, totalDeductions: 1897500,
      totalNetPayout: 10752500, totalEmployerPF: 759000, totalTax: 948750, employeeCount: 1250,
      status: 'pending_approval', createdAt: '2025-09-13T09:00:00.000Z',
    },
    {
      id: 'run-004', tenantId: 'tenant-001', runName: 'Q3 2025 Bonus Run', periodFrom: '2025-07-01', periodTo: '2025-09-30',
      paymentDate: '2025-10-10', currency: 'INR', totalGrossSalary: 3200000, totalDeductions: 480000,
      totalNetPayout: 2720000, totalEmployerPF: 0, totalTax: 480000, employeeCount: 342,
      status: 'draft', createdAt: '2025-09-14T09:00:00.000Z',
    },
  ];

  // ─── Disbursements ──────────────────────────────────────────────────────────
  private static disbursements: FinDisbursementDTO[] = [
    { id: 'dis-001', tenantId: 'tenant-001', payrollRunId: 'run-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', employeeCode: 'EMP-1001', department: 'Engineering & Quality', grossSalary: 180000, basicSalary: 90000, hra: 36000, specialAllowance: 27000, otherAllowances: 27000, providentFund: 10800, professionalTax: 200, incomeTax: 15000, totalDeductions: 26000, netPayout: 154000, currency: 'INR', bankAccountId: 'bank-001', transferMethod: 'upi', transferReference: 'UTR2025090512340001', status: 'credited', creditedAt: '2025-09-05T09:45:00.000Z', paymentDate: '2025-09-05' },
    { id: 'dis-002', tenantId: 'tenant-001', payrollRunId: 'run-001', employeeId: 'EMP-1003', employeeName: 'David Park', employeeCode: 'EMP-1003', department: 'Operations & Assembly', grossSalary: 220000, basicSalary: 110000, hra: 44000, specialAllowance: 33000, otherAllowances: 33000, providentFund: 13200, professionalTax: 200, incomeTax: 22000, totalDeductions: 35400, netPayout: 184600, currency: 'INR', bankAccountId: 'bank-002', transferMethod: 'neft', transferReference: 'UTR2025090512340002', status: 'credited', creditedAt: '2025-09-05T10:00:00.000Z', paymentDate: '2025-09-05' },
    { id: 'dis-003', tenantId: 'tenant-001', payrollRunId: 'run-001', employeeId: 'EMP-1005', employeeName: 'Ananya Krishnan', employeeCode: 'EMP-1005', department: 'Technology', grossSalary: 260000, basicSalary: 130000, hra: 52000, specialAllowance: 39000, otherAllowances: 39000, providentFund: 15600, professionalTax: 200, incomeTax: 31200, totalDeductions: 47000, netPayout: 213000, currency: 'INR', bankAccountId: 'bank-003', transferMethod: 'upi', transferReference: 'UTR2025090512340003', status: 'credited', creditedAt: '2025-09-05T10:15:00.000Z', paymentDate: '2025-09-05' },
    { id: 'dis-004', tenantId: 'tenant-001', payrollRunId: 'run-001', employeeId: 'EMP-1006', employeeName: 'Fatima Al-Zaabi', employeeCode: 'EMP-1006', department: 'Technology', grossSalary: 28000, basicSalary: 18000, hra: 0, specialAllowance: 6000, otherAllowances: 4000, providentFund: 0, professionalTax: 0, incomeTax: 2800, totalDeductions: 2800, netPayout: 25200, currency: 'AED', bankAccountId: 'bank-004', transferMethod: 'wps', transferReference: 'WPS-AE-20250905-004', status: 'credited', creditedAt: '2025-09-05T11:00:00.000Z', paymentDate: '2025-09-05' },
    { id: 'dis-005', tenantId: 'tenant-001', payrollRunId: 'run-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201', department: 'Manufacturing', grossSalary: 85000, basicSalary: 42500, hra: 17000, specialAllowance: 12750, otherAllowances: 12750, providentFund: 5100, professionalTax: 200, incomeTax: 5100, totalDeductions: 10400, netPayout: 74600, currency: 'INR', bankAccountId: 'bank-005', transferMethod: 'neft', status: 'failed', failureReason: 'Bank account not verified — NEFT rejected by beneficiary bank', paymentDate: '2025-09-05' },
    { id: 'dis-006', tenantId: 'tenant-001', payrollRunId: 'run-003', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', employeeCode: 'EMP-1001', department: 'Engineering & Quality', grossSalary: 180000, basicSalary: 90000, hra: 36000, specialAllowance: 27000, otherAllowances: 27000, providentFund: 10800, professionalTax: 200, incomeTax: 15000, totalDeductions: 26000, netPayout: 154000, currency: 'INR', bankAccountId: 'bank-001', transferMethod: 'upi', status: 'pending', paymentDate: '2025-10-05' },
    { id: 'dis-007', tenantId: 'tenant-001', payrollRunId: 'run-003', employeeId: 'EMP-1003', employeeName: 'David Park', employeeCode: 'EMP-1003', department: 'Operations & Assembly', grossSalary: 220000, basicSalary: 110000, hra: 44000, specialAllowance: 33000, otherAllowances: 33000, providentFund: 13200, professionalTax: 200, incomeTax: 22000, totalDeductions: 35400, netPayout: 184600, currency: 'INR', bankAccountId: 'bank-002', transferMethod: 'neft', status: 'pending', paymentDate: '2025-10-05' },
  ];

  // ─── Tax Slips ──────────────────────────────────────────────────────────────
  private static taxSlips: FinTaxSlipDTO[] = [
    { id: 'tax-001', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', employeeCode: 'EMP-1001', department: 'Engineering & Quality', financialYear: '2024-25', slipType: 'form16', grossSalary: 2160000, totalTaxableIncome: 1980000, totalTaxDeducted: 180000, surcharge: 0, educationCess: 5400, netTaxPayable: 185400, status: 'issued', issuedAt: '2025-06-15T09:00:00.000Z', downloadUrl: '/secure/tax/form16-EMP1001-2024-25.pdf' },
    { id: 'tax-002', tenantId: 'tenant-001', employeeId: 'EMP-1003', employeeName: 'David Park', employeeCode: 'EMP-1003', department: 'Operations & Assembly', financialYear: '2024-25', slipType: 'form16', grossSalary: 2640000, totalTaxableIncome: 2400000, totalTaxDeducted: 264000, surcharge: 0, educationCess: 7920, netTaxPayable: 271920, status: 'issued', issuedAt: '2025-06-15T09:00:00.000Z', downloadUrl: '/secure/tax/form16-EMP1003-2024-25.pdf' },
    { id: 'tax-003', tenantId: 'tenant-001', employeeId: 'EMP-1005', employeeName: 'Ananya Krishnan', employeeCode: 'EMP-1005', department: 'Technology', financialYear: '2024-25', slipType: 'form16', grossSalary: 3120000, totalTaxableIncome: 2820000, totalTaxDeducted: 374400, surcharge: 0, educationCess: 11232, netTaxPayable: 385632, status: 'issued', issuedAt: '2025-06-15T09:00:00.000Z', downloadUrl: '/secure/tax/form16-EMP1005-2024-25.pdf' },
    { id: 'tax-004', tenantId: 'tenant-001', employeeId: 'EMP-1006', employeeName: 'Fatima Al-Zaabi', employeeCode: 'EMP-1006', department: 'Technology', financialYear: '2024-25', slipType: 'uae_salary_certificate', grossSalary: 336000, totalTaxableIncome: 0, totalTaxDeducted: 0, surcharge: 0, educationCess: 0, netTaxPayable: 0, status: 'issued', issuedAt: '2025-06-20T09:00:00.000Z', downloadUrl: '/secure/tax/salary-cert-EMP1006-2024-25.pdf' },
    { id: 'tax-005', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201', department: 'Manufacturing', financialYear: '2024-25', slipType: 'form16', grossSalary: 1020000, totalTaxableIncome: 900000, totalTaxDeducted: 61200, surcharge: 0, educationCess: 1836, netTaxPayable: 63036, status: 'draft', downloadUrl: '' },
  ];

  // ─── EWA Requests ───────────────────────────────────────────────────────────
  private static ewaRequests: FinEWARequestDTO[] = [
    { id: 'ewa-001', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', employeeCode: 'EMP-1001', department: 'Engineering & Quality', requestedAmount: 25000, approvedAmount: 25000, currency: 'INR', reason: 'Medical emergency — hospital deposit required', status: 'disbursed', requestedAt: '2025-09-03T11:00:00.000Z', approvedAt: '2025-09-03T14:00:00.000Z', approvedBy: 'Vikram Singh', disbursedAt: '2025-09-03T16:30:00.000Z', repaymentDate: '2025-10-05', feePercent: 0, earnedWageToDate: 120000, maxEligibleAmount: 60000 },
    { id: 'ewa-002', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201', department: 'Manufacturing', requestedAmount: 15000, currency: 'INR', reason: 'Vehicle repair — needed for commute', status: 'pending', requestedAt: '2025-09-13T09:30:00.000Z', earnedWageToDate: 56666, maxEligibleAmount: 28333, feePercent: 0 },
    { id: 'ewa-003', tenantId: 'tenant-001', employeeId: 'EMP-3350', employeeName: 'Khalid Hassan', employeeCode: 'EMP-3350', department: 'Field Operations', requestedAmount: 3000, approvedAmount: 2000, currency: 'AED', reason: 'School fees for children', status: 'approved', requestedAt: '2025-09-10T08:00:00.000Z', approvedAt: '2025-09-10T12:00:00.000Z', approvedBy: 'Naresh Andukoori', repaymentDate: '2025-10-05', feePercent: 0, earnedWageToDate: 18666, maxEligibleAmount: 9333 },
    { id: 'ewa-004', tenantId: 'tenant-001', employeeId: 'EMP-1003', employeeName: 'David Park', employeeCode: 'EMP-1003', department: 'Operations & Assembly', requestedAmount: 50000, currency: 'INR', reason: 'Home renovation down payment', status: 'rejected', requestedAt: '2025-09-05T10:00:00.000Z', approvedAt: '2025-09-05T16:00:00.000Z', approvedBy: 'Vikram Singh', rejectionReason: 'Requested amount exceeds 50% of earned wages (₹73,333 earned). Policy limit is ₹36,666.', earnedWageToDate: 73333, maxEligibleAmount: 36666, feePercent: 0 },
  ];

  // ─── Public API ────────────────────────────────────────────────────────────

  static async getDashboardSummary(tenantId: string): Promise<FinPayrollDashboardSummaryDTO> {
    const runs = this.payrollRuns.filter(r => r.tenantId === tenantId);
    const disbs = this.disbursements.filter(d => d.tenantId === tenantId);
    const ewa = this.ewaRequests.filter(e => e.tenantId === tenantId);
    const lastRun = runs.find(r => r.status === 'disbursed');
    return {
      totalEmployeesOnPayroll: 1250,
      lastPayrollAmount: lastRun?.totalNetPayout || 0,
      lastPayrollCurrency: lastRun?.currency || 'INR',
      lastPayrollDate: lastRun?.disbursedAt || '',
      pendingApprovalRuns: runs.filter(r => r.status === 'pending_approval').length,
      draftRuns: runs.filter(r => r.status === 'draft').length,
      failedDisbursements: disbs.filter(d => d.status === 'failed').length,
      pendingEWARequests: ewa.filter(e => e.status === 'pending').length,
      totalEWADisbursedThisMonth: ewa.filter(e => e.status === 'disbursed').reduce((s, e) => s + (e.approvedAmount || 0), 0),
      taxSlipsIssued: this.taxSlips.filter(t => t.tenantId === tenantId && t.status === 'issued').length,
      taxSlipsPending: this.taxSlips.filter(t => t.tenantId === tenantId && t.status === 'draft').length,
      bankAccountsUnverified: this.bankAccounts.filter(b => b.tenantId === tenantId && !b.isVerified).length,
      nextPayrollDate: '2025-10-05',
      nextPayrollEstimatedAmount: runs.find(r => r.status === 'pending_approval')?.totalNetPayout || 0,
    };
  }

  static async getPayrollRuns(tenantId: string, status?: string): Promise<FinPayrollRunDTO[]> {
    return this.payrollRuns.filter(r => r.tenantId === tenantId && (!status || r.status === status));
  }

  static async approvePayrollRun(runId: string, approvedBy: string): Promise<FinPayrollRunDTO> {
    const run = this.payrollRuns.find(r => r.id === runId);
    if (!run) throw new Error(`Payroll run ${runId} not found`);
    if (run.status !== 'pending_approval') throw new Error(`Run is not in pending_approval state`);
    run.status = 'approved';
    run.approvedBy = approvedBy;
    run.approvedAt = new Date().toISOString();
    run.lockedAt = new Date().toISOString();
    run.cryptoHash = `sha256-${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    return run;
  }

  static async disbursePayrollRun(runId: string): Promise<FinPayrollRunDTO> {
    const run = this.payrollRuns.find(r => r.id === runId);
    if (!run) throw new Error(`Payroll run ${runId} not found`);
    if (run.status !== 'approved') throw new Error(`Run must be approved before disbursement`);
    run.status = 'disbursed';
    run.disbursedAt = new Date().toISOString();
    run.disbursementMethod = 'batch_bank_transfer';
    return run;
  }

  static async getDisbursements(tenantId: string, payrollRunId?: string, status?: string, employeeId?: string): Promise<FinDisbursementDTO[]> {
    return this.disbursements.filter(d =>
      d.tenantId === tenantId &&
      (!payrollRunId || d.payrollRunId === payrollRunId) &&
      (!status || d.status === status) &&
      (!employeeId || d.employeeId === employeeId)
    );
  }

  static async retryFailedDisbursement(disbursementId: string): Promise<FinDisbursementDTO> {
    const disb = this.disbursements.find(d => d.id === disbursementId);
    if (!disb) throw new Error(`Disbursement ${disbursementId} not found`);
    disb.status = 'pending';
    disb.failureReason = undefined;
    disb.transferReference = `UTR${Date.now()}`;
    return disb;
  }

  static async getBankAccounts(tenantId: string): Promise<FinEmployeeBankAccountDTO[]> {
    return this.bankAccounts.filter(b => b.tenantId === tenantId);
  }

  static async getTaxSlips(tenantId: string, financialYear?: string): Promise<FinTaxSlipDTO[]> {
    return this.taxSlips.filter(t => t.tenantId === tenantId && (!financialYear || t.financialYear === financialYear));
  }

  static async issueTaxSlip(slipId: string): Promise<FinTaxSlipDTO> {
    const slip = this.taxSlips.find(t => t.id === slipId);
    if (!slip) throw new Error(`Tax slip ${slipId} not found`);
    slip.status = 'issued';
    slip.issuedAt = new Date().toISOString();
    slip.downloadUrl = `/secure/tax/${slip.slipType}-${slip.employeeCode}-${slip.financialYear}.pdf`;
    return slip;
  }

  static async getEWARequests(tenantId: string, status?: string): Promise<FinEWARequestDTO[]> {
    return this.ewaRequests.filter(e => e.tenantId === tenantId && (!status || e.status === status));
  }

  static async approveEWA(ewaId: string, approvedBy: string, approvedAmount: number): Promise<FinEWARequestDTO> {
    const req = this.ewaRequests.find(e => e.id === ewaId);
    if (!req) throw new Error(`EWA request ${ewaId} not found`);
    req.status = 'approved';
    req.approvedAmount = approvedAmount;
    req.approvedBy = approvedBy;
    req.approvedAt = new Date().toISOString();
    req.repaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return req;
  }

  static async rejectEWA(ewaId: string, approvedBy: string, reason: string): Promise<FinEWARequestDTO> {
    const req = this.ewaRequests.find(e => e.id === ewaId);
    if (!req) throw new Error(`EWA request ${ewaId} not found`);
    req.status = 'rejected';
    req.approvedBy = approvedBy;
    req.approvedAt = new Date().toISOString();
    req.rejectionReason = reason;
    return req;
  }

  static async disburseEWA(ewaId: string): Promise<FinEWARequestDTO> {
    const req = this.ewaRequests.find(e => e.id === ewaId);
    if (!req) throw new Error(`EWA request ${ewaId} not found`);
    if (req.status !== 'approved') throw new Error('EWA must be approved before disbursement');
    req.status = 'disbursed';
    req.disbursedAt = new Date().toISOString();
    return req;
  }
}
