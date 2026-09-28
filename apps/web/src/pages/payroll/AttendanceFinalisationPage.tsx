import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Users,
  Calendar,
  Building,
  Check,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PayPeriodDTO, DepartmentReconciliationDTO, PeriodReconciliationSummaryDTO } from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext.tsx';

export const AttendanceFinalisationPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useNotification();
  
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('prd-002');
  const [periods, setPeriods] = useState<PayPeriodDTO[]>([]);
  const [reconciliation, setReconciliation] = useState<PeriodReconciliationSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [lockRemarks, setLockRemarks] = useState<string>('');
  const [acknowledgementChecked, setAcknowledgementChecked] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'action_required'>('all');

  // Load Periods
  const loadPeriods = async () => {
    try {
      const res = await apiClient.get<PayPeriodDTO[]>('/finalisation/periods');
      if (res.data) {
        const fetchedPeriods = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        setPeriods(fetchedPeriods);
        if (fetchedPeriods.length > 0 && !fetchedPeriods.some((p: PayPeriodDTO) => p.id === selectedPeriodId)) {
          setSelectedPeriodId(fetchedPeriods[0].id);
        }
      }
    } catch {
      toast.error('Failed to load pay periods');
    }
  };

  // Load Reconciliation Data for selected period
  const loadReconciliation = async (periodId: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<PeriodReconciliationSummaryDTO>(`/finalisation/reconciliation/${periodId}`);
      if (res.data) {
        setReconciliation(res.data);
      }
    } catch {
      toast.error('Failed to load reconciliation data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodId) {
      loadReconciliation(selectedPeriodId);
    }
  }, [selectedPeriodId]);

  const currentPeriod = reconciliation?.period || periods.find(p => p.id === selectedPeriodId) || periods[0];
  const departments = reconciliation?.departments || [];

  const filteredDepartments = departments.filter(d => {
    const matchesSearch = d.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRecalculate = async () => {
    if (!currentPeriod) return;
    setIsRecalculating(true);
    try {
      const res = await apiClient.post(`/finalisation/recalculate/${currentPeriod.id}`, {});
      if (!res.error) {
        toast.success('Batch attendance successfully recalculated');
        await loadPeriods();
        await loadReconciliation(currentPeriod.id);
      } else {
        toast.error(res.error?.message || 'Recalculation failed');
      }
    } catch {
      toast.error('Recalculation error');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleLockPeriod = async () => {
    if (!currentPeriod) return;
    setIsLocking(true);
    try {
      const res = await apiClient.post<PayPeriodDTO>('/finalisation/lock', {
        periodId: currentPeriod.id,
        lockRemarks
      });

      if (!res.error) {
        toast.success('Period cryptographically sealed & locked');
        setShowLockModal(false);
        setLockRemarks('');
        setAcknowledgementChecked(false);
        await loadPeriods();
        await loadReconciliation(currentPeriod.id);
      } else {
        toast.error(res.error?.message || 'Lock period failed');
      }
    } catch {
      toast.error('Error locking pay period');
    } finally {
      setIsLocking(false);
    }
  };

  if (isLoading && !reconciliation) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-slate-600 dark:text-slate-300 font-medium">Loading Attendance Finalisation Data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('payroll.attendance_finalisation', 'Attendance Finalisation')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              SCR-WEB-023
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reconcile department timesheets, clear blocking exceptions, and freeze attendance records with an immutable cryptographic seal before payroll handoff.
          </p>
        </div>

        {/* Period Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm focus:ring-2 focus:ring-indigo-500 pr-9 appearance-none shadow-sm cursor-pointer"
            >
              {periods.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.periodCode})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={isRecalculating || currentPeriod?.status === 'locked'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium text-sm transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin text-indigo-600' : ''}`} />
            {isRecalculating ? 'Recalculating...' : 'Recalculate Batch'}</button>

          {currentPeriod?.status === 'locked' ? (
            <button
              onClick={() => navigate('/payroll/export')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Proceed to Payroll Export
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowLockModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm"
            >
              <Lock className="w-4 h-4" />
              Freeze & Lock Period
            </button>
          )}</div>
      </div>

      {/* Cryptographic Seal Status Banner (If locked) */}
      {currentPeriod?.status === 'locked' && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-emerald-950 dark:text-emerald-100">{t('payroll.period_cryptographically_seale', 'Period Cryptographically Sealed & Immutable')}</h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 rounded">
                  LOCKED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Locked by <span className="font-medium text-slate-900 dark:text-white">{currentPeriod.lockedBy || 'System Admin'}</span> on {new Date(currentPeriod.lockedAt || Date.now()).toLocaleString()}</p>
              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1 break-all">
                SHA-256 Signature: {currentPeriod.lockSignature}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/payroll/export')}
            className="self-end md:self-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            Export to Payroll ERP <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Period Readiness & KPIs */}
      {currentPeriod && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Readiness Progress Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payroll Readiness</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                currentPeriod.readinessPercentage === 100 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {currentPeriod.readinessPercentage}% Complete
              </span>
            </div>
            <div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-700 ${
                    currentPeriod.readinessPercentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${currentPeriod.readinessPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentPeriod.status === 'locked'
                  ? 'All 5 reconciliation checkpoints passed. Ready for ERP handoff.'
                  : `${currentPeriod.pendingExceptionsCount} open exceptions and ${currentPeriod.pendingRegularisationsCount} approvals pending.`}</p>
            </div>
          </div>

          {/* Headcount & Payable Days */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{currentPeriod.totalEmployees}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Employees</div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                {currentPeriod.totalPayableDays.toLocaleString()} Total Payable Days
              </div>
            </div>
          </div>

          {/* Present Days & Leaves */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{currentPeriod.totalPresentDays.toLocaleString()}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Present Workdays</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {currentPeriod.totalPaidLeaves} Approved Paid Leaves
              </div>
            </div>
          </div>

          {/* LOP Days & Overtime */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{currentPeriod.totalOvertimeHours} hrs</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Approved Overtime</div>
              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                {currentPeriod.totalLopDays} Loss of Pay (LOP) Days
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Lock Reconciliation Health Checkpoints */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('payroll.pre_lock_reconciliation_checkp', 'Pre-Lock Reconciliation Checkpoints')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Verification gates required before cryptographic period locking can be finalized.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reconciliation?.checkpoints ? (
            reconciliation.checkpoints.map((cp, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${
                cp.passed 
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cp.name}</span>
                  {cp.passed ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" /> {cp.count} Open
                    </span>
                  )}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {cp.description}</p>
                {!cp.passed && cp.actionRequiredMessage && (
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">
                    {cp.actionRequiredMessage}</span>
                )}</div>
            ))
          ) : (
            <div className="col-span-4 text-xs text-slate-500">Loading checkpoints...</div>
          )}</div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('payroll.department_reconciliation_matr', 'Department Reconciliation Matrix')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review aggregate payable workdays, paid leaves, LOP, and overtime per organizational unit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('payroll.search_department', 'Search department...')}
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="ready">Ready for Handoff</option>
              <option value="action_required">Action Required</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                <th className="py-3 px-4 text-center">Expected / Present</th>
                <th className="py-3 px-4 text-center">Paid Leaves</th>
                <th className="py-3 px-4 text-center">LOP Days</th>
                <th className="py-3 px-4 text-center">Overtime</th>
                <th className="py-3 px-4 text-center">Open Exceptions</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDepartments.map((dept) => (
                <tr key={dept.departmentId} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      {dept.departmentName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                    {dept.headcount}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dept.presentDays}</span>
                    <span className="text-slate-400"> / {dept.expectedDays}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-blue-600 dark:text-blue-400">
                    {dept.paidLeaves}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-rose-600 dark:text-rose-400">
                    {dept.lopDays}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-amber-600 dark:text-amber-400">
                    {dept.overtimeHours} hrs
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {dept.openExceptionsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        {dept.openExceptionsCount} open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Clear
                      </span>
                    )}</td>
                  <td className="py-3.5 px-4 text-center">
                    {dept.status === 'ready' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase tracking-wide">
                        Ready
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 uppercase tracking-wide">
                        Action Required
                      </span>
                    )}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/attendance/team"
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition"
                    >
                      Inspect Team
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredDepartments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No department reconciliation records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic Lock Confirmation Modal */}
      {showLockModal && currentPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('payroll.freeze_cryptographically_lock_', 'Freeze & Cryptographically Lock Pay Period')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentPeriod.name} ({currentPeriod.periodCode})</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4" /> Irreversible Locking Warning
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200">
                Once sealed, all punch timestamps, overtime hours, and attendance regularisations for this period become <strong>read-only</strong>. A cryptographic SHA-256 hash will be generated to guarantee audit non-repudiation.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('payroll.audit_remarks_reference', 'Audit Remarks / Reference')}</label>
                <input
                  type="text"
                  value={lockRemarks}
                  onChange={(e) => setLockRemarks(e.target.value)}
                  placeholder={t('payroll.e_g_september_2026_monthly_pay', 'e.g., September 2026 Monthly Payroll Cut-off final sign-off')}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgementChecked}
                  onChange={(e) => setAcknowledgementChecked(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  I confirm that all department exceptions have been audited and that this dataset is authorized for payroll calculation.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
              >
                {t('action.cancel', 'Cancel')}</button>
              <button
                onClick={handleLockPeriod}
                disabled={!acknowledgementChecked || isLocking}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition shadow"
              >
                {isLocking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sealing Hash...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Seal & Freeze Period
                  </>
                )}</button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
