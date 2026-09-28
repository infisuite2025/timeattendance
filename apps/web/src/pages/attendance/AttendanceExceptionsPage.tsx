import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Send,
  UserCheck,
  PlusCircle,
  X,
  FileEdit,
  Sparkles,
  MapPin,
  RefreshCw,
  Check
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext.tsx';
import {
  AttendanceExceptionDTO,
  ExceptionType,
  ExceptionSeverity,
  ExceptionStatus
} from '@infi-timepro/shared-types';

export const AttendanceExceptionsPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeException, setActiveException] = useState<AttendanceExceptionDTO | null>(null);

  // Resolution Form States
  const [resolutionTab, setResolutionTab] = useState<'waive' | 'request_employee' | 'manual_punch' | 'apply_penalty'>('waive');
  const [resolutionReason, setResolutionReason] = useState('');
  const [manualInTime, setManualInTime] = useState('09:00 AM');
  const [manualOutTime, setManualOutTime] = useState('06:00 PM');
  const [isResolving, setIsResolving] = useState(false);

  // Mock Exceptions
  const [exceptions, setExceptions] = useState<AttendanceExceptionDTO[]>([
    {
      id: 'exc-001',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-006',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      date: '2026-09-14',
      shiftName: 'Night Shift',
      shiftTiming: '10:00 PM - 06:30 AM',
      exceptionType: 'missing_out_punch',
      severity: 'critical',
      description: 'Employee logged IN at 10:02 PM but no OUT punch recorded before shift window closed.',
      firstIn: '10:02 PM',
      lastOut: undefined,
      shortfallMinutes: 508,
      status: 'open',
      createdAt: '2026-09-14T07:00:00.000Z'
    },
    {
      id: 'exc-002',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      date: '2026-09-14',
      shiftName: 'Morning Shift',
      shiftTiming: '07:00 AM - 03:30 PM',
      exceptionType: 'late_arrival',
      severity: 'warning',
      description: 'Arrival at 07:35 AM exceeds 15-minute grace threshold by 20 minutes (Late penalty tier 1).',
      firstIn: '07:35 AM',
      lastOut: '03:40 PM',
      shortfallMinutes: 0,
      status: 'in_review',
      createdAt: '2026-09-14T07:36:00.000Z'
    },
    {
      id: 'exc-003',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      date: '2026-09-14',
      shiftName: 'Morning Shift',
      shiftTiming: '07:00 AM - 03:30 PM',
      exceptionType: 'geofence_breach',
      severity: 'critical',
      description: 'Mobile GPS punch registered 520m outside authorized Bengaluru HQ perimeter.',
      firstIn: '07:35 AM',
      shortfallMinutes: 0,
      status: 'open',
      createdAt: '2026-09-14T07:35:10.000Z'
    },
    {
      id: 'exc-004',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'Elena Rostova',
      department: 'Marketing',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      date: '2026-09-14',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      exceptionType: 'mock_gps_detected',
      severity: 'critical',
      description: 'Device sensor telemetry reported Mock GPS Location App active during check-in.',
      firstIn: '09:00 AM',
      shortfallMinutes: 0,
      status: 'open',
      createdAt: '2026-09-14T09:00:15.000Z'
    },
    {
      id: 'exc-005',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      date: '2026-09-11',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      exceptionType: 'missing_in_punch',
      severity: 'warning',
      description: 'Check-in punch missing; employee punched OUT at 06:20 PM.',
      firstIn: undefined,
      lastOut: '06:20 PM',
      shortfallMinutes: 240,
      status: 'resolved',
      resolutionAction: 'regularised',
      resolvedBy: 'Sarah Jenkins',
      resolvedAt: '2026-09-12T10:15:00.000Z',
      resolutionNotes: 'Regularisation request #REG-8091 approved by L1 Manager.',
      createdAt: '2026-09-11T19:00:00.000Z'
    }
  ]);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeException) return;
    setIsResolving(true);

    setTimeout(() => {
      setExceptions(prev =>
        prev.map(item => {
          if (item.id === activeException.id) {
            return {
              ...item,
              status: resolutionTab === 'waive' ? 'waived' : 'resolved',
              resolutionAction: resolutionTab === 'waive' ? 'waived' : (resolutionTab === 'apply_penalty' ? 'penalty_applied' : 'manual_punch'),
              resolvedBy: 'HR Admin (Sarah Jenkins)',
              resolvedAt: new Date().toISOString(),
              resolutionNotes: resolutionReason || 'Action processed via Exceptions Hub'
            };
          }
          return item;
        })
      );
      setIsResolving(false);
      setActiveException(null);
      setResolutionReason('');
    }, 500);
  };

  const filteredExceptions = exceptions.filter(e => {
    const matchesSearch =
      e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || e.exceptionType === selectedType;
    const matchesSeverity = selectedSeverity === 'all' || e.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;

    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: ExceptionSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wide">Critical</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">Warning</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">Info</span>;
    }
  };

  const getExceptionTypePill = (type: ExceptionType) => {
    switch (type) {
      case 'missing_out_punch':
      case 'missing_in_punch':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            {type.replace(/_/g, ' ').toUpperCase()}</span>
        );
      case 'geofence_breach':
      case 'mock_gps_detected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            {type.replace(/_/g, ' ').toUpperCase()}</span>
        );
      case 'late_arrival':
      case 'early_departure':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {type.replace(/_/g, ' ').toUpperCase()}</span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            {type.replace(/_/g, ' ').toUpperCase()}</span>
        );
    }
  };

  const getStatusBadge = (status: ExceptionStatus) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Open</span>;
      case 'in_review':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">In Review</span>;
      case 'resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      case 'waived':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Waived</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('attendance.attendance_exceptions_flags', 'Attendance Exceptions & Flags')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Active Policy Watchdog
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Resolve missing punches, lateness penalties, geofence breaches, and GPS spoofing flags before payroll lock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Exceptions Log
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">4</div>
            <div className="text-xs font-medium text-slate-500">Open Exceptions</div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">3 Critical / Action Required</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">2</div>
            <div className="text-xs font-medium text-slate-500">Missing Punches</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Auto-flags before shift close</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">2</div>
            <div className="text-xs font-medium text-slate-500">Geofence & Mock GPS</div>
            <div className="text-[11px] text-purple-700 font-medium mt-0.5">Anti-fraud sensor triggers</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">12</div>
            <div className="text-xs font-medium text-slate-500">Resolved This Week</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">100% Audit Compliance</div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('attendance.search_employee_description_ex', 'Search employee, description, exception type...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Exception Types</option>
            <option value="missing_out_punch">Missing OUT Punch</option>
            <option value="missing_in_punch">Missing IN Punch</option>
            <option value="late_arrival">Late Arrival</option>
            <option value="geofence_breach">Geofence Breach</option>
            <option value="mock_gps_detected">Mock GPS Detected</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="waived">Waived</option>
          </select>
        </div>
      </div>

      {/* 4. Exceptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Exception Type & Severity</th>
                <th className="py-3.5 px-4">Date & Shift</th>
                <th className="py-3.5 px-4">Recorded Punch Times</th>
                <th className="py-3.5 px-4">Impact / Shortfall</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExceptions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Employee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                        alt={item.employeeName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{item.employeeName}</div>
                        <div className="text-xs text-slate-500">{item.employeeCode} • {item.department}</div>
                      </div>
                    </div>
                  </td>

                  {/* Exception Type */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {getExceptionTypePill(item.exceptionType)}
                        {getSeverityBadge(item.severity)}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.description}</div>
                    </div>
                  </td>

                  {/* Date & Shift */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-semibold text-slate-900">{item.date}</div>
                    <div className="text-[11px] text-slate-500">{item.shiftName}</div>
                  </td>

                  {/* Recorded Times */}
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div>IN: <span className="font-bold text-slate-800">{item.firstIn || '--:--'}</span></div>
                    <div>OUT: <span className="font-bold text-slate-800">{item.lastOut || '--:--'}</span></div>
                  </td>

                  {/* Impact */}
                  <td className="py-3.5 px-4">
                    {item.shortfallMinutes > 0 ? (
                      <span className="font-mono text-xs font-bold text-rose-600">
                        -{Math.floor(item.shortfallMinutes / 60)}h {item.shortfallMinutes % 60}m Shortfall
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">No direct shortfall</span>
                    )}</td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveException(item)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        item.status === 'open' || item.status === 'in_review'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.status === 'open' ? 'Resolve Exception' : 'View Audit Details'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Slide-Over Exception Resolution Drawer */}
      {activeException && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveException(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">{t('attendance.exception_resolution_hub', 'Exception Resolution Hub')}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {activeException.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveException(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Employee Header */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={activeException.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={activeException.employeeName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{activeException.employeeName}</h3>
                    <p className="text-xs text-slate-500">{activeException.employeeCode} • {activeException.department}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {getExceptionTypePill(activeException.exceptionType)}
                      {getSeverityBadge(activeException.severity)}</div>
                  </div>
                </div>

                {/* Diagnostic Breach Details */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-xs font-bold uppercase text-amber-900 tracking-wide">Violation Description</h4>
                  <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
                    {activeException.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-amber-900 font-mono pt-2 border-t border-amber-200">
                    <div>Shift Date: <strong>{activeException.date}</strong></div>
                    <div>Assigned Shift: <strong>{activeException.shiftName}</strong></div>
                  </div>
                </div>

                {/* If already resolved, show audit trail */}
                {activeException.status === 'resolved' || activeException.status === 'waived' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Exception {activeException.status.toUpperCase()}</div>
                    <div className="text-slate-600">Action: <strong className="capitalize">{activeException.resolutionAction}</strong></div>
                    <div className="text-slate-600">Resolved By: <strong>{activeException.resolvedBy}</strong></div>
                    <div className="text-slate-600">Timestamp: <span className="font-mono">{activeException.resolvedAt}</span></div>
                    {activeException.resolutionNotes && (
                      <div className="p-2.5 bg-white rounded border border-emerald-200 text-slate-700 mt-2">
                        {activeException.resolutionNotes}</div>
                    )}</div>
                ) : (
                  /* Action Tabs & Resolution Form */
                  <form onSubmit={handleResolveSubmit} className="space-y-4">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Select Resolution Action</h4>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setResolutionTab('waive')}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                          resolutionTab === 'waive'
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 mb-1 text-blue-600" />
                        <div>Waive Exception</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Admin approval with justification</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolutionTab('request_employee')}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                          resolutionTab === 'request_employee'
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Send className="w-4 h-4 mb-1 text-purple-600" />
                        <div>Request Employee</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Notify to submit regularisation</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolutionTab('manual_punch')}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                          resolutionTab === 'manual_punch'
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Clock className="w-4 h-4 mb-1 text-emerald-600" />
                        <div>Manual Punch In/Out</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Direct admin timestamp override</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolutionTab('apply_penalty')}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                          resolutionTab === 'apply_penalty'
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 mb-1 text-rose-600" />
                        <div>Apply Policy Penalty</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Deduct 0.5 day leave balance</div>
                      </button>
                    </div>

                    {/* Dynamic Fields for Manual Punch */}
                    {resolutionTab === 'manual_punch' && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">{t('attendance.manual_check_in', 'Manual Check-In')}</label>
                          <input
                            type="text"
                            value={manualInTime}
                            onChange={(e) => setManualInTime(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">{t('attendance.manual_check_out', 'Manual Check-Out')}</label>
                          <input
                            type="text"
                            value={manualOutTime}
                            onChange={(e) => setManualOutTime(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Resolution Notes / Audit Justification <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={resolutionReason}
                        onChange={(e) => setResolutionReason(e.target.value)}
                        placeholder={t('attendance.provide_formal_justification_f', 'Provide formal justification for the compliance audit log...')}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setActiveException(null)}
                        className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel</button>
                      <button
                        type="submit"
                        disabled={isResolving}
                        className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isResolving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Confirm Resolution
                          </>
                        )}</button>
                    </div>
                  </form>
                )}</div>
            </div>
          </div>
        </div>
      )}</div>
  );
};
