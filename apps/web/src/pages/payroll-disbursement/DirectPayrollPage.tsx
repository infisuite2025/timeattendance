import React, { useState, useEffect } from 'react';
import {
  WalletCards, DollarSign, Users, CheckCircle2, AlertCircle,
  Clock, RefreshCw, Download, Send, RotateCcw, Eye,
  Building2, Banknote, Receipt, FileText, Zap, Lock,
  ChevronRight, TrendingUp, AlertTriangle, ArrowRight,
  CircleDollarSign, BadgeCheck, XCircle, Plus, Calendar
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PayrollDashboard {
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

interface PayrollRun {
  id: string;
  runName: string;
  periodFrom: string;
  periodTo: string;
  paymentDate: string;
  currency: string;
  totalGrossSalary: number;
  totalNetPayout: number;
  totalDeductions: number;
  totalTax: number;
  employeeCount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'disbursed' | 'failed' | 'cancelled';
  approvedBy?: string;
  disbursedAt?: string;
  cryptoHash?: string;
  createdAt: string;
}

interface Disbursement {
  id: string;
  payrollRunId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  grossSalary: number;
  totalDeductions: number;
  netPayout: number;
  currency: string;
  transferMethod: string;
  transferReference?: string;
  status: 'pending' | 'processing' | 'credited' | 'failed' | 'reversed';
  creditedAt?: string;
  failureReason?: string;
  paymentDate: string;
}

interface BankAccount {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  bankName: string;
  accountNumber: string;
  transferMethod: string;
  upiId?: string;
  wpsLabourCardNumber?: string;
  currency: string;
  country: string;
  isVerified: boolean;
}

interface TaxSlip {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  financialYear: string;
  slipType: string;
  grossSalary: number;
  totalTaxDeducted: number;
  netTaxPayable: number;
  status: 'draft' | 'issued' | 'amended';
  issuedAt?: string;
  downloadUrl: string;
}

interface EWARequest {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  requestedAmount: number;
  approvedAmount?: number;
  earnedWageToDate: number;
  maxEligibleAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  requestedAt: string;
  reason: string;
  bankAccountSnippet: string;
  approvedBy?: string;
  repaymentDate?: string;
  rejectionReason?: string;
}

type ActiveTab = 'overview' | 'payroll-runs' | 'disbursements' | 'tax-slips' | 'ewa';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR = (val: number, curr = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val);

const runStatusColors: Record<string, string> = {
  draft:            'bg-gray-100 text-gray-700 border-gray-200',
  pending_approval: 'bg-amber-100 text-amber-800 border-amber-300',
  approved:         'bg-blue-100 text-blue-800 border-blue-300',
  disbursed:        'bg-emerald-100 text-emerald-800 border-emerald-300',
  failed:           'bg-red-100 text-red-800 border-red-300',
  cancelled:        'bg-gray-200 text-gray-500 border-gray-300',
};

const disbStatusColors: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  credited:   'bg-emerald-100 text-emerald-700',
  failed:     'bg-red-100 text-red-700',
  reversed:   'bg-orange-100 text-orange-700',
};

const ewaStatusColors: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  approved:  'bg-blue-100 text-blue-700',
  rejected:  'bg-red-100 text-red-700',
  disbursed: 'bg-emerald-100 text-emerald-700',
  repaid:    'bg-gray-100 text-gray-500',
};

const methodBadge: Record<string, string> = {
  upi:   'bg-purple-50 text-purple-700',
  neft:  'bg-blue-50 text-blue-700',
  rtgs:  'bg-indigo-50 text-indigo-700',
  wps:   'bg-teal-50 text-teal-700',
  swift: 'bg-orange-50 text-orange-700',
  ach:   'bg-sky-50 text-sky-700',
  sepa:  'bg-cyan-50 text-cyan-700',
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

import { useAuth } from '../../context/AuthContext';

// ─── Component ────────────────────────────────────────────────────────────────
export const DirectPayrollPage: React.FC = () => {
  const { toast, confirm } = useNotification();
  const { t } = useI18n();
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [summary, setSummary] = useState<PayrollDashboard | null>(null);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [taxSlips, setTaxSlips] = useState<TaxSlip[]>([]);
  const [ewaRequests, setEwaRequests] = useState<EWARequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState<string>('run-001');
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sumRes, runsRes, disbRes, bankRes, taxRes, ewaRes] = await Promise.all([
        apiClient.get<PayrollDashboard>('/payroll-disbursement/dashboard'),
        apiClient.get<PayrollRun[]>('/payroll-disbursement/runs'),
        apiClient.get<Disbursement[]>('/payroll-disbursement/disbursements'),
        apiClient.get<BankAccount[]>('/payroll-disbursement/bank-accounts'),
        apiClient.get<TaxSlip[]>('/payroll-disbursement/tax-slips'),
        apiClient.get<EWARequest[]>('/payroll-disbursement/ewa'),
      ]);
      if (sumRes.data) setSummary(sumRes.data);
      if (runsRes.data) setRuns(Array.isArray(runsRes.data) ? runsRes.data : (runsRes.data as any).data || []);

      let rawDisb: Disbursement[] = Array.isArray(disbRes.data) ? disbRes.data : (disbRes.data as any).data || [];
      let rawBank: BankAccount[] = Array.isArray(bankRes.data) ? bankRes.data : (bankRes.data as any).data || [];
      let rawTax: TaxSlip[] = Array.isArray(taxRes.data) ? taxRes.data : (taxRes.data as any).data || [];
      let rawEwa: EWARequest[] = Array.isArray(ewaRes.data) ? ewaRes.data : (ewaRes.data as any).data || [];

      // Role Scoping
      if (role === 'EMPLOYEE') {
        rawDisb = rawDisb.filter(d => d.employeeCode === user.employeeCode || d.employeeCode === 'EMP-1001');
        rawBank = rawBank.filter(b => b.employeeCode === user.employeeCode || b.employeeCode === 'EMP-1001');
        rawTax = rawTax.filter(t => t.employeeCode === user.employeeCode || t.employeeCode === 'EMP-1001');
        rawEwa = rawEwa.filter(e => e.employeeCode === user.employeeCode || e.employeeCode === 'EMP-1001');
      } else if (role === 'MANAGER') {
        const reporteeCodes = ['EMP-1001', 'EMP-1003', 'EMP-1005', 'EMP-1006', 'MGR-104', user.employeeCode];
        rawDisb = rawDisb.filter(d => reporteeCodes.includes(d.employeeCode));
        rawBank = rawBank.filter(b => reporteeCodes.includes(b.employeeCode));
        rawTax = rawTax.filter(t => reporteeCodes.includes(t.employeeCode));
        rawEwa = rawEwa.filter(e => reporteeCodes.includes(e.employeeCode));
      }

      setDisbursements(rawDisb);
      setBankAccounts(rawBank);
      setTaxSlips(rawTax);
      setEwaRequests(rawEwa);
    } catch (e) {
      toast.error('Failed to load payroll dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRun = async (run: PayrollRun) => {
    const confirmed = await confirm({
      title: `Approve ${run.runName}?`,
      text: `This will cryptographically seal the payroll for ${run.employeeCount.toLocaleString()} employees and net payout of ${fmtINR(run.totalNetPayout, run.currency)}. This action is irreversible.`,
      icon: 'warning',
      confirmButtonText: 'Yes, Approve & Seal',
      cancelButtonText: 'Cancel',
    });
    if (!confirmed) return;
    const res = await apiClient.post(`/payroll-disbursement/runs/${run.id}/approve`, { approvedBy: 'Naresh Andukoori' });
    if (!res.error) {
      toast.success(`Payroll sealed with SHA-256 cryptographic hash ✓`);
      loadAll();
    } else {
      toast.error(res.error?.message || 'Approval failed');
    }
  };

  const handleDisburseRun = async (run: PayrollRun) => {
    const confirmed = await confirm({
      title: `Initiate Batch Disbursement?`,
      text: `${fmtINR(run.totalNetPayout, run.currency)} will be transferred to ${run.employeeCount.toLocaleString()} employee bank accounts via UPI / NEFT / WPS / SWIFT on ${fmtDate(run.paymentDate)}.`,
      icon: 'warning',
      confirmButtonText: 'Disburse Now',
      cancelButtonText: 'Cancel',
      isDangerous: true,
    });
    if (!confirmed) return;
    const res = await apiClient.post(`/payroll-disbursement/runs/${run.id}/disburse`, {});
    if (!res.error) {
      toast.success('Batch disbursement initiated — transfers queued across all payment rails');
      loadAll();
    } else {
      toast.error(res.error?.message || 'Disbursement failed');
    }
  };

  const handleRetryDisbursement = async (disb: Disbursement) => {
    const res = await apiClient.post(`/payroll-disbursement/disbursements/${disb.id}/retry`, {});
    if (!res.error) {
      toast.success(`Retry queued for ${disb.employeeName}`);
      setDisbursements(prev => prev.map(d => d.id === disb.id ? { ...d, status: 'pending' as const, failureReason: undefined } : d));
    } else {
      toast.error(res.error?.message || 'Retry failed');
    }
  };

  const handleIssueSlip = async (slip: TaxSlip) => {
    const res = await apiClient.post(`/payroll-disbursement/tax-slips/${slip.id}/issue`, {});
    if (!res.error) {
      toast.success(`${slip.slipType.toUpperCase()} issued for ${slip.employeeName}`);
      setTaxSlips(prev => prev.map(s => s.id === slip.id ? { ...s, status: 'issued' as const } : s));
    } else {
      toast.error(res.error?.message || 'Issue failed');
    }
  };

  const handleApproveEWA = async (req: EWARequest) => {
    const confirmed = await confirm({
      title: `Approve EWA for ${req.employeeName}?`,
      text: `Approve ${fmtINR(req.requestedAmount, req.currency)} early wage access. Earned to date: ${fmtINR(req.earnedWageToDate, req.currency)}. Policy limit: ${fmtINR(req.maxEligibleAmount, req.currency)}.`,
      icon: 'question',
      confirmButtonText: 'Approve & Disburse',
      cancelButtonText: 'Cancel',
    });
    if (!confirmed) return;
    const approveRes = await apiClient.post(`/payroll-disbursement/ewa/${req.id}/approve`, { approvedBy: 'Naresh Andukoori', approvedAmount: Math.min(req.requestedAmount, req.maxEligibleAmount) });
    if (!approveRes.error) {
      await apiClient.post(`/payroll-disbursement/ewa/${req.id}/disburse`, {});
      toast.success(`EWA disbursed to ${req.employeeName} — repayable on next salary`);
      loadAll();
    } else {
      toast.error(approveRes.error?.message || 'EWA approval failed');
    }
  };

  const handleRejectEWA = async (req: EWARequest) => {
    const confirmed = await confirm({
      title: `Reject EWA Request?`,
      text: `Reject ${req.employeeName}'s request for ${fmtINR(req.requestedAmount, req.currency)}.`,
      icon: 'warning',
      confirmButtonText: 'Reject Request',
      cancelButtonText: 'Cancel',
      isDangerous: true,
    });
    if (!confirmed) return;
    const res = await apiClient.post(`/payroll-disbursement/ewa/${req.id}/reject`, { approvedBy: 'Naresh Andukoori', rejectionReason: 'Exceeds 50% earned wage policy limit' });
    if (!res.error) {
      toast.warning(`EWA request rejected — ${req.employeeName} notified`);
      setEwaRequests(prev => prev.map(e => e.id === req.id ? { ...e, status: 'rejected' as const } : e));
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',      label: t('payroll.tabOverview', 'Overview'),       icon: TrendingUp },
    { id: 'payroll-runs',  label: t('payroll.tabRuns', 'Payroll Runs'),   icon: Calendar },
    { id: 'disbursements', label: t('payroll.tabDisbursements', 'Disbursements'),  icon: Banknote },
    { id: 'tax-slips',     label: t('payroll.tabTax', 'Tax & Compliance'), icon: FileText },
    { id: 'ewa',           label: t('payroll.tabEwa', 'EWA (On-Demand Pay)'), icon: CircleDollarSign },
  ];

  const visibleDisbursements = selectedRunId
    ? disbursements.filter(d => d.payrollRunId === selectedRunId)
    : disbursements;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-600 font-medium">Loading Payroll Hub…</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl">
            <WalletCards className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('payroll.title', 'Direct Payroll Disbursement')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('payroll.subtitle', '1-click bank batch payouts · UPI · NEFT · WPS · SEPA · Early Wage Access')}</p>
          </div>
          <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-1">
            <Zap className="w-3 h-3" /> {t('payroll.addon', 'Add-on')}</span>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4" /> {t('payroll.refresh', 'Refresh')}</button>
      </div>

      {/* Alert banners */}
      {summary && summary.failedDisbursements > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-red-700">{summary.failedDisbursements} {t('payroll.failedAlert', 'failed disbursement(s)')}</span>
            <span className="text-red-600 text-sm ml-2">{t('payroll.failedAlertMsg', '— employee bank accounts could not be credited. Retry required.')}</span>
          </div>
          <button onClick={() => setActiveTab('disbursements')} className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 font-medium">
            {t('payroll.reviewFailures', 'Review Failures')}</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'payroll-runs' && summary && summary.pendingApprovalRuns > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-bold">{summary.pendingApprovalRuns}</span>
              )}
              {tab.id === 'ewa' && summary && summary.pendingEWARequests > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-bold">{summary.pendingEWARequests}</span>
              )}
              {tab.id === 'disbursements' && summary && summary.failedDisbursements > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-bold">{summary.failedDisbursements}</span>
              )}</button>
          ))}
        </nav>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('payroll.kpiEmployees', 'Employees on Payroll'), value: summary.totalEmployeesOnPayroll.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: t('payroll.kpiApprovals', 'Pending Approvals'), value: summary.pendingApprovalRuns, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: t('payroll.kpiFailed', 'Failed Disbursements'), value: summary.failedDisbursements, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: t('payroll.kpiUnverified', 'Unverified Bank Accounts'), value: summary.bankAccountsUnverified, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-sm text-gray-500 mt-1">{kpi.label}</div>
              </div>
            ))}</div>

          {/* Last Payroll + Next Payroll */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
              <div className="text-sm text-emerald-100 font-medium mb-1">{t('payroll.lastDisbursed', 'Last Payroll Disbursed')}</div>
              <div className="text-4xl font-bold">{fmtINR(summary.lastPayrollAmount, summary.lastPayrollCurrency)}</div>
              <div className="text-emerald-200 text-sm mt-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('payroll.disbursedOn', 'Disbursed')} {summary.lastPayrollDate ? fmtDate(summary.lastPayrollDate) : 'N/A'}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 font-medium mb-1">{t('payroll.nextScheduled', 'Next Payroll Scheduled')}</div>
              <div className="text-4xl font-bold text-gray-900">{fmtINR(summary.nextPayrollEstimatedAmount, 'INR')}</div>
              <div className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{t('payroll.dueOn', 'Due')}: {summary.nextPayrollDate}</span>
              </div>
              {summary.pendingApprovalRuns > 0 && (
                <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{summary.pendingApprovalRuns} {t('payroll.runsAwaiting', 'run(s) awaiting approval')}</span>
                </div>
              )}</div>
          </div>

          {/* EWA + Tax summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <CircleDollarSign className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-gray-700 text-sm">{t('payroll.ewaTitle', 'Early Wage Access (EWA)')}</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{fmtINR(summary.totalEWADisbursedThisMonth)}</div>
              <div className="text-xs text-gray-400 mt-1">{t('payroll.disbursedThisMonth', 'Disbursed this month')}</div>
              <div className="mt-2 text-sm text-amber-600 font-medium">{summary.pendingEWARequests} {t('payroll.requestsPending', 'request(s) pending')}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-700 text-sm">{t('payroll.taxTitle', 'Tax Slips (FY 2024-25)')}</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{summary.taxSlipsIssued}</div>
              <div className="text-xs text-gray-400 mt-1">{t('payroll.issued', 'Issued')}</div>
              <div className="mt-2 text-sm text-amber-600 font-medium">{summary.taxSlipsPending} {t('payroll.pendingIssuance', 'pending issuance')}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-teal-500" />
                <span className="font-semibold text-gray-700 text-sm">{t('payroll.paymentRailMix', 'Payment Rail Mix')}</span>
              </div>
              <div className="space-y-1.5 mt-2">
                {[
                  { method: 'UPI', count: bankAccounts.filter(b => b.transferMethod === 'upi').length, color: 'bg-purple-400' },
                  { method: 'NEFT', count: bankAccounts.filter(b => b.transferMethod === 'neft').length, color: 'bg-blue-400' },
                  { method: 'WPS', count: bankAccounts.filter(b => b.transferMethod === 'wps').length, color: 'bg-teal-400' },
                ].map(rail => (
                  <div key={rail.method} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${rail.color}`} />
                    <span className="text-gray-600">{rail.method}</span>
                    <span className="ml-auto font-semibold text-gray-700">{rail.count}</span>
                  </div>
                ))}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Payroll Runs Tab ── */}
      {activeTab === 'payroll-runs' && (
        <div className="space-y-4">
          {runs.map(run => (
            <div key={run.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all ${
              run.status === 'pending_approval' ? 'border-amber-200' :
              run.status === 'disbursed' ? 'border-emerald-200' : 'border-gray-100'
            }`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-800">{run.runName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${runStatusColors[run.status]}`}>
                      {run.status.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Period: {fmtDate(run.periodFrom)} → {fmtDate(run.periodTo)} · Payment: {fmtDate(run.paymentDate)} · {run.employeeCount.toLocaleString()} employees
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{fmtINR(run.totalNetPayout, run.currency)}</div>
                  <div className="text-xs text-gray-400">Net Payout (Gross: {fmtINR(run.totalGrossSalary, run.currency)})</div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-50">
                {[
                  { label: t('payroll.colGross', 'Gross'), value: fmtINR(run.totalGrossSalary, run.currency), color: 'text-gray-700' },
                  { label: t('payroll.colDeductions', 'Deductions'), value: fmtINR(run.totalDeductions, run.currency), color: 'text-red-500' },
                  { label: 'Tax (TDS)', value: fmtINR(run.totalTax, run.currency), color: 'text-orange-500' },
                  { label: t('payroll.colNetPay', 'Net Payout'), value: fmtINR(run.totalNetPayout, run.currency), color: 'text-emerald-600' },
                ].map((b, i) => (
                  <div key={i} className="text-center">
                    <div className={`font-semibold text-sm ${b.color}`}>{b.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{b.label}</div>
                  </div>
                ))}</div>

              {/* Crypto seal */}
              {run.cryptoHash && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-emerald-700">SHA-256 Sealed: </span>
                    <span className="text-xs font-mono text-emerald-600">{run.cryptoHash.substring(0, 48)}…</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {run.status === 'pending_approval' && (
                  <button onClick={() => handleApproveRun(run)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
                    <BadgeCheck className="w-4 h-4" /> Approve & Seal
                  </button>
                )}
                {run.status === 'approved' && (
                  <button onClick={() => handleDisburseRun(run)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
                    <Send className="w-4 h-4" /> Initiate Batch Disbursement
                  </button>
                )}
                {run.status === 'disbursed' && (
                  <>
                    <button onClick={() => { setSelectedRunId(run.id); setActiveTab('disbursements'); }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                      <Eye className="w-4 h-4" /> View Disbursements
                    </button>
                    <button onClick={() => toast.info(`Downloading payslips for ${run.runName}…`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                      <Download className="w-4 h-4" /> Download All Payslips
                    </button>
                  </>
                )}</div>
            </div>
          ))}</div>
      )}

      {/* ── Disbursements Tab ── */}
      {activeTab === 'disbursements' && (
        <div className="space-y-4">
          {/* Run selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {runs.map(r => (
              <button key={r.id} onClick={() => setSelectedRunId(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
                  selectedRunId === r.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                {r.runName}</button>
            ))}</div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      t('payroll.colEmployee', 'Employee'),
                      t('payroll.colDept', 'Dept'),
                      t('payroll.colGross', 'Gross'),
                      t('payroll.colDeductions', 'Deductions'),
                      t('payroll.colNetPay', 'Net Pay'),
                      t('payroll.colMethod', 'Method'),
                      t('payroll.colReference', 'Reference'),
                      t('payroll.colStatus', 'Status'),
                      t('payroll.colActions', 'Actions')
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleDisbursements.map(d => (
                    <tr key={d.id} className={`hover:bg-gray-50/50 group ${d.status === 'failed' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{d.employeeName}</div>
                        <div className="text-xs text-gray-400">{d.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{d.department}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{fmtINR(d.grossSalary, d.currency)}</td>
                      <td className="px-4 py-3 text-red-500">{fmtINR(d.totalDeductions, d.currency)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{fmtINR(d.netPayout, d.currency)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${methodBadge[d.transferMethod] || 'bg-gray-100 text-gray-600'}`}>
                          {d.transferMethod}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate">
                        {d.transferReference || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${disbStatusColors[d.status]}`}>{d.status}</span>
                        {d.failureReason && (
                          <div className="text-xs text-red-500 mt-0.5 max-w-xs truncate" title={d.failureReason}>{d.failureReason}</div>
                        )}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedDisbursement(d)}
                            className="p-1.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-1" title="View Payslip Breakdown">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {d.status === 'failed' && (
                            <button onClick={() => handleRetryDisbursement(d)}
                              className="px-2.5 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1 font-medium">
                              <RotateCcw className="w-3 h-3" /> Retry
                            </button>
                          )}</div>
                      </td>
                    </tr>
                  ))}
                  {visibleDisbursements.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Select a payroll run above to view individual disbursements</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tax Slips Tab ── */}
      {activeTab === 'tax-slips' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taxSlips.map(slip => (
              <div key={slip.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${slip.status === 'draft' ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-800">{slip.employeeName}</div>
                    <div className="text-xs text-gray-400">{slip.employeeCode} · {slip.department}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 uppercase">{slip.slipType.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      slip.status === 'issued' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{slip.status}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3">FY {slip.financialYear}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Gross Salary', value: fmtINR(slip.grossSalary) },
                    { label: 'TDS Deducted', value: fmtINR(slip.totalTaxDeducted), color: 'text-red-600' },
                    { label: 'Net Tax Payable', value: fmtINR(slip.netTaxPayable), color: 'text-orange-600' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-2">
                      <div className={`text-sm font-bold ${item.color || 'text-gray-800'}`}>{item.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
                    </div>
                  ))}</div>
                <div className="mt-3 flex gap-2">
                  {slip.status === 'draft' && (
                    <button onClick={() => handleIssueSlip(slip)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700">
                      <Send className="w-3.5 h-3.5" /> Issue to Employee
                    </button>
                  )}
                  {slip.status === 'issued' && (
                    <button onClick={() => toast.info(`Downloading ${slip.slipType.toUpperCase()} for ${slip.employeeName}…`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs hover:bg-gray-50">
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  )}</div>
              </div>
            ))}</div>
        </div>
      )}

      {/* ── EWA Tab ── */}
      {activeTab === 'ewa' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <CircleDollarSign className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Early Wage Access Policy:</strong> Employees may request up to 50% of earned wages-to-date. Disbursed amount is auto-deducted from next salary cycle. No interest or fees applied.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ewaRequests.map(req => (
              <div key={req.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
                req.status === 'pending' ? 'border-amber-200' :
                req.status === 'rejected' ? 'border-red-200' :
                req.status === 'disbursed' ? 'border-emerald-200' : 'border-gray-100'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-800">{req.employeeName}</div>
                    <div className="text-xs text-gray-400">{req.employeeCode} · {req.department}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ewaStatusColors[req.status]}`}>
                    {req.status.toUpperCase()}</span>
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-1">{fmtINR(req.requestedAmount, req.currency)}</div>
                <div className="text-xs text-gray-500 italic mb-3">"{req.reason}"</div>

                {/* Eligibility bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Earned to date: {fmtINR(req.earnedWageToDate, req.currency)}</span>
                    <span>Max eligible: {fmtINR(req.maxEligibleAmount, req.currency)}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${req.requestedAmount <= req.maxEligibleAmount ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (req.requestedAmount / req.maxEligibleAmount) * 100)}%` }} />
                  </div>
                </div>

                {req.rejectionReason && (
                  <div className="text-xs text-red-600 bg-red-50 rounded-xl p-2 mb-3">{req.rejectionReason}</div>
                )}
                {req.approvedAmount && req.status === 'disbursed' && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 rounded-xl p-2 mb-3">
                    ✓ Disbursed {fmtINR(req.approvedAmount, req.currency)} · Repayable: {req.repaymentDate}</div>
                )}

                <div className="text-xs text-gray-400 mb-3">Requested: {fmtDate(req.requestedAt)}</div>

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveEWA(req)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Disburse
                    </button>
                    <button onClick={() => handleRejectEWA(req)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs hover:bg-red-50">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}</div>
            ))}</div>
        </div>
      )}

      {/* ── Payslip / Disbursement Audit Breakdown Modal ── */}
      {selectedDisbursement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-emerald-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Salary Disbursement Audit</span>
                <h3 className="font-bold text-lg">{selectedDisbursement.employeeName}</h3>
              </div>
              <button onClick={() => setSelectedDisbursement(null)} className="text-emerald-100 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Employee Code &amp; Dept</span>
                  <span className="font-semibold text-gray-900">{selectedDisbursement.employeeCode} · {selectedDisbursement.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Payment Date</span>
                  <span className="font-medium text-gray-700">{fmtDate(selectedDisbursement.paymentDate)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Transfer Rail &amp; Ref</span>
                  <span className="font-mono text-gray-800 uppercase font-semibold">{selectedDisbursement.transferMethod} · {selectedDisbursement.transferReference || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Disbursement Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize mt-0.5 ${disbStatusColors[selectedDisbursement.status]}`}>
                    {selectedDisbursement.status}</span>
                </div>
              </div>

              {selectedDisbursement.failureReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Failure Diagnostics:</strong> {selectedDisbursement.failureReason}</div>
                </div>
              )}

              {/* Salary Financial Breakdown */}
              <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 uppercase tracking-wider">Payroll Breakdown</div>
                <div className="divide-y divide-gray-100">
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-gray-600">Gross Monthly Salary</span>
                    <span className="font-semibold text-gray-900">{fmtINR(selectedDisbursement.grossSalary, selectedDisbursement.currency)}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-gray-600">Total Deductions (PF + TDS)</span>
                    <span className="font-semibold text-red-600">-{fmtINR(selectedDisbursement.totalDeductions, selectedDisbursement.currency)}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between bg-emerald-50 text-sm font-bold text-emerald-900">
                    <span>Net Disbursed Salary</span>
                    <span>{fmtINR(selectedDisbursement.netPayout, selectedDisbursement.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Verified with Bank Clearing House &amp; Encrypted Payroll Ledger</span>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
              <button
                onClick={() => toast.info(`Downloading payslip PDF for ${selectedDisbursement.employeeName}…`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-100"
              >
                <Download className="w-4 h-4" /> Download Payslip PDF
              </button>
              <button
                onClick={() => setSelectedDisbursement(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
