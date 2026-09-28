import React, { useState } from 'react';
import { useI18n } from '../../context/I18nContext.tsx';
import {
  Smartphone,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Users,
  MapPin,
  FileText,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Search,
  Filter,
  Layers,
  ArrowLeft,
  Check,
  X,
  Send,
  MoreVertical,
  Play,
  RotateCw,
  Sliders,
  TrendingUp,
  Briefcase
} from 'lucide-react';

export const MobileAppSimulatorPage: React.FC = () => {
  const { t } = useI18n();
  const [activeScreenId, setActiveScreenId] = useState<string>('SCR-MOB-002');
  const [clockedIn, setClockedIn] = useState<boolean>(true);
  const [clockTime, setClockTime] = useState<string>('09:05 AM');
  const [bottomNavIndex, setBottomNavIndex] = useState<number>(0);

  // Screen catalogue
  const screens = [
    { id: 'SCR-MOB-001', page: '23', title: 'Mobile Login & Org Selection', category: 'Auth & Onboarding' },
    { id: 'SCR-MOB-002', page: '24', title: 'Employee Home & Punch', category: 'Self-Service' },
    { id: 'SCR-MOB-003', page: '25', title: 'Live Attendance (Team/Org)', category: 'Team & Live' },
    { id: 'SCR-MOB-004', page: '26', title: 'My Attendance Hub', category: 'Self-Service' },
    { id: 'SCR-MOB-005', page: '27', title: 'Team Attendance (Manager View)', category: 'Team & Live' },
    { id: 'SCR-MOB-006', page: '28', title: 'Attendance Monthly Calendar', category: 'Self-Service' },
    { id: 'SCR-MOB-007', page: '29', title: 'Attendance Day Detail & Timeline', category: 'Self-Service' },
    { id: 'SCR-MOB-008', page: '30', title: 'Mobile Punch Telemetry Stream', category: 'Self-Service' },
    { id: 'SCR-MOB-009', page: '31', title: 'Attendance Exceptions & Flags', category: 'Self-Service' },
    { id: 'SCR-MOB-010', page: '32', title: 'Regularisation Requests Feed', category: 'Regularisation' },
    { id: 'SCR-MOB-011', page: '37', title: 'Site Map & Geofence Tracker', category: 'Team & Live' },
    { id: 'SCR-MOB-012', page: '39', title: 'Regularisation Request Detail', category: 'Regularisation' },
    { id: 'SCR-MOB-013', page: '40', title: 'Raise Regularisation Form Wizard', category: 'Regularisation' },
    { id: 'SCR-MOB-014', page: '41', title: 'Regularisation History & Trends', category: 'Regularisation' },
    { id: 'SCR-MOB-015', page: '42', title: 'Mobile Approvals Inbox', category: 'Approvals Hub' },
    { id: 'SCR-MOB-016', page: '43', title: 'Regularisation Approval View', category: 'Approvals Hub' },
    { id: 'SCR-MOB-017', page: '44', title: 'Shift Swap Requests & Sheet', category: 'Shift Rostering' },
    { id: 'SCR-MOB-018', page: '45', title: 'Employee Shift Assignment Sheet', category: 'Shift Rostering' },
    { id: 'SCR-MOB-019', page: '46', title: 'Mobile Shift Library', category: 'Shift Rostering' },
    { id: 'SCR-MOB-020', page: '47', title: 'Overtime Approval View', category: 'Approvals Hub' },
    { id: 'SCR-MOB-021', page: '48', title: 'Approval History Log', category: 'Approvals Hub' },
    { id: 'SCR-MOB-022', page: '49', title: 'Create / Edit Shift Mobile', category: 'Shift Rostering' },
    { id: 'SCR-MOB-023', page: '50', title: 'Shift Swap Approval Detail', category: 'Approvals Hub' },
    { id: 'SCR-MOB-024', page: '51', title: 'Mobile Team Schedule Calendar', category: 'Shift Rostering' },
    { id: 'SCR-MOB-025', page: '52', title: 'Mobile Shift Groups & Rotation', category: 'Shift Rostering' },
  ];

  const currentScreen = screens.find(s => s.id === activeScreenId) || screens[1];

  const renderMobileScreenContent = () => {
    switch (activeScreenId) {
      case 'SCR-MOB-001': // Login
        return (
          <div className="p-5 space-y-6 text-slate-800 animate-in fade-in duration-150">
            <div className="text-center pt-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">{t('mobile.infitimepro', 'InfiTimePro')}</h2>
              <p className="text-xs text-slate-500">A Smarter Way to Manage Your Workforce</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('mobile.organization', 'Organization')}</label>
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-700">
                  ACME Global Industries (acme.infitimepro.com)</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('mobile.email_employee_id', 'Email / Employee ID')}</label>
                <input
                  type="email"
                  defaultValue="priya.nair@company.com"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('mobile.password', 'Password')}</label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>Remember me</span>
                </label>
                <span className="text-blue-600 font-semibold cursor-pointer">Forgot password?</span>
              </div>

              <button
                onClick={() => setActiveScreenId('SCR-MOB-002')}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition"
              >
                {t('common.sign_in_to_infitimepro', 'Sign In to InfiTimePro')}</button>

              <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm">
                <span>Sign in with Microsoft SSO</span>
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-4">
              Protected by Enterprise 256-bit AES Encryption
            </div>
          </div>
        );

      case 'SCR-MOB-002': // Employee Home
      default:
        return (
          <div className="p-4 space-y-4 text-slate-800 animate-in fade-in duration-150">
            {/* Greeting Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Tue, 17 Sep 2024 • Bangalore, IN</div>
                <div className="text-lg font-black text-slate-900">Good Morning, Priya! 👋</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                PN
              </div>
            </div>

            {/* Attendance Status Banner Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-600/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm">
                  {clockedIn ? '● CHECKED IN' : '○ NOT CHECKED IN'}</span>
                <span className="text-xs font-medium text-blue-100">General Shift (09:00 - 18:00)</span>
              </div>

              <div>
                <div className="text-2xl font-black">{clockTime}</div>
                <div className="text-xs text-blue-100">Today's Clock-in Time (On Time)</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
                <div>Worked: <strong>2h 36m</strong> / 8h</div>
                <div>Location: <strong>Bangalore HQ</strong></div>
              </div>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div
                onClick={() => setClockedIn(!clockedIn)}
                className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm cursor-pointer hover:border-blue-500 active:scale-95 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                  <Check className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-bold">{clockedIn ? 'Clock Out' : 'Clock In'}</div>
              </div>

              <div
                onClick={() => setActiveScreenId('SCR-MOB-013')}
                className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm cursor-pointer hover:border-blue-500 active:scale-95 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-1">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-bold">Regularise</div>
              </div>

              <div
                onClick={() => setActiveScreenId('SCR-MOB-006')}
                className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm cursor-pointer hover:border-blue-500 active:scale-95 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-1">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-bold">Calendar</div>
              </div>

              <div
                onClick={() => setActiveScreenId('SCR-MOB-008')}
                className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm cursor-pointer hover:border-blue-500 active:scale-95 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-bold">Timeline</div>
              </div>
            </div>

            {/* Monthly Attendance Progress Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Monthly Attendance Rate</span>
                <span className="text-xs font-bold text-emerald-600">82% (18/22 Days)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[82%]" />
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                <div className="p-1.5 bg-emerald-50 text-emerald-800 font-bold rounded">18 Present</div>
                <div className="p-1.5 bg-rose-50 text-rose-800 font-bold rounded">2 Absent</div>
                <div className="p-1.5 bg-amber-50 text-amber-800 font-bold rounded">1 Late</div>
                <div className="p-1.5 bg-blue-50 text-blue-800 font-bold rounded">1 Leave</div>
              </div>
            </div>

            {/* Team Today Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">My Team Today</span>
                <button onClick={() => setActiveScreenId('SCR-MOB-003')} className="text-[11px] font-bold text-blue-600">{t('common.view_all_rarr', 'View All →')}</button>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>12 Present</span>
                <span>2 Absent</span>
                <span>3 Late</span>
                <span>4 In Review</span>
              </div>
            </div>
          </div>
        );

      case 'SCR-MOB-003': // Live Attendance (Who's In)
        return (
          <div className="p-4 space-y-4 text-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveScreenId('SCR-MOB-002')} className="p-1 text-slate-400 hover:text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-sm text-slate-900">{t('mobile.live_attendance', 'Live Attendance')}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <div className="font-bold text-emerald-700">28</div>
                <div className="text-[10px] text-emerald-600">Present (60%)</div>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <div className="font-bold text-rose-700">6</div>
                <div className="text-[10px] text-rose-600">Absent (13%)</div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <div className="font-bold text-amber-700">5</div>
                <div className="text-[10px] text-amber-600">Late (11%)</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Priya Nair', role: 'HR Lead', time: '09:05 AM', status: 'Present', color: 'emerald' },
                { name: 'Aarav Sharma', role: 'Staff Backend', time: '09:28 AM', status: 'Late (+28m)', color: 'amber' },
                { name: 'Sneha Kulkarni', role: 'Logistics', time: '09:02 AM', status: 'WFH', color: 'blue' },
                { name: 'Rohan Mehta', role: 'Software Eng', time: '--:--', status: 'Absent', color: 'rose' },
                { name: 'Kavya Iyer', role: 'Finance', time: '--:--', status: 'On Leave', color: 'purple' },
              ].map((m, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {m.name.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.role} • In: {m.time}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                    m.color === 'amber' ? 'bg-amber-50 text-amber-700' :
                    m.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                    m.color === 'purple' ? 'bg-purple-50 text-purple-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {m.status}</span>
                </div>
              ))}</div>
          </div>
        );

      case 'SCR-MOB-015': // Approvals Inbox
        return (
          <div className="p-4 space-y-4 text-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">{t('mobile.my_approvals_inbox', 'My Approvals Inbox')}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                5 Pending
              </span>
            </div>

            <div className="space-y-3">
              {[
                { id: 'REG-8092', type: 'Regularisation', name: 'Michael Chang', date: '14 Sep', detail: 'Check-In missing (09:00 AM)', prio: 'High' },
                { id: 'OT-4102', type: 'Overtime Claim', name: 'Rohan Mehta', date: '12 Sep', detail: 'Claimed 3h 10m OT deployment', prio: 'Normal' },
                { id: 'SWP-201', type: 'Shift Swap', name: 'Sneha Kulkarni', date: '15 Sep', detail: 'Morning to Night Swap with Kavya', prio: 'Normal' },
              ].map((req, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {req.id} • {req.type}</span>
                    <span className="text-[10px] font-bold text-slate-400">{req.date}</span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900">{req.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{req.detail}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveScreenId('SCR-MOB-016')}
                      className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold"
                    >
                      {t('common.approve', 'Approve')}</button>
                    <button className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold">{t('mobile.reject', 'Reject')}</button>
                  </div>
                </div>
              ))}</div>
          </div>
        );

      case 'SCR-MOB-006': // Calendar
        return (
          <div className="p-4 space-y-4 text-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveScreenId('SCR-MOB-002')} className="p-1 text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-sm text-slate-900">{t('mobile.september_2024', 'September 2024')}</h3>
              <div className="w-4" />
            </div>

            {/* Calendar 7x5 Grid */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm space-y-2">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 pb-1 border-b">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isOff = day % 7 === 6 || day % 7 === 0;
                  const isLate = day === 10 || day === 23;
                  const isLeave = day === 19;
                  return (
                    <div
                      key={day}
                      className={`p-1.5 rounded-lg font-medium text-[11px] flex flex-col items-center justify-center ${
                        isLeave ? 'bg-blue-100 text-blue-800 font-bold' :
                        isLate ? 'bg-amber-100 text-amber-800 font-bold' :
                        isOff ? 'bg-slate-100 text-slate-400' :
                        'bg-emerald-50 text-emerald-800 font-bold'
                      }`}
                    >
                      {day}
                      <span className={`w-1 h-1 rounded-full mt-0.5 ${
                        isLeave ? 'bg-blue-600' : isLate ? 'bg-amber-600' : isOff ? 'bg-slate-300' : 'bg-emerald-600'
                      }`} />
                    </div>
                  );
                })}</div>
            </div>

            {/* Selected Day Info */}
            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Tue, 10 Sep 2024</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">LATE (25m)</span>
              </div>
              <p className="text-[11px] text-slate-500">In: 09:25 AM • Out: 06:10 PM • 8h 15m</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('mobile.mobile_application_suite_flutt', 'Mobile Application Suite (Flutter)')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              SCR-MOB-001 to 025
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Interactive device simulation of all 25 cross-platform Flutter screens for iOS & Android with live offline sync and geofencing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            Flutter 3.x • Clean Architecture
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Screen Directory List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-3 max-h-[750px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('mobile.25_mobile_screens_directory', '25 Mobile Screens Directory')}</h3>
            <span className="text-xs text-slate-400 font-mono">100% Verified</span>
          </div>

          <div className="space-y-1.5">
            {screens.map((scr) => {
              const isSelected = activeScreenId === scr.id;
              return (
                <div
                  key={scr.id}
                  onClick={() => setActiveScreenId(scr.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                      : 'border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {scr.id}</span>
                      <span className="text-[10px] text-slate-400">Page {scr.page}</span>
                    </div>
                    <div className="truncate max-w-[220px]">{scr.title}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              );
            })}</div>
        </div>

        {/* Center: Interactive Phone Chassis (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[360px] h-[720px] bg-slate-900 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between">
            {/* Phone Screen Glass */}
            <div className="w-full h-full bg-[#f8fafc] rounded-[36px] overflow-hidden flex flex-col justify-between relative shadow-inner">
              {/* Dynamic Island & Status Bar */}
              <div className="h-11 bg-white px-6 flex items-center justify-between shrink-0 select-none border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 font-mono">09:41</span>
                {/* Dynamic Island Pill */}
                <div className="w-20 h-4 bg-slate-900 rounded-full" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800">
                  <span>5G</span>
                  <div className="w-4 h-2.5 border border-slate-800 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-800 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Dynamic Screen Viewport Area */}
              <div className="flex-1 overflow-y-auto">
                {renderMobileScreenContent()}</div>

              {/* Mobile Bottom Navigation Bar (5 tabs) */}
              <div className="h-16 bg-white border-t border-slate-200/80 px-4 flex items-center justify-around shrink-0 select-none">
                {[
                  { icon: Clock, label: 'Home', screen: 'SCR-MOB-002' },
                  { icon: Calendar, label: 'Attendance', screen: 'SCR-MOB-004' },
                  { icon: FileText, label: 'Requests', screen: 'SCR-MOB-010' },
                  { icon: Users, label: 'Team', screen: 'SCR-MOB-003' },
                  { icon: CheckCircle2, label: 'Approvals', screen: 'SCR-MOB-015' },
                ].map((tab, idx) => {
                  const IconComp = tab.icon;
                  const isActive = activeScreenId === tab.screen;
                  return (
                    <div
                      key={tab.label}
                      onClick={() => {
                        setBottomNavIndex(idx);
                        setActiveScreenId(tab.screen);
                      }}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                        isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[10px]">{tab.label}</span>
                    </div>
                  );
                })}</div>
            </div>
          </div>
        </div>

        {/* Right: Screen Details & Visual Spec Checklist (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {currentScreen.id}</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{currentScreen.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mapped to Ref Page <strong>{currentScreen.page}</strong> of the 52 InfiTimePro visual UI specification artifacts.
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Haversine GPS Geofencing
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Sensor Mock GPS Anti-Spoofing
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Offline SQLite Ingestion Buffer
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Multi-Tier Approval Handoff
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Flutter Workspace Structure
            </div>
            <p className="text-[11px] text-slate-500">
              Flutter project located in <code>apps/mobile/</code> with BLoC clean architecture and shared design tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
