import React, { useState, useEffect } from 'react';
import {
  Globe, Globe2, Calculator, Calendar, FileText, CheckCircle2,
  AlertTriangle, RefreshCw, Zap, ChevronRight, Info, Building2,
  DollarSign, Shield, ArrowUpRight, Award, Lock, Sparkles, Sliders,
  HelpCircle, Flag, Layers, PieChart, Users, Check
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GprCountryProfile {
  code: string; name: string; flag: string; currency: string; currencySymbol: string;
  cluster: string; taxSystem: string; hasTax: boolean;
  taxBrackets: { label: string; rate: number; from: number; to: number | null }[];
  standardDeduction: number; personalAllowance: number;
  employeeContributions: { name: string; code: string; rate: number; description: string }[];
  employerContributions: { name: string; code: string; rate: number; description: string }[];
  salaryComponents: { code: string; name: string; typicalPercentOfGross: number; description: string }[];
  eosb: { applicable: boolean; description: string };
  complianceFilings: { code: string; name: string; authority: string; frequency: string; description: string; penaltyNote?: string }[];
  specialNotes: string[];
  keyFacts: { taxRange: string; employeeSSRate: string; employerSSRate: string; noTax: boolean; mandatoryComponents: string[] };
}

interface GprCalculationResult {
  countryCode: string; countryName: string; currency: string; currencySymbol: string; cluster: string;
  grossAnnual: number; grossMonthly: number; basicAnnual: number; basicMonthly: number;
  standardDeduction: number; personalAllowance: number; taxableIncome: number;
  incomeTaxAnnual: number; incomeTaxMonthly: number; effectiveTaxRate: number;
  taxBracketBreakdown: { label: string; taxableAmount: number; rate: number; tax: number }[];
  employeeContributions: { name: string; code: string; rate: number; monthlyAmount: number; annualAmount: number }[];
  totalEmployeeContributionsAnnual: number; totalEmployeeContributionsMonthly: number;
  netAnnual: number; netMonthly: number; effectiveTotalDeductionRate: number;
  employerContributions: { name: string; code: string; rate: number; monthlyAmount: number; annualAmount: number }[];
  totalEmployerContributionsAnnual: number; totalEmployerCostAnnual: number; totalEmployerCostMonthly: number;
  eosbAnnualAccrual: number; eosbMonthlyAccrual: number; eosbDescription: string;
  complianceNotes: string[];
}

interface GprPayrollRun {
  id: string; runName: string; countryCode: string; countryName: string; countryFlag: string; currency: string;
  periodFrom: string; periodTo: string; paymentDate: string; employeeCount: number; totalGrossPayroll: number;
  totalTaxWithheld: number; totalEmployeeDeductions: number; totalNetPayroll: number; totalEmployerCost: number; status: string;
}

interface GprComplianceItem {
  id: string; countryCode: string; countryName: string; countryFlag: string; filingCode: string; filingName: string;
  authority: string; frequency: string; periodCovered: string; dueDate: string; status: string; penaltyNote?: string;
}

interface GprDashboard {
  countriesActive: number; totalPayrollRuns: number; totalGrossPayrollAllCountries: number; totalEmployeesGlobally: number;
  pendingComplianceFilings: number; overdueComplianceFilings: number;
  payrollRunsByCountry: { countryCode: string; countryName: string; flag: string; currency: string; runs: number; totalGross: number }[];
  upcomingFilings: GprComplianceItem[];
}

type Tab = 'overview' | 'directory' | 'calculator' | 'compliance';

const clusterNames: Record<string, string> = {
  SOUTH_ASIA: 'South Asia (India, BD, NP)',
  GCC: 'GCC / Middle East (UAE, Saudi, Qatar)',
  EU_CONTINENTAL: 'EU Continental (Germany, France, Spain)',
  UK_COMMONWEALTH: 'UK & Commonwealth (UK, AU, CA)',
  AMERICAS: 'Americas (US, Brazil)',
  EAST_ASIA: 'East Asia (Japan, SG, Korea)',
  NORDIC: 'Nordic (Sweden)',
};

const clusterColors: Record<string, string> = {
  SOUTH_ASIA: 'from-orange-500 to-amber-600',
  GCC: 'from-emerald-500 to-teal-600',
  EU_CONTINENTAL: 'from-blue-500 to-indigo-600',
  UK_COMMONWEALTH: 'from-violet-500 to-purple-600',
  AMERICAS: 'from-rose-500 to-pink-600',
  EAST_ASIA: 'from-cyan-500 to-blue-600',
  NORDIC: 'from-teal-500 to-emerald-600',
};

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  due_soon: 'bg-amber-100 text-amber-700 font-semibold',
  overdue: 'bg-red-100 text-red-700 font-bold',
  filed: 'bg-emerald-100 text-emerald-700',
};

export const GlobalPayrollPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotification();
  const [tab, setTab] = useState<Tab>('overview');
  const [summary, setSummary] = useState<GprDashboard | null>(null);
  const [countries, setCountries] = useState<GprCountryProfile[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [selectedCountryProfile, setSelectedCountryProfile] = useState<GprCountryProfile | null>(null);
  const [runs, setRuns] = useState<GprPayrollRun[]>([]);
  const [complianceItems, setComplianceItems] = useState<GprComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator inputs
  const [calcCountry, setCalcCountry] = useState('IN');
  const [calcGross, setCalcGross] = useState<number>(1200000);
  const [calcBasicPct, setCalcBasicPct] = useState<number>(0.40);
  const [calcYears, setCalcYears] = useState<number>(3);
  const [calcIsNational, setCalcIsNational] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<GprCalculationResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sumRes, countriesRes, runsRes, compRes] = await Promise.all([
        apiClient.get<GprDashboard>('/global-payroll/dashboard'),
        apiClient.get<GprCountryProfile[]>('/global-payroll/countries'),
        apiClient.get<GprPayrollRun[]>('/global-payroll/runs'),
        apiClient.get<GprComplianceItem[]>('/global-payroll/compliance'),
      ]);

      if (sumRes.data) setSummary(sumRes.data);
      const cList = Array.isArray(countriesRes.data) ? countriesRes.data : (countriesRes.data as any)?.data || [];
      setCountries(cList);
      if (cList.length > 0) {
        setSelectedCountryCode(cList[0].code);
        setSelectedCountryProfile(cList[0]);
      }
      setRuns(Array.isArray(runsRes.data) ? runsRes.data : (runsRes.data as any)?.data || []);
      setComplianceItems(Array.isArray(compRes.data) ? compRes.data : (compRes.data as any)?.data || []);

      // Initial calculate
      runCalculator('IN', 1200000, 0.40, 3, false);
    } catch (err) {
      toast.error('Failed to load Global Payroll Engine data');
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountryCode(code);
    const p = countries.find(c => c.code === code);
    if (p) setSelectedCountryProfile(p);
  };

  const runCalculator = async (cCode = calcCountry, gross = calcGross, basicPct = calcBasicPct, years = calcYears, isNat = calcIsNational) => {
    setCalcLoading(true);
    try {
      const res = await apiClient.post<GprCalculationResult>('/global-payroll/calculate', {
        countryCode: cCode,
        grossAnnual: gross,
        basicSalaryPercent: basicPct,
        yearsOfService: years,
        isNational: isNat,
      });
      if (res.data) setCalcResult(res.data);
    } catch {
      toast.error('Calculation failed');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleApproveRun = async (run: GprPayrollRun) => {
    const ok = await confirm({
      title: `Approve ${run.runName}?`,
      text: `Approve payroll run for ${run.employeeCount} employees with total gross ${run.currency} ${run.totalGrossPayroll.toLocaleString()}.`,
      icon: 'question',
      confirmButtonText: 'Approve Run',
      cancelButtonText: 'Cancel'
    });
    if (!ok) return;

    const res = await apiClient.post(`/global-payroll/runs/${run.id}/approve`, { approvedBy: 'Naresh Andukoori' });
    if (!res.error) {
      toast.success(`${run.runName} approved and ready for bank disbursement!`);
      setRuns(prev => prev.map(r => r.id === run.id ? { ...r, status: 'approved' } : r));
    }
  };

  const handleFileCompliance = async (item: GprComplianceItem) => {
    const ok = await confirm({
      title: `File ${item.filingName} (${item.countryName})?`,
      text: `Submit official statutory return for ${item.periodCovered} to ${item.authority}. Due Date: ${item.dueDate}.`,
      icon: 'question',
      confirmButtonText: 'File Return Now',
      cancelButtonText: 'Cancel'
    });
    if (!ok) return;

    const res = await apiClient.post(`/global-payroll/compliance/${item.id}/file`, { filedBy: 'Naresh Andukoori' });
    if (!res.error) {
      toast.success(`${item.filingName} successfully filed for ${item.countryName}!`);
      setComplianceItems(prev => prev.map(c => c.id === item.id ? { ...c, status: 'filed' } : c));
      setSummary(prev => prev ? {
        ...prev,
        pendingComplianceFilings: Math.max(0, prev.pendingComplianceFilings - 1),
        overdueComplianceFilings: item.status === 'overdue' ? Math.max(0, prev.overdueComplianceFilings - 1) : prev.overdueComplianceFilings
      } : null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-3 text-gray-600 font-medium">Initializing Global Payroll Engine…</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-md text-white">
            <Globe2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{t('global-payroll.multi_country_global_payroll_e', 'Multi-Country Global Payroll Engine')}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-1">
                <Zap className="w-3 h-3" /> Add-on
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Unified cluster architecture covering 15+ countries · 7 statutory frameworks · Zero redundant engines
            </p>
          </div>
        </div>
        <button onClick={loadAll} className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm text-gray-600 bg-white shadow-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Overdue compliance warning banner */}
      {summary && summary.overdueComplianceFilings > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-red-800">{summary.overdueComplianceFilings} statutory compliance filing(s) OVERDUE!</span>
            <span className="text-red-700 ml-2">Immediate action required to prevent statutory penalties and interest penalties.</span>
          </div>
          <button onClick={() => setTab('compliance')} className="text-xs text-red-700 bg-white border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 font-semibold shadow-xs">{t('common.review_calendar', 'Review Calendar')}</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-2 -mb-px overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Clusters', icon: Layers },
            { id: 'directory', label: 'Country Profiles (15)', icon: Flag },
            { id: 'calculator', label: 'Interactive Gross-to-Net Engine', icon: Calculator },
            { id: 'compliance', label: 'Statutory Compliance Calendar', icon: Calendar },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.id === 'compliance' && summary && summary.pendingComplianceFilings > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">{summary.pendingComplianceFilings}</span>
              )}</button>
          ))}
        </nav>
      </div>

      {/* ── TAB 1: OVERVIEW & CLUSTERS ── */}
      {tab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Payroll Countries', value: summary.countriesActive, sub: 'Across 7 framework clusters', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Total Global Employees', value: summary.totalEmployeesGlobally.toLocaleString(), sub: 'In active payroll runs', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Payroll Value', value: `$${(summary.totalGrossPayrollAllCountries / 1000000).toFixed(2)}M`, sub: 'Combined monthly gross', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending Compliance', value: summary.pendingComplianceFilings, sub: `${summary.overdueComplianceFilings} overdue filing(s)`, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <k.icon className={`w-5 h-5 ${k.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{k.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{k.label}</div>
              </div>
            ))}</div>

          {/* Architecture Cluster Map */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{t('global-payroll.7_global_framework_clusters', '7 Global Framework Clusters')}</h3>
                <p className="text-xs text-gray-500">Instead of 160+ separate codebases, countries are grouped into 7 calculation engines with rate-table configuration.</p>
              </div>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded-full">gpr_ domain boundary</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(clusterNames).map(([key, name]) => {
                const clusterCountries = countries.filter(c => c.cluster === key);
                return (
                  <div key={key} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${clusterColors[key] || 'from-gray-400 to-gray-600'}`} />
                      <span className="font-bold text-sm text-gray-800">{name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {clusterCountries.map(c => (
                        <button
                          key={c.code}
                          onClick={() => { setTab('directory'); handleCountrySelect(c.code); }}
                          className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <span>{c.flag}</span> <span>{c.code}</span>
                        </button>
                      ))}</div>
                  </div>
                );
              })}</div>
          </div>

          {/* Active Global Payroll Runs */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-4">{t('global-payroll.active_global_payroll_runs', 'Active Global Payroll Runs')}</h3>
            <div className="space-y-3">
              {runs.map(run => (
                <div key={run.id} className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{run.countryFlag}</span>
                    <div>
                      <div className="font-bold text-gray-800 text-base flex items-center gap-2">
                        {run.runName}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          run.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          run.status === 'submitted' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {run.status}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Period: {run.periodFrom} to {run.periodTo} · Pay Date: {run.paymentDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {run.currency} {run.totalGrossPayroll.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{run.employeeCount} employees</div>
                    </div>

                    {run.status !== 'approved' && (
                      <button
                        onClick={() => handleApproveRun(run)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Run
                      </button>
                    )}</div>
                </div>
              ))}</div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COUNTRY PROFILES DIRECTORY ── */}
      {tab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Country selector sidebar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2 max-h-[700px] overflow-y-auto">
            <h3 className="font-bold text-gray-800 text-sm px-2 mb-2">Supported Countries ({countries.length})</h3>
            {countries.map(c => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedCountryCode === c.code ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-950 shadow-2xs' : 'border-transparent hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <div className="text-sm font-bold">{c.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.currency} · {c.cluster}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedCountryCode === c.code ? 'text-indigo-600' : 'text-gray-300'}`} />
              </button>
            ))}</div>

          {/* Profile details */}
          {selectedCountryProfile && (
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCountryProfile.flag}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCountryProfile.name} Payroll Profile</h2>
                    <p className="text-xs text-gray-500 font-mono">
                      Currency: {selectedCountryProfile.currency} ({selectedCountryProfile.currencySymbol}) · Cluster: {selectedCountryProfile.cluster}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCalcCountry(selectedCountryProfile.code);
                    setTab('calculator');
                    runCalculator(selectedCountryProfile.code);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                >
                  <Calculator className="w-4 h-4" /> Open in Calculator
                </button>
              </div>

              {/* Tax system summary */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-950">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" /> Tax System & Deductions
                </div>
                <p className="text-xs leading-relaxed">{selectedCountryProfile.taxSystem}</p>
              </div>

              {/* Key facts badges */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-medium">Income Tax Range</div>
                  <div className="font-bold text-gray-800 text-sm mt-0.5">{selectedCountryProfile.keyFacts.taxRange}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-medium">Employee Social Security</div>
                  <div className="font-bold text-gray-800 text-sm mt-0.5">{selectedCountryProfile.keyFacts.employeeSSRate}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-medium">Employer Social Security</div>
                  <div className="font-bold text-gray-800 text-sm mt-0.5">{selectedCountryProfile.keyFacts.employerSSRate}</div>
                </div>
              </div>

              {/* Tax Brackets (if any) */}
              {selectedCountryProfile.taxBrackets.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-2">Statutory Income Tax Brackets</h4>
                  <div className="space-y-1.5">
                    {selectedCountryProfile.taxBrackets.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border border-gray-100 rounded-lg p-2.5 bg-gray-50/40">
                        <span className="font-medium text-gray-700">{b.label}</span>
                        <span className="font-mono font-bold text-indigo-600">{(b.rate * 100).toFixed(1)}%</span>
                      </div>
                    ))}</div>
                </div>
              )}

              {/* Employee & Employer Contributions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-2">Employee Deductions</h4>
                  <div className="space-y-2">
                    {selectedCountryProfile.employeeContributions.map(c => (
                      <div key={c.code} className="border border-gray-100 rounded-xl p-3 bg-gray-50/30 text-xs">
                        <div className="font-semibold text-gray-800">{c.name}</div>
                        <div className="text-gray-500 mt-1 leading-normal">{c.description}</div>
                      </div>
                    ))}</div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-2">Employer Contributions</h4>
                  <div className="space-y-2">
                    {selectedCountryProfile.employerContributions.map(c => (
                      <div key={c.code} className="border border-gray-100 rounded-xl p-3 bg-gray-50/30 text-xs">
                        <div className="font-semibold text-gray-800">{c.name}</div>
                        <div className="text-gray-500 mt-1 leading-normal">{c.description}</div>
                      </div>
                    ))}</div>
                </div>
              </div>

              {/* Special Gotchas & Compliance Notes */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-2">Compliance Gotchas & Regulations</h4>
                <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside bg-amber-50/40 border border-amber-100 rounded-xl p-4">
                  {selectedCountryProfile.specialNotes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}</div>
      )}

      {/* ── TAB 3: INTERACTIVE CALCULATOR ── */}
      {tab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3 border-gray-100">{t('global-payroll.calculation_inputs', 'Calculation Inputs')}</h3>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">{t('global-payroll.target_country', 'Target Country')}</label>
              <select
                value={calcCountry}
                onChange={e => {
                  setCalcCountry(e.target.value);
                  runCalculator(e.target.value);
                }}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white font-medium text-gray-800 focus:outline-none focus:border-indigo-600"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.currency})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Gross Annual Salary ({countries.find(c=>c.code===calcCountry)?.currencySymbol})</label>
              <input
                type="number"
                value={calcGross}
                onChange={e => setCalcGross(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Basic Salary % of Gross ({Math.round(calcBasicPct*100)}%)</label>
              <input
                type="range"
                min="0.30"
                max="0.80"
                step="0.05"
                value={calcBasicPct}
                onChange={e => setCalcBasicPct(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>30%</span><span>50%</span><span>80%</span></div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">{t('global-payroll.years_of_service_for_eosb_grat', 'Years of Service (for EOSB/Gratuity)')}</label>
              <input
                type="number"
                value={calcYears}
                min="1"
                max="30"
                onChange={e => setCalcYears(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {['AE', 'SA', 'QA'].includes(calcCountry) && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isNat"
                  checked={calcIsNational}
                  onChange={e => setCalcIsNational(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <label htmlFor="isNat" className="text-xs text-gray-700 font-medium">{t('global-payroll.is_country_national_enables_pe', 'Is Country National (enables pension)')}</label>
              </div>
            )}

            <button
              onClick={() => runCalculator()}
              disabled={calcLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {calcLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} Calculate Payroll
            </button>
          </div>

          {/* Results Output */}
          {calcResult && (
            <div className="lg:col-span-2 space-y-4">
              {/* Top Banner Result */}
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full">{calcResult.countryName} Gross-to-Net Summary</span>
                  <span className="text-xs text-indigo-200 font-mono">Cluster: {calcResult.cluster}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-indigo-200 font-medium">Gross Monthly</div>
                    <div className="text-lg font-bold mt-0.5">{calcResult.currencySymbol}{calcResult.grossMonthly.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 font-medium">Net Monthly Take-Home</div>
                    <div className="text-xl font-extrabold text-emerald-300 mt-0.5">{calcResult.currencySymbol}{calcResult.netMonthly.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 font-medium">Effective Tax Rate</div>
                    <div className="text-lg font-bold mt-0.5">{calcResult.effectiveTaxRate}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 font-medium">Total Employer Cost/Mo</div>
                    <div className="text-lg font-bold mt-0.5">{calcResult.currencySymbol}{calcResult.totalEmployerCostMonthly.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Side */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2 border-gray-100 flex items-center justify-between">
                    <span>Employee Take-Home Breakdown</span>
                    <span className="text-xs font-normal text-gray-400">Annual basis</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1"><span className="text-gray-600">Gross Annual Salary:</span><span className="font-bold text-gray-900">{calcResult.currencySymbol}{calcResult.grossAnnual.toLocaleString()}</span></div>
                    <div className="flex justify-between py-1 text-red-600"><span className="font-medium">Annual Income Tax (PAYE/TDS):</span><span className="font-bold">-{calcResult.currencySymbol}{calcResult.incomeTaxAnnual.toLocaleString()}</span></div>
                    {calcResult.employeeContributions.map(c => (
                      <div key={c.code} className="flex justify-between py-1 text-orange-600">
                        <span>{c.name}:</span>
                        <span className="font-bold">-{calcResult.currencySymbol}{c.annualAmount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-emerald-600">
                      <span>Net Take-Home Annual:</span>
                      <span>{calcResult.currencySymbol}{calcResult.netAnnual.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Employer Side */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2 border-gray-100 flex items-center justify-between">
                    <span>Employer Total Cost Breakdown</span>
                    <span className="text-xs font-normal text-gray-400">Annual basis</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1"><span className="text-gray-600">Base Salary Paid:</span><span className="font-bold text-gray-900">{calcResult.currencySymbol}{calcResult.grossAnnual.toLocaleString()}</span></div>
                    {calcResult.employerContributions.map(c => (
                      <div key={c.code} className="flex justify-between py-1 text-indigo-600">
                        <span>{c.name}:</span>
                        <span className="font-bold">+{calcResult.currencySymbol}{c.annualAmount.toLocaleString()}</span>
                      </div>
                    ))}
                    {calcResult.eosbAnnualAccrual > 0 && (
                      <div className="flex justify-between py-1 text-purple-600">
                        <span>EOSB / Gratuity Accrual:</span>
                        <span className="font-bold">+{calcResult.currencySymbol}{calcResult.eosbAnnualAccrual.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-indigo-950">
                      <span>Total Employer Cost:</span>
                      <span>{calcResult.currencySymbol}{calcResult.totalEmployerCostAnnual.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}</div>
      )}

      {/* ── TAB 4: COMPLIANCE CALENDAR ── */}
      {tab === 'compliance' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <div>
              <strong>Statutory Compliance Radar:</strong> Keeps track of filing deadlines across all active countries (India Form 24Q/EPF, UAE WPS, UK RTI FPS, Germany Lohnsteueranmeldung, US Form 941). Prevents penalties and interest charges automatically.
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Country', 'Filing Name', 'Authority', 'Frequency', 'Period Covered', 'Due Date', 'Status', 'Penalty Risk', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {complianceItems.map(item => (
                    <tr key={item.id} className={`hover:bg-gray-50/50 ${item.status === 'overdue' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.countryFlag}</span>
                          <span className="font-bold text-gray-800 text-xs">{item.countryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-xs">{item.filingName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.authority}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs capitalize">{item.frequency.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.periodCovered}</td>
                      <td className="px-4 py-3 font-semibold text-xs whitespace-nowrap text-gray-800">{item.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                          {item.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-red-600 max-w-xs truncate">{item.penaltyNote || 'Standard late interest'}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {item.status === 'filed' ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Filed</span>
                        ) : (
                          <button
                            onClick={() => handleFileCompliance(item)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                          >
                            File Return</button>
                        )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}</div>
  );
};
