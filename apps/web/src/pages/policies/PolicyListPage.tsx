import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Edit,
  Loader2,
  Building,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AttendancePolicyDTO } from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient.ts';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import { encodeSecureToken } from '../../utils/routeSecurity.ts';

export const PolicyListPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast, confirm } = useNotification();
  const [policies, setPolicies] = useState<AttendancePolicyDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<AttendancePolicyDTO[]>('/policies');
      if (res.success && Array.isArray(res.data)) {
        setPolicies(res.data);
      } else {
        toast.error('Failed to load policies', res.error?.message || 'Server returned invalid format');
      }
    } catch (err: any) {
      toast.error('Error fetching policies', err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleDeletePolicy = async (policy: AttendancePolicyDTO) => {
    const confirmed = await confirm({
      title: `Delete Policy: ${policy.name}?`,
      text: `Are you sure you want to permanently remove "${policy.name}" (${policy.code})? This will unassign any active rules associated with it.`,
      confirmButtonText: 'Delete Policy',
      icon: 'delete',
      isDangerous: true,
    });

    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/policies/${policy.id}`);
      if (res.success) {
        toast.success('Policy Deleted', `Policy "${policy.name}" was successfully removed.`);
        setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
      } else {
        toast.error('Delete Failed', res.error?.message || 'Failed to delete policy.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to delete policy.');
    }
  };

  const filteredPolicies = policies.filter((pol) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      pol.name.toLowerCase().includes(q) ||
      pol.code.toLowerCase().includes(q) ||
      pol.description.toLowerCase().includes(q) ||
      pol.assignedLocations.some((l) => l.toLowerCase().includes(q)) ||
      pol.assignedDepartments.some((d) => d.toLowerCase().includes(q))
    );
  });

  const activeCount = policies.filter((p) => p.status === 'active').length;
  const defaultCount = policies.filter((p) => p.isDefault).length;
  const overrideCount = Math.max(0, activeCount - defaultCount);
  const avgGrace =
    policies.length > 0
      ? Math.round(policies.reduce((acc, p) => acc + (p.rules?.graceInMinutes || 0), 0) / policies.length)
      : 15;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Policy Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <NavLink
          to="/policies"
          className={({ isActive }) =>
            `flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all ${
              isActive
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <Clock className="w-4 h-4" />
          <span>Attendance & Overtime Policies ({policies.length})</span>
        </NavLink>

        <NavLink
          to="/policies/leaves"
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Leave Types & Accrual Rules</span>
        </NavLink>

        <NavLink
          to="/policies/leaves"
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Executive Attendance Exemptions</span>
        </NavLink>
      </div>

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Attendance Policies</span>
            <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              REST-API-CONNECTED
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('policies.attendance_policies', 'Attendance Policies')}</h1>
          <p className="text-xs text-slate-500">
            Define daily work requirements, arrival grace rules, sandwich penalties, and overtime qualification criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPolicies}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm"
            title="Refresh policies from API"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <NavLink
            to="/policies/leaves"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <span>Leave & Exemption Studio</span>
          </NavLink>

          <NavLink
            to="/policies/create"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Policy</span>
          </NavLink>
        </div>
      </div>

      {/* Policy Statistics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Configured Policies</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount} Active</p>
          <p className="text-[11px] text-blue-600 font-medium">
            {defaultCount} Global Default &bull; {overrideCount} Departmental Overrides
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Average Grace Period</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{avgGrace} mins</p>
          <p className="text-[11px] text-slate-400">Late arrival tolerance window</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Policy Version Control</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">Effective-Dated</p>
          <p className="text-[11px] text-slate-400">Zero retroactive corruption</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('policies.search_policies_by_code_name_d', 'Search policies by code, name, department, or location...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredPolicies.length} of {policies.length} policies
        </span>
      </div>

      {/* Policy Cards Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading attendance policies from database...</p>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No Policies Found</p>
          <p className="text-xs text-slate-500">
            {searchQuery ? `No policy matches query "${searchQuery}".` : 'No attendance policies currently configured.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {filteredPolicies.map((pol) => {
            const rules = pol.rules || ({} as any);
            const fullDayHours = rules.fullDayThresholdMinutes
              ? `${Math.floor(rules.fullDayThresholdMinutes / 60)}h ${rules.fullDayThresholdMinutes % 60 ? rules.fullDayThresholdMinutes % 60 + 'm' : '00m'}`
              : '8h 00m';

            return (
              <div
                key={pol.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{pol.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">{pol.code}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                            {pol.version}</span>
                        </div>
                      </div>
                    </div>
                    {pol.isDefault && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                        Default
                      </span>
                    )}</div>

                  <p className="text-xs text-slate-600 line-clamp-2">{pol.description}</p>

                  <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Grace In Window</span>
                      <span className="font-bold text-slate-800">{rules.graceInMinutes ?? 15} mins</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Full-Day Threshold</span>
                      <span className="font-bold text-slate-800">{fullDayHours}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Min Overtime Threshold</span>
                      <span className="font-bold text-slate-800">
                        {rules.otMinQualificationMinutes ? `${rules.otMinQualificationMinutes} mins` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">WFH Allowance</span>
                      <span className="font-bold text-slate-800">{rules.wfhAllowedDaysPerMonth ?? 0} days/mo</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500">
                    <p>
                      <span className="font-semibold text-slate-700">Locations:</span>{' '}
                      {pol.assignedLocations?.join(', ') || 'All'}</p>
                    <p>
                      <span className="font-semibold text-slate-700">Departments:</span>{' '}
                      {pol.assignedDepartments?.join(', ') || 'All'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {pol.effectiveFrom} – {pol.effectiveTo}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeletePolicy(pol)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <NavLink
                      to={`/policies/edit/${encodeSecureToken(pol.id)}`}
                      className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Edit Policy</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}</div>
      )}</div>
  );
};
