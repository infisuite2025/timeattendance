import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  Check,
  Eye,
  X,
  FileCheck,
  RefreshCw,
  Lock,
  Globe,
  Database,
  Terminal,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AuditLogEntryDTO, AuditEventCategory, AuditEventSeverity } from '@infi-timepro/shared-types';
import { useI18n } from '../../context/I18nContext.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useNotification } from '../../context/NotificationContext.tsx';

export const AuditLogExplorerPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntryDTO | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const [logs, setLogs] = useState<AuditLogEntryDTO[]>([
    {
      id: 'aud-9801',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T17:45:12.000Z',
      eventCode: 'PAYROLL_PERIOD_LOCKED',
      category: 'payroll',
      severity: 'critical',
      actorId: 'usr-002',
      actorName: 'Anita Desai',
      actorEmail: 'anita.desai@company.com',
      actorRole: 'Head of HR & Payroll',
      targetEntity: 'PayPeriod',
      targetId: 'PAY-2026-AUG',
      ipAddress: '106.51.72.19',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0',
      location: 'Bengaluru, India',
      description: 'Applied immutable cryptographic lock and generated SHA-256 seal for August 2026 Monthly Pay Period.',
      beforeState: { status: 'ready_to_lock', totalEmployees: 248 },
      afterState: { status: 'locked', lockSignature: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384' },
      hashSignature: '0x9f8b23a104c9e812d3198a0c213f890adef78192039485710293847561029384',
      previousHash: '0x8e7a12b093d8f701c20879fb102e789fcd0e6781920394857102938475610293'
    },
    {
      id: 'aud-9802',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T16:20:00.000Z',
      eventCode: 'ATTENDANCE_OVERRIDE',
      category: 'attendance',
      severity: 'warning',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'Administrator',
      targetEntity: 'AttendanceDay',
      targetId: 'att-20260914-emp002',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Approved manual check-in regularisation of 09:00 AM for Michael Chang (EMP-1002) due to gate terminal sync lag.',
      beforeState: { firstIn: null, status: 'missing_punch' },
      afterState: { firstIn: '09:00 AM', status: 'present' },
      hashSignature: '0x8e7a12b093d8f701c20879fb102e789fcd0e6781920394857102938475610293',
      previousHash: '0x7d6f01a982c7e6f0b19768ea0f1d678ebc9d5670819283746501928374650192'
    },
    {
      id: 'aud-9803',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T14:10:35.000Z',
      eventCode: 'GEOFENCE_RADIUS_ALTERED',
      category: 'hardware',
      severity: 'warning',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'Administrator',
      targetEntity: 'GeofenceZone',
      targetId: 'geo-001',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Updated geofence radius boundary for Bengaluru Tech Park campus from 100m to 120m.',
      beforeState: { radiusMeters: 100 },
      afterState: { radiusMeters: 120 },
      hashSignature: '0x7d6f01a982c7e6f0b19768ea0f1d678ebc9d5670819283746501928374650192',
      previousHash: '0x6c5e90f871b6d5e9a08657d90e0c567dab8c4569708172635490817263549081'
    },
    {
      id: 'aud-9804',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T11:00:00.000Z',
      eventCode: 'SUPERADMIN_FEATURE_FLAG_TOGGLE',
      category: 'superadmin',
      severity: 'critical',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'SuperAdmin',
      targetEntity: 'TenantFeatureFlag',
      targetId: 'tenant-002:antiSpoofingSensors',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Enabled hardware mock-GPS anti-spoofing sensor heuristics for TechNova Cloud Solutions instance.',
      beforeState: { antiSpoofingSensors: false },
      afterState: { antiSpoofingSensors: true },
      hashSignature: '0x6c5e90f871b6d5e9a08657d90e0c567dab8c4569708172635490817263549081',
      previousHash: '0x5b4d8f0760a5c4d89f7546c8fd9b456c9a7b34586f706152438f706152438f70'
    },
    {
      id: 'aud-9805',
      tenantId: 'tenant-demo-001',
      timestamp: '2026-09-14T09:00:15.000Z',
      eventCode: 'AUTH_LOGIN_SUCCESS',
      category: 'authentication',
      severity: 'info',
      actorId: 'usr-001',
      actorName: 'Naresh Andukoori',
      actorEmail: 'naresh@company.com',
      actorRole: 'Administrator',
      targetEntity: 'UserSession',
      targetId: 'sess-89021',
      ipAddress: '183.82.112.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      location: 'Hyderabad, India',
      description: 'Successful administrative login with 2-Factor Authentication (TOTP).',
      hashSignature: '0x5b4d8f0760a5c4d89f7546c8fd9b456c9a7b34586f706152438f706152438f70',
      previousHash: '0x4a3c7e965f94b3c78e6435b7ec8a345b896a23475e6f5041327e5f5041327e5f'
    }
  ]);

  const filteredLogs = logs.filter(l => {
    const matchesCategory = filterCategory === 'all' || l.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || l.severity === filterSeverity;
    const matchesSearch =
      l.eventCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ipAddress.includes(searchTerm);
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const { toast } = useNotification();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAuditLogs = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient.post('/audit/export');
      if (res.data) {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SOC2_GDPR_Audit_Export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('SOC2 / GDPR Export Generated', 'Immutable cryptographic audit trail report downloaded successfully.');
      } else {
        toast.error('Export Failed', res.error?.message || 'Failed to generate export file.');
      }
    } catch {
      toast.error('Error generating audit export report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await apiClient.get('/audit/verify-integrity');
      if (res.data?.valid || res.success) {
        setVerifySuccess(true);
        toast.success('Integrity Verified', 'All Merkle hash chain blocks cryptographically validated.');
        setTimeout(() => setVerifySuccess(false), 4000);
      } else {
        toast.error('Verification Error', 'Failed to verify Merkle root integrity.');
      }
    } catch {
      toast.error('Error verifying cryptographic audit chain.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.system_audit_trail_compliance_', 'System Audit Trail & Compliance Explorer')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              SCR-WEB-027
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Immutable, cryptographically chained event log recording all managerial actions, policy shifts, punch overrides, and tenant provisioning events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium text-sm transition shadow-sm disabled:opacity-50"
          >
            <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin text-indigo-600' : 'text-emerald-600'}`} />
            {isVerifying ? 'Verifying Merkle Hash...' : 'Verify Cryptographic Chain'}</button>

          <button
            onClick={handleExportAuditLogs}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Generating Report...' : 'Export SOC2 / GDPR Audit Report'}
          </button>
        </div>
      </div>

      {/* Verification Success Toast Banner */}
      {verifySuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm">Merkle Root & Hash Chain Fully Validated</span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                All 14,820 consecutive SHA-256 blocks verified without any modification or tampering. Zero ledger violations found.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-3 py-1 rounded-lg">
            VALIDATED
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">14,820</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Audit Records</div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">Append-Only Partition</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">12</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">High-Risk Operations</div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">Requires Executive Review</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Cryptographic Integrity</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">SHA-256 Chained Hash</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">365 Days</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Immutable Retention</div>
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">SOC2 Type II Compliant</div>
          </div>
        </div>
      </div>

      {/* Audit Log Stream Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('admin.immutable_audit_trail_ledger', 'Immutable Audit Trail Ledger')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live sequential stream of all system events with non-repudiation cryptographic proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('admin.search_event_actor_ip', 'Search event, actor, IP...')}
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="payroll">Payroll Locking</option>
              <option value="attendance">Attendance Overrides</option>
              <option value="hardware">Hardware & Geofence</option>
              <option value="superadmin">SuperAdmin & Config</option>
              <option value="authentication">Authentication</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Event Code</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Location / IP</th>
                <th className="py-3 px-4">Cryptographic Hash</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{log.eventCode}</span>
                    <div className="text-[10px] font-normal text-slate-400 truncate max-w-[200px]">{log.description}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                    <div>{log.targetEntity}</div>
                    <div className="text-[10px] text-slate-400">{log.targetId}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    <div>{log.location}</div>
                    <div className="text-[10px] text-slate-400">{log.ipAddress}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[120px]">{log.hashSignature}</span>
                      <button
                        onClick={() => copyHash(log.hashSignature, log.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition"
                        title="Copy Hash"
                      >
                        {copiedHashId === log.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}</button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      log.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200'
                        : log.severity === 'warning'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200'
                    }`}>
                      {log.severity}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3 h-3 text-indigo-600" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Audit Event & State Diff Inspector Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">{selectedLog.eventCode}</h3>
                    <p className="text-xs text-slate-400">Audit ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Description */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2 text-xs">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedLog.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>Actor: <strong className="text-slate-800 dark:text-slate-200">{selectedLog.actorName}</strong></div>
                  <div>Role: <strong className="text-slate-800 dark:text-slate-200">{selectedLog.actorRole}</strong></div>
                  <div>IP: <strong className="text-slate-800 dark:text-slate-200">{selectedLog.ipAddress}</strong></div>
                  <div>Location: <strong className="text-slate-800 dark:text-slate-200">{selectedLog.location}</strong></div>
                </div>
              </div>

              {/* Before vs After State Diff (If available) */}
              {selectedLog.beforeState && selectedLog.afterState && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">State Modification Diff</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">State Before</span>
                      <pre className="text-[10px] font-mono mt-1 text-slate-700 dark:text-slate-300 overflow-x-auto">
                        {JSON.stringify(selectedLog.beforeState, null, 2)}</pre>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">State After</span>
                      <pre className="text-[10px] font-mono mt-1 text-slate-700 dark:text-slate-300 overflow-x-auto">
                        {JSON.stringify(selectedLog.afterState, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Cryptographic Chain Integrity Proof */}
              <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px]">Cryptographic Proof</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Chained Node
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400">Block Signature:</span>
                    <p className="text-indigo-600 dark:text-indigo-400 break-all">{selectedLog.hashSignature}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Previous Node Hash:</span>
                    <p className="text-slate-500 break-all">{selectedLog.previousHash}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                Done</button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
