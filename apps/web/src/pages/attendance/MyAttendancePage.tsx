import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ListFilter,
  Download,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  FileEdit,
  TrendingUp,
  X,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Globe
} from 'lucide-react';
import {
  MyAttendanceMonthViewDTO,
  MyAttendanceDayRecordDTO,
  DayStatus,
  PunchType,
  PunchSource
} from '@infi-timepro/shared-types';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const MyAttendancePage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<MyAttendanceDayRecordDTO | null>(null);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [webPunchState, setWebPunchState] = useState<'IDLE' | 'PUNCHED_IN'>('PUNCHED_IN');

  // Sample Month Data
  const days: MyAttendanceDayRecordDTO[] = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2026-09-${day < 10 ? '0' + day : day}`;
    const d = new Date(dateStr);
    const dayOfWeekNum = d.getDay();
    const dayOfWeekName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeekNum];

    if (dayOfWeekNum === 0 || dayOfWeekNum === 6) {
      return {
        id: `att-day-${day}`,
        date: dateStr,
        dayOfWeek: dayOfWeekName,
        shiftCode: 'WO',
        shiftName: 'Weekly Off',
        shiftTiming: 'Non-Working Day',
        grossDurationMinutes: 0,
        breakDurationMinutes: 0,
        netWorkDurationMinutes: 0,
        regularDurationMinutes: 0,
        overtimeMinutes: 0,
        status: 'weekly_off' as DayStatus,
        isLate: false,
        lateByMinutes: 0,
        isEarlyOut: false,
        earlyOutByMinutes: 0,
        isRegularised: false,
        isSandwichPenalty: false,
        punches: []
      };
    }

    if (day === 8) {
      return {
        id: `att-day-${day}`,
        date: dateStr,
        dayOfWeek: dayOfWeekName,
        shiftCode: 'GS',
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        grossDurationMinutes: 0,
        breakDurationMinutes: 0,
        netWorkDurationMinutes: 0,
        regularDurationMinutes: 0,
        overtimeMinutes: 0,
        status: 'on_leave' as DayStatus,
        isLate: false,
        lateByMinutes: 0,
        isEarlyOut: false,
        earlyOutByMinutes: 0,
        isRegularised: false,
        isSandwichPenalty: false,
        punches: []
      };
    }

    if (day === 4) {
      return {
        id: `att-day-${day}`,
        date: dateStr,
        dayOfWeek: dayOfWeekName,
        shiftCode: 'GS',
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        firstIn: '09:24 AM',
        lastOut: '06:35 PM',
        grossDurationMinutes: 551,
        breakDurationMinutes: 60,
        netWorkDurationMinutes: 491,
        regularDurationMinutes: 480,
        overtimeMinutes: 11,
        status: 'late' as DayStatus,
        isLate: true,
        lateByMinutes: 24,
        isEarlyOut: false,
        earlyOutByMinutes: 0,
        isRegularised: false,
        isSandwichPenalty: false,
        punches: [
          { id: `pch-${day}-1`, time: '09:24 AM', type: 'IN' as PunchType, source: 'mobile_app' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
          { id: `pch-${day}-2`, time: '01:05 PM', type: 'BREAK_OUT' as PunchType, source: 'web_portal' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
          { id: `pch-${day}-3`, time: '02:05 PM', type: 'BREAK_IN' as PunchType, source: 'web_portal' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
          { id: `pch-${day}-4`, time: '06:35 PM', type: 'OUT' as PunchType, source: 'biometric' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
        ]
      };
    }

    return {
      id: `att-day-${day}`,
      date: dateStr,
      dayOfWeek: dayOfWeekName,
      shiftCode: 'GS',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      firstIn: '08:55 AM',
      lastOut: day === 14 ? '--' : '06:25 PM',
      grossDurationMinutes: day === 14 ? 360 : 570,
      breakDurationMinutes: 60,
      netWorkDurationMinutes: day === 14 ? 300 : 510,
      regularDurationMinutes: 480,
      overtimeMinutes: day === 14 ? 0 : 30,
      status: 'present' as DayStatus,
      isLate: false,
      lateByMinutes: 0,
      isEarlyOut: false,
      earlyOutByMinutes: 0,
      isRegularised: day === 11,
      isSandwichPenalty: false,
      punches: [
        { id: `pch-${day}-1`, time: '08:55 AM', type: 'IN' as PunchType, source: 'biometric' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
        { id: `pch-${day}-2`, time: '01:00 PM', type: 'BREAK_OUT' as PunchType, source: 'biometric' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
        { id: `pch-${day}-3`, time: '02:00 PM', type: 'BREAK_IN' as PunchType, source: 'biometric' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
        ...(day !== 14 ? [{ id: `pch-${day}-4`, time: '06:25 PM', type: 'OUT' as PunchType, source: 'biometric' as PunchSource, locationName: 'Bengaluru Tech Park HQ', isFlagged: false }] : [])
      ]
    };
  });

  const getStatusBadge = (status: DayStatus, isLate?: boolean, isRegularised?: boolean) => {
    if (isRegularised) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          Regularised
        </span>
      );
    }
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Present
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Late
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Leave
          </span>
        );
      case 'weekly_off':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
            Off
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
            {status}</span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Month Navigator & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('attendance.my_attendance', 'My Attendance')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Sarah Jenkins (EMP-1001)</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track your daily attendance punches, working hours, leaves, and submit regularisation requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Navigator */}
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-sm font-semibold text-slate-700">
            <button
              onClick={() => {}}
              className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3">September 2026</span>
            <button
              onClick={() => {}}
              className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Table
            </button>
          </div>

          {/* Web Punch Action */}
          <button
            onClick={() => setShowPunchModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Fingerprint className="w-4 h-4" />
            Web Kiosk Punch
          </button>

          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export
          </button>
        </div>
      </div>

      {/* 2. Monthly Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Working Days</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">22</div>
          <div className="text-[11px] text-slate-400 mt-0.5">September 2026</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Present Days</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">21</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">95.4% Attendance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Late Marks</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">1</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Late by 24 mins</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Leaves Taken</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">1</div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Annual Leave (Approved)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Hours Logged</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">178.5h</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Req: 176.0h</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Overtime Logged</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">3.5h</div>
          <div className="text-[11px] text-purple-700 font-medium mt-0.5">100% Approved</div>
        </div>
      </div>

      {/* 3. Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid (Days 1 to 30) */}
          <div className="grid grid-cols-7 gap-2.5">
            {/* Blank leading slots if month starts on Tuesday */}
            <div className="min-h-[100px] p-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 opacity-40"></div>
            <div className="min-h-[100px] p-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 opacity-40"></div>

            {days.map((d, index) => {
              const dayNum = index + 1;
              const isToday = dayNum === 14;

              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDay(d)}
                  className={`min-h-[105px] p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-xs'
                      : d.status === 'weekly_off'
                      ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                      : d.status === 'on_leave'
                      ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50/70'
                      : d.status === 'late'
                      ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-600 font-extrabold' : 'text-slate-800'}`}>
                      {dayNum} {isToday && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full ml-1">Today</span>}</span>
                    {getStatusBadge(d.status, d.isLate, d.isRegularised)}</div>

                  {d.status !== 'weekly_off' && d.status !== 'on_leave' ? (
                    <div className="space-y-1 mt-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-700">
                        <span>{d.firstIn || '--'}</span>
                        <span className="text-slate-300">→</span>
                        <span>{d.lastOut || '--'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Net: {Math.floor(d.netWorkDurationMinutes / 60)}h {d.netWorkDurationMinutes % 60}m</span>
                        {d.overtimeMinutes > 0 && (
                          <span className="text-purple-600 font-semibold font-mono">+{d.overtimeMinutes}m OT</span>
                        )}</div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium my-auto text-center">
                      {d.shiftName}</div>
                  )}

                  <div className="text-[10px] text-slate-400 truncate">
                    {d.shiftCode} ({d.shiftTiming.split(' - ')[0]})</div>
                </div>
              );
            })}</div>
        </div>
      )}

      {/* 4. Tabular List View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">First In</th>
                  <th className="py-3 px-4">Last Out</th>
                  <th className="py-3 px-4">Gross Hours</th>
                  <th className="py-3 px-4">Break</th>
                  <th className="py-3 px-4">Net Hours</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-xs">{d.date}</div>
                      <div className="text-[11px] text-slate-400">{d.dayOfWeek}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-slate-800">{d.shiftName}</div>
                      <div className="text-[11px] text-slate-400">{d.shiftTiming}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{d.firstIn || '--'}</td>
                    <td className="py-3 px-4 font-mono text-xs">{d.lastOut || '--'}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {d.grossDurationMinutes > 0 ? `${Math.floor(d.grossDurationMinutes / 60)}h ${d.grossDurationMinutes % 60}m` : '--'}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {d.breakDurationMinutes > 0 ? `${d.breakDurationMinutes}m` : '--'}</td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-800">
                      {d.netWorkDurationMinutes > 0 ? `${Math.floor(d.netWorkDurationMinutes / 60)}h ${d.netWorkDurationMinutes % 60}m` : '--'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-purple-600">
                      {d.overtimeMinutes > 0 ? `+${d.overtimeMinutes}m` : '--'}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(d.status, d.isLate, d.isRegularised)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDay(d)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Day Detail Slide-Over Drawer */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDay(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{t('attendance.daily_attendance_record', 'Daily Attendance Record')}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedDay.date} ({selectedDay.dayOfWeek})</p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status Card */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Day Status</div>
                    <div className="mt-1">{getStatusBadge(selectedDay.status, selectedDay.isLate, selectedDay.isRegularised)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Assigned Shift</div>
                    <div className="text-xs font-bold text-slate-800 mt-1">{selectedDay.shiftName}</div>
                    <div className="text-[11px] text-slate-400">{selectedDay.shiftTiming}</div>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Hours & Duration Calculation</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">First In Time</div>
                      <div className="font-semibold text-slate-800 font-mono text-sm mt-0.5">{selectedDay.firstIn || '--'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">Last Out Time</div>
                      <div className="font-semibold text-slate-800 font-mono text-sm mt-0.5">{selectedDay.lastOut || '--'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">Net Work Hours</div>
                      <div className="font-bold text-emerald-600 font-mono text-sm mt-0.5">
                        {Math.floor(selectedDay.netWorkDurationMinutes / 60)}h {selectedDay.netWorkDurationMinutes % 60}m
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">Overtime</div>
                      <div className="font-bold text-purple-600 font-mono text-sm mt-0.5">
                        {selectedDay.overtimeMinutes > 0 ? `+${selectedDay.overtimeMinutes} mins` : '0 mins'}</div>
                    </div>
                  </div>
                </div>

                {/* Punch Sequence Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Punch Events Sequence</h4>
                  {selectedDay.punches.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-slate-400 text-xs text-center rounded-lg border border-slate-200">
                      No punch events recorded for this date.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDay.punches.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}</span>
                            <div>
                              <div className="font-bold text-slate-800">{p.type} • {p.time}</div>
                              <div className="text-[11px] text-slate-500 capitalize">{p.source.replace('_', ' ')} • {p.locationName}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                            Verified
                          </span>
                        </div>
                      ))}</div>
                  )}</div>
              </div>

              {/* Drawer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const reqDate = selectedDay?.date || '2026-09-14';
                    toast.info('Regularisation Portal', `Navigating to raise attendance regularisation for ${reqDate}`);
                    navigate('/attendance/regularisations');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  Request Regularisation
                </button>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Web Kiosk Punch Modal */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Fingerprint className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('attendance.web_kiosk_punch', 'Web Kiosk Punch')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bengaluru Tech Park HQ • GPS Verified
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono">
              Current Time: {new Date().toLocaleTimeString()}</div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPunchModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel</button>
              <button
                onClick={() => {
                  toast.success('Punch Registered Successfully', 'Web Kiosk attendance punch logged at ' + new Date().toLocaleTimeString() + ' (Bengaluru HQ).');
                  setShowPunchModal(false);
                  setWebPunchState('PUNCHED_IN');
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Confirm Punch
              </button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
