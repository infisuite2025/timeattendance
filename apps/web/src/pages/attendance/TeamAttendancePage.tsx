import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Download,
  Send,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  Smartphone,
  Fingerprint,
  Globe,
  MapPin,
  Eye,
  BellRing
} from 'lucide-react';
import {
  TeamAttendanceMemberDTO,
  TeamAttendanceSummaryDTO,
  DayStatus,
  PunchSource
} from '@infi-timepro/shared-types';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import { encodeSecureToken } from '../../utils/routeSecurity.ts';

export const TeamAttendancePage: React.FC = () => {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const { toast } = useNotification();
  const [selectedDate, setSelectedDate] = useState('2026-09-14');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMember, setActiveMember] = useState<TeamAttendanceMemberDTO | null>(null);

  const teamMembers: TeamAttendanceMemberDTO[] = [
    {
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      department: 'Engineering',
      designation: 'Staff Frontend Architect',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      todayStatus: 'present',
      firstIn: '08:55 AM',
      lastOut: '--',
      netWorkDurationMinutes: 480,
      isLate: false,
      lateByMinutes: 0,
      pendingRequestsCount: 0,
      locationName: 'Bengaluru Tech Park HQ',
      lastPunchChannel: 'biometric'
    },
    {
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      department: 'Product Design',
      designation: 'Principal UI/UX Lead',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      todayStatus: 'present',
      firstIn: '09:14 AM',
      lastOut: '--',
      netWorkDurationMinutes: 460,
      isLate: false,
      lateByMinutes: 0,
      pendingRequestsCount: 1,
      locationName: 'Bengaluru Tech Park HQ',
      lastPunchChannel: 'mobile_app'
    },
    {
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      department: 'Operations',
      designation: 'Operations Specialist',
      shiftName: 'Morning Shift',
      shiftTiming: '07:00 AM - 03:30 PM',
      todayStatus: 'late',
      firstIn: '07:35 AM',
      lastOut: '03:40 PM',
      netWorkDurationMinutes: 485,
      isLate: true,
      lateByMinutes: 35,
      pendingRequestsCount: 1,
      locationName: 'Bengaluru Tech Park HQ',
      lastPunchChannel: 'geofence'
    },
    {
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'David Rodriguez',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      department: 'Customer Success',
      designation: 'Enterprise CS Manager',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      todayStatus: 'present',
      firstIn: '08:45 AM',
      lastOut: '--',
      netWorkDurationMinutes: 490,
      isLate: false,
      lateByMinutes: 0,
      pendingRequestsCount: 0,
      locationName: 'Bengaluru Tech Park HQ',
      lastPunchChannel: 'web_portal'
    },
    {
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      department: 'Marketing',
      designation: 'Growth Marketer',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      todayStatus: 'on_leave',
      firstIn: '--',
      lastOut: '--',
      netWorkDurationMinutes: 0,
      isLate: false,
      lateByMinutes: 0,
      pendingRequestsCount: 0,
      locationName: 'Bengaluru Tech Park HQ',
    },
    {
      employeeId: 'emp-006',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      department: 'Engineering',
      designation: 'Senior Backend Engineer',
      shiftName: 'Night Shift',
      shiftTiming: '10:00 PM - 06:30 AM',
      todayStatus: 'missing_punch',
      firstIn: '10:02 PM',
      lastOut: '--',
      netWorkDurationMinutes: 508,
      isLate: false,
      lateByMinutes: 0,
      pendingRequestsCount: 1,
      locationName: 'Mumbai Financial Centre',
      lastPunchChannel: 'biometric'
    }
  ];

  const filteredMembers = teamMembers.filter(m => {
    // Role-based scoping
    if (role === 'EMPLOYEE') {
      if (m.employeeCode !== user.employeeCode) return false;
    } else if (role === 'MANAGER') {
      // Manager Vikram Singh oversees direct team: EMP-1001, EMP-1003, EMP-1005, EMP-1006
      const isMyStaff = m.department === 'Operations' || m.department === 'Engineering' || m.employeeCode === 'EMP-1001' || m.employeeCode === 'EMP-1003' || m.employeeCode === 'EMP-1005';
      if (!isMyStaff) return false;
    }

    const matchesSearch =
      m.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDept === 'all' || m.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || m.todayStatus === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const getSourceIcon = (source?: PunchSource) => {
    switch (source) {
      case 'mobile_app': return <Smartphone className="w-3.5 h-3.5 text-blue-600" />;
      case 'biometric': return <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />;
      case 'geofence': return <MapPin className="w-3.5 h-3.5 text-purple-600" />;
      case 'web_portal': return <Globe className="w-3.5 h-3.5 text-indigo-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: DayStatus, lateByMinutes?: number) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Present
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Late (+{lateByMinutes}m)</span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            On Leave
          </span>
        );
      case 'missing_punch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Missing Punch
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}</span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('attendance.team_attendance', 'Team Attendance')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Shift Tracking
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time workforce presence, shift status, and exception approvals for your direct reportees.
          </p>

          {/* Scope Indicator Banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
            {role === 'EMPLOYEE' && (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Personal View: Showing attendance only for <strong>{user.name} ({user.employeeCode})</strong></span>
              </>
            )}
            {role === 'MANAGER' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Manager Team Scope: Showing direct staff supervised by <strong>{user.name} ({user.employeeCode})</strong></span>
              </>
            )}
            {role === 'ADMIN' && (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Enterprise Administrator Scope: Company-wide view across all 6 departments</span>
              </>
            )}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Today, 14 Sep 2026</span>
          </div>

          <button
            onClick={() => toast.success('Reminder Broadcast Dispatched', 'Broadcast notification sent to all active on-shift team members.')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-sm"
          >
            <BellRing className="w-4 h-4 text-slate-500" />
            Send Reminder
          </button>

          <button
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Team Report
          </button>
        </div>
      </div>

      {/* 2. Team Health KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Team Size</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">6</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Direct Reportees</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Present Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">4</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">67% On Time</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Late Marks</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">1</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Avg Late: 35m</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">On Leave</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">1</div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Approved Annual</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Missing Punch</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">1</div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">Requires Sign-off</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Pending Approvals</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">3</div>
          <div className="text-[11px] text-purple-700 font-medium mt-0.5">Regularisations</div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('attendance.search_member_name_employee_id', 'Search member name, employee ID, role...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="product design">Product Design</option>
            <option value="operations">Operations</option>
            <option value="customer success">Customer Success</option>
            <option value="marketing">Marketing</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="on_leave">On Leave</option>
            <option value="missing_punch">Missing Punch</option>
          </select>
        </div>
      </div>

      {/* 4. Team Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Assigned Shift</th>
                <th className="py-3.5 px-4">First IN</th>
                <th className="py-3.5 px-4">Last OUT</th>
                <th className="py-3.5 px-4">Net Logged Hours</th>
                <th className="py-3.5 px-4">Channel / Device</th>
                <th className="py-3.5 px-4">Live Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.employeeId} className="hover:bg-slate-50/80 transition-colors">
                  {/* Employee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                        alt={member.employeeName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{member.employeeName}</div>
                        <div className="text-xs text-slate-500">{member.employeeCode} • {member.designation}</div>
                      </div>
                    </div>
                  </td>

                  {/* Shift */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 text-xs">{member.shiftName}</div>
                    <div className="text-[11px] text-slate-400">{member.shiftTiming}</div>
                  </td>

                  {/* First IN */}
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900">
                    {member.firstIn}</td>

                  {/* Last OUT */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                    {member.lastOut}</td>

                  {/* Net Logged Hours */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs font-bold text-slate-800">
                      {member.netWorkDurationMinutes > 0
                        ? `${Math.floor(member.netWorkDurationMinutes / 60)}h ${member.netWorkDurationMinutes % 60}m`
                        : '--'}</div>
                    {member.netWorkDurationMinutes >= 480 && (
                      <div className="text-[10px] text-emerald-600 font-medium">Full Shift Completed</div>
                    )}</td>

                  {/* Channel / Device */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 capitalize">
                      {getSourceIcon(member.lastPunchChannel)}
                      <span>{member.lastPunchChannel ? member.lastPunchChannel.replace('_', ' ') : 'None'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{member.locationName}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(member.todayStatus, member.lateByMinutes)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.pendingRequestsCount > 0 && (
                        <button
                          onClick={() => setActiveMember(member)}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Approve ({member.pendingRequestsCount})</button>
                      )}
                      <button
                        onClick={() => setActiveMember(member)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Inspect</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Slide-Over Member Detail Drawer */}
      {activeMember && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveMember(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeMember.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={activeMember.employeeName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h2 className="text-base font-bold text-white">{activeMember.employeeName}</h2>
                    <p className="text-xs text-slate-400 font-mono">{activeMember.employeeCode} • {activeMember.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMember(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400 font-medium">Assigned Shift & Location</div>
                  <div className="text-sm font-bold text-slate-800 mt-1">{activeMember.shiftName} ({activeMember.shiftTiming})</div>
                  <div className="text-xs text-slate-500 mt-0.5">{activeMember.locationName}</div>
                </div>

                {activeMember.pendingRequestsCount > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-800 uppercase tracking-wide">Pending Regularisation Request</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">Tier 1 Approval</span>
                    </div>
                    <p className="text-xs text-purple-800">
                      Requesting check-in time correction to 09:00 AM due to client meeting at customer premises.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          toast.success('Regularisation Approved', `Approved regularisation for ${activeMember.employeeName}`);
                          setActiveMember(null);
                        }}
                        className="flex-1 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Regularisation Rejected', `Rejected regularisation for ${activeMember.employeeName}`);
                          setActiveMember(null);
                        }}
                        className="flex-1 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Today's Timeline Summary</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <span className="text-slate-500">First IN Time</span>
                    <span className="font-mono font-bold text-slate-800">{activeMember.firstIn}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <span className="text-slate-500">Last OUT Time</span>
                    <span className="font-mono font-bold text-slate-800">{activeMember.lastOut}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <span className="text-slate-500">Net Work Duration</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {Math.floor(activeMember.netWorkDurationMinutes / 60)}h {activeMember.netWorkDurationMinutes % 60}m
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <NavLink
                  to={`/attendance/day-detail/${encodeSecureToken(activeMember.employeeCode || activeMember.employeeId)}`}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Secure Day Detail</span>
                </NavLink>
                <button
                  onClick={() => setActiveMember(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}</div>
  );
};
