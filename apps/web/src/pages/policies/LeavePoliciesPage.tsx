import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Plus,
  ShieldCheck,
  Building2,
  Users,
  Coins,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Info,
  Sliders,
  DollarSign,
  Percent,
  RefreshCw,
  X,
  FileSpreadsheet,
  Check,
  Coffee,
  HelpCircle,
  Briefcase,
  Zap,
  Moon,
  Crown,
  FileText,
  Send,
  CalendarRange,
  Search,
  Trash2,
  Loader2,
  Edit
} from 'lucide-react';
import {
  UniversalLeaveTypeDefinitionDTO,
  ExecutiveAttendanceExemptionProfileDTO,
  LeaveBalanceRecordDTO
} from '@infi-timepro/shared-types';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useI18n } from '../../context/I18nContext.tsx';

interface LeaveApplicationRecord {
  id: string;
  requestCode: string;
  leaveType: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  isHalfDay: boolean;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
  appliedOn: string;
  approver: string;
}

export const LeavePoliciesPage: React.FC = () => {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const { toast, confirm } = useNotification();

  const isEmployee = role === 'EMPLOYEE';
  const isManager = role === 'MANAGER';
  const isAdmin = role === 'ADMIN';

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>(
    isEmployee ? 'my_balances' : isManager ? 'team_balances' : 'types'
  );

  const [leaveTypes, setLeaveTypes] = useState<UniversalLeaveTypeDefinitionDTO[]>([]);
  const [exemptionProfiles, setExemptionProfiles] = useState<ExecutiveAttendanceExemptionProfileDTO[]>([]);
  const [employeeBalances, setEmployeeBalances] = useState<LeaveBalanceRecordDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);

  // New Leave Type Form State
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState<'ANNUAL' | 'CASUAL' | 'SICK' | 'COMPENSATORY' | 'STATUTORY' | 'UNPAID'>('ANNUAL');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [newTypeQuota, setNewTypeQuota] = useState(12);
  const [newTypeAccrual, setNewTypeAccrual] = useState<'MONTHLY_PRO_RATA' | 'FRONT_LOADED' | 'WORK_DAYS_BASED'>('MONTHLY_PRO_RATA');
  const [newTypeBasis, setNewTypeBasis] = useState<'WORKING_DAYS' | 'CALENDAR_DAYS'>('WORKING_DAYS');
  const [newTypeAllowCF, setNewTypeAllowCF] = useState(true);
  const [newTypeMaxCF, setNewTypeMaxCF] = useState(15);
  const [newTypeAllowEncash, setNewTypeAllowEncash] = useState(false);
  const [newTypeDivisor, setNewTypeDivisor] = useState<26 | 30>(26);
  const [isSubmittingType, setIsSubmittingType] = useState(false);

  // New Exemption Profile Form State
  const [newProfName, setNewProfName] = useState('');
  const [newProfMode, setNewProfMode] = useState<'NEGATIVE_100_PERCENT_EXEMPT' | 'SINGLE_PUNCH_FULL_DAY_CREDIT' | 'CORE_HOURS_EXCEPTION_ONLY' | 'POSITIVE_STRICT_IN_OUT'>('NEGATIVE_100_PERCENT_EXEMPT');
  const [newProfDesc, setNewProfDesc] = useState('');
  const [newProfDesignations, setNewProfDesignations] = useState('');
  const [newProfDepartments, setNewProfDepartments] = useState('');
  const [newProfSinglePunchHours, setNewProfSinglePunchHours] = useState(8.0);
  const [newProfWaiveGrace, setNewProfWaiveGrace] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Leave Application Form State (For ESS)
  const [applyLeaveType, setApplyLeaveType] = useState('EL');
  const [applyStartDate, setApplyStartDate] = useState('2026-09-24');
  const [applyEndDate, setApplyEndDate] = useState('2026-09-25');
  const [applyHalfDay, setApplyHalfDay] = useState(false);
  const [applyReason, setApplyReason] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // 4. Employee Past Leave Applications (ESS)
  const [myApplications, setMyApplications] = useState<LeaveApplicationRecord[]>([
    {
      id: 'app-001',
      requestCode: 'LEV-2026-901',
      leaveType: 'Earned / Privilege Leave',
      leaveTypeCode: 'EL',
      startDate: '2026-08-14',
      endDate: '2026-08-15',
      daysCount: 2,
      isHalfDay: false,
      reason: 'Annual family holiday travel',
      status: 'approved',
      appliedOn: '2026-08-01',
      approver: 'Vikram Singh (Reporting Manager)'
    },
    {
      id: 'app-002',
      requestCode: 'LEV-2026-842',
      leaveType: 'Casual Leave',
      leaveTypeCode: 'CL',
      startDate: '2026-07-22',
      endDate: '2026-07-22',
      daysCount: 1,
      isHalfDay: false,
      reason: 'Personal home maintenance emergency',
      status: 'approved',
      appliedOn: '2026-07-20',
      approver: 'Vikram Singh (Reporting Manager)'
    },
    {
      id: 'app-003',
      requestCode: 'LEV-2026-710',
      leaveType: 'Sick / Medical Leave',
      leaveTypeCode: 'SL',
      startDate: '2026-06-10',
      endDate: '2026-06-10',
      daysCount: 1,
      isHalfDay: false,
      reason: 'Viral fever and doctor consultation',
      status: 'approved',
      appliedOn: '2026-06-10',
      approver: 'Vikram Singh (Reporting Manager)'
    }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesRes, profilesRes, balancesRes] = await Promise.all([
        apiClient.get<UniversalLeaveTypeDefinitionDTO[]>('/leaves/types'),
        apiClient.get<ExecutiveAttendanceExemptionProfileDTO[]>('/leaves/exemption-profiles'),
        apiClient.get<LeaveBalanceRecordDTO[]>('/leaves/balances')
      ]);

      if (typesRes.success && Array.isArray(typesRes.data)) {
        setLeaveTypes(typesRes.data);
      }
      if (profilesRes.success && Array.isArray(profilesRes.data)) {
        setExemptionProfiles(profilesRes.data);
      }
      if (balancesRes.success && Array.isArray(balancesRes.data)) {
        setEmployeeBalances(balancesRes.data);
      }
    } catch (err: any) {
      toast.error('Data Loading Failed', err.message || 'Could not fetch leave records from API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeCode.trim() || !newTypeName.trim()) {
      toast.error('Validation Error', 'Please specify both Leave Code and Policy Name.');
      return;
    }
    if (newTypeQuota < 0) {
      toast.error('Validation Error', 'Annual quota cannot be negative.');
      return;
    }

    setIsSubmittingType(true);
    const payload: UniversalLeaveTypeDefinitionDTO = {
      id: `lt-${Date.now()}`,
      tenantId: 'tenant-demo-001',
      code: newTypeCode.toUpperCase().trim(),
      name: newTypeName.trim(),
      category: newTypeCategory,
      description: newTypeDesc || 'Custom workplace leave policy.',
      color: newTypeCategory === 'ANNUAL' ? '#3B82F6' : newTypeCategory === 'SICK' ? '#F59E0B' : '#10B981',
      accrualMode: newTypeAccrual,
      annualEntitlementDays: newTypeQuota,
      accrualFrequency: newTypeAccrual === 'MONTHLY_PRO_RATA' ? 'MONTHLY' : 'ANNUAL',
      calculationBasis: newTypeBasis,
      allowHalfDay: true,
      allowQuarterDay: false,
      minConsecutiveDays: 0.5,
      maxConsecutiveDays: 30,
      allowCarryforward: newTypeAllowCF,
      maxCarryforwardDays: newTypeAllowCF ? newTypeMaxCF : 0,
      allowEncashment: newTypeAllowEncash,
      minRetentionDaysBeforeEncashment: 15,
      encashmentCalculationDivisor: newTypeDivisor,
      encashmentSalaryBasis: 'BASIC_ONLY',
      canClubWithLeaveTypes: ['EL', 'CL', 'SL'],
      enforceSandwichRule: false
    };

    try {
      const res = await apiClient.post('/leaves/types', payload);
      if (res.success) {
        toast.success('Leave Policy Type Created', `Policy "${payload.name}" (${payload.code}) was created successfully.`);
        setShowCreateTypeModal(false);
        setNewTypeCode('');
        setNewTypeName('');
        setNewTypeDesc('');
        loadData();
      } else {
        toast.error('Creation Failed', res.error?.message || 'Failed to create leave policy type.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'An error occurred while creating leave type.');
    } finally {
      setIsSubmittingType(false);
    }
  };

  const handleDeleteLeaveType = async (lt: UniversalLeaveTypeDefinitionDTO) => {
    const confirmed = await confirm({
      title: `Delete Leave Type: ${lt.name}?`,
      text: `Are you sure you want to permanently delete policy type "${lt.name}" (${lt.code})?`,
      confirmButtonText: 'Delete Policy Type',
      icon: 'delete',
      isDangerous: true
    });

    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/leaves/types/${lt.id}`);
      if (res.success) {
        toast.success('Leave Type Removed', `Policy type "${lt.name}" deleted successfully.`);
        setLeaveTypes(prev => prev.filter(t => t.id !== lt.id));
      } else {
        toast.error('Delete Failed', res.error?.message || 'Failed to remove leave type.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to delete leave type.');
    }
  };

  const handleCreateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) {
      toast.error('Validation Error', 'Profile Name is required.');
      return;
    }

    setIsSubmittingProfile(true);
    const desigs = newProfDesignations.split(',').map(s => s.trim()).filter(Boolean);
    const depts = newProfDepartments.split(',').map(s => s.trim()).filter(Boolean);

    const payload: ExecutiveAttendanceExemptionProfileDTO = {
      id: `exp-${Date.now()}`,
      tenantId: 'tenant-demo-001',
      profileName: newProfName.trim(),
      trackingMode: newProfMode,
      description: newProfDesc || 'Custom attendance exemption archetype.',
      allowMissingPunchTolerance: true,
      autoWaiveLatenessGrace: newProfWaiveGrace,
      autoCreditHoursOnSinglePunch: newProfSinglePunchHours,
      assignedDesignations: desigs.length ? desigs : ['Directors', 'Executives'],
      assignedDepartments: depts.length ? depts : ['Executive Leadership'],
      headcountCount: 12
    };

    try {
      const res = await apiClient.post('/leaves/exemption-profiles', payload);
      if (res.success) {
        toast.success('Exemption Profile Created', `Profile "${payload.profileName}" saved to database.`);
        setShowCreateProfileModal(false);
        setNewProfName('');
        setNewProfDesc('');
        loadData();
      } else {
        toast.error('Creation Failed', res.error?.message || 'Failed to create exemption profile.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'An error occurred while creating profile.');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleDeleteExemptionProfile = async (prof: ExecutiveAttendanceExemptionProfileDTO) => {
    const confirmed = await confirm({
      title: `Delete Profile: ${prof.profileName}?`,
      text: `Are you sure you want to remove executive exemption profile "${prof.profileName}"?`,
      confirmButtonText: 'Delete Profile',
      icon: 'delete',
      isDangerous: true
    });

    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/leaves/exemption-profiles/${prof.id}`);
      if (res.success) {
        toast.success('Profile Deleted', `Exemption profile "${prof.profileName}" removed.`);
        setExemptionProfiles(prev => prev.filter(p => p.id !== prof.id));
      } else {
        toast.error('Delete Failed', res.error?.message || 'Failed to remove profile.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to delete profile.');
    }
  };

  // Scoped Balances based on Role
  const scopedBalances = employeeBalances.filter(b => {
    if (role === 'EMPLOYEE') {
      return b.employeeCode === user.employeeCode || b.employeeId === 'emp-001';
    }
    if (role === 'MANAGER') {
      return b.department === 'Operations & Assembly' || b.department === 'Engineering';
    }
    return true;
  });

  // Encashment Calculator Form State
  const [encashBasicSalary] = useState(65000);
  const [encashDivisor] = useState<26 | 30>(26);
  const [encashRequestedDays, setEncashRequestedDays] = useState(8);
  const [encashRetentionGuard] = useState(15);

  const currentEmpBalance = scopedBalances.find(b => b.leaveTypeCode === 'EL') || scopedBalances[0] || {
    employeeName: 'Sarah Jenkins',
    employeeCode: 'EMP-1001',
    department: 'Engineering',
    leaveTypeCode: 'EL',
    availableBalance: 23.5
  };
  const maxEncashableDays = Math.max(0, currentEmpBalance.availableBalance - encashRetentionGuard);
  const eligibleEncashDays = Math.min(encashRequestedDays, maxEncashableDays);
  const retainedBalanceAfter = currentEmpBalance.availableBalance - eligibleEncashDays;
  const perDayRate = Math.round((encashBasicSalary / encashDivisor) * 100) / 100;
  const totalEncashPayout = Math.round(eligibleEncashDays * perDayRate);

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLeave(true);

    setTimeout(() => {
      const selectedTypeObj = leaveTypes.find(l => l.code === applyLeaveType);
      const newApp: LeaveApplicationRecord = {
        id: `app-${Date.now()}`,
        requestCode: `LEV-2026-${Math.floor(100 + Math.random() * 900)}`,
        leaveType: selectedTypeObj ? selectedTypeObj.name : applyLeaveType,
        leaveTypeCode: applyLeaveType,
        startDate: applyStartDate,
        endDate: applyEndDate,
        daysCount: applyHalfDay ? 0.5 : 2,
        isHalfDay: applyHalfDay,
        reason: applyReason,
        status: 'pending',
        appliedOn: new Date().toISOString().split('T')[0],
        approver: 'Vikram Singh (Reporting Manager)'
      };

      setMyApplications([newApp, ...myApplications]);
      setIsSubmittingLeave(false);
      setShowApplyLeaveModal(false);
      setApplyReason('');
      toast.success(
        'Leave Application Submitted',
        `Request #${newApp.requestCode} for ${newApp.daysCount} day(s) submitted to your reporting manager.`
      );
    }, 450);
  };

  const filteredLeaveTypes = leaveTypes.filter(lt => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return lt.name.toLowerCase().includes(q) || lt.code.toLowerCase().includes(q) || lt.category.toLowerCase().includes(q);
  });

  const filteredExemptionProfiles = exemptionProfiles.filter(prof => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return prof.profileName.toLowerCase().includes(q) || prof.trackingMode.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{isEmployee ? 'Employee Self-Service' : isManager ? 'Team Management' : 'Administration'}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">
              {isEmployee ? 'Leaves & Balances' : isManager ? 'Team Leaves & Quotas' : 'Leave Studio'}</span>
            <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              REST-API-CONNECTED
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {isEmployee
              ? 'My Leave Balances & Time-Off Portal'
              : isManager
              ? 'Team Leave Management & Workforce Balances'
              : 'Universal Leave & Executive Exemption Studio'}</h1>

          <p className="text-xs text-slate-500">
            {isEmployee
              ? 'View your personal accrued leave balances, apply for leaves, calculate encashment payouts, and track past applications.'
              : isManager
              ? 'Monitor direct staff leave balances for Operations & Assembly, review encashments, and check policy entitlements.'
              : 'Configure global statutory leave types, carryforward rules, encashment payout formulas, and executive attendance tracking archetypes.'}</p>

          {/* Scope Indicator Banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
            {isEmployee && (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Personal Portal: Logged in as <strong>{user.name} ({user.employeeCode})</strong> • {user.department}</span>
              </>
            )}
            {isManager && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Manager Scope: Direct staff in <strong>{user.department}</strong> supervised by <strong>{user.name}</strong></span>
              </>
            )}
            {isAdmin && (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Enterprise Administrator Scope: Global policy configuration & company-wide leave ledger</span>
              </>
            )}</div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm"
            title="Refresh leave data from API"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isEmployee && (
            <button
              onClick={() => setShowApplyLeaveModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}

          {isAdmin && activeTab === 'types' && (
            <button
              onClick={() => setShowCreateTypeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Leave Type</span>
            </button>
          )}

          {isAdmin && activeTab === 'exemptions' && (
            <button
              onClick={() => setShowCreateProfileModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exemption Profile</span>
            </button>
          )}

          {isAdmin && (
            <NavLink
              to="/policies/create"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Attendance Policy Builder</span>
            </NavLink>
          )}</div>
      </div>

      {/* Search Bar */}
      {(isAdmin || isManager) && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('policies.search_leave_policy_types_code', 'Search leave policy types, codes, or exemption profiles...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Live database connection active
          </span>
        </div>
      )}

      {/* Role-Specific Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {isEmployee ? (
          <>
            <button
              onClick={() => setActiveTab('my_balances')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'my_balances'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Leave Balances & Quota</span>
            </button>

            <button
              onClick={() => setActiveTab('encashment')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'encashment'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Leave Encashment Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('guidelines')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'guidelines'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Company Leave Entitlements</span>
            </button>
          </>
        ) : isManager ? (
          <>
            <button
              onClick={() => setActiveTab('team_balances')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'team_balances'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team Leave Balances ({scopedBalances.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('encashment')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'encashment'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Encashment Review Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('guidelines')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'guidelines'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Statutory Policy Rules</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('types')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'types'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Leave Types & Accrual Rules ({leaveTypes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('exemptions')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'exemptions'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Executive Attendance Exemptions ({exemptionProfiles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('encashment')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === 'encashment'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Workforce Balances & Encashment Studio</span>
            </button>
          </>
        )}</div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading leave policy parameters from API...</p>
        </div>
      ) : (
        <>
          {/* EMPLOYEE VIEW: Tab 1 — My Leave Balances & History */}
          {isEmployee && activeTab === 'my_balances' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Balance Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scopedBalances.map((bal, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        {bal.leaveTypeCode}</span>
                      <span className="text-[10px] font-semibold text-slate-500">FY 2026–27</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{bal.leaveTypeName}</h3>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold font-mono text-blue-600">{bal.availableBalance}</span>
                        <span className="text-xs font-semibold text-slate-500">Days Available</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Accrued this year:</span>
                        <span className="font-semibold text-slate-800">{bal.accruedDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carried forward:</span>
                        <span className="font-semibold text-slate-800">+{bal.carriedForwardDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used to date:</span>
                        <span className="font-semibold text-rose-600">{bal.usedDays} Days</span>
                      </div>
                    </div>
                  </div>
                ))}</div>

              {/* Leave Applications History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{t('policies.my_leave_applications_history', 'My Leave Applications History')}</h3>
                    <p className="text-xs text-slate-500">Track approved, pending, and past time-off requests.</p>
                  </div>

                  <button
                    onClick={() => setShowApplyLeaveModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Apply
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Request #</th>
                        <th className="py-3 px-4">Leave Type</th>
                        <th className="py-3 px-4">Date Range</th>
                        <th className="py-3 px-3 text-center">Duration</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Approver</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/75 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{app.requestCode}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{app.leaveType}</td>
                          <td className="py-3.5 px-4 text-slate-600">{app.startDate} → {app.endDate}</td>
                          <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-900">{app.daysCount} Day{app.daysCount > 1 ? 's' : ''}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{app.reason}</td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">{app.approver}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              app.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : app.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {app.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* READ-ONLY Policy Guidelines (For Employees & Managers) */}
          {((isEmployee || isManager) && activeTab === 'guidelines') && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t('policies.company_leave_entitlements_pol', 'Company Leave Entitlements & Policy Guidelines')}</h2>
                  <p className="text-xs text-slate-500">
                    Official statutory leave quotas, accrual rates, and carryforward allowances for your organization.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Read-Only Reference
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeaveTypes.map((lt) => (
                  <div
                    key={lt.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: lt.color }}></span>
                          <span className="font-mono font-bold text-xs text-blue-600">{lt.code}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                          {lt.category}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mb-1">{lt.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{lt.description}</p>

                      <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Accrual Mode:</span>
                          <span className="font-semibold text-slate-800">{lt.accrualMode.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Annual Quota:</span>
                          <span className="font-bold text-blue-600">{lt.annualEntitlementDays} Days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Carryforward Limit:</span>
                          <span className="font-semibold text-emerald-600">
                            {lt.allowCarryforward ? `Max ${lt.maxCarryforwardDays} Days` : 'Lapses at Year End'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Encashment Status:</span>
                          <span className="font-semibold text-indigo-600">
                            {lt.allowEncashment ? `Allowed (Statutory ${lt.encashmentCalculationDivisor || 26} Divisor)` : 'Not Encashable'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Enforced by InfiTimePro Rule Engine</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}</div>
            </div>
          )}

          {/* ADMIN TAB 1: Leave Types & Accrual Rules (With Edit & Delete Permissions) */}
          {isAdmin && activeTab === 'types' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t('policies.configured_leave_policy_types', 'Configured Leave Policy Types')}</h2>
                  <p className="text-xs text-slate-500">Statutory and company leave categories with accrual modes, carryforward caps, and encashment formulas.</p>
                </div>
                <button
                  onClick={() => setShowCreateTypeModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <Plus className="w-4 h-4" /> Create Leave Type
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeaveTypes.map((lt) => (
                  <div
                    key={lt.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: lt.color }}></span>
                          <span className="font-mono font-bold text-xs text-blue-600">{lt.code}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                          {lt.category}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mb-1">{lt.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{lt.description}</p>

                      <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Accrual Mode:</span>
                          <span className="font-semibold text-slate-800">{lt.accrualMode.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Annual Quota:</span>
                          <span className="font-bold text-blue-600">{lt.annualEntitlementDays} Days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Calculation Basis:</span>
                          <span className="font-semibold text-slate-800">{lt.calculationBasis.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Carryforward:</span>
                          <span className="font-semibold text-emerald-600">
                            {lt.allowCarryforward ? `Max ${lt.maxCarryforwardDays} Days` : 'Lapses at Year End'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Encashment:</span>
                          <span className="font-semibold text-indigo-600">
                            {lt.allowEncashment ? `Allowed (Divisor: ${lt.encashmentCalculationDivisor || 26})` : 'Not Encashable'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <button
                        onClick={() => handleDeleteLeaveType(lt)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => toast.info('Policy Editor', `Configured policy rules for ${lt.name}.`)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Edit Policy Rules</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}</div>
            </div>
          )}

          {/* ADMIN TAB 2: Executive Attendance Exemption Profiles */}
          {isAdmin && activeTab === 'exemptions' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t('policies.executive_attendance_exemption', 'Executive Attendance Exemption Profiles')}</h2>
                  <p className="text-xs text-slate-500">Assign specialized tracking archetypes (100% Negative Exemption, Single-Punch Full Day, Core Hours) across designations.</p>
                </div>
                <button
                  onClick={() => setShowCreateProfileModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <Plus className="w-4 h-4" /> Create Exemption Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExemptionProfiles.map((prof) => (
                  <div
                    key={prof.id}
                    className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                          <Crown className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{prof.profileName}</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {prof.headcountCount} Assigned
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">{prof.description}</p>

                    <div className="space-y-2 text-[11px] bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Tracking Strategy:</span>
                        <span className="font-mono font-semibold text-slate-800">{prof.trackingMode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Single Punch Full-Day Credit:</span>
                        <span className="font-bold text-emerald-600">{prof.autoCreditHoursOnSinglePunch} Hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Lateness Grace Waiver:</span>
                        <span className="font-semibold text-slate-800">{prof.autoWaiveLatenessGrace ? 'Automated 100%' : 'Standard Rule'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <button
                        onClick={() => handleDeleteExemptionProfile(prof)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => toast.info('Profile Manager', `Managing assignments for ${prof.profileName}.`)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Manage Designation Assignments</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}</div>
            </div>
          )}

          {/* ENCASHMENT & BALANCES TAB (Shared across all roles with Scoped Data) */}
          {(activeTab === 'encashment' || activeTab === 'team_balances') && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 Columns: Encashment Calculator */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <Coins className="w-5 h-5" />
                      <h3 className="font-bold text-slate-900">
                        {isEmployee ? 'My Leave Encashment Calculator' : 'Statutory Leave Encashment Calculator'}</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      {isEmployee
                        ? 'Calculate eligible payout from your available Earned Leave (EL) balance according to statutory labour formulas.'
                        : 'Universal formula engine applying statutory 26-day working divisor for India/APAC or 30-day calendar divisor for Middle East.'}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t('policies.employee_in_scope', 'Employee in Scope')}</label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{currentEmpBalance.employeeName}</span>
                          <span className="text-slate-400 block text-[10px]">{currentEmpBalance.employeeCode} • {currentEmpBalance.department}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold font-mono text-xs">
                          {currentEmpBalance.availableBalance} Days Available
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">{t('policies.days_to_encash', 'Days to Encash')}</label>
                        <input
                          type="number"
                          max={maxEncashableDays}
                          min={1}
                          value={encashRequestedDays}
                          onChange={(e) => setEncashRequestedDays(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">{t('policies.min_retention_threshold', 'Min Retention Threshold')}</label>
                        <input
                          type="number"
                          disabled
                          value={encashRetentionGuard}
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Live Encashment Result Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-3 shadow-md">
                      <div className="flex items-center justify-between text-xs text-indigo-300">
                        <span>Calculated Encashment Payout</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-800/80 font-bold">
                          {eligibleEncashDays} Days Eligible
                        </span>
                      </div>

                      <div className="text-3xl font-extrabold font-mono text-emerald-400">
                        ₹{totalEncashPayout.toLocaleString()}</div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-700">
                        <div>
                          <span className="text-slate-400 block">Per Day Rate:</span>
                          <span className="font-mono font-bold">₹{perDayRate.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Retained in Bank:</span>
                          <span className="font-mono font-bold text-amber-300">{retainedBalanceAfter} Days</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                        Formula: (₹{encashBasicSalary.toLocaleString()} ÷ {encashDivisor} days) × {eligibleEncashDays} eligible days. Retains {retainedBalanceAfter} days exceeding min threshold ({encashRetentionGuard} days).
                      </p>

                      <button
                        disabled={eligibleEncashDays <= 0}
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: `Confirm Leave Encashment Request?`,
                            text: `Apply to encash ${eligibleEncashDays} days of Earned Leave (${currentEmpBalance.leaveTypeCode}) for ₹${totalEncashPayout.toLocaleString()} net credit?`,
                            icon: 'question',
                            confirmButtonText: 'Yes, Submit Encashment Claim',
                            cancelButtonText: 'Cancel'
                          });
                          if (confirmed) {
                            toast.success(
                              'Encashment Application Lodged',
                              `Encashment request for ₹${totalEncashPayout.toLocaleString()} (${eligibleEncashDays} days) queued for Payroll cycle processing.`
                            );
                          }
                        }}
                        className={`w-full mt-2 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                          eligibleEncashDays > 0
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-4 h-4" /> Submit Encashment Application (₹{totalEncashPayout.toLocaleString()})</button>
                    </div>
                  </div>
                </div>

                {/* Right 7 Columns: Employee Leave Balance Ledger */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {isEmployee ? 'My Leave Ledger & Balances' : isManager ? 'Operations & Assembly Leave Ledger' : 'Workforce Leave Balances Ledger'}</h3>
                        <p className="text-xs text-slate-500">Live accrual accumulation, carryforwards, and encashable balances.</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        FY 2026–27
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-3">Leave Type</th>
                            <th className="py-3 px-3 text-center">Accrued</th>
                            <th className="py-3 px-3 text-center">Carried Over</th>
                            <th className="py-3 px-3 text-center">Used</th>
                            <th className="py-3 px-3 text-center font-bold text-blue-600">Available</th>
                            <th className="py-3 px-4 text-right font-bold text-emerald-600">Encashable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {scopedBalances.map((rec, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/75 transition">
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                <div>{rec.employeeName}</div>
                                <div className="text-[10px] font-normal text-slate-400">{rec.employeeCode} • {rec.department}</div>
                              </td>
                              <td className="py-3 px-3 font-medium text-slate-700">
                                <span className="font-mono font-bold text-blue-600 mr-1.5">{rec.leaveTypeCode}</span>
                                {rec.leaveTypeName}</td>
                              <td className="py-3 px-3 text-center font-mono">{rec.accruedDays}</td>
                              <td className="py-3 px-3 text-center font-mono text-slate-500">+{rec.carriedForwardDays}</td>
                              <td className="py-3 px-3 text-center font-mono text-rose-600">{rec.usedDays}</td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-blue-600 bg-blue-50/30">
                                {rec.availableBalance}</td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                                {rec.encashableBalance > 0 ? `${rec.encashableBalance} Days` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing active statutory leave quotas</span>
                    <button
                      onClick={() => toast.info('Export Initiated', 'Generating Leave Balances Ledger in Excel (XLSX) format...')}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {t('policies.exportBalancesXlsx', 'Export Balances (XLSX)')}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE LEAVE TYPE MODAL */}
      {showCreateTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t('policies.create_statutory_leave_policy_', 'Create Statutory Leave Policy Type')}</h3>
                  <p className="text-xs text-slate-500">Define accrual frequencies, entitlement quotas, and encashment rules</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTypeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTypeSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('policies.leave_code_e_g_ml_pl', 'Leave Code (e.g. ML, PL)')}</label>
                  <input
                    type="text"
                    value={newTypeCode}
                    onChange={(e) => setNewTypeCode(e.target.value)}
                    placeholder={t('policies.e_g_ml', 'e.g. ML')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('policies.category', 'Category')}</label>
                  <select
                    value={newTypeCategory}
                    onChange={(e) => setNewTypeCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ANNUAL">ANNUAL</option>
                    <option value="CASUAL">CASUAL</option>
                    <option value="SICK">SICK</option>
                    <option value="COMPENSATORY">COMPENSATORY</option>
                    <option value="STATUTORY">STATUTORY</option>
                    <option value="UNPAID">UNPAID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('policies.policy_type_name', 'Policy Type Name')}</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder={t('policies.e_g_maternity_leave_ml', 'e.g. Maternity Leave (ML)')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('policies.policy_description', 'Policy Description')}</label>
                <textarea
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  rows={2}
                  placeholder={t('policies.describe_entitlement_rules_doc', 'Describe entitlement rules, documentation requirement, or eligibility criteria...')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('policies.annual_quota_days', 'Annual Quota (Days)')}</label>
                  <input
                    type="number"
                    min={0}
                    value={newTypeQuota}
                    onChange={(e) => setNewTypeQuota(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('policies.accrual_mode', 'Accrual Mode')}</label>
                  <select
                    value={newTypeAccrual}
                    onChange={(e) => setNewTypeAccrual(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MONTHLY_PRO_RATA">Monthly Pro-Rata</option>
                    <option value="FRONT_LOADED">Front-Loaded (Jan 1st)</option>
                    <option value="WORK_DAYS_BASED">Work-Days Based</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="allowCF"
                    checked={newTypeAllowCF}
                    onChange={(e) => setNewTypeAllowCF(e.target.checked)}
                    className="rounded text-blue-600 border-slate-300"
                  />
                  <label htmlFor="allowCF" className="font-semibold text-slate-700">{t('policies.allow_carryforward', 'Allow Carryforward')}</label>
                </div>
                {newTypeAllowCF && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('policies.max_carryforward_days', 'Max Carryforward Days')}</label>
                    <input
                      type="number"
                      value={newTypeMaxCF}
                      onChange={(e) => setNewTypeMaxCF(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono"
                    />
                  </div>
                )}</div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTypeModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('action.cancel', 'Cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmittingType}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmittingType ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Leave Policy Type</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXEMPTION PROFILE MODAL */}
      {showCreateProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t('policies.create_executive_exemption_pro', 'Create Executive Exemption Profile')}</h3>
                  <p className="text-xs text-slate-500">Configure attendance waivers, core-hours exceptions, or single-punch rules</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateProfileModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProfileSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('policies.profile_name', 'Profile Name')}</label>
                <input
                  type="text"
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  placeholder={t('policies.e_g_regional_vp_advisory_board', 'e.g. Regional VP & Advisory Board Exemption')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('policies.tracking_archetype_strategy', 'Tracking Archetype Strategy')}</label>
                <select
                  value={newProfMode}
                  onChange={(e) => setNewProfMode(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NEGATIVE_100_PERCENT_EXEMPT">100% Negative Exemption (Zero Swipes Required)</option>
                  <option value="SINGLE_PUNCH_FULL_DAY_CREDIT">Single-Punch Full-Day Credit (8.0 Hours)</option>
                  <option value="CORE_HOURS_EXCEPTION_ONLY">Core-Hours Exception Only (11:00 AM - 3:30 PM)</option>
                  <option value="POSITIVE_STRICT_IN_OUT">Positive Strict IN/OUT Gatepass Pairing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('policies.profile_description', 'Profile Description')}</label>
                <textarea
                  value={newProfDesc}
                  onChange={(e) => setNewProfDesc(e.target.value)}
                  rows={2}
                  placeholder={t('policies.explain_why_this_role_is_exemp', 'Explain why this role is exempt from standard turnstile punctuality rules...')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('policies.assigned_designations_comma_se', 'Assigned Designations (Comma-separated)')}</label>
                <input
                  type="text"
                  value={newProfDesignations}
                  onChange={(e) => setNewProfDesignations(e.target.value)}
                  placeholder={t('policies.chief_executive_officer_vice_p', 'Chief Executive Officer, Vice President, Partner')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateProfileModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('action.cancel', 'Cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmittingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Exemption Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY LEAVE MODAL (For Employees) */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t('policies.apply_for_leave_time_off', 'Apply for Leave / Time-Off')}</h3>
                  <p className="text-xs text-slate-500">Submit a formal time-off application for manager approval</p>
                </div>
              </div>
              <button
                onClick={() => setShowApplyLeaveModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('policies.leave_category', 'Leave Category')}</label>
                <select
                  value={applyLeaveType}
                  onChange={(e) => setApplyLeaveType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EL">Earned / Privilege Leave (EL) — 23.5 Days Available</option>
                  <option value="CL">Casual Leave (CL) — 7.0 Days Available</option>
                  <option value="SL">Sick / Medical Leave (SL) — 16.0 Days Available</option>
                  <option value="COMP_OFF">Compensatory Off (Comp-Off) — 2.0 Days Available</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('policies.start_date', 'Start Date')}</label>
                  <input
                    type="date"
                    value={applyStartDate}
                    onChange={(e) => setApplyStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('policies.end_date', 'End Date')}</label>
                  <input
                    type="date"
                    value={applyEndDate}
                    onChange={(e) => setApplyEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halfDayCheck"
                  checked={applyHalfDay}
                  onChange={(e) => setApplyHalfDay(e.target.checked)}
                  className="rounded text-blue-600 border-slate-300"
                />
                <label htmlFor="halfDayCheck" className="text-xs font-semibold text-slate-700">{t('policies.apply_for_half_day_first_half_', 'Apply for Half-Day (First Half / Second Half)')}</label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('policies.reason_for_time_off', 'Reason for Time-Off')}</label>
                <textarea
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  rows={3}
                  placeholder={t('policies.e_g_annual_family_holiday_trip', 'e.g., Annual family holiday trip, medical consultation, personal matters.')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('action.cancel', 'Cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmittingLeave ? 'Submitting...' : 'Submit Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
