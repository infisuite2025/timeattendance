import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  PlusCircle,
  X,
  TrendingUp,
  DollarSign,
  Check,
  Building,
  Briefcase,
  Sparkles,
  Zap,
  Sliders,
  Eye,
  EyeOff,
  Coffee,
  HelpCircle,
  FileCheck,
  Info
} from 'lucide-react';
import { OvertimeRequestDTO } from '@infi-timepro/shared-types';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export type OvertimePolicyStrategy = 
  | 'MANUAL_CLAIM' 
  | 'AUTO_ACCRUE' 
  | 'CONVERT_TO_COMP_OFF' 
  | 'NO_OT_INFORMATIONAL' 
  | 'NO_OT_MASKED';

export interface DetectedExtraHourRecord {
  id: string;
  date: string;
  shiftName: string;
  shiftTiming: string;
  actualIn: string;
  actualOut: string;
  detectedExtraMinutes: number;
  policyQualifyingMinutes: number;
  multiplier: number;
  status: 'ELIGIBLE_TO_CLAIM' | 'CLAIMED' | 'AUTO_ACCRUED' | 'COMP_OFF_CONVERTED';
}

export const OvertimeRequestsPage: React.FC = () => {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const { toast } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Policy Strategy (Tenant / Department Configurable Setting)
  const [policyStrategy, setPolicyStrategy] = useState<OvertimePolicyStrategy>('MANUAL_CLAIM');

  // Form State
  const [claimDate, setClaimDate] = useState('2026-09-14');
  const [claimMinutes, setClaimMinutes] = useState(120);
  const [claimProject, setClaimProject] = useState('PRJ-INFITIME-CORE');
  const [claimReason, setClaimReason] = useState('');

  // 1. Detected Unclaimed Extra Hours
  const [detectedExtraHours, setDetectedExtraHours] = useState<DetectedExtraHourRecord[]>([
    {
      id: 'deh-01',
      date: '2026-09-14',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      actualIn: '08:55 AM',
      actualOut: '07:45 PM',
      detectedExtraMinutes: 105, // 1h 45m
      policyQualifyingMinutes: 90, // after 15m buffer
      multiplier: 1.5,
      status: 'ELIGIBLE_TO_CLAIM'
    },
    {
      id: 'deh-02',
      date: '2026-09-12',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      actualIn: '08:50 AM',
      actualOut: '07:20 PM',
      detectedExtraMinutes: 80, // 1h 20m
      policyQualifyingMinutes: 60, // 1h rounded
      multiplier: 1.5,
      status: 'ELIGIBLE_TO_CLAIM'
    }
  ]);

  // Mock Overtime List
  const [otList, setOtList] = useState<OvertimeRequestDTO[]>([
    {
      id: 'ot-001',
      requestCode: 'OT-4102',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Operations & Assembly',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      attendanceDate: '2026-09-13',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      claimedMinutes: 120,
      systemCalculatedMinutes: 110,
      approvedMinutes: 110,
      projectCode: 'PRJ-INFITIME-CORE',
      reason: 'Release 2.4 production deployment and sanity verification window.',
      status: 'approved',
      approverName: 'David Rodriguez',
      submittedAt: '2026-09-13T18:30:00.000Z',
      decidedAt: '2026-09-14T08:15:00.000Z'
    },
    {
      id: 'ot-002',
      requestCode: 'OT-4103',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-006',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      department: 'Operations & Assembly',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      attendanceDate: '2026-09-14',
      shiftName: 'Night Shift',
      shiftTiming: '10:00 PM - 06:30 AM',
      claimedMinutes: 90,
      systemCalculatedMinutes: 90,
      projectCode: 'PRJ-DB-OPTIMIZE',
      reason: 'Database index rebuild and high volume stress testing.',
      status: 'pending',
      submittedAt: '2026-09-14T06:45:00.000Z'
    },
    {
      id: 'ot-003',
      requestCode: 'OT-4098',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'David Rodriguez',
      department: 'Customer Success',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      attendanceDate: '2026-09-10',
      shiftName: 'General Shift',
      shiftTiming: '09:00 AM - 06:00 PM',
      claimedMinutes: 60,
      systemCalculatedMinutes: 45,
      approvedMinutes: 45,
      projectCode: 'PRJ-ENTERPRISE-ONBOARD',
      reason: 'Late night customer training for US West Coast enterprise account.',
      status: 'approved',
      approverName: 'Anita Desai',
      submittedAt: '2026-09-10T19:00:00.000Z',
      decidedAt: '2026-09-11T10:00:00.000Z'
    }
  ]);

  const handleAutoClaimAll = () => {
    const eligible = detectedExtraHours.filter(d => d.status === 'ELIGIBLE_TO_CLAIM');
    if (eligible.length === 0) return;

    const newClaims: OvertimeRequestDTO[] = eligible.map(d => ({
      id: `ot-${Date.now()}-${d.id}`,
      requestCode: `OT-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: 'tenant-demo-001',
      employeeId: user.id,
      employeeCode: user.employeeCode,
      employeeName: user.name,
      department: user.department,
      avatarUrl: user.avatar,
      attendanceDate: d.date,
      shiftName: d.shiftName,
      shiftTiming: d.shiftTiming,
      claimedMinutes: d.policyQualifyingMinutes,
      systemCalculatedMinutes: d.policyQualifyingMinutes,
      projectCode: 'PRJ-AUTO-ACCRUAL',
      reason: `System-detected overtime: Clocked out at ${d.actualOut} exceeding standard shift end (+${Math.round(d.detectedExtraMinutes/60*10)/10}h).`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    }));

    setOtList(prev => [...newClaims, ...prev]);
    setDetectedExtraHours(prev => prev.map(d => ({ ...d, status: 'CLAIMED' })));
    toast.success('Overtime Auto-Claimed', `⚡ Successfully claimed ${eligible.length} detected overtime session(s) (${eligible.reduce((acc, c) => acc + c.policyQualifyingMinutes, 0) / 60}h total) for manager review.`);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newOt: OvertimeRequestDTO = {
        id: `ot-${Date.now()}`,
        requestCode: `OT-${Math.floor(1000 + Math.random() * 9000)}`,
        tenantId: 'tenant-demo-001',
        employeeId: 'emp-001',
        employeeCode: 'EMP-1001',
        employeeName: 'Sarah Jenkins',
        department: 'Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        attendanceDate: claimDate,
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        claimedMinutes: claimMinutes,
        systemCalculatedMinutes: claimMinutes,
        projectCode: claimProject,
        reason: claimReason,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      setOtList(prev => [newOt, ...prev]);
      setIsSubmitting(false);
      setShowClaimModal(false);
      setClaimReason('');
      toast.success('Claim Submitted', `Overtime claim #${newOt.requestCode} submitted for manager review.`);
    }, 500);
  };

  const filteredList = otList.filter(item => {
    // Role-based data scoping
    if (role === 'EMPLOYEE') {
      if (item.employeeCode !== user.employeeCode) return false;
    } else if (role === 'MANAGER') {
      // Manager sees direct team (e.g. Operations & Assembly staff: EMP-1001, EMP-1006)
      const isTeamMember = item.department === 'Operations' || item.department === 'Operations & Assembly' || item.employeeCode === 'EMP-1001' || item.employeeCode === 'EMP-1006';
      if (!isTeamMember) return false;
    }

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('attendance.overtime_extra_hours_managemen', 'Overtime & Extra Hours Management')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              Policy Multiplier: {policyStrategy === 'CONVERT_TO_COMP_OFF' ? '1.0x (Comp-Off)' : '1.5x Pay'}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Detect, review, auto-accrue, or claim overtime hours as per enterprise attendance and compensation policies.
          </p>

          {/* Scope Indicator Banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
            {role === 'EMPLOYEE' && (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Personal View: Showing extra hours for <strong>{user.name} ({user.employeeCode})</strong></span>
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
          {policyStrategy !== 'NO_OT_MASKED' && policyStrategy !== 'NO_OT_INFORMATIONAL' && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Claim Overtime
            </button>
          )}</div>
      </div>

      {/* 2. Policy Strategy & Visibility Governance Bar (Configurable Setting) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Tenant Policy Governance (Configurable Rule)</span>
            </div>
            <p className="text-xs text-slate-300">
              Select how this organization treats extra hours worked by employees:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setPolicyStrategy('MANUAL_CLAIM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                policyStrategy === 'MANUAL_CLAIM'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              📝 Manual Claim
            </button>
            <button
              onClick={() => setPolicyStrategy('AUTO_ACCRUE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                policyStrategy === 'AUTO_ACCRUE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              ⚡ Auto-Accrue OT
            </button>
            <button
              onClick={() => setPolicyStrategy('CONVERT_TO_COMP_OFF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                policyStrategy === 'CONVERT_TO_COMP_OFF'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              🌴 Convert Comp-Off
            </button>
            <button
              onClick={() => setPolicyStrategy('NO_OT_INFORMATIONAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                policyStrategy === 'NO_OT_INFORMATIONAL'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              ℹ️ No OT (Info Only)</button>
            <button
              onClick={() => setPolicyStrategy('NO_OT_MASKED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                policyStrategy === 'NO_OT_MASKED'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              🔒 No OT (Masked)</button>
          </div>
        </div>

        {/* Policy Description Callout */}
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              {policyStrategy === 'MANUAL_CLAIM' && 'System detects extra hours. Employee reviews and submits claims for manager approval with project codes.'}
              {policyStrategy === 'AUTO_ACCRUE' && 'System turnstile clock-outs automatically calculate qualified OT and send straight to payroll export without manual claims.'}
              {policyStrategy === 'CONVERT_TO_COMP_OFF' && 'Extra hours worked on weekends or late shifts are converted into Compensatory Off leave days in Leave Studio.'}
              {policyStrategy === 'NO_OT_INFORMATIONAL' && 'Overtime pay is not applicable (salaried/IT flexi). Extra hours are shown for effort tracking, but claiming is disabled.'}
              {policyStrategy === 'NO_OT_MASKED' && 'Overtime tracking is completely disabled. Extra hours are masked/suppressed to standard 8.0h shift duration.'}</span>
          </div>
        </div>
      </div>

      {/* 3. Condition A: If Policy is NO_OT_MASKED, Show Masked Notice */}
      {policyStrategy === 'NO_OT_MASKED' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <EyeOff className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{t('attendance.overtime_tracking_is_disabled', 'Overtime Tracking is Disabled')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This organization policy specifies that extra hours are not tracked or compensated. All attendance is recorded strictly up to standard shift limits.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            Policy Rule: MASK_SUPPRESS_EXTRA_HOURS
          </span>
        </div>
      ) : (
        <>
          {/* 4. Detected Unclaimed Extra Hours Hub */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/40 via-white to-purple-50/30">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    {policyStrategy === 'NO_OT_INFORMATIONAL' ? 'System-Detected Extended Hours (Informational)' : 'System-Detected Extra Hours Ready to Claim'}</h3>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {detectedExtraHours.filter(d => d.status === 'ELIGIBLE_TO_CLAIM').length} Detected
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated from biometric & mobile punches after deducting the 15-minute grace threshold.
                </p>
              </div>

              {policyStrategy === 'MANUAL_CLAIM' && (
                <button
                  onClick={handleAutoClaimAll}
                  disabled={detectedExtraHours.filter(d => d.status === 'ELIGIBLE_TO_CLAIM').length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  Claim All Eligible ({detectedExtraHours.filter(d => d.status === 'ELIGIBLE_TO_CLAIM').reduce((acc, c) => acc + c.policyQualifyingMinutes, 0) / 60}h)</button>
              )}

              {policyStrategy === 'AUTO_ACCRUE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Auto-Accrual Engine Active
                </span>
              )}

              {policyStrategy === 'CONVERT_TO_COMP_OFF' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  <Coffee className="w-4 h-4 text-purple-600" />
                  Auto-Converting to Comp-Off Leave
                </span>
              )}</div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Shift Schedule</th>
                    <th className="py-3 px-4">Actual Punches</th>
                    <th className="py-3 px-4 text-center">Detected Extra</th>
                    <th className="py-3 px-4 text-center">Policy Qualified</th>
                    <th className="py-3 px-4 text-center">Status / Mode</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detectedExtraHours.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {record.date}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{record.shiftName}</div>
                        <div className="text-[10px] text-slate-400">{record.shiftTiming}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        IN: {record.actualIn} → <span className="font-bold text-purple-700">OUT: {record.actualOut}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-600">
                        +{Math.floor(record.detectedExtraMinutes / 60)}h {record.detectedExtraMinutes % 60}m
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                        {Math.floor(record.policyQualifyingMinutes / 60)}h {record.policyQualifyingMinutes % 60}m ({record.multiplier}x)
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {record.status === 'CLAIMED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Claim Submitted
                          </span>
                        ) : policyStrategy === 'AUTO_ACCRUE' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Auto-Credited to Payroll
                          </span>
                        ) : policyStrategy === 'CONVERT_TO_COMP_OFF' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Credited to Comp-Off Bank
                          </span>
                        ) : policyStrategy === 'NO_OT_INFORMATIONAL' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Informational Only
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Eligible to Claim
                          </span>
                        )}</td>
                      <td className="py-3.5 px-4 text-right">
                        {record.status === 'ELIGIBLE_TO_CLAIM' && policyStrategy === 'MANUAL_CLAIM' ? (
                          <button
                            onClick={() => {
                              setClaimDate(record.date);
                              setClaimMinutes(record.policyQualifyingMinutes);
                              setShowClaimModal(true);
                            }}
                            className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            Claim OT
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Logged</span>
                        )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">18</div>
            <div className="text-xs font-medium text-slate-500">Total OT Claims</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">September 2026</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">4</div>
            <div className="text-xs font-medium text-slate-500">Pending Approvals</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">3.5 hours claimed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">48.5h</div>
            <div className="text-xs font-medium text-slate-500">Approved OT Hours</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Calculated by Policy</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">$2,425</div>
            <div className="text-xs font-medium text-slate-500">Est. Payroll Payable</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">Ready for export</div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status}</button>
          ))}</div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('attendance.search_employee_project_reason', 'Search employee, project, reason...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Request Code</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Date & Shift</th>
                <th className="py-3.5 px-4">Claimed vs Policy OT</th>
                <th className="py-3.5 px-4">Project / Task</th>
                <th className="py-3.5 px-4">Reason & Justification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-600">
                    {item.requestCode}</td>
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
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-semibold text-slate-900">{item.attendanceDate}</div>
                    <div className="text-[11px] text-slate-500">{item.shiftName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="font-bold text-purple-700">
                      {Math.floor(item.claimedMinutes / 60)}h {item.claimedMinutes % 60}m claimed
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Calculated: {Math.floor(item.systemCalculatedMinutes / 60)}h {item.systemCalculatedMinutes % 60}m
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {item.projectCode || 'General'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-700 truncate max-w-xs">{item.reason}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === 'approved' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>
                    ) : item.status === 'rejected' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                    )}</td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setOtList(prev => prev.map(o => o.id === item.id ? { ...o, status: 'approved' } : o));
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setOtList(prev => prev.map(o => o.id === item.id ? { ...o, status: 'rejected' } : o));
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Decided</span>
                    )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">{t('attendance.claim_overtime_hours', 'Claim Overtime Hours')}</h3>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.attendance_date', 'Attendance Date')}</label>
                <input
                  type="date"
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.overtime_duration_minutes', 'Overtime Duration (Minutes)')}</label>
                <input
                  type="number"
                  step="15"
                  value={claimMinutes}
                  onChange={(e) => setClaimMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  120 minutes = 2.0 hours (Standard OT rate: 1.5x)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('attendance.project_code_cost_center', 'Project Code / Cost Center')}</label>
                <input
                  type="text"
                  value={claimProject}
                  onChange={(e) => setClaimProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Work Description & Task Deliverables <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder={t('attendance.detail_the_emergency_or_schedu', 'Detail the emergency or scheduled overtime deliverable...')}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit OT Claim'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}</div>
  );
};
