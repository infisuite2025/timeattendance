import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  TabletSmartphone,
  CheckCircle2,
  FileText,
  UserCheck,
  Edit2,
  X,
  Save,
  Check,
  User,
  Layers,
  History,
  AlertCircle,
  Plus,
  Laptop,
  Award,
  Download,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { EmployeeDetailDTO } from '@infi-timepro/shared-types';
import { useI18n } from '../../context/I18nContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { decodeSecureToken, encodeSecureToken, validateAttendanceDetailAccess } from '../../utils/routeSecurity.ts';

export const EmployeeDetailPage: React.FC = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useNotification();

  const rawTargetId = decodeSecureToken(id || 'emp_naresh_001');
  const accessCheck = validateAttendanceDetailAccess(role, user.employeeCode, rawTargetId);

  if (!accessCheck.allowed) {
    const landingPath =
      role === 'EMPLOYEE' ? '/attendance/my' :
      role === 'MANAGER' ? '/attendance/team' :
      role === 'SUPER_ADMIN' ? '/admin/tenants' : '/attendance/live';

    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl space-y-4 text-rose-900 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-rose-950">🚨 ACCESS DENIED: Security Guard Intercepted</h2>
              <p className="text-xs text-rose-700 font-medium">Unauthorized Employee Profile Access Attempt (IDOR & Scope Guard)</p>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-rose-100 text-xs space-y-2.5">
            <p className="font-semibold text-slate-800">{accessCheck.reason}</p>
            <p className="text-slate-500">
              Your active session persona (<span className="font-bold text-slate-900">{role}</span> - {user.email}) is restricted by tenant role isolation policies from inspecting profile records for worker ID <span className="font-mono font-bold text-rose-700">{rawTargetId}</span>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => navigate(landingPath)}
              className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Permitted Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'shifts' | 'devices' | 'hr' | 'audit'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignShiftModal, setShowAssignShiftModal] = useState(false);
  const [saveSuccessAlert, setSaveSuccessAlert] = useState<string | null>(null);

  const [employeeData, setEmployeeData] = useState<EmployeeDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields fallback
  const [employee, setEmployee] = useState({
    id: rawTargetId,
    code: 'TP0001',
    name: 'Naresh Andukoori',
    status: 'Active',
    designation: 'Principal Systems Administrator',
    department: 'Human Resources',
    email: 'naresh@company.com',
    phone: '+91 9876543210',
    location: 'Hyderabad Main Office',
    legalEntity: 'ACME Corporation Global',
    reportingManager: 'Naresh Andukoori (TP0001)',
    joiningDate: '01 Jan 2020',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop',
    overtimeEligible: true,
    maxOtHoursPerDay: 4,
    remoteWorkPolicy: 'Allowed (2 Days/Week)',
    biometricCardId: 'BIO-EMP-001',
    faceToken: 'FT-99482-HYD',
    deviceModel: 'Apple iPhone 15 Pro',
    deviceUuid: 'a8b9c7-4421-9988',
    geofenceEnabled: true
  });

  const loadEmployee = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<EmployeeDetailDTO>(`/employees/${rawTargetId}`);
      if (res.data) {
        setEmployeeData(res.data);
        setEmployee(prev => ({
          ...prev,
          id: res.data!.id,
          code: res.data!.employeeCode,
          name: res.data!.fullName,
          status: res.data!.employmentStatus === 'active' ? 'Active' : res.data!.employmentStatus || 'Active',
          designation: res.data!.jobTitle,
          department: res.data!.departmentName,
          email: res.data!.email,
          phone: res.data!.phoneNumber || prev.phone,
          location: res.data!.locationName,
          joiningDate: res.data!.joiningDate || prev.joiningDate,
          avatarUrl: res.data!.avatarUrl || prev.avatarUrl,
          biometricCardId: res.data!.biometricId || prev.biometricCardId
        }));
      }
    } catch {
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [id]);

  // Edit Form Temporary State
  const [editForm, setEditForm] = useState({ ...employee });

  // Shift Assignments State
  const [shifts, setShifts] = useState([
    {
      name: 'General Shift (GS)',
      timing: '09:00 AM – 06:00 PM',
      from: '01 Jan 2025',
      to: '31 Dec 2025',
      status: 'Active'
    }
  ]);

  const [newShiftName, setNewShiftName] = useState('Morning Shift (MS)');
  const [newShiftFrom, setNewShiftFrom] = useState('2026-10-01');
  const [newShiftTo, setNewShiftTo] = useState('2026-12-31');

  // Audit Records State
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'aud-001',
      action: 'Biometric Face Token Enrolled',
      performedBy: 'Anita Desai (HR Security Lead)',
      timestamp: '14 Sep 2026, 11:20 AM',
      details: 'Face token FT-99482-HYD registered to turnstile biometric gate BIO-01.'
    },
    {
      id: 'aud-002',
      action: 'Shift Roster Assigned',
      performedBy: 'Naresh Andukoori (CTO)',
      timestamp: '01 Sep 2026, 09:00 AM',
      details: 'Assigned General Shift (09:00 AM - 06:00 PM) effective from 01 Jan 2025.'
    },
    {
      id: 'aud-003',
      action: 'Mobile Device Authorized',
      performedBy: 'System Security Gateway',
      timestamp: '15 Aug 2026, 04:35 PM',
      details: 'Authorized Apple iPhone 15 Pro (UUID: a8b9c7-4421-9988) with Geofence Punch.'
    }
  ]);

  const handleOpenEditModal = () => {
    setEditForm({ ...employee });
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.put<EmployeeDetailDTO>(`/employees/${employee.id}`, editForm);
      if (res.data) {
        setEmployee(prev => ({
          ...prev,
          name: res.data!.fullName,
          designation: res.data!.jobTitle,
          department: res.data!.departmentName,
          location: res.data!.locationName,
          email: res.data!.email,
          phone: res.data!.phoneNumber || editForm.phone,
          status: res.data!.employmentStatus === 'active' ? 'Active' : res.data!.employmentStatus || 'Active'
        }));
        setShowEditModal(false);

        const newAudit = {
          id: `aud-${Date.now().toString(36)}`,
          action: 'Employee Profile Updated',
          performedBy: 'Naresh Andukoori (Administrator)',
          timestamp: new Date().toLocaleString(),
          details: `Updated designation to ${editForm.designation}, department to ${editForm.department}, phone to ${editForm.phone}.`
        };
        setAuditLogs([newAudit, ...auditLogs]);

        setSaveSuccessAlert('Employee profile updated in database successfully!');
        setTimeout(() => setSaveSuccessAlert(null), 3500);
      } else {
        toast.error(res.error?.message || 'Failed to update employee profile');
      }
    } catch {
      toast.error('Error updating employee profile');
    }
  };

  const handleAssignShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignedShift = {
      name: newShiftName,
      timing: newShiftName.includes('Morning') ? '07:00 AM – 04:00 PM' : '02:00 PM – 11:00 PM',
      from: newShiftFrom,
      to: newShiftTo,
      status: 'Active'
    };
    setShifts([newAssignedShift, ...shifts]);
    setShowAssignShiftModal(false);

    setSaveSuccessAlert(`Assigned "${newShiftName}" to employee.`);
    setTimeout(() => setSaveSuccessAlert(null), 3500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600 font-medium">Loading Employee Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <NavLink to="/employees" className="hover:text-blue-600">Employees</NavLink>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Worker Profile</span>
            <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              {employee.code}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('employees.employee_attendance_profile', 'Employee Attendance Profile')}</h1>
          <p className="text-xs text-slate-500">
            View workforce details, active shift rosters, biometric terminal enrollments, and policy assignments.
          </p>
        </div>

        <NavLink
          to="/employees"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </NavLink>
      </div>

      {/* Success Alert Banner */}
      {saveSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{saveSuccessAlert}</span>
          </div>
          <button onClick={() => setSaveSuccessAlert(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Employee Profile Hero Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <img
              src={employee.avatarUrl}
              alt={employee.name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-blue-50"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {employee.status}</span>
              </div>
              <p className="text-sm font-semibold text-slate-600">{employee.designation} &bull; {employee.code}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {employee.email}</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {employee.phone}</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {employee.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>

            <NavLink
              to={`/attendance/day-detail/${encodeSecureToken(employee.code || rawTargetId)}`}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              View Attendance
            </NavLink>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview & Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === 'shifts' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Shift & Roster Assignments ({shifts.length})</button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === 'devices' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Biometric & Devices
          </button>
          <button
            onClick={() => setActiveTab('hr')}
            className={`rounded-xl px-4 py-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'hr' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>HR Compliance & Assets</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
              Add-on
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === 'audit' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Audit History ({auditLogs.length})</button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-in fade-in duration-150">
          {/* Org Hierarchy Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              Organizational Hierarchy
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Legal Entity</span>
                <span className="font-semibold text-slate-900">{employee.legalEntity}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-900">{employee.department}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Assigned Branch / Site</span>
                <span className="font-semibold text-slate-900">{employee.location}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Reporting Manager</span>
                <span className="font-semibold text-blue-600">{employeeData?.reportingManagerName || employee.reportingManager}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Joining Date</span>
                <span className="font-semibold text-slate-900">{employee.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Attendance Performance Metrics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Monthly Attendance Performance (Sep 2026)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-100">
                <p className="text-xl font-extrabold text-emerald-700">
                  {employeeData?.attendanceSummary?.presentDays ?? 20}</p>
                <p className="text-[10px] font-semibold text-emerald-600">Present Days</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100">
                <p className="text-xl font-extrabold text-amber-700">
                  {employeeData?.attendanceSummary?.lateDays ?? 2}</p>
                <p className="text-[10px] font-semibold text-amber-600">Late Days</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-100">
                <p className="text-xl font-extrabold text-blue-700">
                  {employeeData?.attendanceSummary?.totalHours || '168h 30m'}</p>
                <p className="text-[10px] font-semibold text-blue-600">Total Hours</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Overtime Policy</span>
                <span className="font-semibold text-emerald-600">
                  {employee.overtimeEligible ? `Eligible (Max ${employee.maxOtHoursPerDay}h/day)` : 'Exempt'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Remote Work Policy</span>
                <span className="font-semibold text-blue-600">{employee.remoteWorkPolicy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shift Assignments */}
      {activeTab === 'shifts' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('employees.current_scheduled_shifts', 'Current & Scheduled Shifts')}</h3>
              <p className="text-xs text-slate-500">Active working hours and shift group assignment horizon.</p>
            </div>
            <button
              onClick={() => setShowAssignShiftModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Assign Shift
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Shift Name</th>
                  <th className="px-4 py-3">Timing</th>
                  <th className="px-4 py-3">Effective From</th>
                  <th className="px-4 py-3">Effective To</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((sh, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/75 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{sh.name}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{sh.timing}</td>
                    <td className="px-4 py-3.5 text-slate-600">{sh.from}</td>
                    <td className="px-4 py-3.5 text-slate-600">{sh.to}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        {sh.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Biometric & Devices */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <TabletSmartphone className="h-5 w-5" />
              <h3 className="text-sm font-bold text-slate-900">{t('employees.registered_hardware_terminals', 'Registered Hardware Terminals')}</h3>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">BIO-01 (Hyderabad HQ Main)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Linked</span>
              </div>
              <p className="text-slate-500">Biometric Card ID: <span className="font-mono font-medium text-slate-800">{employee.biometricCardId}</span></p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">FR-01 (Face Recognition Turnstile)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Linked</span>
              </div>
              <p className="text-slate-500">Face Token: <span className="font-mono font-medium text-slate-800">{employee.faceToken}</span></p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-sm font-bold text-slate-900">{t('employees.mobile_device_authorization', 'Mobile Device Authorization')}</h3>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{employee.deviceModel}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Trusted</span>
              </div>
              <p className="text-slate-500">Device UUID: <span className="font-mono text-[11px] text-slate-700">{employee.deviceUuid}</span></p>
              <p className="text-slate-500">
                Geofence Punch: <span className="font-semibold text-emerald-600">{employee.geofenceEnabled ? 'Enabled' : 'Disabled'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: HR Compliance & Allocated Assets (Add-on) */}
      {activeTab === 'hr' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allocated Assets Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Laptop className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-slate-900">{t('employees.allocated_it_company_assets', 'Allocated IT & Company Assets')}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  HR Asset Hub
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">MacBook Pro 16" M3 Max</span>
                    <span className="font-mono text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border">
                      AST-LT-1042
                    </span>
                  </div>
                  <p className="text-slate-500">Serial: C02G9988MD6P • Space Black (36GB / 1TB SSD)</p>
                  <p className="text-[11px] text-slate-400">Allocated: 16 Feb 2024 • Warranty until 2027</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Dell UltraSharp 32" 4K USB-C Hub</span>
                    <span className="font-mono text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border">
                      AST-MON-0881
                    </span>
                  </div>
                  <p className="text-slate-500">Serial: CN-098K41 • 90W Power Delivery Hub</p>
                  <p className="text-[11px] text-slate-400">Allocated: 16 Feb 2024 • Location: Bengaluru R&D</p>
                </div>
              </div>
            </div>

            {/* Compliance Documents Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-slate-900">{t('employees.verified_compliance_vault', 'Verified Compliance Vault')}</h3>
                </div>
                <NavLink
                  to="/hr"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Manage in HR Hub &rarr;
                </NavLink>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">National Passport Credentials</span>
                    <span className="text-[11px] text-slate-500">Doc #: P-98472910A • Verified</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Expiring (31d)</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Executive Employment Agreement</span>
                    <span className="text-[11px] text-slate-500">Executed & Digitally Counter-signed</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Lifetime Valid
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit History */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">{t('employees.immutable_employee_profile_aud', 'Immutable Employee Profile Audit Trail')}</h3>
          </div>
          <p className="text-xs text-slate-500">Chronological history of biometric enrollments, policy adjustments, and profile changes.</p>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-medium text-slate-400">&bull; {log.timestamp}</span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                  <p className="text-[11px] text-slate-400">Actor: {log.performedBy}</p>
                </div>
              </div>
            ))}</div>
        </div>
      )}

      {/* Edit Profile Slide-Over / Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t('employees.edit_employee_profile', 'Edit Employee Profile')}</h3>
                  <p className="text-xs text-slate-500">Update worker metadata, reporting line, and policy parameters.</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.full_name', 'Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.designation', 'Designation')}</label>
                  <input
                    type="text"
                    required
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.department', 'Department')}</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Product">Product Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations & Logistics</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Customer Success">Customer Success</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.assigned_site_location', 'Assigned Site / Location')}</label>
                  <select
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Hyderabad Main Office">Hyderabad Main Office</option>
                    <option value="Bengaluru Tech Park HQ">Bengaluru Tech Park HQ</option>
                    <option value="Mumbai Financial Centre">Mumbai Financial Centre</option>
                    <option value="Singapore Regional Hub">Singapore Regional Hub</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.email_address', 'Email Address')}</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.phone_number', 'Phone Number')}</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.employment_status', 'Employment Status')}</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.remote_wfh_allowance', 'Remote WFH Allowance')}</label>
                  <select
                    value={editForm.remoteWorkPolicy}
                    onChange={(e) => setEditForm({ ...editForm, remoteWorkPolicy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Allowed (2 Days/Week)">Allowed (2 Days/Week)</option>
                    <option value="Full Remote">Full Remote (100%)</option>
                    <option value="Office Only">Office Only (0 Days WFH)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Shift Modal */}
      {showAssignShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Assign Shift to {employee.name}</h3>
              </div>
              <button onClick={() => setShowAssignShiftModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignShift} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('employees.select_shift', 'Select Shift')}</label>
                <select
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="Morning Shift (MS)">Morning Shift (MS) &bull; 07:00 AM – 04:00 PM</option>
                  <option value="General Shift (GS)">General Shift (GS) &bull; 09:00 AM – 06:00 PM</option>
                  <option value="Evening Shift (ES)">Evening Shift (ES) &bull; 02:00 PM – 11:00 PM</option>
                  <option value="Night Shift (NS)">Night Shift (NS) &bull; 10:00 PM – 07:00 AM</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.effective_from', 'Effective From')}</label>
                  <input
                    type="date"
                    value={newShiftFrom}
                    onChange={(e) => setNewShiftFrom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('employees.effective_to', 'Effective To')}</label>
                  <input
                    type="date"
                    value={newShiftTo}
                    onChange={(e) => setNewShiftTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignShiftModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow"
                >{t('employees.confirm_assignment', 'Confirm Assignment')}</button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
