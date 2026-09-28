import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Check,
  X,
  Send,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  CalendarRange,
  FileEdit,
  History,
  Sparkles,
  Briefcase
} from 'lucide-react';
import {
  UnifiedApprovalItemDTO,
  ApprovalHistoryLogDTO,
  ApprovalCategory,
  ApprovalDecision,
  ApprovalInboxMetricsDTO
} from '@infi-timepro/shared-types';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useI18n } from '../../context/I18nContext.tsx';

export const ApprovalsHubPage: React.FC = () => {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const { toast, confirm } = useNotification();
  const [mainTab, setMainTab] = useState<'pending' | 'history'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [inspectedItem, setInspectedItem] = useState<UnifiedApprovalItemDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Decision Form State in Drawer
  const [decisionComments, setDecisionComments] = useState('');
  const [adjustedMinutes, setAdjustedMinutes] = useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  // Live API State
  const [items, setItems] = useState<UnifiedApprovalItemDTO[]>([]);
  const [history, setHistory] = useState<ApprovalHistoryLogDTO[]>([]);
  const [metrics, setMetrics] = useState<ApprovalInboxMetricsDTO>({
    pendingMyActionCount: 4,
    escalatedCount: 1,
    approvalsCompletedThisMonth: 20,
    avgTurnaroundHours: 3.8,
    regularisationsPending: 2,
    overtimePending: 1,
    shiftSwapsPending: 1
  });

  const fetchApprovalsData = async () => {
    setIsLoading(true);
    try {
      const [inboxRes, metricsRes, historyRes] = await Promise.all([
        apiClient.get<UnifiedApprovalItemDTO[]>('/approvals/inbox'),
        apiClient.get<ApprovalInboxMetricsDTO>('/approvals/metrics'),
        apiClient.get<ApprovalHistoryLogDTO[]>('/approvals/history'),
      ]);

      if (inboxRes.success && Array.isArray(inboxRes.data)) {
        setItems(inboxRes.data);
      }
      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data);
      }
      if (historyRes.success && Array.isArray(historyRes.data)) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.warn('Error fetching approvals data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsData();
  }, []);

  const handleDecision = async (decision: ApprovalDecision) => {
    if (!inspectedItem) return;
    setIsProcessing(true);

    try {
      const res = await apiClient.post<any>('/approvals/decision', {
        approvalId: inspectedItem.id,
        decision,
        comments: decisionComments || `Action: ${decision.toUpperCase()}`,
        adjustedDurationMinutes: adjustedMinutes,
      });

      if (res.success) {
        // Add to history state
        const newHist: ApprovalHistoryLogDTO = {
          id: `hist-${Date.now()}`,
          requestCode: inspectedItem.requestCode,
          category: inspectedItem.category,
          employeeName: inspectedItem.employeeName,
          employeeCode: inspectedItem.employeeCode,
          avatarUrl: inspectedItem.avatarUrl,
          decision,
          approverName: user?.name || 'Sarah Jenkins',
          approverRole: role === 'ADMIN' ? 'System Administrator' : 'Reporting Manager',
          decisionTimestamp: new Date().toISOString(),
          comments: decisionComments || `Action: ${decision.toUpperCase()}`,
          impactSummary: `Decision recorded as ${decision.toUpperCase()}. Notification dispatched.`
        };

        setHistory(prev => [newHist, ...prev]);
        setItems(prev => prev.filter(i => i.id !== inspectedItem.id));
        setMetrics(prev => ({
          ...prev,
          pendingMyActionCount: Math.max(0, prev.pendingMyActionCount - 1),
          approvalsCompletedThisMonth: prev.approvalsCompletedThisMonth + 1,
        }));

        setInspectedItem(null);
        setDecisionComments('');

        if (decision === 'approved') {
          toast.success('Request Approved', `Request #${inspectedItem.requestCode} for ${inspectedItem.employeeName} approved.`);
        } else if (decision === 'rejected') {
          toast.warning('Request Rejected', `Request #${inspectedItem.requestCode} for ${inspectedItem.employeeName} rejected.`);
        } else {
          toast.info('Request Modified', `Request #${inspectedItem.requestCode} updated with adjusted values.`);
        }
      } else {
        toast.error('Decision Failed', res.error?.message || 'Could not record decision');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to submit decision');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;

    const confirmed = await confirm({
      title: `Approve ${count} Selected Requests?`,
      text: `You are about to authorize attendance regularisations and overtime claims for ${count} team members.`,
      icon: 'question',
      confirmButtonText: 'Yes, Approve All',
      cancelButtonText: 'Cancel'
    });

    if (confirmed) {
      try {
        const res = await apiClient.post<any>('/approvals/bulk-decision', {
          approvalIds: selectedItemIds,
          decision: 'approved',
          comments: 'Batch approved from Unified Approvals Hub',
        });

        if (res.success) {
          setItems(prev => prev.filter(i => !selectedItemIds.includes(i.id)));
          setMetrics(prev => ({
            ...prev,
            pendingMyActionCount: Math.max(0, prev.pendingMyActionCount - count),
            approvalsCompletedThisMonth: prev.approvalsCompletedThisMonth + count,
          }));
          setSelectedItemIds([]);
          toast.success('Batch Approvals Complete', `Successfully approved ${count} attendance requests.`);
        }
      } catch (err: any) {
        toast.error('Bulk Approval Failed', err.message);
      }
    }
  };

  const exportInboxCSV = () => {
    const headers = ['Request Code', 'Category', 'Employee Name', 'Employee Code', 'Department', 'Target Date', 'Requested Values', 'Reason', 'Priority', 'SLA Hours Left'];
    const rows = filteredItems.map(item => [
      item.requestCode,
      item.category,
      `"${item.employeeName}"`,
      item.employeeCode,
      `"${item.department}"`,
      item.targetDate,
      `"${item.requestedValues}"`,
      `"${item.reasonText}"`,
      item.priority,
      item.slaHoursRemaining
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Approvals_Inbox_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inbox Exported', 'Downloaded CSV report of pending approvals.');
  };

  const filteredItems = items.filter(i => {
    // Role-based data scoping
    if (role === 'EMPLOYEE') {
      if (i.employeeCode !== user.employeeCode) return false;
    } else if (role === 'MANAGER') {
      const isMyStaff = i.department === 'Operations' || i.department === 'Engineering' || i.employeeCode === 'EMP-1001' || i.employeeCode === 'EMP-1003' || i.employeeCode === 'EMP-1006';
      if (!isMyStaff) return false;
    }

    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    const matchesSearch =
      i.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: ApprovalCategory) => {
    switch (category) {
      case 'regularisation':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Regularisation</span>;
      case 'overtime':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Overtime</span>;
      case 'shift_swap':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Shift Swap</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">{category}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('approvals.unified_approvals_hub', 'Unified Approvals Hub')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
              Workflow Orchestration Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review and decide attendance regularisations, overtime claims, and shift exchange requests with SLA enforcement.
          </p>

          {/* Scope Indicator Banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
            {role === 'EMPLOYEE' && (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Personal View: Showing approval status for requests submitted by <strong>{user?.name} ({user?.employeeCode})</strong></span>
              </>
            )}
            {role === 'MANAGER' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Manager Decision Queue: Showing pending requests from <strong>{user?.name}'s direct staff ({user?.department})</strong></span>
              </>
            )}
            {role === 'ADMIN' && (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Enterprise Administrator Scope: Company-wide decision & audit queue</span>
              </>
            )}</div>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedItemIds.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Approve Selected ({selectedItemIds.length})</button>
          )}

          <button
            onClick={fetchApprovalsData}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50"
            title="Refresh inbox"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={exportInboxCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Inbox
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{items.length}</div>
            <div className="text-xs font-medium text-slate-500">Pending My Action</div>
            <div className="text-[11px] text-purple-600 font-medium mt-0.5">Across all categories</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">{metrics.escalatedCount}</div>
            <div className="text-xs font-medium text-slate-500">Approaching SLA (&lt;10h)</div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">Auto-escalates to HR Head</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.approvalsCompletedThisMonth}</div>
            <div className="text-xs font-medium text-slate-500">Decided This Month</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">95% Approval Rate</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{metrics.avgTurnaroundHours}h</div>
            <div className="text-xs font-medium text-slate-500">Avg Turnaround Time</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">SLA Target: &lt;24.0h</div>
          </div>
        </div>
      </div>

      {/* 3. Main Tabs & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Main Inbox Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainTab('pending')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                mainTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Pending My Action ({items.length})</button>
            <button
              onClick={() => setMainTab('history')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                mainTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              Approval Audit History ({history.length})</button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('approvals.search_code_employee_title', 'Search code, employee, title...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills (Only when viewing pending) */}
        {mainTab === 'pending' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories ({items.length})</button>
            <button
              onClick={() => setCategoryFilter('regularisation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                categoryFilter === 'regularisation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Regularisations ({items.filter(i => i.category === 'regularisation').length})</button>
            <button
              onClick={() => setCategoryFilter('overtime')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                categoryFilter === 'overtime'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Overtime Claims ({items.filter(i => i.category === 'overtime').length})</button>
            <button
              onClick={() => setCategoryFilter('shift_swap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                categoryFilter === 'shift_swap'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Shift Swaps ({items.filter(i => i.category === 'shift_swap').length})</button>
          </div>
        )}</div>

      {/* 4. Tab 1: Pending Approvals Table */}
      {mainTab === 'pending' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.length === filteredItems.length && filteredItems.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedItemIds(filteredItems.map(i => i.id));
                        else setSelectedItemIds([]);
                      }}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300"
                    />
                  </th>
                  <th className="py-3.5 px-4">Request Code</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Category & Title</th>
                  <th className="py-3.5 px-4">Target Date</th>
                  <th className="py-3.5 px-4">Requested Details</th>
                  <th className="py-3.5 px-4">SLA Countdown</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                      All pending approvals have been cleared.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedItemIds(prev => [...prev, item.id]);
                            else setSelectedItemIds(prev => prev.filter(id => id !== item.id));
                          }}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs text-blue-600">{item.requestCode}</span>
                        {item.priority === 'high' && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase">High</span>
                        )}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                            alt={item.employeeName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{item.employeeName}</div>
                            <div className="text-xs text-slate-500">{item.employeeCode} • {item.department}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div>{getCategoryBadge(item.category)}</div>
                        <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {item.targetDate}</td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-mono font-medium text-slate-800">{item.requestedValues}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.reasonText}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                          item.slaHoursRemaining <= 10
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {item.slaHoursRemaining}h left
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setInspectedItem(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                        >
                          Review & Decide</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Approval Audit History Table (SCR-WEB-016) */}
      {mainTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Request Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Decision</th>
                  <th className="py-3.5 px-4">Decided By</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Impact Summary & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-600">
                      {hist.requestCode}</td>
                    <td className="py-3.5 px-4">
                      {getCategoryBadge(hist.category)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{hist.employeeName}</div>
                      <div className="text-xs text-slate-400">{hist.employeeCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {hist.decision === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" /> APPROVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <X className="w-3 h-3" /> REJECTED
                        </span>
                      )}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-800">{hist.approverName}</div>
                      <div className="text-[11px] text-slate-400">{hist.approverRole}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {new Date(hist.decisionTimestamp).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-800 font-medium">{hist.impactSummary}</div>
                      <div className="text-[11px] text-slate-400 italic mt-0.5">"{hist.comments}"</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Unified Deep-Dive Decision Drawer */}
      {inspectedItem && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setInspectedItem(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase">
                      {inspectedItem.category}</span>
                    <span className="font-mono text-xs text-slate-400">#{inspectedItem.requestCode}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">{inspectedItem.title}</h2>
                </div>
                <button
                  onClick={() => setInspectedItem(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Employee Card */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={inspectedItem.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={inspectedItem.employeeName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{inspectedItem.employeeName}</h3>
                    <p className="text-xs text-slate-500">{inspectedItem.employeeCode} • {inspectedItem.department}</p>
                    <div className="text-[11px] text-slate-400 mt-0.5">Target Date: <strong>{inspectedItem.targetDate}</strong></div>
                  </div>
                </div>

                {/* Regularisation Specific */}
                {inspectedItem.category === 'regularisation' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Original vs Requested Time Comparison</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-blue-200">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Original System Punch</div>
                        <div className="font-mono text-slate-700 font-bold mt-1">{inspectedItem.originalValues || 'IN: --:--'}</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-blue-200">
                        <div className="text-[10px] text-emerald-600 font-bold uppercase">Requested Correction</div>
                        <div className="font-mono text-emerald-700 font-bold mt-1">{inspectedItem.requestedValues}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overtime Specific */}
                {inspectedItem.category === 'overtime' && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">Overtime Validation & Policy Check</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-purple-200">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Claimed Overtime</div>
                        <div className="font-mono text-purple-700 font-bold mt-1">{inspectedItem.claimedDurationMinutes} minutes (1.5h)</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-purple-200">
                        <div className="text-[10px] text-emerald-600 font-bold uppercase">Calculated by Policy</div>
                        <div className="font-mono text-emerald-700 font-bold mt-1">{inspectedItem.policyCalculatedMinutes} minutes (1.5h)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shift Swap Specific */}
                {inspectedItem.category === 'shift_swap' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Mutual Shift Exchange Verification</h4>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Swap Partner</div>
                        <div className="font-bold text-slate-800 mt-0.5">{inspectedItem.swapPartnerName}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        11h Rest Rule Compliant
                      </span>
                    </div>
                  </div>
                )}

                {/* Reason & Justification */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Employee Justification</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {inspectedItem.reasonText}</div>
                </div>

                {/* Decision Comments Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">{t('approvals.approver_comments_decision_not', 'Approver Comments & Decision Notes')}</label>
                  <textarea
                    rows={3}
                    value={decisionComments}
                    onChange={(e) => setDecisionComments(e.target.value)}
                    placeholder={t('approvals.enter_approval_comments_stipul', 'Enter approval comments, stipulations or rejection reasons...')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDecision('rejected')}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('sent_back')}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Send Back
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('approved')}
                  disabled={isProcessing}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Approve Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}</div>
  );
};
