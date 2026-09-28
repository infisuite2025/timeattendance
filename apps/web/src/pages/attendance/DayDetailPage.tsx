import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { decodeSecureToken, encodeSecureToken, validateAttendanceDetailAccess } from '../../utils/routeSecurity.ts';
import {
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  MessageSquare,
  FileText,
  AlertCircle,
  Plus,
  ShieldAlert,
  Lock,
  ShieldCheck
} from 'lucide-react';

export const DayDetailPage: React.FC = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [remarkText, setRemarkText] = useState('');

  const rawTargetId = decodeSecureToken(id || 'TP1012');
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
              <p className="text-xs text-rose-700 font-medium">Unauthorized Attendance Record Access Attempt (IDOR & Scope Guard)</p>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-rose-100 text-xs space-y-2.5">
            <p className="font-semibold text-slate-800">{accessCheck.reason}</p>
            <p className="text-slate-500">
              Your active session persona (<span className="font-bold text-slate-900">{role}</span> - {user.email}) is restricted by tenant role isolation policies from inspecting operational records for worker ID <span className="font-mono font-bold text-rose-700">{rawTargetId}</span>.
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

  const encryptedTokenSample = id?.startsWith('tk_') ? id : encodeSecureToken(rawTargetId);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Attendance</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Attendance Day Detail</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>Cryptographic URL Token Active ({encryptedTokenSample.slice(0, 16)}...)</span>
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('attendance.attendance_day_detail', 'Attendance Day Detail')}</h1>
          <p className="text-xs text-slate-500">
            View detailed attendance record, punch events and related information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Mon, 28 Apr 2025</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-slate-600 shadow-sm">
            <button className="rounded-lg p-1 hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-1 hover:bg-slate-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <NavLink
            to="/attendance/live"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Attendance</span>
          </NavLink>
        </div>
      </div>

      {/* Employee Profile Hero Card */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop"
            alt="Srinivas Reddy"
            className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{t('attendance.srinivas_reddy', 'Srinivas Reddy')}</h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                Present
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600">Product Manager</p>
            <p className="text-[11px] text-slate-400">
              Emp ID: <span className="text-slate-600 font-medium">TP1012</span> &bull; Department:{' '}
              <span className="text-slate-600 font-medium">Product</span> &bull; Location:{' '}
              <span className="text-slate-600 font-medium">Hyderabad</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-400">Date</p>
            <p className="text-sm font-bold text-slate-900">Mon, 28 Apr 2025</p>
            <p className="text-[10px] text-slate-400">Monday</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-200"></div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Day Status</p>
            <p className="text-sm font-bold text-emerald-600">Present</p>
            <p className="text-[10px] text-slate-400">Completed as per schedule</p>
          </div>
        </div>
      </div>

      {/* 5 Attendance Metric Cards Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <p className="text-[11px] font-semibold text-slate-500">First In</p>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">08:58 AM</p>
          <p className="text-[11px] font-semibold text-emerald-600">On time</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <p className="text-[11px] font-semibold text-slate-500">Last Out</p>
            <Clock className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">06:08 PM</p>
          <p className="text-[11px] font-semibold text-emerald-600">On time</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <p className="text-[11px] font-semibold text-slate-500">Work Duration</p>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">8h 10m</p>
          <p className="text-[11px] text-slate-400">Expected: 8h 0m</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <p className="text-[11px] font-semibold text-slate-500">Break Time</p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">1h 00m</p>
          <p className="text-[11px] text-slate-400">1 break(s)</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <p className="text-[11px] font-semibold text-slate-500">Net Hours</p>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">7h 10m</p>
          <p className="text-[11px] text-slate-400">Excludes break time</p>
        </div>
      </div>

      {/* Middle Split: Punch Events Timeline (Left) & Shift Details / Map (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Punch Events Table */}
        <div className="space-y-6 lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('attendance.punch_events', 'Punch Events')}</h3>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                4 Events
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Event</th>
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                    08:58 AM
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    Check In <span className="block text-[10px] text-slate-400 font-normal">Work started</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Face Recognition <span className="block text-[10px] text-slate-400">Office Device</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Hyderabad <span className="block text-[10px] text-slate-400">Main Office</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                    12:30 PM
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    Break Out <span className="block text-[10px] text-slate-400 font-normal">Lunch break</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Web Portal <span className="block text-[10px] text-slate-400">Chrome (Windows)</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Hyderabad <span className="block text-[10px] text-slate-400">Main Office</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                    01:30 PM
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    Break In <span className="block text-[10px] text-slate-400 font-normal">Back from break</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Web Portal <span className="block text-[10px] text-slate-400">Chrome (Windows)</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Hyderabad <span className="block text-[10px] text-slate-400">Main Office</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <span className="inline-block h-2 w-2 rounded-full bg-rose-500 mr-2"></span>
                    06:08 PM
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    Check Out <span className="block text-[10px] text-slate-400 font-normal">Work completed</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Face Recognition <span className="block text-[10px] text-slate-400">Office Device</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Hyderabad <span className="block text-[10px] text-slate-400">Main Office</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks & Requests Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('attendance.remarks_requests', 'Remarks & Requests')}</h3>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                <Plus className="h-3 w-3" /> Add Remark
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs">
                <div className="flex items-start gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop"
                    alt="Srinivas"
                    className="h-7 w-7 rounded-full object-cover mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Srinivas Reddy</span>
                      <span className="text-[10px] text-slate-400">28 Apr 2025 01:15 PM</span>
                    </div>
                    <p className="mt-1 text-slate-600">Lunch break extended due to client meeting.</p>
                  </div>
                </div>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Noted
                </span>
              </div>

              <div className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs">
                <div className="flex items-start gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop"
                    alt="Srinivas"
                    className="h-7 w-7 rounded-full object-cover mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Srinivas Reddy</span>
                      <span className="text-[10px] text-slate-400">28 Apr 2025 06:20 PM</span>
                    </div>
                    <p className="mt-1 text-slate-600">Working from office today.</p>
                  </div>
                </div>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  Info
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shift Details, Location Map, Additional Info */}
        <div className="space-y-6 lg:col-span-5">
          {/* Shift Details Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('attendance.shift_details', 'Shift Details')}</h3>
              </div>
              <NavLink to="/shifts/library" className="text-xs font-semibold text-blue-600 hover:underline">
                View Shift
              </NavLink>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shift Name</span>
                <span className="font-semibold text-slate-900">General Shift</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shift Time</span>
                <span className="font-semibold text-slate-900">09:00 AM – 06:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expected Work Hours</span>
                <span className="font-semibold text-slate-900">8h 0m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Break Policy</span>
                <span className="font-semibold text-slate-900">1h 0m (1 break)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Grace Period</span>
                <span className="font-semibold text-slate-900">15 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shift Type</span>
                <span className="font-semibold text-slate-900">Regular</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Roster</span>
                <span className="font-semibold text-slate-900">Default Weekly Roster</span>
              </div>
            </div>
          </div>

          {/* Location Map Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('attendance.location', 'Location')}</h3>
              </div>
              <a href="#maps" className="text-xs font-semibold text-blue-600 hover:underline">
                View in Maps
              </a>
            </div>

            {/* Interactive Location Visual Box */}
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-50/60 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md animate-bounce">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="mt-1 text-[11px] font-bold text-slate-800">Hyderabad Main Office</span>
                  <span className="text-[9px] text-slate-500">HITEC City, Hyderabad, TG</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">Plot No. 5, HITEC City, Madhapur, Hyderabad, 500081</p>
          </div>

          {/* Additional Information Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">{t('attendance.additional_information', 'Additional Information')}</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Work Location</span>
                <span className="font-semibold text-slate-900">Hyderabad Main Office</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Attendance Policy</span>
                <span className="font-semibold text-slate-900">General Policy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Overtime</span>
                <span className="font-semibold text-slate-900">Not Applicable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Leave</span>
                <span className="font-semibold text-slate-900">No Leave Applied</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Regularization</span>
                <NavLink to="/attendance/regularisations" className="font-semibold text-blue-600 hover:underline">
                  Raise Request &rarr;
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
