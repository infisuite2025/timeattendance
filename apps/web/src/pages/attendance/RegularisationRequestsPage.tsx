import React, { useState } from 'react';
import {
  FileEdit,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  PlusCircle,
  X,
  Send,
  UploadCloud,
  Check,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';
import {
  RegularisationDetailDTO,
  RegularisationType
} from '@infi-timepro/shared-types';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const RegularisationRequestsPage: React.FC = () => {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const { toast } = useNotification();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegularisationDetailDTO | null>(null);

  // Form State
  const [formDate, setFormDate] = useState('2026-09-14');
  const [formType, setFormType] = useState<RegularisationType>('check_in');
  const [formReqIn, setFormReqIn] = useState('09:00 AM');
  const [formReqOut, setFormReqOut] = useState('06:00 PM');
  const [formCategory, setFormCategory] = useState('Biometric Device Failure');
  const [formReason, setFormReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Regularisations
  const [requests, setRequests] = useState<RegularisationDetailDTO[]>([
    {
      id: 'reg-001',
      requestCode: 'REG-8092',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      attendanceDate: '2026-09-14',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      requestType: 'check_in',
      originalIn: '--',
      originalOut: '06:25 PM',
      requestedIn: '09:00 AM',
      requestedOut: '06:25 PM',
      reasonCategory: 'Biometric Device Failure',
      reasonText: 'Main gate facial terminal showed timeout error during 9 AM morning rush.',
      status: 'pending',
      currentTier: 1,
      maxTiers: 2,
      approvers: [
        { tier: 1, approverName: 'Sarah Jenkins', role: 'Reporting Manager', status: 'pending' },
        { tier: 2, approverName: 'Anita Desai', role: 'Head of HR', status: 'pending' }
      ],
      submittedAt: '2026-09-14T09:30:00.000Z'
    },
    {
      id: 'reg-002',
      requestCode: 'REG-8093',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      attendanceDate: '2026-09-14',
      shiftName: 'Morning Shift',
      shiftTiming: '07:00 AM - 03:30 PM',
      requestType: 'client_visit',
      originalIn: '07:35 AM',
      originalOut: '03:40 PM',
      requestedIn: '07:00 AM',
      requestedOut: '03:40 PM',
      reasonCategory: 'On-Duty Client Visit',
      reasonText: 'Directly reported to vendor logistics hub in Whitefield for dispatch inspection.',
      status: 'pending',
      currentTier: 1,
      maxTiers: 1,
      approvers: [
        { tier: 1, approverName: 'Sarah Jenkins', role: 'Reporting Manager', status: 'pending' }
      ],
      submittedAt: '2026-09-14T08:00:00.000Z'
    },
    {
      id: 'reg-003',
      requestCode: 'REG-8090',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      attendanceDate: '2026-09-11',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      requestType: 'full_day',
      originalIn: '--',
      originalOut: '--',
      requestedIn: '09:00 AM',
      requestedOut: '06:00 PM',
      reasonCategory: 'WFH Authorization',
      reasonText: 'Worked remotely to support AWS cloud migration window.',
      status: 'approved',
      currentTier: 2,
      maxTiers: 2,
      approvers: [
        { tier: 1, approverName: 'David Rodriguez', role: 'VP Engineering', status: 'approved', actionAt: '2026-09-12T09:15:00Z' },
        { tier: 2, approverName: 'Anita Desai', role: 'Head of HR', status: 'approved', actionAt: '2026-09-12T11:30:00Z' }
      ],
      submittedAt: '2026-09-11T18:00:00.000Z'
    }
  ]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newReq: RegularisationDetailDTO = {
        id: `reg-${Date.now()}`,
        requestCode: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
        tenantId: 'tenant-demo-001',
        employeeId: 'emp-001',
        employeeCode: 'EMP-1001',
        employeeName: 'Sarah Jenkins',
        department: 'Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        attendanceDate: formDate,
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        requestType: formType,
        originalIn: '--',
        originalOut: '--',
        requestedIn: formReqIn,
        requestedOut: formReqOut,
        reasonCategory: formCategory,
        reasonText: formReason,
        status: 'pending',
        currentTier: 1,
        maxTiers: 2,
        approvers: [
          { tier: 1, approverName: 'David Rodriguez', role: 'Reporting Manager', status: 'pending' },
          { tier: 2, approverName: 'Anita Desai', role: 'Head of HR', status: 'pending' }
        ],
        submittedAt: new Date().toISOString()
      };

      setRequests(prev => [newReq, ...prev]);
      setIsSubmitting(false);
      setShowCreateModal(false);
      setFormReason('');
      toast.success('Request Submitted', `Regularisation request #${newReq.requestCode} submitted for manager review.`);
    }, 500);
  };

  const filteredRequests = requests.filter(r => {
    // Role-based data scoping
    if (role === 'EMPLOYEE') {
      if (r.employeeCode !== user.employeeCode) return false;
    } else if (role === 'MANAGER') {
      // Manager sees direct team (e.g. Operations & Assembly staff: EMP-1001, EMP-1003, EMP-1004)
      const isTeamMember = r.department === 'Operations' || r.department === 'Operations & Assembly' || r.employeeCode === 'EMP-1001' || r.employeeCode === 'EMP-1003';
      if (!isTeamMember) return false;
    }

    const matchesTab = activeTab === 'all' || r.status === activeTab;
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reasonText.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getRequestTypeBadge = (type: RegularisationType) => {
    switch (type) {
      case 'check_in':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Check-In Correction</span>;
      case 'check_out':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Check-Out Correction</span>;
      case 'client_visit':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">On-Duty Client Visit</span>;
      case 'wfh':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Work From Home</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Full Day Present</span>;
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending Approval</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('attendance.attendance_regularisation_requ', 'Attendance Regularisation Requests')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <FileEdit className="w-3.5 h-3.5 text-blue-600" />
              Multi-Tier Workflow Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Submit, review, and track attendance corrections, missed punch regularisations, and on-duty client visits.
          </p>

          {/* Scope Indicator Banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
            {role === 'EMPLOYEE' && (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Personal View: Showing requests submitted by <strong>{user.name} ({user.employeeCode})</strong></span>
              </>
            )}
            {role === 'MANAGER' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Manager Team Scope: Showing direct reports in <strong>{user.department}</strong> supervised by <strong>{user.name}</strong></span>
              </>
            )}
            {role === 'ADMIN' && (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Enterprise Administrator Scope: Company-wide view across all departments</span>
              </>
            )}</div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Apply Regularisation
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">28</div>
            <div className="text-xs font-medium text-slate-500">Total Requests</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">September 2026</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">6</div>
            <div className="text-xs font-medium text-slate-500">Pending Approvals</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Avg turnaround: 4.2h</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">20</div>
            <div className="text-xs font-medium text-slate-500">Approved This Month</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">91% Approval Rate</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">2</div>
            <div className="text-xs font-medium text-slate-500">Rejected / Sent Back</div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">Feedback provided</div>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 w-full md:w-auto pb-2 md:pb-0">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab} Requests
              </button>
            ))}</div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('attendance.search_code_employee_reason', 'Search code, employee, reason...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Request Code</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Date & Shift</th>
                <th className="py-3.5 px-4">Type & Correction</th>
                <th className="py-3.5 px-4">Reason Category</th>
                <th className="py-3.5 px-4">Approval Stepper</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Code */}
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-600">
                    {req.requestCode}</td>

                  {/* Employee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                        alt={req.employeeName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{req.employeeName}</div>
                        <div className="text-xs text-slate-500">{req.employeeCode} • {req.department}</div>
                      </div>
                    </div>
                  </td>

                  {/* Date & Shift */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-semibold text-slate-900">{req.attendanceDate}</div>
                    <div className="text-[11px] text-slate-500">{req.shiftName}</div>
                  </td>

                  {/* Type & Correction */}
                  <td className="py-3.5 px-4 space-y-1">
                    <div>{getRequestTypeBadge(req.requestType)}</div>
                    <div className="text-[11px] font-mono text-slate-700 flex items-center gap-1.5">
                      <span className="text-slate-400 line-through">{req.originalIn || '--'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-emerald-600">{req.requestedIn}</span>
                    </div>
                  </td>

                  {/* Reason Category */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-medium text-slate-800">{req.reasonCategory}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{req.reasonText}</div>
                  </td>

                  {/* Multi-Tier Stepper */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {req.approvers.map((app, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded font-semibold ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          L{app.tier}: {app.status.toUpperCase()}</span>
                      ))}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusPill(req.status)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Submit Regularisation Wizard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">{t('attendance.apply_attendance_regularisatio', 'Apply Attendance Regularisation')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.attendance_date', 'Attendance Date')}</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.request_type', 'Request Type')}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as RegularisationType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="check_in">Check-In Time Correction</option>
                    <option value="check_out">Check-Out Time Correction</option>
                    <option value="full_day">Full Day Attendance</option>
                    <option value="client_visit">On-Duty / Client Visit</option>
                    <option value="wfh">Work From Home (WFH)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.requested_check_in', 'Requested Check-In')}</label>
                  <input
                    type="text"
                    value={formReqIn}
                    onChange={(e) => setFormReqIn(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.requested_check_out', 'Requested Check-Out')}</label>
                  <input
                    type="text"
                    value={formReqOut}
                    onChange={(e) => setFormReqOut(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.reason_category', 'Reason Category')}</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="Biometric Device Failure">Biometric Terminal Timeout / Hardware Failure</option>
                  <option value="On-Duty Client Visit">Customer / Client On-Site Meeting</option>
                  <option value="WFH Authorization">Emergency Remote Work / WFH</option>
                  <option value="Network Outage">Internet Connectivity Loss at Facility</option>
                  <option value="Forgot to Punch">Employee Forgot to Punch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Detailed Remarks & Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder={t('attendance.explain_why_regularisation_is_', 'Explain why regularisation is requested...')}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                <UploadCloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span>Drag & drop supporting files or click to attach ticket screenshot</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Request Detail Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedRequest(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Regularisation #{selectedRequest.requestCode}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedRequest.attendanceDate}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{selectedRequest.employeeName}</span>
                    <span className="text-xs text-slate-500">{selectedRequest.employeeCode}</span>
                  </div>
                  <div className="text-xs text-slate-600">{selectedRequest.department}</div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span>Assigned Shift:</span>
                    <strong>{selectedRequest.shiftName} ({selectedRequest.shiftTiming})</strong>
                  </div>
                </div>

                {/* Original vs Requested Comparison */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Correction Overview</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 bg-white rounded border border-blue-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Original IN / OUT</div>
                      <div className="font-mono text-slate-600 mt-1">{selectedRequest.originalIn || '--'} / {selectedRequest.originalOut || '--'}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-blue-200">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase">Requested Values</div>
                      <div className="font-mono font-bold text-emerald-700 mt-1">{selectedRequest.requestedIn} / {selectedRequest.requestedOut}</div>
                    </div>
                  </div>
                </div>

                {/* Justification */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Employee Justification</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong>Category:</strong> {selectedRequest.reasonCategory}
                    <p className="mt-1">{selectedRequest.reasonText}</p>
                  </div>
                </div>

                {/* Multi-Tier Stepper */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Multi-Tier Approval Hierarchy</h4>
                  <div className="space-y-2">
                    {selectedRequest.approvers.map((app, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">Tier {app.tier}: {app.role}</div>
                          <div className="text-[11px] text-slate-500">{app.approverName}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}</span>
                      </div>
                    ))}</div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                {selectedRequest.status === 'pending' && (
                  <button
                    onClick={() => {
                      toast.success('Request Approved', `Request #${selectedRequest.requestCode} approved successfully!`);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg"
                >
                  Close</button>
              </div>
            </div>
          </div>
        </div>
      )}</div>
  );
};
