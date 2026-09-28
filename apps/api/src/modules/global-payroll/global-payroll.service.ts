import {
  GprCountryProfile,
  GprCalculationInput,
  GprCalculationResult,
  GprTaxBracketResult,
  GprContributionResult,
  GprPayrollRunDTO,
  GprComplianceItemDTO,
  GprGlobalDashboardDTO,
  GprCluster,
} from '@infi-timepro/shared-types';

// ═══════════════════════════════════════════════════════════════════════════
// CORE CALCULATION ENGINE — Shared by ALL 7 clusters
// ═══════════════════════════════════════════════════════════════════════════

function calcProgressiveTax(taxableIncome: number, brackets: GprCountryProfile['taxBrackets']): { tax: number; breakdown: GprTaxBracketResult[] } {
  let tax = 0;
  const breakdown: GprTaxBracketResult[] = [];
  let remaining = Math.max(0, taxableIncome);

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bracketSize = bracket.to === null ? remaining : Math.min(remaining, bracket.to - bracket.from);
    const taxableAmount = Math.min(remaining, bracketSize);
    const bracketTax = taxableAmount * bracket.rate;
    if (taxableAmount > 0) {
      breakdown.push({ label: bracket.label, taxableAmount, rate: bracket.rate, tax: bracketTax });
    }
    tax += bracketTax;
    remaining -= taxableAmount;
  }

  return { tax, breakdown };
}

function calcContributions(gross: number, basic: number, defs: GprCountryProfile['employeeContributions']): GprContributionResult[] {
  return defs.map(c => {
    const base = c.basis === 'basic' ? basic : gross;
    const annualBase = c.annualCap !== undefined ? Math.min(base * 12, c.annualCap) : base * 12;
    const monthlyBase = annualBase / 12;
    const monthlyAmount = c.cap !== undefined ? Math.min(monthlyBase * c.rate, c.cap) : monthlyBase * c.rate;
    return {
      name: c.name,
      code: c.code,
      rate: c.rate,
      monthlyAmount: Math.round(monthlyAmount),
      annualAmount: Math.round(monthlyAmount * 12),
      isEmployer: c.isEmployer,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COUNTRY PROFILES — Rate tables (7 clusters, 15 countries)
// Adding a new country = add one profile object, no engine changes needed.
// ═══════════════════════════════════════════════════════════════════════════

const COUNTRY_PROFILES: Record<string, GprCountryProfile> = {

  // ─── CLUSTER 1: SOUTH ASIA ────────────────────────────────────────────────
  IN: {
    code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹',
    cluster: 'SOUTH_ASIA',
    taxSystem: 'TDS (Tax Deducted at Source) — New Tax Regime FY 2024-25 default',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 300000,   rate: 0.00, label: '0–₹3L @ 0%' },
      { from: 300000,  to: 700000,   rate: 0.05, label: '₹3L–₹7L @ 5%' },
      { from: 700000,  to: 1000000,  rate: 0.10, label: '₹7L–₹10L @ 10%' },
      { from: 1000000, to: 1200000,  rate: 0.15, label: '₹10L–₹12L @ 15%' },
      { from: 1200000, to: 1500000,  rate: 0.20, label: '₹12L–₹15L @ 20%' },
      { from: 1500000, to: null,     rate: 0.30, label: '₹15L+ @ 30%' },
    ],
    standardDeduction: 75000,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'EPF (Employee PF)', code: 'EPF_EMP', rate: 0.12, cap: 1800, basis: 'basic', isEmployer: false, description: '12% of basic, capped at ₹15,000 basic → max ₹1,800/month', taxable: false },
      { name: 'ESI (Employee)', code: 'ESI_EMP', rate: 0.0075, cap: 157.5, basis: 'gross', isEmployer: false, description: '0.75% of gross wages; only if gross ≤ ₹21,000/month', taxable: false },
      { name: 'Professional Tax', code: 'PT', rate: 0, cap: 208, basis: 'gross', isEmployer: false, description: '~₹2,500/year; state-specific (Karnataka ₹200/month, Maharashtra slab)', taxable: false },
    ],
    employerContributions: [
      { name: 'EPF (Employer PF + EPS)', code: 'EPF_EMP_ER', rate: 0.12, cap: 1800, basis: 'basic', isEmployer: true, description: '12% of basic (3.67% EPF + 8.33% EPS), capped at ₹15,000 basic' },
      { name: 'ESI (Employer)', code: 'ESI_ER', rate: 0.0325, cap: 682.5, basis: 'gross', isEmployer: true, description: '3.25% of gross wages; only if gross ≤ ₹21,000/month' },
      { name: 'EDLI + Admin Charges', code: 'EDLI', rate: 0.005, cap: 75, basis: 'basic', isEmployer: true, description: '0.5% employer admin + EDLI insurance' },
      { name: 'Gratuity Accrual', code: 'GRATUITY', rate: 0.0481, basis: 'basic', isEmployer: true, description: '4.81% of basic = 15 days/26 working days per year accrual' },
    ],
    salaryComponents: [
      { code: 'BASIC', name: 'Basic Salary', typicalPercentOfGross: 0.40, taxExempt: false, mandatory: true, description: 'Foundation component; PF calculated on this' },
      { code: 'HRA', name: 'House Rent Allowance', typicalPercentOfGross: 0.20, taxExempt: true, mandatory: false, description: 'Exempt u/s 10(13A): lower of actual HRA, 40/50% of basic, or rent paid minus 10% of basic' },
      { code: 'LTA', name: 'Leave Travel Allowance', typicalPercentOfGross: 0.05, taxExempt: true, mandatory: false, description: 'Exempt for actual travel cost; 2 journeys in 4-year block' },
      { code: 'SPECIAL', name: 'Special Allowance', typicalPercentOfGross: 0.35, taxExempt: false, mandatory: false, description: 'Fully taxable balancing component' },
    ],
    eosb: { applicable: true, basis: 'basic', daysPerYear_first5: 15, daysPerYear_after5: 15, description: 'Gratuity under Payment of Gratuity Act: 15 days basic per year after 5 years of service' },
    complianceFilings: [
      { code: 'TDS_24Q', name: 'TDS Return (Form 24Q)', authority: 'Income Tax Dept (TRACES)', frequency: 'quarterly', description: 'Quarterly TDS filing for salary deductions. Q1: Jul 31, Q2: Oct 31, Q3: Jan 31, Q4: May 31', penaltyNote: '₹200/day late fee u/s 234E' },
      { code: 'FORM16', name: 'Form 16 Issue', authority: 'Income Tax Dept', frequency: 'annual', description: 'Annual TDS certificate to employees — due by June 15 of following year' },
      { code: 'EPF_ECR', name: 'EPF Electronic Challan Return', authority: 'EPFO', frequency: 'monthly', description: 'Monthly PF challan by 15th of following month via EPFO Unified Portal', penaltyNote: '12% p.a. interest + damages for late payment' },
      { code: 'ESI_RETURN', name: 'ESI Half-Yearly Return', authority: 'ESIC', frequency: 'semi_annual', description: 'Semi-annual returns: May (for Oct–Mar) and November (for Apr–Sep)', penaltyNote: 'Interest @ 12% p.a. on delayed contributions' },
      { code: 'PT_RETURN', name: 'Professional Tax Return', authority: 'State Government', frequency: 'monthly', description: 'Monthly PT deduction and remittance to respective State government by 10th–20th' },
    ],
    specialNotes: [
      'New Tax Regime is default from FY 2024-25 (Budget 2024). Standard deduction ₹75,000.',
      'EPF: If basic salary > ₹15,000/month, employer can contribute at actual rate or restrict to ₹15,000 ceiling.',
      'ESI applies only if monthly gross wages ≤ ₹21,000 (₹25,000 for persons with disability).',
      'HRA exemption: least of (i) actual HRA received, (ii) 50% of basic for metro/40% for non-metro, (iii) rent paid minus 10% of basic.',
      'Professional Tax is state-specific — not all states levy it. Karnataka: ₹200/month. Maharashtra: slab-based up to ₹200/month.',
      'Gratuity payable after 5 years of continuous service: 15 days × (basic/26) × years.',
    ],
    keyFacts: { taxRange: '0–30%', employeeSSRate: '12.75%', employerSSRate: '16.31%', noTax: false, mandatoryComponents: ['Basic', 'HRA', 'EPF', 'ESI (if applicable)'] },
  },

  // ─── CLUSTER 2: GCC ────────────────────────────────────────────────────────
  AE: {
    code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'AED ',
    cluster: 'GCC',
    taxSystem: 'No personal income tax. UAE Corporate Tax (9%) does not affect payroll.',
    hasTax: false,
    taxBrackets: [],
    standardDeduction: 0,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'GPSSA Pension (UAE Nationals only)', code: 'GPSSA_EMP', rate: 0.05, basis: 'gross', isEmployer: false, description: '5% pension contribution for UAE Nationals. Expats: zero.', taxable: false },
    ],
    employerContributions: [
      { name: 'GPSSA Pension (UAE Nationals only)', code: 'GPSSA_ER', rate: 0.125, basis: 'gross', isEmployer: true, description: '12.5% for UAE Nationals. For Abu Dhabi Nationals: 15% + 2.5% federal = 17.5%.' },
    ],
    salaryComponents: [
      { code: 'BASIC', name: 'Basic Salary', typicalPercentOfGross: 0.60, taxExempt: true, mandatory: true, description: 'Basis for EOSB (gratuity) calculation — keep this clearly defined in employment contract' },
      { code: 'HOUSING', name: 'Housing Allowance', typicalPercentOfGross: 0.25, taxExempt: true, mandatory: false, description: 'Employer-provided housing allowance; excluded from gratuity basis' },
      { code: 'TRANSPORT', name: 'Transport Allowance', typicalPercentOfGross: 0.10, taxExempt: true, mandatory: false, description: 'Common in UAE employment packages' },
      { code: 'OTHER_ALLOW', name: 'Other Allowances', typicalPercentOfGross: 0.05, taxExempt: true, mandatory: false, description: 'Meal, telephone, education allowances, etc.' },
    ],
    eosb: { applicable: true, basis: 'basic', daysPerYear_first5: 21, daysPerYear_after5: 30, cap: 2, description: 'UAE Labour Law (Decree-Law 33/2021): 21 working days basic/year for first 5 years; 30 working days/year thereafter. Total capped at 2 years total wages.' },
    complianceFilings: [
      { code: 'WPS', name: 'Wage Protection System (WPS)', authority: 'Ministry of Human Resources (MOHRE)', frequency: 'monthly', description: 'Mandatory salary transfer through approved channels within 10 days of pay date', penaltyNote: 'Fines AED 5,000/employee for non-compliance; work permit suspension' },
      { code: 'GPSSA_RET', name: 'GPSSA Monthly Contribution', authority: 'General Pension & Social Security Authority', frequency: 'monthly', description: 'For UAE national employees only — file and pay by 15th of following month' },
      { code: 'MOHRE_REG', name: 'Labour Contract Registration', authority: 'MOHRE Tasheel', frequency: 'annual', description: 'Ensure all employee contracts are registered with MOHRE. Annual renewal for limited contracts.' },
    ],
    specialNotes: [
      'UAE has NO personal income tax — gross salary = net salary for expatriate employees.',
      'Gratuity (EOSB) is calculated on BASIC salary only — housing, transport, and other allowances are excluded.',
      'WPS is mandatory for all private sector employees. Salary must be paid within 10 days of due date.',
      'New EOSB Savings Scheme (DIFC/ADGM model expanding): Some entities can opt for a contributory savings plan instead of traditional gratuity.',
      'UAE Nationals: GPSSA contributions apply. Abu Dhabi nationals: 15% employer + 2.5% federal = 17.5% total employer.',
      'For Dubai International Financial Centre (DIFC) or ADGM employees, different regulations may apply.',
    ],
    keyFacts: { taxRange: '0%', employeeSSRate: '0% (expat) / 5% (national)', employerSSRate: '0% (expat) / 12.5–17.5% (national)', noTax: true, mandatoryComponents: ['Basic', 'WPS-compliant transfer', 'EOSB accrual'] },
  },

  SA: {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: 'SAR ',
    cluster: 'GCC',
    taxSystem: 'No income tax on salary income. Zakat on business profits (not payroll). GOSI for Saudi nationals.',
    hasTax: false,
    taxBrackets: [],
    standardDeduction: 0,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'GOSI (Saudi Nationals only)', code: 'GOSI_EMP', rate: 0.10, basis: 'gross', isEmployer: false, description: 'General Organization for Social Insurance — 10% for Saudi nationals only. Expats: exempt.' },
    ],
    employerContributions: [
      { name: 'GOSI Employer Contribution', code: 'GOSI_ER', rate: 0.12, basis: 'gross', isEmployer: true, description: '12% employer GOSI for Saudi nationals. Expats: no GOSI but Nitaqat quota compliance required.' },
    ],
    salaryComponents: [
      { code: 'BASIC', name: 'Basic Salary', typicalPercentOfGross: 0.60, taxExempt: true, mandatory: true, description: 'Base for EOSB calculation' },
      { code: 'HOUSING', name: 'Housing Allowance', typicalPercentOfGross: 0.25, taxExempt: true, mandatory: false, description: 'Standard in Saudi employment packages' },
      { code: 'TRANSPORT', name: 'Transport Allowance', typicalPercentOfGross: 0.10, taxExempt: true, mandatory: false, description: 'Transport allowance' },
      { code: 'OTHER', name: 'Other Allowances', typicalPercentOfGross: 0.05, taxExempt: true, mandatory: false, description: 'Utilities, education, etc.' },
    ],
    eosb: { applicable: true, basis: 'basic', daysPerYear_first5: 15, daysPerYear_after5: 30, description: 'Saudi Labour Law: half-month salary per year for first 5 years; one month per year thereafter.' },
    complianceFilings: [
      { code: 'GOSI_MONTHLY', name: 'GOSI Monthly Contribution Filing', authority: 'General Organization for Social Insurance', frequency: 'monthly', description: 'For Saudi national employees — file by end of the following month', penaltyNote: '1% monthly penalty + 10% annual for late payment' },
      { code: 'NITAQAT', name: 'Nitaqat Compliance Check', authority: 'Ministry of Human Resources', frequency: 'quarterly', description: 'Maintain Saudization quotas (% of Saudi nationals per sector/size). Platinum/Green status required for visa issuance.' },
      { code: 'WAGE_PROTECT', name: 'Wage Protection Program (WPP)', authority: 'Ministry of Human Resources', frequency: 'monthly', description: 'Similar to UAE WPS — salary through approved channels' },
    ],
    specialNotes: [
      'No income tax on employment income in Saudi Arabia.',
      'GOSI: 10% employee + 12% employer for Saudi nationals. Expats are NOT covered by GOSI.',
      'Nitaqat (Saudization): Quotas by sector — e.g. 75% local in retail, 35% in construction. Failure = restricted work permits.',
      'EOSB for resigning employees (<2 years: no entitlement; 2-5 years: 1/3 of entitlement; 5-10 years: 2/3; 10+ years: full).',
      'Iqama (residence permit) must be employer-sponsored; annual renewal cost borne by employer.',
    ],
    keyFacts: { taxRange: '0%', employeeSSRate: '0% (expat) / 10% (national)', employerSSRate: '0% (expat) / 12% (national)', noTax: true, mandatoryComponents: ['Basic', 'GOSI (nationals)', 'EOSB accrual', 'Nitaqat quota'] },
  },

  QA: {
    code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'QAR ',
    cluster: 'GCC',
    taxSystem: 'No personal income tax. Government employees have pension via GOSI Qatar.',
    hasTax: false,
    taxBrackets: [],
    standardDeduction: 0,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'GRSIA (Qatari Nationals only)', code: 'GRSIA_EMP', rate: 0.05, basis: 'gross', isEmployer: false, description: '5% General Retirement & Social Insurance Authority for Qatari nationals' },
    ],
    employerContributions: [
      { name: 'GRSIA Employer', code: 'GRSIA_ER', rate: 0.10, basis: 'gross', isEmployer: true, description: '10% GRSIA for Qatari nationals in private sector' },
    ],
    salaryComponents: [
      { code: 'BASIC', name: 'Basic Salary', typicalPercentOfGross: 0.60, taxExempt: true, mandatory: true, description: 'Gratuity basis' },
      { code: 'HOUSING', name: 'Housing Allowance', typicalPercentOfGross: 0.30, taxExempt: true, mandatory: false, description: 'Typical in Qatari packages' },
      { code: 'TRANSPORT', name: 'Transport Allowance', typicalPercentOfGross: 0.10, taxExempt: true, mandatory: false, description: '' },
    ],
    eosb: { applicable: true, basis: 'basic', daysPerYear_first5: 21, daysPerYear_after5: 30, description: 'Qatar Labour Law: 3 weeks (21 days) basic salary per year for first 5 years, 4 weeks thereafter.' },
    complianceFilings: [
      { code: 'AWAMI', name: 'Wage Protection System (WPS)', authority: 'Ministry of Labour Qatar', frequency: 'monthly', description: 'Mandatory electronic salary transfer through QCB-approved banks' },
      { code: 'GRSIA_FILING', name: 'GRSIA Contribution Filing', authority: 'GRSIA Qatar', frequency: 'monthly', description: 'Monthly pension contribution for Qatari national employees' },
    ],
    specialNotes: ['No income tax in Qatar.', 'WPS mandatory for all private sector employers.', 'Gratuity mandatory after 1 year service.'],
    keyFacts: { taxRange: '0%', employeeSSRate: '0% (expat) / 5% (national)', employerSSRate: '0% (expat) / 10% (national)', noTax: true, mandatoryComponents: ['Basic', 'EOSB', 'WPS'] },
  },

  // ─── CLUSTER 3: EU CONTINENTAL ───────────────────────────────────────────
  DE: {
    code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€',
    cluster: 'EU_CONTINENTAL',
    taxSystem: 'Progressive wage tax (Lohnsteuer) + Solidarity Surcharge + Church Tax (optional). Payroll: monthly wage tax class I-VI.',
    hasTax: true,
    taxBrackets: [
      { from: 0,      to: 11784,   rate: 0.00,  label: '0–€11,784 Grundfreibetrag @ 0%' },
      { from: 11784,  to: 17005,   rate: 0.14,  label: '€11,784–€17,005 @ 14–24% (progressive, avg 14%)' },
      { from: 17005,  to: 66760,   rate: 0.24,  label: '€17,005–€66,760 @ avg 24%' },
      { from: 66760,  to: 277825,  rate: 0.42,  label: '€66,760–€277,825 @ 42%' },
      { from: 277825, to: null,    rate: 0.45,  label: '€277,825+ @ 45% (Reichsteuer)' },
    ],
    standardDeduction: 1230,
    personalAllowance: 11784,
    employeeContributions: [
      { name: 'Pension Insurance (Rentenversicherung)', code: 'RV_EMP', rate: 0.093, basis: 'gross', isEmployer: false, annualCap: 90600, description: '9.3% up to annual BBG of €90,600 (West Germany 2024)' },
      { name: 'Health Insurance (Krankenversicherung)', code: 'KV_EMP', rate: 0.073, basis: 'gross', isEmployer: false, annualCap: 62100, description: '7.3% statutory + ~0.9-1.6% supplemental average. Cap at €62,100/year.' },
      { name: 'Unemployment Insurance (Arbeitslosenversicherung)', code: 'AV_EMP', rate: 0.013, basis: 'gross', isEmployer: false, annualCap: 90600, description: '1.3% of gross, same BBG ceiling as pension' },
      { name: 'Long-term Care Insurance (Pflegeversicherung)', code: 'PV_EMP', rate: 0.01525, basis: 'gross', isEmployer: false, annualCap: 62100, description: '1.525% + 0.6% surcharge for childless employees over 23' },
    ],
    employerContributions: [
      { name: 'Pension Insurance (Employer)', code: 'RV_ER', rate: 0.093, basis: 'gross', isEmployer: true, annualCap: 90600, description: '9.3% employer pension matching' },
      { name: 'Health Insurance (Employer)', code: 'KV_ER', rate: 0.073, basis: 'gross', isEmployer: true, annualCap: 62100, description: '7.3% health insurance employer share' },
      { name: 'Unemployment Insurance (Employer)', code: 'AV_ER', rate: 0.013, basis: 'gross', isEmployer: true, annualCap: 90600, description: '1.3% employer unemployment contribution' },
      { name: 'Long-term Care Insurance (Employer)', code: 'PV_ER', rate: 0.01525, basis: 'gross', isEmployer: true, annualCap: 62100, description: '1.525% employer care insurance' },
      { name: "Accident Insurance (Berufsgenossenschaft)", code: 'BG', rate: 0.013, basis: 'gross', isEmployer: true, description: '~1.3% employer-only accident insurance (varies by sector)' },
    ],
    salaryComponents: [
      { code: 'GRUNDGEHALT', name: 'Grundgehalt (Base Salary)', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'Base gross salary; Germany typically uses single gross salary structure' },
      { code: 'WEIHNACHT', name: 'Christmas Bonus (optional)', typicalPercentOfGross: 0, taxExempt: false, mandatory: false, description: 'Common 13th month payment; fully taxable' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory EOSB/gratuity in Germany. Severance only by collective agreement or redundancy.' },
    complianceFilings: [
      { code: 'LOHNSTEUER_ANMELDUNG', name: 'Lohnsteueranmeldung (Wage Tax Return)', authority: 'Finanzamt (Tax Office)', frequency: 'monthly', description: 'Monthly wage tax withholding declaration via ELSTER. Due: 10th of following month.', penaltyNote: '1% per month on unpaid amount; up to 10% penalty' },
      { code: 'SV_BEITRAEGE', name: 'Social Security Contribution Transfer', authority: 'Krankenkasse / DRV', frequency: 'monthly', description: 'Transfer of all social insurance contributions by 3rd working day of following month' },
      { code: 'LOHNKONTO', name: 'Annual Wage Account (Lohnkonto)', authority: 'Finanzamt', frequency: 'annual', description: 'Year-end wage account statements — retain 6 years. ELSTER electronic reporting by Feb 28.' },
    ],
    specialNotes: [
      'Germany has 6 wage tax classes (Steuerklassen) affecting withholding rate. Class I = single, III = married (higher earner), etc.',
      'Solidarity surcharge (Soli): 5.5% on income tax amount, only applies above €18,130 individual income tax threshold (2024).',
      'Church tax (Kirchensteuer): 8-9% of income tax for registered church members — employer withholds if employee is registered.',
      'Beitragsbeurteilungsgrenzen (BBG): Social security contributions capped. Pension/UI: €90,600/year; Health/Care: €62,100/year (2024 West Germany).',
      'Mini-jobs (≤€538/month): flat rate 13% employer contribution, exempt from employee SS.',
      'Annual tax settlement (Einkommensteuererklärung) by July 31 of following year for employees with other income sources.',
    ],
    keyFacts: { taxRange: '0–45% + Soli', employeeSSRate: '~20.6%', employerSSRate: '~21.6%', noTax: false, mandatoryComponents: ['Gross Salary', 'All 4 SS pillars', 'Monthly Lohnsteuer filing'] },
  },

  FR: {
    code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€',
    cluster: 'EU_CONTINENTAL',
    taxSystem: 'Progressive income tax (IR) collected by employer (prélèvement à la source since 2019). Complex SS: CSG/CRDS + sectoral contributions.',
    hasTax: true,
    taxBrackets: [
      { from: 0,      to: 11497,  rate: 0.00, label: '0–€11,497 @ 0%' },
      { from: 11497,  to: 29315,  rate: 0.11, label: '€11,497–€29,315 @ 11%' },
      { from: 29315,  to: 83823,  rate: 0.30, label: '€29,315–€83,823 @ 30%' },
      { from: 83823,  to: 180294, rate: 0.41, label: '€83,823–€180,294 @ 41%' },
      { from: 180294, to: null,   rate: 0.45, label: '€180,294+ @ 45%' },
    ],
    standardDeduction: 12170,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'CSG (Contribution Sociale Généralisée)', code: 'CSG', rate: 0.068, basis: 'gross', isEmployer: false, description: '6.8% deductible CSG + 2.4% non-deductible CSG = 9.2% total CSG. Basis: 98.25% of gross.' },
      { name: 'CRDS', code: 'CRDS', rate: 0.005, basis: 'gross', isEmployer: false, description: '0.5% for repayment of social debt' },
      { name: 'Health / Maladie', code: 'MALADIE_EMP', rate: 0.00, basis: 'gross', isEmployer: false, description: 'Employee health: 0% (abolished). Covered by employer + CSG.' },
      { name: 'Pension (Retraite Régime Général)', code: 'RETRAITE_EMP', rate: 0.068, basis: 'gross', isEmployer: false, annualCap: 47100, description: '6.8% old-age insurance on earnings up to Plafond SS (PSS = €47,100/year 2024)' },
      { name: 'Unemployment (Chômage)', code: 'CHOMAGE_EMP', rate: 0.00, basis: 'gross', isEmployer: false, description: 'Employee unemployment: 0% (abolished 2019). Employer only.' },
      { name: 'AGIRC-ARRCO (Complementary Pension)', code: 'ARRCO_EMP', rate: 0.0315, basis: 'gross', isEmployer: false, annualCap: 188400, description: '3.15% T1 (up to PSS) + 8.64% T2 (1-8x PSS). Weighted average ~3.15-4% for most.' },
    ],
    employerContributions: [
      { name: 'Health Insurance (Assurance Maladie)', code: 'MALADIE_ER', rate: 0.13, basis: 'gross', isEmployer: true, description: '13% health (reduced to 7% for low wages under Fillon scheme)' },
      { name: 'Old-Age Insurance (Vieillesse)', code: 'VIEILLESSE_ER', rate: 0.0845, basis: 'gross', isEmployer: true, description: '8.45% pension, 1.9% above PSS' },
      { name: 'Unemployment Insurance', code: 'CHOMAGE_ER', rate: 0.0405, basis: 'gross', isEmployer: true, description: '4.05% unemployment on 4x PSS ceiling' },
      { name: 'AGIRC-ARRCO (Employer)', code: 'ARRCO_ER', rate: 0.0475, basis: 'gross', isEmployer: true, description: '4.75% T1 complementary pension + T2 above PSS' },
      { name: 'Family Allowance (CAF)', code: 'CAF_ER', rate: 0.0525, basis: 'gross', isEmployer: true, description: '5.25% family benefit (reduced to 3.45% for low wages)' },
      { name: 'Accidents du Travail', code: 'AT_ER', rate: 0.022, basis: 'gross', isEmployer: true, description: '~2.2% work accidents — varies by sector risk classification' },
    ],
    salaryComponents: [
      { code: 'BRUT', name: 'Salaire Brut', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'French payroll uses single gross salary; net computed after all deductions' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory gratuity. Indemnité de licenciement (severance) applies only on dismissal.' },
    complianceFilings: [
      { code: 'DSN', name: 'Déclaration Sociale Nominative (DSN)', authority: 'URSSAF / Net-Entreprises', frequency: 'monthly', description: 'Mandatory monthly digital employee declaration. Must be filed by 5th or 15th depending on company size.', penaltyNote: '7.5% of SS contributions (capped at 750 SMIC hours) for late filing' },
      { code: 'PAS', name: 'Prélèvement à la Source (Income Tax Withholding)', authority: 'Direction Générale des Finances Publiques (DGFiP)', frequency: 'monthly', description: 'Monthly income tax withholding; rates provided by DGFiP. Transfer by 15th.' },
      { code: 'HOLIDAY_PAY', name: '5th Week Paid Leave Accrual', authority: 'Caisse des Congés Payés (construction/BTP)', frequency: 'quarterly', description: 'Accrue 2.5 days paid leave per month worked. Minimum 5 weeks paid vacation mandatory.' },
    ],
    specialNotes: [
      'France has among the highest employer social security costs globally (~42-45% of gross for typical salary).',
      'PSS (Plafond de la Sécurité Sociale) 2024: €47,100/year = €3,925/month — key threshold for contribution caps.',
      'SMIC (minimum wage) 2024: €1,766.92 gross/month. Must be respected with Fillon reduction benefits.',
      'Fillon exemption: Significant employer SS reduction for wages ≤ 1.6x SMIC — can reduce contributions by up to 28%.',
      '13th month is common but not legally mandatory (negotiated in collective agreements).',
      'Prime de partage de la valeur (PPV): Profit-sharing bonus up to €3,000 tax and SS exempt.',
    ],
    keyFacts: { taxRange: '0–45%', employeeSSRate: '~22–25%', employerSSRate: '~42–45%', noTax: false, mandatoryComponents: ['Brut', 'CSG/CRDS', 'DSN monthly filing', '5-week vacation'] },
  },

  ES: {
    code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€',
    cluster: 'EU_CONTINENTAL',
    taxSystem: 'IRPF (Impuesto sobre la Renta de las Personas Físicas) — progressive, withheld monthly by employer via Modelo 111.',
    hasTax: true,
    taxBrackets: [
      { from: 0,      to: 12450,  rate: 0.19, label: '0–€12,450 @ 19%' },
      { from: 12450,  to: 20200,  rate: 0.24, label: '€12,450–€20,200 @ 24%' },
      { from: 20200,  to: 35200,  rate: 0.30, label: '€20,200–€35,200 @ 30%' },
      { from: 35200,  to: 60000,  rate: 0.37, label: '€35,200–€60,000 @ 37%' },
      { from: 60000,  to: 300000, rate: 0.45, label: '€60,000–€300,000 @ 45%' },
      { from: 300000, to: null,   rate: 0.47, label: '€300,000+ @ 47%' },
    ],
    standardDeduction: 2000,
    personalAllowance: 5550,
    employeeContributions: [
      { name: 'Social Security (Contingencias Comunes)', code: 'SS_COMUN_EMP', rate: 0.047, basis: 'gross', isEmployer: false, annualCap: 57240, description: '4.7% employee common contingencies (illness, maternity, disability, pension)' },
      { name: 'Unemployment (Desempleo)', code: 'SS_DESEMPLEO_EMP', rate: 0.0155, basis: 'gross', isEmployer: false, annualCap: 57240, description: '1.55% employee unemployment insurance' },
      { name: 'Vocational Training (FP)', code: 'SS_FP_EMP', rate: 0.001, basis: 'gross', isEmployer: false, annualCap: 57240, description: '0.1% employee vocational training levy' },
    ],
    employerContributions: [
      { name: 'Social Security (Employer Common)', code: 'SS_COMUN_ER', rate: 0.236, basis: 'gross', isEmployer: true, annualCap: 57240, description: '23.6% employer common contingencies — largest component in Spain' },
      { name: 'Unemployment (Employer)', code: 'SS_DESEMPLEO_ER', rate: 0.055, basis: 'gross', isEmployer: true, annualCap: 57240, description: '5.5% employer unemployment contribution (5.5% indefinite contracts, 6.7% temporary)' },
      { name: 'FOGASA', code: 'FOGASA_ER', rate: 0.002, basis: 'gross', isEmployer: true, annualCap: 57240, description: '0.2% Wages Guarantee Fund — covers wages if employer goes insolvent' },
      { name: 'Vocational Training (FP Employer)', code: 'SS_FP_ER', rate: 0.006, basis: 'gross', isEmployer: true, annualCap: 57240, description: '0.6% employer vocational training levy' },
    ],
    salaryComponents: [
      { code: 'SALARIO_BASE', name: 'Salario Base', typicalPercentOfGross: 0.70, taxExempt: false, mandatory: true, description: 'Base salary as per collective bargaining agreement' },
      { code: 'COMPLEMENTOS', name: 'Complementos Salariales', typicalPercentOfGross: 0.20, taxExempt: false, mandatory: false, description: 'Seniority, performance, territorial supplements' },
      { code: 'PAGAS_EXTRA', name: 'Pagas Extraordinarias (Bonus)', typicalPercentOfGross: 0.10, taxExempt: false, mandatory: true, description: '2 mandatory extra payments (Christmas + July) — often monthly prorated' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory gratuity. Indemnización por despido: 33 days/year for dismissal without cause (max 24 months).' },
    complianceFilings: [
      { code: 'MOD111', name: 'Modelo 111 (IRPF Withholding)', authority: 'Agencia Tributaria (AEAT)', frequency: 'monthly', description: 'Monthly IRPF (income tax) withholding declaration. Due: 20th of following month.', penaltyNote: '50% of unpaid amount minimum if AEAT detects before voluntary payment' },
      { code: 'MOD190', name: 'Modelo 190 (Annual IRPF Summary)', authority: 'Agencia Tributaria', frequency: 'annual', description: 'Annual summary of all employee withholdings — file by January 31' },
      { code: 'SS_TC2', name: 'Social Security TC1/TC2 (RLC/RNT)', authority: 'Tesorería General de la Seguridad Social (TGSS)', frequency: 'monthly', description: 'Monthly SS contribution and employee registration via RED system. Due: last day of following month.', penaltyNote: '20% surcharge + interest for late payment' },
    ],
    specialNotes: [
      'Spain has 14 salary payments/year as standard — 12 monthly + 2 extraordinary payments (Christmas and July bonus).',
      'Minimum interprofessional wage (SMI) 2024: €1,134/month × 14 payments = €15,876/year.',
      'SS base ceiling (Base máxima) 2024: €4,720.50/month = €56,646/year.',
      'ERTE (temporary layoffs): Special furlough scheme — government covers SS during approved ERTE periods.',
      'Redundancy (dismissal): 33 days per year worked, max 24 months for objective dismissals; 45 days for disciplinary (disputed).',
    ],
    keyFacts: { taxRange: '19–47%', employeeSSRate: '6.35%', employerSSRate: '~29.9%', noTax: false, mandatoryComponents: ['Salario Base', 'SS contributions', '14 payments/year (incl. bonus)', 'Monthly Modelo 111'] },
  },

  // ─── CLUSTER 4: UK & COMMONWEALTH ────────────────────────────────────────
  GB: {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£',
    cluster: 'UK_COMMONWEALTH',
    taxSystem: 'PAYE (Pay As You Earn) — income tax + National Insurance withheld monthly by employer. RTI real-time reporting.',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 12570,  rate: 0.00, label: '0–£12,570 Personal Allowance @ 0%' },
      { from: 12570,   to: 50270,  rate: 0.20, label: '£12,570–£50,270 Basic Rate @ 20%' },
      { from: 50270,   to: 125140, rate: 0.40, label: '£50,270–£125,140 Higher Rate @ 40%' },
      { from: 125140,  to: null,   rate: 0.45, label: '£125,140+ Additional Rate @ 45%' },
    ],
    standardDeduction: 0,
    personalAllowance: 12570,
    employeeContributions: [
      { name: 'National Insurance Class 1 (Employee)', code: 'NI_EMP', rate: 0.08, basis: 'gross', isEmployer: false, annualCap: 50270, description: '8% on earnings £12,570–£50,270; 2% above £50,270' },
      { name: 'National Insurance Class 1 (Employee — above UEL)', code: 'NI_EMP_HI', rate: 0.02, basis: 'gross', isEmployer: false, description: '2% on earnings above £50,270 (Upper Earnings Limit)' },
      { name: 'Workplace Pension (Auto-enrollment)', code: 'PENSION_EMP', rate: 0.05, basis: 'gross', isEmployer: false, description: 'Minimum 5% employee contribution on qualifying earnings (£6,240–£50,270)' },
    ],
    employerContributions: [
      { name: 'National Insurance Class 1 (Employer)', code: 'NI_ER', rate: 0.138, basis: 'gross', isEmployer: true, annualCap: 9100, description: '13.8% on earnings above £9,100/year Secondary Threshold' },
      { name: 'Workplace Pension (Employer)', code: 'PENSION_ER', rate: 0.03, basis: 'gross', isEmployer: true, description: 'Minimum 3% employer pension contribution (qualifying earnings)' },
      { name: 'Apprenticeship Levy', code: 'APPRENT_LEVY', rate: 0.005, basis: 'gross', isEmployer: true, description: '0.5% Apprenticeship Levy (employers with wage bill > £3M/year only; £15K annual allowance)' },
    ],
    salaryComponents: [
      { code: 'BASIC', name: 'Basic Salary', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'Gross salary — UK typically uses single gross figure' },
      { code: 'TAXFREE_BENEFITS', name: 'Tax-Free Benefits', typicalPercentOfGross: 0, taxExempt: true, mandatory: false, description: 'Company car (benefit-in-kind), private medical, childcare vouchers (pre-Oct 2018), EV charging' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No gratuity in UK. Statutory Redundancy Pay: 0.5–1.5 weeks per year based on age, max £19,290.' },
    complianceFilings: [
      { code: 'RTI_FPS', name: 'Full Payment Submission (FPS) — RTI', authority: 'HMRC', frequency: 'monthly', description: 'Real-Time Information: submit FPS on or before each payday via payroll software.', penaltyNote: '£100–£400/month penalty (by number of employees) for late/missing FPS' },
      { code: 'P60', name: 'P60 (Year-End Certificate)', authority: 'HMRC', frequency: 'annual', description: 'Issue P60 to all employees by May 31 after tax year end (April 5). Shows total pay and tax deducted.' },
      { code: 'P11D', name: 'P11D (Benefits in Kind)', authority: 'HMRC', frequency: 'annual', description: 'Report benefits in kind (company cars, medical insurance, etc.) by July 6.' },
      { code: 'AUTO_ENROLL', name: 'Auto-Enrolment Compliance', authority: 'The Pensions Regulator', frequency: 'annual', description: 'Cyclical re-enrolment every 3 years. Must re-assess eligible workers.' },
    ],
    specialNotes: [
      'NI rates were cut in 2024: Employee NI reduced from 12% to 8% (Jan 2024), from 10% to 8% (Apr 2024). Employer NI: 13.8% (unchanged).',
      'Personal Allowance £12,570 tapers to £0 for income above £125,140 (£1 reduction per £2 earned above £100,000).',
      'Scottish Income Tax rates differ: Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), Top (48%) — from April 2024.',
      'National Living Wage (NLW) 2024/25: £11.44/hour (age 21+). National Minimum Wage: £8.60/hour (18-20).',
      'UK employers with wage bill > £3M/year must pay 0.5% Apprenticeship Levy (offset by £15K annual allowance).',
      'PAYE Settlement Agreements (PSAs): For minor/irregular benefits — employer pays tax/NI on behalf of employees.',
    ],
    keyFacts: { taxRange: '0–45%', employeeSSRate: '8%/2% NI + 5% pension', employerSSRate: '13.8% NI + 3% pension', noTax: false, mandatoryComponents: ['PAYE', 'National Insurance', 'Auto-enrolment Pension', 'RTI monthly FPS'] },
  },

  AU: {
    code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$',
    cluster: 'UK_COMMONWEALTH',
    taxSystem: 'PAYG Withholding (Pay As You Go) — progressive tax withheld by employer. STP (Single Touch Payroll) mandatory.',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 18200,  rate: 0.00,  label: '0–A$18,200 Tax-Free Threshold @ 0%' },
      { from: 18200,   to: 45000,  rate: 0.19,  label: 'A$18,200–A$45,000 @ 19%' },
      { from: 45000,   to: 120000, rate: 0.325, label: 'A$45,000–A$120,000 @ 32.5%' },
      { from: 120000,  to: 180000, rate: 0.37,  label: 'A$120,000–A$180,000 @ 37%' },
      { from: 180000,  to: null,   rate: 0.45,  label: 'A$180,000+ @ 45%' },
    ],
    standardDeduction: 0,
    personalAllowance: 18200,
    employeeContributions: [
      { name: 'Medicare Levy', code: 'MEDICARE', rate: 0.02, basis: 'gross', isEmployer: false, description: '2% Medicare Levy on taxable income (low-income threshold: A$26,000 for 2024-25)' },
    ],
    employerContributions: [
      { name: 'Superannuation Guarantee (SG)', code: 'SUPER', rate: 0.11, basis: 'gross', isEmployer: true, description: '11% employer Super (rising to 11.5% Jul 2025, 12% Jul 2026). Mandatory for all employees earning >A$450/month.' },
      { name: 'Payroll Tax (state-based)', code: 'PAYROLL_TAX', rate: 0.048, basis: 'gross', isEmployer: true, description: '~4.85% state payroll tax (NSW/VIC/QLD) above threshold (varies by state: A$1.2M–A$2M). Not all employers liable.' },
    ],
    salaryComponents: [
      { code: 'GROSS', name: 'Gross Salary', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'Gross salary excluding Super (Super is payable on top of, not within, salary in Australia)' },
      { code: 'SUPER_INCL', name: 'Salary Sacrifice (Super)', typicalPercentOfGross: 0, taxExempt: true, mandatory: false, description: 'Voluntary pre-tax Super contributions via salary sacrifice — taxed at 15% in Super fund' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory gratuity. Redundancy entitlements: 4–12 weeks pay based on years of service (Fair Work Act).' },
    complianceFilings: [
      { code: 'STP', name: 'Single Touch Payroll (STP Phase 2)', authority: 'Australian Taxation Office (ATO)', frequency: 'monthly', description: 'Report tax, super, and payroll info to ATO on each pay run via STP-enabled software.', penaltyNote: '1 penalty unit (A$313) per week for non-lodgement' },
      { code: 'SUPER_QUARTERLY', name: 'Superannuation Guarantee Payment', authority: 'ATO / Super Funds', frequency: 'quarterly', description: 'Must pay Super by 28th day after each quarter end (Q1: Oct 28, Q2: Jan 28, Q3: Apr 28, Q4: Jul 28).', penaltyNote: 'SG charge applies if late: interest (10% p.a.) + admin fee + charged on-top of ATO returns' },
      { code: 'PAYG_SUMMARY', name: 'PAYG Payment Summary / Income Statement', authority: 'ATO via STP', frequency: 'annual', description: 'Under STP Phase 2, income statements auto-pre-filled in MyTax. Employer marks as "Tax Ready" by July 14.' },
    ],
    specialNotes: [
      'Superannuation is paid ON TOP of (not within) salary in Australia. Gross salary + 11% Super = total employer cost.',
      'STP Phase 2: From July 2022, disaggregated reporting of salary income types, disaggregated SS, and country-of-residency info.',
      'Low Income Tax Offset (LITO): Up to A$700 tax offset for incomes below A$66,667 (reduces PAYG withholding tables).',
      'Payroll Tax: State-based, not federal. NSW: 4.85% above A$1.2M; VIC: 4.85% above A$900K; QLD: 4.75% above A$1.3M.',
      'Annual leave loading: 17.5% loading on 4 weeks annual leave pay is common (Award-specific).',
      'Stapled Super: From November 2021, new employees must be paid to their "stapled" existing Super fund if they have one.',
    ],
    keyFacts: { taxRange: '0–45% + 2% Medicare', employeeSSRate: '2% Medicare levy', employerSSRate: '11% Super + state payroll tax', noTax: false, mandatoryComponents: ['PAYG withholding', 'Medicare Levy', 'Superannuation (11%)', 'STP reporting'] },
  },

  CA: {
    code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'C$',
    cluster: 'UK_COMMONWEALTH',
    taxSystem: 'Federal + Provincial income tax withheld by employer. Combined PAYROLL deductions via CRA payroll deduction tables.',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 55867,  rate: 0.15,  label: 'C$0–C$55,867 @ 15% Federal' },
      { from: 55867,   to: 111733, rate: 0.205, label: 'C$55,867–C$111,733 @ 20.5% Federal' },
      { from: 111733,  to: 154906, rate: 0.26,  label: 'C$111,733–C$154,906 @ 26% Federal' },
      { from: 154906,  to: 246752, rate: 0.29,  label: 'C$154,906–C$246,752 @ 29% Federal' },
      { from: 246752,  to: null,   rate: 0.33,  label: 'C$246,752+ @ 33% Federal' },
    ],
    standardDeduction: 0,
    personalAllowance: 15705,
    employeeContributions: [
      { name: 'CPP (Canada Pension Plan)', code: 'CPP_EMP', rate: 0.0595, basis: 'gross', isEmployer: false, annualCap: 68500, description: '5.95% on earnings C$3,500–C$68,500 (2024 YMPE). Additional CPP2: 4% on C$68,500–C$73,200.' },
      { name: 'EI (Employment Insurance)', code: 'EI_EMP', rate: 0.0166, basis: 'gross', isEmployer: false, annualCap: 63200, description: '1.66% on insurable earnings up to C$63,200 (2024 annual maximum insurable earnings)' },
    ],
    employerContributions: [
      { name: 'CPP (Employer)', code: 'CPP_ER', rate: 0.0595, basis: 'gross', isEmployer: true, annualCap: 68500, description: 'Employer matches employee CPP 1:1 — 5.95% same rate and ceiling' },
      { name: 'EI (Employer)', code: 'EI_ER', rate: 0.0232, basis: 'gross', isEmployer: true, annualCap: 63200, description: 'Employer EI: 1.4x employee rate = 2.32% (C$63,200 ceiling). Can earn premium reduction.' },
    ],
    salaryComponents: [
      { code: 'GROSS', name: 'Regular Wages', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'Gross wages — single component' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory gratuity. Severance under Employment Standards Act varies by province.' },
    complianceFilings: [
      { code: 'PD7A', name: 'Payroll Remittance (PD7A/RP)', authority: 'Canada Revenue Agency (CRA)', frequency: 'monthly', description: 'Remit income tax, CPP, EI by 15th of following month (regular remitters). Accelerated: twice/month.', penaltyNote: '3-10% penalty based on timing of failure to remit' },
      { code: 'T4', name: 'T4 Slip (Annual)', authority: 'Canada Revenue Agency', frequency: 'annual', description: 'Issue T4 slips to employees and file T4 Summary with CRA by Feb 28/29.' },
      { code: 'ROE', name: 'Record of Employment (ROE)', authority: 'Service Canada', frequency: 'monthly', description: 'Issue ROE within 5 calendar days of employee\'s last day of pay (for EI claims).' },
    ],
    specialNotes: [
      'Provincial income tax: Add ON TOP of federal tax. Highest combined: Quebec (~26.5% federal+provincial for top bracket). Ontario: ~13.16% provincial rate.',
      'Quebec employees: Quebec Pension Plan (QPP) 6.4% instead of CPP. QPIP instead of EI.',
      'Personal Basic Amount (BPA) 2024: C$15,705 federal; varies by province.',
      'RRSP (Registered Retirement Savings Plan): Employee pre-tax contributions deductible. Not employer-withheld but affects net taxable income.',
      'HST/GST does not apply to payroll — only goods/services taxed.',
    ],
    keyFacts: { taxRange: '15–33% Federal + Provincial', employeeSSRate: 'CPP 5.95% + EI 1.66%', employerSSRate: 'CPP 5.95% + EI 2.32%', noTax: false, mandatoryComponents: ['Federal + Provincial Tax', 'CPP', 'EI', 'T4 annual'] },
  },

  // ─── CLUSTER 5: AMERICAS ─────────────────────────────────────────────────
  US: {
    code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$',
    cluster: 'AMERICAS',
    taxSystem: 'Federal income tax withholding (Form W-4) + State income tax (varies). FICA: Social Security + Medicare.',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 11600,  rate: 0.10,  label: '$0–$11,600 @ 10%' },
      { from: 11600,   to: 47150,  rate: 0.12,  label: '$11,600–$47,150 @ 12%' },
      { from: 47150,   to: 100525, rate: 0.22,  label: '$47,150–$100,525 @ 22%' },
      { from: 100525,  to: 191950, rate: 0.24,  label: '$100,525–$191,950 @ 24%' },
      { from: 191950,  to: 243725, rate: 0.32,  label: '$191,950–$243,725 @ 32%' },
      { from: 243725,  to: 609350, rate: 0.35,  label: '$243,725–$609,350 @ 35%' },
      { from: 609350,  to: null,   rate: 0.37,  label: '$609,350+ @ 37%' },
    ],
    standardDeduction: 14600,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'Social Security Tax (OASDI)', code: 'SS', rate: 0.062, basis: 'gross', isEmployer: false, annualCap: 168600, description: '6.2% of wages up to $168,600 wage base (2024)' },
      { name: 'Medicare Tax (HI)', code: 'MEDICARE', rate: 0.0145, basis: 'gross', isEmployer: false, description: '1.45% Medicare; additional 0.9% for wages above $200,000 (single) — employer withholds on payday' },
      { name: 'State Income Tax (avg)', code: 'STATE_TAX', rate: 0.05, basis: 'gross', isEmployer: false, description: 'Average state income tax ~5%. No state tax: TX, FL, NV, WA, TN, WY, SD, AK, NH (dividends only)' },
    ],
    employerContributions: [
      { name: 'Social Security (Employer OASDI)', code: 'SS_ER', rate: 0.062, basis: 'gross', isEmployer: true, annualCap: 168600, description: 'Employer matches employee Social Security 6.2%, same $168,600 cap' },
      { name: 'Medicare (Employer HI)', code: 'MEDICARE_ER', rate: 0.0145, basis: 'gross', isEmployer: true, description: 'Employer matches Medicare 1.45%. Note: additional 0.9% is employee-only.' },
      { name: 'FUTA (Federal Unemployment)', code: 'FUTA', rate: 0.006, basis: 'gross', isEmployer: true, annualCap: 7000, description: 'Net FUTA 0.6% after SUTA credit (effective rate on first $7,000 of wages)' },
      { name: 'SUTA (State Unemployment)', code: 'SUTA', rate: 0.027, basis: 'gross', isEmployer: true, annualCap: 15000, description: '~2.7% average SUTA new employer rate. Highly variable by state and history ($7K–$56K taxable wage base).' },
    ],
    salaryComponents: [
      { code: 'SALARY', name: 'Gross Wages', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'Gross compensation including base, commissions, bonuses' },
      { code: '401K', name: '401(k) Deferral', typicalPercentOfGross: 0.06, taxExempt: true, mandatory: false, description: 'Pre-tax 401(k) contribution: 2024 limit $23,000 ($30,500 age 50+). Reduces federal taxable income.' },
      { code: 'HEALTH_INS', name: 'Health Insurance Premium (Employee)', typicalPercentOfGross: 0.05, taxExempt: true, mandatory: false, description: 'Pre-tax Section 125 cafeteria plan — reduces FICA and income tax base' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory gratuity/EOSB in USA. 401(k) vesting schedule governs employer retirement contributions.' },
    complianceFilings: [
      { code: 'FORM941', name: 'Form 941 (Quarterly Federal Tax Return)', authority: 'Internal Revenue Service (IRS)', frequency: 'quarterly', description: 'Quarterly report of federal income tax, SS, and Medicare withheld. Due: Apr 30, Jul 31, Oct 31, Jan 31.', penaltyNote: '2–15% FTD (Failure to Deposit) penalty + interest for late payroll tax deposits' },
      { code: 'W2_FORM', name: 'W-2 Form (Annual)', authority: 'IRS / Social Security Administration', frequency: 'annual', description: 'Issue W-2 to employees by Jan 31. File Copy A with SSA by Jan 31 (electronic >10 forms).' },
      { code: 'FUTA_940', name: 'Form 940 (FUTA Annual Return)', authority: 'IRS', frequency: 'annual', description: 'Annual federal unemployment tax return — due January 31.' },
      { code: 'STATE_PAYROLL', name: 'State Payroll Tax Returns', authority: 'State Tax Department (varies)', frequency: 'quarterly', description: 'Quarterly state payroll tax returns — schedule varies by state. Usually with state PIT withholding.' },
    ],
    specialNotes: [
      'No mandatory federal paid sick leave — Family and Medical Leave Act (FMLA): 12 weeks unpaid, job-protected.',
      'Standard deduction 2024 (single): $14,600. Married filing jointly: $29,200.',
      'Additional Medicare: 0.9% on wages above $200,000 (single) — employer withholds but employer does not match this extra 0.9%.',
      'FICA: Social Security wage base 2024: $168,600. Indexed annually.',
      'State taxes vary widely: No state income tax in TX, FL, NV, WA, WY, SD, AK. NY top rate: 10.9%. CA top rate: 13.3%.',
      '401(k) employer match: Not legally required but typically 3-6% of salary. Pre-tax contributions reduce taxable wages.',
    ],
    keyFacts: { taxRange: '10–37% Federal + State', employeeSSRate: 'FICA 7.65%', employerSSRate: 'FICA 7.65% + FUTA 0.6%', noTax: false, mandatoryComponents: ['Federal Tax', 'FICA SS + Medicare', 'State tax (most states)', 'Quarterly Form 941'] },
  },

  BR: {
    code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$',
    cluster: 'AMERICAS',
    taxSystem: 'IRRF (Imposto de Renda Retido na Fonte) — monthly withholding. Complex: 13th salary, vacation pay, INSS, FGTS. eSocial mandatory.',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 26964,  rate: 0.00,  label: 'R$0–R$26,964 @ 0% (isenção)' },
      { from: 26964,   to: 33919,  rate: 0.075, label: 'R$26,964–R$33,919 @ 7.5%' },
      { from: 33919,   to: 45012,  rate: 0.15,  label: 'R$33,919–R$45,012 @ 15%' },
      { from: 45012,   to: 55976,  rate: 0.225, label: 'R$45,012–R$55,976 @ 22.5%' },
      { from: 55976,   to: null,   rate: 0.275, label: 'R$55,976+ @ 27.5%' },
    ],
    standardDeduction: 3072,
    personalAllowance: 26964,
    employeeContributions: [
      { name: 'INSS (Previdência Social)', code: 'INSS', rate: 0.0975, basis: 'gross', isEmployer: false, annualCap: 90996, description: 'Graduated: 7.5% up to R$1,412; 9% R$1,412-R$2,666.68; 12% R$2,666.68-R$4,000.03; 14% R$4,000.03-R$7,786.02. Max: ~R$908.82/month' },
    ],
    employerContributions: [
      { name: 'FGTS (Fundo de Garantia do FGTS)', code: 'FGTS', rate: 0.08, basis: 'gross', isEmployer: true, description: '8% of gross salary deposited in employee\'s FGTS account (severance fund). Employee accesses on dismissal without cause.' },
      { name: 'INSS Patronal (Employer INSS)', code: 'INSS_ER', rate: 0.20, basis: 'gross', isEmployer: true, description: '20% employer INSS (may be replaced by CPP for certain sectors — Desoneração da Folha)' },
      { name: 'RAT + FAP (Work Accident)', code: 'RAT', rate: 0.02, basis: 'gross', isEmployer: true, description: 'RAT: 1-3% based on risk × FAP multiplier. ~2% average. Covers work accidents.' },
      { name: 'Terceiros (SESI/SENAI/SEBRAE)', code: 'TERCEIROS', rate: 0.058, basis: 'gross', isEmployer: true, description: '~5.8% system S contributions (varies by sector: SESI, SENAI, SESC, SENAC, SEBRAE, etc.)' },
    ],
    salaryComponents: [
      { code: 'SALARIO', name: 'Salário Base', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'Monthly base salary' },
      { code: '13SAL', name: '13º Salário (Thirteenth Salary)', typicalPercentOfGross: 0.0833, taxExempt: false, mandatory: true, description: 'Mandatory — 1/12 of annual salary per month worked. Paid in two installments: Nov 30 (50%) and Dec 20 (balance).' },
      { code: 'FERIAS', name: 'Férias + 1/3 (Vacation Pay)', typicalPercentOfGross: 0.111, taxExempt: false, mandatory: true, description: '30 days paid vacation + 1/3 additional constitutional bonus per year. Accrual: ~11.1% monthly.' },
    ],
    eosb: { applicable: true, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'FGTS is the effective EOSB: 8%/month deposited. On dismissal without cause: employee receives FGTS balance + 40% penalty on total balance.' },
    complianceFilings: [
      { code: 'ESOCIAL', name: 'eSocial (Digital Bookkeeping)', authority: 'Receita Federal do Brasil (RFB)', frequency: 'monthly', description: 'Mandatory digital payroll reporting system. All employment events reported in real-time (hiring, payroll, termination).', penaltyNote: 'R$200–R$5,000 per event for non-compliance' },
      { code: 'DARF', name: 'DARF — IRRF Payment', authority: 'Receita Federal', frequency: 'monthly', description: 'Monthly income tax withholding payment by 20th of following month via DARF document' },
      { code: 'GPS', name: 'Guia da Previdência Social (INSS)', authority: 'INSS via eSocial', frequency: 'monthly', description: 'Monthly INSS contributions by 20th (employees) via DCTFWeb/eSocial' },
      { code: '13SAL_FISC', name: '13º Salary Filings', authority: 'Receita Federal / INSS', frequency: 'annual', description: 'First installment: November 30. Second installment + IRRF: December 20. INSS and FGTS also due.' },
    ],
    specialNotes: [
      'Brazil has among the most complex payroll globally: eSocial + 13th salary + vacation with 1/3 bonus + FGTS + multi-tier INSS.',
      '13th salary: mandatory for all CLT (formal) employees. 1 month extra salary = 8.33% monthly accrual.',
      'Vacation: 30 days annual + 1/3 constitutional bonus. Unusual vacation conversion: employee can sell 10 of 30 days ("venda de férias").',
      'FGTS 40% penalty: On dismissal without just cause, employer pays 40% of total FGTS accumulated balance as penalty.',
      'Desoneração da Folha: Some sectors pay CPP (Contribuição Previdenciária sobre Receita Bruta = ~1-2% revenue) instead of 20% INSS — reduces payroll cost.',
      'RAIS (Annual Social Information Report): Filed by March 31 with ministry data on all employees.',
    ],
    keyFacts: { taxRange: '0–27.5%', employeeSSRate: 'INSS 7.5–14%', employerSSRate: 'FGTS 8% + INSS 20% + ~8% Sistema S', noTax: false, mandatoryComponents: ['13th Salary', 'Vacation + 1/3', 'FGTS', 'INSS', 'eSocial reporting'] },
  },

  // ─── CLUSTER 6: EAST ASIA ─────────────────────────────────────────────────
  JP: {
    code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥',
    cluster: 'EAST_ASIA',
    taxSystem: 'Shotoku-zei (所得税) withheld monthly + Jūmin-zei (住民税 Resident Tax) paid next year. Year-end adjustment (年末調整).',
    hasTax: true,
    taxBrackets: [
      { from: 0,         to: 1950000,  rate: 0.05,  label: '¥0–¥1,950,000 @ 5%' },
      { from: 1950000,   to: 3300000,  rate: 0.10,  label: '¥1,950,000–¥3,300,000 @ 10%' },
      { from: 3300000,   to: 6950000,  rate: 0.20,  label: '¥3,300,000–¥6,950,000 @ 20%' },
      { from: 6950000,   to: 9000000,  rate: 0.23,  label: '¥6,950,000–¥9,000,000 @ 23%' },
      { from: 9000000,   to: 18000000, rate: 0.33,  label: '¥9,000,000–¥18,000,000 @ 33%' },
      { from: 18000000,  to: 40000000, rate: 0.40,  label: '¥18,000,000–¥40,000,000 @ 40%' },
      { from: 40000000,  to: null,     rate: 0.45,  label: '¥40,000,000+ @ 45%' },
    ],
    standardDeduction: 480000,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'Health Insurance (健康保険)', code: 'KENKO', rate: 0.0500, basis: 'gross', isEmployer: false, annualCap: 13440000, description: '5% (協会けんぽ standard rate 10% split equally). Annual wage ceiling ¥1,390,000/month.' },
      { name: 'Kosei Nenkin Pension (厚生年金)', code: 'NENKIN', rate: 0.0915, basis: 'gross', isEmployer: false, annualCap: 6204000, description: '9.15% employee pension. Monthly ceiling ¥650,000/month = ¥59,475 max monthly contribution.' },
      { name: 'Employment Insurance (雇用保険)', code: 'KOYO', rate: 0.006, basis: 'gross', isEmployer: false, description: '0.6% employee employment insurance (general industry)' },
      { name: 'Resident Tax (住民税)', code: 'JUMIN', rate: 0.10, basis: 'gross', isEmployer: false, description: '10% Resident Tax (Prefectural 4% + Municipal 6%) withheld from June of following year. Based on prior year income.' },
      { name: 'Reconstruction Surtax (復興特別所得税)', code: 'FUKKO', rate: 0.021, basis: 'gross', isEmployer: false, description: '2.1% surtax on income tax amount (until 2037 for reconstruction fund)' },
    ],
    employerContributions: [
      { name: 'Health Insurance (Employer)', code: 'KENKO_ER', rate: 0.0500, basis: 'gross', isEmployer: true, annualCap: 13440000, description: 'Employer matches health insurance 5%' },
      { name: 'Kosei Nenkin Pension (Employer)', code: 'NENKIN_ER', rate: 0.0915, basis: 'gross', isEmployer: true, annualCap: 6204000, description: 'Employer matches pension 9.15%' },
      { name: 'Employment Insurance (Employer)', code: 'KOYO_ER', rate: 0.0095, basis: 'gross', isEmployer: true, description: 'Employer employment insurance 0.95% (general industry)' },
      { name: "Workers' Accident Insurance (労災)", code: 'ROSAI', rate: 0.003, basis: 'gross', isEmployer: true, description: '~0.3% workers accident insurance — varies by industry risk. Employer-only.' },
    ],
    salaryComponents: [
      { code: 'KIHON', name: '基本給 (Kihon-kyū / Base Salary)', typicalPercentOfGross: 0.70, taxExempt: false, mandatory: true, description: 'Base monthly salary' },
      { code: 'TSUKIN', name: '通勤手当 (Commuting Allowance)', typicalPercentOfGross: 0.05, taxExempt: true, mandatory: false, description: 'Tax-exempt up to ¥150,000/month for commuting costs' },
      { code: 'JYUTAKU', name: '住宅手当 (Housing Allowance)', typicalPercentOfGross: 0.10, taxExempt: false, mandatory: false, description: 'Taxable housing allowance common in Japan' },
      { code: 'BONUS', name: '賞与 (Bonus / Shōyo)', typicalPercentOfGross: 0.15, taxExempt: false, mandatory: false, description: 'Biannual bonus (summer July, winter December). Subject to SS and income tax.' },
    ],
    eosb: { applicable: false, basis: 'basic', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory statutory EOSB. Taishoku-kin (退職金): voluntary company retirement allowance — common but regulated by company policy.' },
    complianceFilings: [
      { code: 'GENSEN_CHOSHU', name: '源泉徴収 Monthly Tax Withholding', authority: 'National Tax Agency (NTA)', frequency: 'monthly', description: 'Monthly or semi-annual (special cases ≤9 employees) remittance of withheld income tax. Monthly: by 10th of following month.', penaltyNote: '不納付加算税 (non-payment surcharge) 10% + interest' },
      { code: 'NENMATSU_CHOSEI', name: '年末調整 Year-End Adjustment', authority: 'NTA', frequency: 'annual', description: 'Mandatory year-end reconciliation of actual income tax vs withheld amount. Complete by January 31. Issue 源泉徴収票 (withholding slip).' },
      { code: 'SHAKAI_HOKEN', name: '社会保険 Monthly Contributions', authority: 'Japan Pension Service (JPS)', frequency: 'monthly', description: 'Health and pension contributions to Nenkin Kikin or 健保 by end of following month.' },
      { code: 'KOYO_HOKEN', name: '雇用保険 Annual Declaration', authority: 'Hello Work (Public Employment Security Office)', frequency: 'annual', description: 'Annual declaration of employment insurance premiums by June 1.' },
    ],
    specialNotes: [
      'Resident tax (住民税): Withheld from salary in arrears — June of year N+1 for year N income. New employees have no resident tax deduction for first year.',
      'Year-end adjustment (年末調整): Employers must calculate final annual tax, refund over-withheld or collect under-withheld amounts from December payroll.',
      'Social insurance grade (標準報酬月額): Actual contributions based on fixed monthly remuneration grades — reassessed in September each year (月変 mid-year reassessment if change >2 grades).',
      'Commuting allowance (通勤手当): Tax-exempt up to ¥150,000/month. Included in social insurance base but not taxable income up to limit.',
      '賞与 (Bonus): Social insurance contributions at full rate applied to bonus. Income tax: apply 1/6 of bonus to monthly tax table for rate determination.',
      'Overtime pay (残業代): Mandatory: +25% for OT >8h/day or 40h/week, +35% nights, +50% for >60h/month.',
    ],
    keyFacts: { taxRange: '5–45% + 10% Resident Tax', employeeSSRate: '~24.15%', employerSSRate: '~15.5%', noTax: false, mandatoryComponents: ['Monthly income tax withholding', 'Health + Pension + UI', 'Year-end adjustment', 'Resident tax (deferred)'] },
  },

  SG: {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$',
    cluster: 'EAST_ASIA',
    taxSystem: 'No withholding tax at source for residents. Income tax self-assessed annually (IR8A from employer). CPF mandatory for Citizens and PRs.',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 20000,   rate: 0.00,  label: 'S$0–S$20,000 @ 0%' },
      { from: 20000,   to: 30000,   rate: 0.02,  label: 'S$20,000–S$30,000 @ 2%' },
      { from: 30000,   to: 40000,   rate: 0.035, label: 'S$30,000–S$40,000 @ 3.5%' },
      { from: 40000,   to: 80000,   rate: 0.07,  label: 'S$40,000–S$80,000 @ 7%' },
      { from: 80000,   to: 120000,  rate: 0.115, label: 'S$80,000–S$120,000 @ 11.5%' },
      { from: 120000,  to: 160000,  rate: 0.15,  label: 'S$120,000–S$160,000 @ 15%' },
      { from: 160000,  to: 200000,  rate: 0.18,  label: 'S$160,000–S$200,000 @ 18%' },
      { from: 200000,  to: 240000,  rate: 0.19,  label: 'S$200,000–S$240,000 @ 19%' },
      { from: 240000,  to: 280000,  rate: 0.195, label: 'S$240,000–S$280,000 @ 19.5%' },
      { from: 280000,  to: 320000,  rate: 0.20,  label: 'S$280,000–S$320,000 @ 20%' },
      { from: 320000,  to: 500000,  rate: 0.22,  label: 'S$320,000–S$500,000 @ 22%' },
      { from: 500000,  to: 1000000, rate: 0.23,  label: 'S$500,000–S$1,000,000 @ 23%' },
      { from: 1000000, to: null,    rate: 0.24,  label: 'S$1,000,000+ @ 24%' },
    ],
    standardDeduction: 1000,
    personalAllowance: 0,
    employeeContributions: [
      { name: 'CPF Ordinary Wage (Employee, age ≤55)', code: 'CPF_EMP', rate: 0.20, basis: 'gross', isEmployer: false, cap: 1480, description: '20% employee CPF on Ordinary Wages capped at S$7,400/month (2025 OW ceiling). Allocated: OA 0.23, SA 0.06, MA 0.10 (age ≤35).' },
    ],
    employerContributions: [
      { name: 'CPF Ordinary Wage (Employer, age ≤55)', code: 'CPF_ER', rate: 0.17, basis: 'gross', isEmployer: true, cap: 1258, description: 'Employer 17% CPF on OW (S$7,400 cap from Jan 2025). Total CPF rate 37% (37% of S$7,400 = S$2,738 max monthly).' },
      { name: 'Skills Development Levy (SDL)', code: 'SDL', rate: 0.0025, basis: 'gross', isEmployer: true, cap: 11.25, description: 'SDL: 0.25% of gross, minimum S$2/employee/month, maximum S$11.25/month. Funds SkillsFuture.' },
    ],
    salaryComponents: [
      { code: 'BASIC', name: 'Ordinary Wages (OW)', typicalPercentOfGross: 0.85, taxExempt: false, mandatory: true, description: 'Wages earned in the month. Subject to CPF on first S$7,400/month.' },
      { code: 'AW', name: 'Additional Wages (AW)', typicalPercentOfGross: 0.15, taxExempt: false, mandatory: false, description: 'Annual bonus, AWS (13th month). Subject to CPF on AW ceiling = S$102,000 - OW subject to CPF.' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory gratuity. Retrenchment benefits: negotiated or minimum 2 weeks per year of service (common market practice).' },
    complianceFilings: [
      { code: 'CPF_CONTRIBUTION', name: 'CPF Monthly Contribution', authority: 'CPF Board', frequency: 'monthly', description: 'Pay CPF contributions by 14th of following month (electronic). Late submissions attract interest 1.5% p.a.', penaltyNote: 'Interest 1.5% p.a. on overdue CPF; court prosecution for willful non-payment' },
      { code: 'IR8A', name: 'IR8A (Employee Income Return)', authority: 'Inland Revenue Authority of Singapore (IRAS)', frequency: 'annual', description: 'Annual return of employee employment income — submit by March 1 via AIS (Auto-Inclusion Scheme) for >5 employees.' },
      { code: 'SDL_CONTRIB', name: 'SDL Monthly Levy', authority: 'SkillsFuture Singapore (SSG)', frequency: 'monthly', description: 'SDL collected with CPF — pay by 14th of following month.' },
    ],
    specialNotes: [
      'CPF applies only to Singapore Citizens (SC) and Permanent Residents (PR). Work Pass holders (EP, S Pass): CPF NOT required.',
      'CPF OW ceiling: S$7,400/month from Jan 2025 (increasing annually toward S$8,000 by Jan 2026).',
      'CPF additional wage (AW) annual ceiling: S$102,000 - OW subject to CPF for that year.',
      'CPF age-graduated rates: Age 55-60: employee 13% + employer 13%; Age 60-65: 7.5% + 9%; Age 65-70: 5% + 7.5%; Age 70+: 5% + 5%.',
      'Income tax: Self-assessed — employees file Form B1 by April 15. No withholding by employer (except for non-residents: 15% withholding for non-resident employees).',
      'AIS (Auto-Inclusion Scheme): Employers with >5 employees must submit IR8A electronically — IRAS auto-fills employees\' tax returns.',
    ],
    keyFacts: { taxRange: '0–24% (self-assessed)', employeeSSRate: '20% CPF (SC/PR only)', employerSSRate: '17% CPF + 0.25% SDL', noTax: false, mandatoryComponents: ['CPF (SC/PR)', 'SDL', 'IR8A annual return'] },
  },

  KR: {
    code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', currencySymbol: '₩',
    cluster: 'EAST_ASIA',
    taxSystem: 'Monthly income tax withholding (근로소득세) with year-end settlement in February. 4 mandatory insurances.',
    hasTax: true,
    taxBrackets: [
      { from: 0,          to: 14000000,  rate: 0.06,  label: '₩0–₩14M @ 6%' },
      { from: 14000000,   to: 50000000,  rate: 0.15,  label: '₩14M–₩50M @ 15%' },
      { from: 50000000,   to: 88000000,  rate: 0.24,  label: '₩50M–₩88M @ 24%' },
      { from: 88000000,   to: 150000000, rate: 0.35,  label: '₩88M–₩150M @ 35%' },
      { from: 150000000,  to: 300000000, rate: 0.38,  label: '₩150M–₩300M @ 38%' },
      { from: 300000000,  to: 500000000, rate: 0.40,  label: '₩300M–₩500M @ 40%' },
      { from: 500000000,  to: null,      rate: 0.45,  label: '₩500M+ @ 45%' },
    ],
    standardDeduction: 1500000,
    personalAllowance: 1500000,
    employeeContributions: [
      { name: 'National Pension (국민연금)', code: 'NP_EMP', rate: 0.045, basis: 'gross', isEmployer: false, annualCap: 71280000, description: '4.5% on standard monthly wages up to ₹5,940,000/month (2024)' },
      { name: 'Health Insurance (건강보험)', code: 'HI_EMP', rate: 0.03545, basis: 'gross', isEmployer: false, annualCap: 120000000, description: '3.545% health insurance + 0.4591% long-term care (의료보험)' },
      { name: 'Employment Insurance (고용보험)', code: 'EI_EMP', rate: 0.009, basis: 'gross', isEmployer: false, description: '0.9% employee employment insurance (150/1000 of monthly wage)' },
      { name: 'Local Income Tax (지방소득세)', code: 'LOCAL_TAX', rate: 0.10, basis: 'gross', isEmployer: false, description: '10% of income tax amount (surtax on national income tax — withheld monthly)' },
    ],
    employerContributions: [
      { name: 'National Pension (Employer)', code: 'NP_ER', rate: 0.045, basis: 'gross', isEmployer: true, annualCap: 71280000, description: 'Employer matches National Pension 4.5%' },
      { name: 'Health Insurance (Employer)', code: 'HI_ER', rate: 0.03545, basis: 'gross', isEmployer: true, annualCap: 120000000, description: 'Employer matches health insurance 3.545%' },
      { name: 'Employment Insurance (Employer)', code: 'EI_ER', rate: 0.0115, basis: 'gross', isEmployer: true, description: '1.15% employer employment insurance (includes worker retention and job training)' },
      { name: "Workers' Compensation Insurance (산재보험)", code: 'SANJAI', rate: 0.009, basis: 'gross', isEmployer: true, description: '~0.9% average workers compensation (varies by industry). Employer-only.' },
    ],
    salaryComponents: [
      { code: 'BASIC', name: '기본급 (Base Salary)', typicalPercentOfGross: 0.60, taxExempt: false, mandatory: true, description: 'Base monthly salary' },
      { code: 'BONUS', name: '상여금 (Bonus)', typicalPercentOfGross: 0.20, taxExempt: false, mandatory: false, description: 'Performance bonus — typically 100-400% of monthly base per year' },
      { code: 'MEAL', name: '식대 (Meal Allowance)', typicalPercentOfGross: 0.05, taxExempt: true, mandatory: false, description: 'Meal allowance: ₩200,000/month tax-exempt (from 2023)' },
    ],
    eosb: { applicable: true, basis: 'gross', daysPerYear_first5: 30, daysPerYear_after5: 30, description: '퇴직금 (Retirement Allowance): 1 month average salary per year of service after ≥1 year employment. OR IRP (Individual Retirement Pension) account.' },
    complianceFilings: [
      { code: 'WITHHOLDING_MONTHLY', name: 'Monthly Payroll Tax Withholding', authority: 'National Tax Service (NTS)', frequency: 'monthly', description: 'Withhold and remit income tax + local income tax. Micro-businesses: semi-annual option.', penaltyNote: '3-5% late filing penalty + interest on unpaid amount' },
      { code: 'YEAR_END_SETTLE', name: 'Year-End Tax Settlement (연말정산)', authority: 'NTS', frequency: 'annual', description: 'February payroll: recalculate final annual tax, apply deductions (dependents, insurance, education). Issue 원천징수영수증.' },
      { code: 'FOUR_INSURANCE', name: 'Monthly 4-Insurance Contributions', authority: 'NHIS / NPS / MOEL / COMWEL', frequency: 'monthly', description: 'Four mandatory insurances (NP, HI, EI, Workers Comp) — combined EC filing by end of following month' },
    ],
    specialNotes: [
      'Minimum wage 2024: ₩9,860/hour = ~₩2,060,000/month (209 hours). Rising to ₩10,030/hour in 2025.',
      '연차 (Annual Leave): 15 days after 1 year, +1 day every 2 years, max 25 days.',
      'Severance: 1 month average salary per year. Average salary = (3 months wages + bonuses/12 × 3) ÷ 3.',
      'Meal allowance: Increased from ₩100,000 to ₩200,000/month tax-exempt from Jan 2023.',
      'Local income tax: 10% of national income tax amount — withheld same time as national tax.',
    ],
    keyFacts: { taxRange: '6–45% + 10% local surcharge', employeeSSRate: '~13% (NP 4.5% + HI 3.5% + EI 0.9% + local tax)', employerSSRate: '~14.6% (NP+HI+EI+Workers Comp)', noTax: false, mandatoryComponents: ['4 Insurances', 'Retirement Allowance', 'Year-end settlement'] },
  },

  // ─── CLUSTER 7: NORDIC ────────────────────────────────────────────────────
  SE: {
    code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr ',
    cluster: 'NORDIC',
    taxSystem: 'Municipal income tax (~32%) withheld at source + state income tax (20%) above threshold. Employer pays ALL social contributions.',
    hasTax: true,
    taxBrackets: [
      { from: 0,       to: 598500,  rate: 0.32,  label: 'Municipal tax ~32% (average; varies by municipality)' },
      { from: 598500,  to: null,    rate: 0.52,  label: '598,500+ kr: Municipal 32% + State 20% = 52%' },
    ],
    standardDeduction: 30000,
    personalAllowance: 14000,
    employeeContributions: [],
    employerContributions: [
      { name: 'Social Security Employer Contributions (Arbetsgivaravgifter)', code: 'ARGA', rate: 0.3142, basis: 'gross', isEmployer: true, description: '31.42% total employer social contributions: Pension 10.21% + Health 3.55% + Work Injury 0.2% + Parental 2.6% + Unemployment 2.64% + Activity Guarantee 0.01% + Survivor 0.7% + other 11.51%' },
    ],
    salaryComponents: [
      { code: 'LONEKOSTNAD', name: 'Lön (Gross Salary)', typicalPercentOfGross: 1.0, taxExempt: false, mandatory: true, description: 'Gross monthly salary. Sweden uses single gross figure. Employee pays income tax; employer pays all SS separately.' },
    ],
    eosb: { applicable: false, basis: 'gross', daysPerYear_first5: 0, daysPerYear_after5: 0, description: 'No mandatory gratuity. Avtalsgruppsjukförsäkring (AGS), ITP (white collar) or SAF-LO (blue collar) occupational pensions are standard through collective agreements.' },
    complianceFilings: [
      { code: 'AGI', name: 'Arbetsgivardeklaration (AGI) — Monthly PAYE', authority: 'Skatteverket (Swedish Tax Agency)', frequency: 'monthly', description: 'Monthly payroll tax return (employee-level data). Due: 12th of following month (26th for smaller employers). Via Skatteverket portal.', penaltyNote: 'SEK 1,250 per late return + 2% monthly surcharge on unpaid tax' },
      { code: 'KONTROLLUPPGIFT', name: 'Kontrolluppgift (KU) Annual Return', authority: 'Skatteverket', frequency: 'annual', description: 'Annual return of all employees\' income and tax withheld — submit by January 31. Auto-fills employees\' tax returns.' },
      { code: 'AG_SOCIAL', name: 'Social Contribution Payment', authority: 'Skatteverket', frequency: 'monthly', description: 'Pay employer social contributions with the monthly AGI by 12th/26th.' },
    ],
    specialNotes: [
      'Sweden has no EMPLOYEE social security contributions — all SS paid by employer (31.42% of gross).',
      'Municipal tax rate varies by municipality (2024 range: 28.9%–35.2%). Average ~32%. Deducted at source by employer.',
      'State income tax: 20% on taxable income above SEK 598,500 (2024 "skiktgräns"). Combined max rate ~52%.',
      'Pension system: 18.5% of pensionable income — 16% to public pension (Inkomstpension), 2.5% Premium Pension (PPM).',
      'Occupational pension (avtalpension): Typically 4.5–30% of salary depending on agreement (ITP1/ITP2 for white collar).',
      'Friskvårdbidrag (wellness allowance): Up to SEK 5,000/year employer-paid health benefit tax-exempt.',
    ],
    keyFacts: { taxRange: '~32% municipal + 20% state above threshold', employeeSSRate: '0% (employer pays all)', employerSSRate: '31.42%', noTax: false, mandatoryComponents: ['Income tax withholding', '31.42% employer SS (no employee SS)', 'Monthly AGI filing'] },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PAYROLL RUN DATA
// ═══════════════════════════════════════════════════════════════════════════

const PAYROLL_RUNS: GprPayrollRunDTO[] = [
  { id: 'gpr-run-001', tenantId: 'tenant-001', runName: 'India — September 2025', countryCode: 'IN', countryName: 'India', countryFlag: '🇮🇳', currency: 'INR', periodFrom: '2025-09-01', periodTo: '2025-09-30', paymentDate: '2025-10-05', employeeCount: 1150, totalGrossPayroll: 11500000, totalTaxWithheld: 1200000, totalEmployeeDeductions: 1800000, totalNetPayroll: 9700000, totalEmployerContributions: 2100000, totalEmployerCost: 13600000, status: 'approved', approvedBy: 'Naresh Andukoori', approvedAt: '2025-09-28T10:00:00.000Z', complianceFilingsDue: ['EPF_ECR', 'TDS_24Q_Q2', 'PT_RETURN'], createdAt: '2025-09-20T09:00:00.000Z' },
  { id: 'gpr-run-002', tenantId: 'tenant-001', runName: 'UAE — September 2025', countryCode: 'AE', countryName: 'United Arab Emirates', countryFlag: '🇦🇪', currency: 'AED', periodFrom: '2025-09-01', periodTo: '2025-09-30', paymentDate: '2025-09-30', employeeCount: 68, totalGrossPayroll: 850000, totalTaxWithheld: 0, totalEmployeeDeductions: 0, totalNetPayroll: 850000, totalEmployerContributions: 0, totalEmployerCost: 850000, status: 'submitted', approvedBy: 'Naresh Andukoori', approvedAt: '2025-09-27T10:00:00.000Z', complianceFilingsDue: ['WPS'], createdAt: '2025-09-18T09:00:00.000Z' },
  { id: 'gpr-run-003', tenantId: 'tenant-001', runName: 'United Kingdom — September 2025', countryCode: 'GB', countryName: 'United Kingdom', countryFlag: '🇬🇧', currency: 'GBP', periodFrom: '2025-09-01', periodTo: '2025-09-30', paymentDate: '2025-09-26', employeeCount: 22, totalGrossPayroll: 165000, totalTaxWithheld: 28000, totalEmployeeDeductions: 41000, totalNetPayroll: 124000, totalEmployerContributions: 18000, totalEmployerCost: 183000, status: 'calculated', complianceFilingsDue: ['RTI_FPS'], createdAt: '2025-09-19T09:00:00.000Z' },
  { id: 'gpr-run-004', tenantId: 'tenant-001', runName: 'USA — September 2025', countryCode: 'US', countryName: 'United States', countryFlag: '🇺🇸', currency: 'USD', periodFrom: '2025-09-01', periodTo: '2025-09-30', paymentDate: '2025-09-30', employeeCount: 10, totalGrossPayroll: 85000, totalTaxWithheld: 15000, totalEmployeeDeductions: 21000, totalNetPayroll: 64000, totalEmployerContributions: 8500, totalEmployerCost: 93500, status: 'draft', complianceFilingsDue: ['FORM941_Q3'], createdAt: '2025-09-21T09:00:00.000Z' },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE CALENDAR
// ═══════════════════════════════════════════════════════════════════════════

const COMPLIANCE_ITEMS: GprComplianceItemDTO[] = [
  { id: 'comp-001', tenantId: 'tenant-001', countryCode: 'IN', countryName: 'India', countryFlag: '🇮🇳', filingCode: 'EPF_ECR', filingName: 'EPF Electronic Challan (ECR)', authority: 'EPFO', frequency: 'monthly', periodCovered: 'Sep 2025', dueDate: '2025-10-15', status: 'upcoming', penaltyNote: '12% p.a. interest for late payment' },
  { id: 'comp-002', tenantId: 'tenant-001', countryCode: 'IN', countryName: 'India', countryFlag: '🇮🇳', filingCode: 'PT_RETURN', filingName: 'Professional Tax Return', authority: 'State Govt (Karnataka)', frequency: 'monthly', periodCovered: 'Sep 2025', dueDate: '2025-10-20', status: 'upcoming', penaltyNote: 'Penalty ₹250/month delay' },
  { id: 'comp-003', tenantId: 'tenant-001', countryCode: 'IN', countryName: 'India', countryFlag: '🇮🇳', filingCode: 'TDS_24Q', filingName: 'TDS Return Q2 (Form 24Q)', authority: 'Income Tax Dept (TRACES)', frequency: 'quarterly', periodCovered: 'Q2 FY25 (Jul–Sep 2025)', dueDate: '2025-10-31', status: 'upcoming', penaltyNote: '₹200/day late fee u/s 234E' },
  { id: 'comp-004', tenantId: 'tenant-001', countryCode: 'AE', countryName: 'UAE', countryFlag: '🇦🇪', filingCode: 'WPS', filingName: 'Wage Protection System Transfer', authority: 'MOHRE', frequency: 'monthly', periodCovered: 'Sep 2025', dueDate: '2025-10-10', status: 'filed', filedAt: '2025-09-30T14:00:00.000Z', referenceNumber: 'WPS-2025-09-AE-001' },
  { id: 'comp-005', tenantId: 'tenant-001', countryCode: 'GB', countryName: 'United Kingdom', countryFlag: '🇬🇧', filingCode: 'RTI_FPS', filingName: 'Full Payment Submission (FPS)', authority: 'HMRC', frequency: 'monthly', periodCovered: 'Sep 2025', dueDate: '2025-09-26', status: 'due_soon', penaltyNote: '£100–£400/month penalty for missing FPS' },
  { id: 'comp-006', tenantId: 'tenant-001', countryCode: 'US', countryName: 'USA', countryFlag: '🇺🇸', filingCode: 'FORM941', filingName: 'Form 941 Q3 (Quarterly)', authority: 'IRS', frequency: 'quarterly', periodCovered: 'Q3 2025 (Jul–Sep)', dueDate: '2025-10-31', status: 'upcoming', penaltyNote: '2–15% FTD penalty for late deposits' },
  { id: 'comp-007', tenantId: 'tenant-001', countryCode: 'IN', countryName: 'India', countryFlag: '🇮🇳', filingCode: 'ESI_RETURN', filingName: 'ESI Half-Yearly Return', authority: 'ESIC', frequency: 'semi_annual', periodCovered: 'Apr–Sep 2025', dueDate: '2025-11-11', status: 'upcoming', penaltyNote: 'Interest @ 12% p.a. on delayed contributions' },
  { id: 'comp-008', tenantId: 'tenant-001', countryCode: 'GB', countryName: 'United Kingdom', countryFlag: '🇬🇧', filingCode: 'P11D', filingName: 'P11D (Benefits in Kind)', authority: 'HMRC', frequency: 'annual', periodCovered: 'FY 2024-25', dueDate: '2025-07-06', status: 'overdue', penaltyNote: '£300 penalty per return + £60/day for continued failure' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class GlobalPayrollService {

  static getCountries(cluster?: GprCluster): GprCountryProfile[] {
    const all = Object.values(COUNTRY_PROFILES);
    return cluster ? all.filter(c => c.cluster === cluster) : all;
  }

  static getCountryProfile(code: string): GprCountryProfile | undefined {
    return COUNTRY_PROFILES[code.toUpperCase()];
  }

  static calculatePayroll(input: GprCalculationInput): GprCalculationResult {
    const profile = COUNTRY_PROFILES[input.countryCode.toUpperCase()];
    if (!profile) throw new Error(`Country profile not found: ${input.countryCode}`);

    const grossAnnual = input.grossAnnual;
    const grossMonthly = grossAnnual / 12;
    const basicPercent = input.basicSalaryPercent ?? 0.40;
    const basicAnnual = grossAnnual * basicPercent;
    const basicMonthly = basicAnnual / 12;

    // ─ Income Tax ──────────────────────────────────────────────────────────
    let taxableIncome = 0;
    let incomeTaxAnnual = 0;
    let breakdown: GprTaxBracketResult[] = [];

    if (profile.hasTax) {
      taxableIncome = Math.max(0, grossAnnual - profile.standardDeduction - profile.personalAllowance);

      // Special: Singapore income tax is self-assessed, not withheld (we show indicative)
      // Special: Korea local income tax = 10% surtax on national income tax
      let baseTaxResult = calcProgressiveTax(taxableIncome, profile.taxBrackets);
      let baseTax = baseTaxResult.tax;
      breakdown = baseTaxResult.breakdown;

      // Japan: Add 2.1% reconstruction surtax on income tax
      if (input.countryCode === 'JP') { baseTax *= 1.021; }

      // Korea: Add 10% local income tax
      if (input.countryCode === 'KR') { baseTax *= 1.10; }

      incomeTaxAnnual = Math.round(baseTax);
    }

    // ─ Employee Contributions ──────────────────────────────────────────────
    // For UAE/SA/QA expats, zero social security
    const isExpat = !input.isNational && ['AE', 'SA', 'QA'].includes(input.countryCode.toUpperCase());
    const empContribs = profile.employeeContributions.filter(c => {
      if (isExpat && (c.code.includes('GPSSA') || c.code.includes('GOSI') || c.code.includes('GRSIA'))) return false;
      return true;
    });

    const employeeResults = calcContributions(grossMonthly, basicMonthly, empContribs);
    const totalEmpMonthly = employeeResults.reduce((s, c) => s + c.monthlyAmount, 0);
    const totalEmpAnnual = totalEmpMonthly * 12;

    // ─ Net Take-Home ───────────────────────────────────────────────────────
    const netAnnual = Math.round(grossAnnual - incomeTaxAnnual - totalEmpAnnual);
    const netMonthly = Math.round(netAnnual / 12);

    // ─ Employer Contributions ──────────────────────────────────────────────
    const erContribs = profile.employerContributions.filter(c => {
      if (isExpat && (c.code.includes('GPSSA') || c.code.includes('GOSI') || c.code.includes('GRSIA'))) return false;
      return true;
    });

    const employerResults = calcContributions(grossMonthly, basicMonthly, erContribs);
    const totalErAnnual = employerResults.reduce((s, c) => s + c.annualAmount, 0);

    // ─ EOSB ────────────────────────────────────────────────────────────────
    let eosbAnnual = 0;
    if (profile.eosb.applicable) {
      const yearsService = input.yearsOfService ?? 1;
      const dailyBase = (profile.eosb.basis === 'basic' ? basicMonthly : grossMonthly) * 12 / 365;
      const days = yearsService <= 5 ? profile.eosb.daysPerYear_first5 : profile.eosb.daysPerYear_after5;
      eosbAnnual = Math.round(dailyBase * days);
    }

    // ─ Compliance Notes ────────────────────────────────────────────────────
    const notes = [...profile.specialNotes.slice(0, 3)];

    return {
      input,
      countryCode: profile.code,
      countryName: profile.name,
      currency: profile.currency,
      currencySymbol: profile.currencySymbol,
      cluster: profile.cluster,

      grossAnnual,
      grossMonthly: Math.round(grossMonthly),
      basicAnnual: Math.round(basicAnnual),
      basicMonthly: Math.round(basicMonthly),

      standardDeduction: profile.standardDeduction,
      personalAllowance: profile.personalAllowance,
      taxableIncome: Math.round(taxableIncome),
      incomeTaxAnnual,
      incomeTaxMonthly: Math.round(incomeTaxAnnual / 12),
      taxBracketBreakdown: breakdown,
      effectiveTaxRate: grossAnnual > 0 ? Math.round((incomeTaxAnnual / grossAnnual) * 1000) / 10 : 0,

      employeeContributions: employeeResults,
      totalEmployeeContributionsAnnual: totalEmpAnnual,
      totalEmployeeContributionsMonthly: totalEmpMonthly,

      netAnnual,
      netMonthly,
      effectiveTotalDeductionRate: grossAnnual > 0 ? Math.round(((grossAnnual - netAnnual) / grossAnnual) * 1000) / 10 : 0,

      employerContributions: employerResults,
      totalEmployerContributionsAnnual: Math.round(totalErAnnual),
      totalEmployerCostAnnual: Math.round(grossAnnual + totalErAnnual),
      totalEmployerCostMonthly: Math.round((grossAnnual + totalErAnnual) / 12),

      eosbAnnualAccrual: eosbAnnual,
      eosbMonthlyAccrual: Math.round(eosbAnnual / 12),
      eosbDescription: profile.eosb.description,

      complianceNotes: notes,
      generatedAt: new Date().toISOString(),
    };
  }

  static getPayrollRuns(tenantId: string, countryCode?: string): GprPayrollRunDTO[] {
    return PAYROLL_RUNS.filter(r => r.tenantId === tenantId && (!countryCode || r.countryCode === countryCode.toUpperCase()));
  }

  static approvePayrollRun(runId: string, approvedBy: string): GprPayrollRunDTO {
    const run = PAYROLL_RUNS.find(r => r.id === runId);
    if (!run) throw new Error(`Payroll run ${runId} not found`);
    run.status = 'approved';
    run.approvedBy = approvedBy;
    run.approvedAt = new Date().toISOString();
    return run;
  }

  static getComplianceCalendar(tenantId: string, countryCode?: string): GprComplianceItemDTO[] {
    return COMPLIANCE_ITEMS.filter(c => c.tenantId === tenantId && (!countryCode || c.countryCode === countryCode.toUpperCase()));
  }

  static fileComplianceItem(itemId: string, filedBy: string): GprComplianceItemDTO {
    const item = COMPLIANCE_ITEMS.find(c => c.id === itemId);
    if (!item) throw new Error(`Compliance item ${itemId} not found`);
    item.status = 'filed';
    item.penaltyNote = `Filed & Submitted by ${filedBy} on ${new Date().toLocaleDateString()}`;
    return item;
  }

  static getDashboardSummary(tenantId: string): GprGlobalDashboardDTO {
    const runs = PAYROLL_RUNS.filter(r => r.tenantId === tenantId);
    const compliance = COMPLIANCE_ITEMS.filter(c => c.tenantId === tenantId);
    const activeCountries = [...new Set(runs.map(r => r.countryCode))];
    const runsByCountry = activeCountries.map(code => {
      const profile = COUNTRY_PROFILES[code];
      const countryRuns = runs.filter(r => r.countryCode === code);
      return {
        countryCode: code,
        countryName: profile?.name || code,
        flag: profile?.flag || '',
        currency: profile?.currency || '',
        runs: countryRuns.length,
        totalGross: countryRuns.reduce((s, r) => s + r.totalGrossPayroll, 0),
      };
    });
    return {
      countriesActive: activeCountries.length,
      totalPayrollRuns: runs.length,
      totalGrossPayrollAllCountries: runs.reduce((s, r) => s + r.totalGrossPayroll, 0),
      totalEmployeesGlobally: runs.reduce((s, r) => s + r.employeeCount, 0),
      pendingComplianceFilings: compliance.filter(c => ['upcoming', 'due_soon'].includes(c.status)).length,
      overdueComplianceFilings: compliance.filter(c => c.status === 'overdue').length,
      payrollRunsByCountry: runsByCountry,
      upcomingFilings: compliance.filter(c => c.status !== 'filed').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5),
    };
  }
}
