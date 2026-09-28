import React, { useState, useEffect } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, ShieldOff, AlertTriangle,
  Smartphone, Fingerprint, MapPin, Brain, Eye, Ban,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Plus,
  ChevronRight, Search, Filter, Activity, Zap,
  Lock, Unlock, Cpu, Radio, Crosshair
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext.tsx';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ThreatSummary {
  totalDevicesRegistered: number;
  devicesPassedAttestation: number;
  devicesWithWarning: number;
  devicesBlocked: number;
  totalSpoofEventsLast30Days: number;
  criticalThreatCount: number;
  highThreatCount: number;
  punchesBlockedLast30Days: number;
  livenessPassRate: number;
  avgLivenessScore: number;
  blacklistedAppsActive: number;
  totalBlacklistDetections: number;
  overallThreatLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface LivenessCheck {
  id: string;
  employeeName: string;
  employeeCode: string;
  deviceId: string;
  checkType: string;
  result: 'passed' | 'failed' | 'warning';
  confidenceScore: number;
  livenessScore: number;
  timestamp: string;
  processingTimeMs: number;
  modelVersion: string;
  failureReason?: string;
  actionRequired: boolean;
}

interface SpoofEvent {
  id: string;
  employeeName: string;
  employeeCode: string;
  eventType: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  deviceModel: string;
  detectionMethod: string;
  description: string;
  punchBlocked: boolean;
  hrAlerted: boolean;
  status: 'detected' | 'confirmed' | 'under_review' | 'false_positive' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  mlModelConfidence: number;
  falsePositiveProbability: number;
}

interface DeviceAttestation {
  id: string;
  employeeName: string;
  employeeCode: string;
  deviceId: string;
  deviceModel: string;
  platform: 'android' | 'ios';
  osVersion: string;
  appVersion: string;
  attestationStatus: 'passed' | 'warning' | 'failed' | 'pending';
  isRooted: boolean;
  isMockLocationEnabled: boolean;
  blacklistedAppsFound: string[];
  lastCheckedAt: string;
  playIntegrityStatus: string;
  warningReason?: string;
}

interface BlacklistedApp {
  id: string;
  appPackageName: string;
  appDisplayName: string;
  platform: string;
  threatCategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedCount: number;
  addedAt: string;
  addedBy: string;
  isActive: boolean;
  description: string;
}

type ActiveTab = 'threat-monitor' | 'liveness-audit' | 'device-attestation' | 'blacklist';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const threatColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusColors: Record<string, string> = {
  passed:       'bg-emerald-100 text-emerald-700',
  failed:       'bg-red-100 text-red-700',
  warning:      'bg-amber-100 text-amber-700',
  pending:      'bg-gray-100 text-gray-500',
  confirmed:    'bg-red-100 text-red-700',
  under_review: 'bg-amber-100 text-amber-700',
  detected:     'bg-orange-100 text-orange-700',
  resolved:     'bg-emerald-100 text-emerald-700',
  false_positive: 'bg-blue-100 text-blue-600',
};

const eventTypeIcons: Record<string, React.ElementType> = {
  gps_spoof:    MapPin,
  photo_replay: Eye,
  deepfake_face: Brain,
  root_bypass:  Unlock,
  screen_replay: Radio,
  mask_attack:  Crosshair,
};

const fmtTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Component ────────────────────────────────────────────────────────────────
export const BiometricSecurityPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState<ActiveTab>('threat-monitor');
  const [summary, setSummary] = useState<ThreatSummary | null>(null);
  const [livenessChecks, setLivenessChecks] = useState<LivenessCheck[]>([]);
  const [spoofEvents, setSpoofEvents] = useState<SpoofEvent[]>([]);
  const [devices, setDevices] = useState<DeviceAttestation[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [lvFilter, setLvFilter] = useState('all');
  const [spoofFilter, setSpoofFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBlacklistModal, setShowAddBlacklistModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SpoofEvent | null>(null);
  const [newApp, setNewApp] = useState({ appPackageName: '', appDisplayName: '', platform: 'android', threatCategory: 'gps_spoof', severity: 'high', description: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, lvRes, spoofRes, devRes, blRes] = await Promise.all([
        apiClient.get<ThreatSummary>('/security/dashboard'),
        apiClient.get<LivenessCheck[]>('/security/liveness'),
        apiClient.get<SpoofEvent[]>('/security/spoof-events'),
        apiClient.get<DeviceAttestation[]>('/security/devices'),
        apiClient.get<BlacklistedApp[]>('/security/blacklist'),
      ]);
      if (summaryRes.data) setSummary(summaryRes.data);
      if (lvRes.data) setLivenessChecks(Array.isArray(lvRes.data) ? lvRes.data : (lvRes.data as any).data || []);
      if (spoofRes.data) setSpoofEvents(Array.isArray(spoofRes.data) ? spoofRes.data : (spoofRes.data as any).data || []);
      if (devRes.data) setDevices(Array.isArray(devRes.data) ? devRes.data : (devRes.data as any).data || []);
      if (blRes.data) setBlacklist(Array.isArray(blRes.data) ? blRes.data : (blRes.data as any).data || []);
    } catch (err) {
      toast.error('Failed to load Security Hub data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveEvent = async (event: SpoofEvent) => {
    const confirmed = await confirm({
      title: 'Mark Event as Resolved?',
      text: `Confirm resolution of the ${event.eventType.replace('_', ' ')} event for ${event.employeeName}.`,
      icon: 'question',
      confirmButtonText: 'Mark Resolved',
      cancelButtonText: 'Cancel',
    });
    if (!confirmed) return;
    const res = await apiClient.post(`/security/spoof-events/${event.id}/resolve`, {
      resolvedBy: 'Naresh Andukoori',
      resolutionNotes: 'Reviewed and resolved via Security Hub',
    });
    if (!res.error) {
      toast.success('Spoof event marked as resolved');
      setSpoofEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: 'resolved' as const, resolvedBy: 'Naresh Andukoori' } : e));
    } else {
      toast.error(res.error?.message || 'Failed to resolve event');
    }
  };

  const handleRevokeDevice = async (device: DeviceAttestation) => {
    const confirmed = await confirm({
      title: `Revoke Device Access?`,
      text: `${device.deviceModel} registered to ${device.employeeName} will be blocked from mobile punch-in immediately.`,
      icon: 'warning',
      confirmButtonText: 'Yes, Revoke Device',
      cancelButtonText: 'Cancel',
      isDangerous: true,
    });
    if (!confirmed) return;
    const res = await apiClient.post(`/security/devices/${device.deviceId}/revoke`, { revokedBy: 'Naresh Andukoori' });
    if (!res.error) {
      toast.warning(`Device revoked — ${device.employeeName} cannot punch-in via mobile`);
      setDevices(prev => prev.map(d => d.deviceId === device.deviceId ? { ...d, attestationStatus: 'failed' as const } : d));
    } else {
      toast.error(res.error?.message || 'Revocation failed');
    }
  };

  const handleToggleBlacklist = async (app: BlacklistedApp) => {
    const res = await apiClient.post(`/security/blacklist/${app.id}/toggle`, { isActive: !app.isActive });
    if (!res?.error) {
      toast.success(`App ${app.isActive ? 'deactivated' : 'reactivated'} in blacklist`);
      setBlacklist(prev => prev.map(a => a.id === app.id ? { ...a, isActive: !a.isActive } : a));
    }
  };

  const handleAddBlacklist = async () => {
    if (!newApp.appPackageName) { toast.error('Package name is required'); return; }
    const res = await apiClient.post('/security/blacklist', { ...newApp, addedBy: 'Naresh Andukoori' });
    if (!res.error) {
      toast.success('App added to threat blacklist');
      setShowAddBlacklistModal(false);
      setNewApp({ appPackageName: '', appDisplayName: '', platform: 'android', threatCategory: 'gps_spoof', severity: 'high', description: '' });
      loadAll();
    } else {
      toast.error(res.error?.message || 'Failed to add app');
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'threat-monitor', label: 'Threat Monitor', icon: Activity },
    { id: 'liveness-audit', label: 'Liveness Audit', icon: Fingerprint },
    { id: 'device-attestation', label: 'Device Attestation', icon: Smartphone },
    { id: 'blacklist', label: 'App Blacklist', icon: Ban },
  ];

  const filteredLiveness = livenessChecks.filter(l => {
    const matchResult = lvFilter === 'all' || l.result === lvFilter;
    const matchSearch = !searchQuery || l.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchResult && matchSearch;
  });

  const filteredSpoof = spoofEvents.filter(e => {
    const matchStatus = spoofFilter === 'all' || e.status === spoofFilter;
    return matchStatus;
  });

  const threatLevelConfig = {
    critical: { bg: 'from-red-600 to-red-700', icon: ShieldOff, text: 'CRITICAL THREAT', pulse: true },
    high:     { bg: 'from-orange-500 to-red-600', icon: ShieldAlert, text: 'HIGH THREAT', pulse: true },
    medium:   { bg: 'from-amber-500 to-orange-500', icon: Shield, text: 'MEDIUM THREAT', pulse: false },
    low:      { bg: 'from-emerald-500 to-teal-600', icon: ShieldCheck, text: 'LOW THREAT', pulse: false },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
        <span className="ml-3 text-gray-600 font-medium">Loading Security Hub…</span>
      </div>
    );
  }

  const threatConfig = summary ? threatLevelConfig[summary.overallThreatLevel] : threatLevelConfig.low;
  const ThreatIcon = threatConfig.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${threatConfig.bg} ${threatConfig.pulse ? 'animate-pulse' : ''}`}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('security.ai_biometric_security_hub', 'AI Biometric Security Hub')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Real-time liveness verification, GPS spoof detection &amp; device threat intelligence</p>
          </div>
          <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center gap-1">
            <Zap className="w-3 h-3" /> Add-on
          </span>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Threat Level Banner */}
      {summary && summary.overallThreatLevel !== 'low' && (
        <div className={`bg-gradient-to-r ${threatConfig.bg} rounded-2xl p-4 text-white flex items-center gap-4`}>
          <div className={`p-2 bg-white/20 rounded-xl ${threatConfig.pulse ? 'animate-pulse' : ''}`}>
            <ThreatIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg">{threatConfig.text} DETECTED</div>
            <div className="text-sm text-white/80">
              {summary.criticalThreatCount} critical + {summary.highThreatCount} high threat events require attention. {summary.punchesBlockedLast30Days} punches blocked in last 30 days.
            </div>
          </div>
          <button onClick={() => { setSpoofFilter('confirmed'); setActiveTab('threat-monitor'); }} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold border border-white/30">
            View Active Threats
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'threat-monitor' && summary && summary.criticalThreatCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-bold">
                  {summary.criticalThreatCount}</span>
              )}
              {tab.id === 'liveness-audit' && livenessChecks.filter(l => l.actionRequired).length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-bold">
                  {livenessChecks.filter(l => l.actionRequired).length}</span>
              )}
              {tab.id === 'device-attestation' && devices.filter(d => d.attestationStatus === 'failed').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-bold">
                  {devices.filter(d => d.attestationStatus === 'failed').length}</span>
              )}</button>
          ))}
        </nav>
      </div>

      {/* ── Threat Monitor Tab ── */}
      {activeTab === 'threat-monitor' && summary && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Devices Registered', value: summary.totalDevicesRegistered, sub: `${summary.devicesPassedAttestation} passed`, icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Liveness Pass Rate', value: `${summary.livenessPassRate}%`, sub: `Avg score ${summary.avgLivenessScore}`, icon: Fingerprint, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Punches Blocked', value: summary.punchesBlockedLast30Days, sub: 'Last 30 days', icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Blacklist Detections', value: summary.totalBlacklistDetections, sub: `${summary.blacklistedAppsActive} active rules`, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
                <div className="text-sm text-gray-500 mt-1">{kpi.label}</div>
              </div>
            ))}</div>

          {/* Device Health Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{t('security.device_fleet_health', 'Device Fleet Health')}</h3>
            <div className="flex rounded-full overflow-hidden h-6 mb-3">
              <div
                className="bg-emerald-400 flex items-center justify-center text-xs text-white font-semibold transition-all"
                style={{ width: `${(summary.devicesPassedAttestation / summary.totalDevicesRegistered) * 100}%` }}
              >Passed</div>
              <div
                className="bg-amber-400 flex items-center justify-center text-xs text-white font-semibold transition-all"
                style={{ width: `${(summary.devicesWithWarning / summary.totalDevicesRegistered) * 100}%` }}
              >Warn</div>
              <div
                className="bg-red-500 flex items-center justify-center text-xs text-white font-semibold transition-all"
                style={{ width: `${(summary.devicesBlocked / summary.totalDevicesRegistered) * 100}%` }}
              >Blocked</div>
            </div>
            <div className="flex gap-6 text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />{summary.devicesPassedAttestation} Passed</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />{summary.devicesWithWarning} Warning</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{summary.devicesBlocked} Blocked</span>
            </div>
          </div>

          {/* Spoof Events Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Threat Event Log
              </h3>
              <div className="flex gap-2">
                {['all', 'confirmed', 'under_review', 'resolved'].map(s => (
                  <button key={s} onClick={() => setSpoofFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${spoofFilter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s.replace('_', ' ')}</button>
                ))}</div>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredSpoof.map(event => {
                const EventIcon = eventTypeIcons[event.eventType] || AlertCircle;
                return (
                  <div key={event.id} className="px-6 py-4 hover:bg-gray-50/50 group transition-colors cursor-pointer" onClick={() => setSelectedEvent(event)}>
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 p-2 rounded-xl border ${threatColors[event.threatLevel]}`}>
                        <EventIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800">{event.employeeName}</span>
                          <span className="text-xs text-gray-400">({event.employeeCode})</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${threatColors[event.threatLevel]}`}>
                            {event.threatLevel.toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                            {event.status.replace('_', ' ')}</span>
                          {event.punchBlocked && (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                              <Ban className="w-3 h-3" /> Punch Blocked
                            </span>
                          )}</div>
                        <div className="text-sm text-gray-500 mt-1 capitalize">{event.eventType.replace('_', ' ')} · {event.deviceModel} · {fmtTime(event.detectedAt)}</div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>ML Confidence: <strong className="text-gray-600">{event.mlModelConfidence}%</strong></span>
                          <span>False Positive: <strong className="text-gray-600">{event.falsePositiveProbability}%</strong></span>
                          <span>{event.detectionMethod}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        {(event.status === 'confirmed' || event.status === 'under_review') && (
                          <button
                            onClick={() => handleResolveEvent(event)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 whitespace-nowrap"
                          >
                            {t('security.markResolved', 'Mark Resolved')}</button>
                        )}</div>
                    </div>
                  </div>
                );
              })}</div>
          </div>
        </div>
      )}

      {/* ── Liveness Audit Tab ── */}
      {activeTab === 'liveness-audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t('security.search_by_employee', 'Search by employee…')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500/20" />
            </div>
            <div className="flex gap-2">
              {['all', 'passed', 'failed', 'warning'].map(f => (
                <button key={f} onClick={() => setLvFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${lvFilter === f ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
              ))}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Employee', 'Check Type', 'Result', 'Confidence', 'Liveness Score', 'Timestamp', 'Model', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLiveness.map(lv => (
                    <tr key={lv.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{lv.employeeName}</div>
                        <div className="text-xs text-gray-400">{lv.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize text-xs">{lv.checkType.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lv.result]}`}>{lv.result}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${lv.confidenceScore >= 90 ? 'bg-emerald-500' : lv.confidenceScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${lv.confidenceScore}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{lv.confidenceScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${lv.livenessScore >= 90 ? 'text-emerald-600' : lv.livenessScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {lv.livenessScore}</span>
                        <span className="text-xs text-gray-400"> / 100</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtTime(lv.timestamp)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{lv.modelVersion}</td>
                      <td className="px-4 py-3">
                        {lv.actionRequired && (
                          <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Review
                          </span>
                        )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failure Details */}
          {filteredLiveness.filter(l => l.failureReason).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Failure Details</h4>
              {filteredLiveness.filter(l => l.failureReason).map(lv => (
                <div key={lv.id} className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-red-800 text-sm">{lv.employeeName} · {fmtTime(lv.timestamp)}</div>
                      <div className="text-sm text-red-700 mt-1">{lv.failureReason}</div>
                    </div>
                  </div>
                </div>
              ))}</div>
          )}</div>
      )}

      {/* ── Device Attestation Tab ── */}
      {activeTab === 'device-attestation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map(device => (
            <div key={device.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-shadow hover:shadow-md ${
              device.attestationStatus === 'failed' ? 'border-red-200' :
              device.attestationStatus === 'warning' ? 'border-amber-200' : 'border-gray-100'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    device.attestationStatus === 'passed' ? 'bg-emerald-50' :
                    device.attestationStatus === 'warning' ? 'bg-amber-50' : 'bg-red-50'
                  }`}>
                    <Smartphone className={`w-5 h-5 ${
                      device.attestationStatus === 'passed' ? 'text-emerald-600' :
                      device.attestationStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{device.employeeName}</div>
                    <div className="text-xs text-gray-400">{device.employeeCode}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  device.attestationStatus === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  device.attestationStatus === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {device.attestationStatus === 'passed' ? '✓ Trusted' : device.attestationStatus === 'warning' ? '⚠ Warning' : '✗ Blocked'}</span>
              </div>

              <div className="text-sm text-gray-700 font-medium">{device.deviceModel}</div>
              <div className="text-xs text-gray-400">{device.platform === 'android' ? '🤖' : '🍎'} {device.osVersion} · App {device.appVersion}</div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Rooted', value: device.isRooted, danger: true },
                  { label: 'Mock GPS', value: device.isMockLocationEnabled, danger: true },
                  { label: 'Play Integrity', value: device.playIntegrityStatus === 'strong', danger: false },
                ].map((check, i) => (
                  <div key={i} className={`rounded-lg p-2 text-center text-xs ${
                    check.danger ? (check.value ? 'bg-red-50' : 'bg-gray-50') : (check.value ? 'bg-emerald-50' : 'bg-red-50')
                  }`}>
                    <div className={`font-semibold ${
                      check.danger ? (check.value ? 'text-red-600' : 'text-gray-500') : (check.value ? 'text-emerald-600' : 'text-red-500')
                    }`}>
                      {check.danger ? (check.value ? '✗ Yes' : '✓ No') : (check.value ? '✓ Strong' : `✗ ${device.playIntegrityStatus}`)}</div>
                    <div className="text-gray-400 mt-0.5">{check.label}</div>
                  </div>
                ))}</div>

              {device.blacklistedAppsFound.length > 0 && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-xl">
                  <div className="text-xs font-semibold text-red-700 flex items-center gap-1">
                    <Ban className="w-3 h-3" /> {device.blacklistedAppsFound.length} blacklisted app(s) detected
                  </div>
                  {device.blacklistedAppsFound.map(pkg => (
                    <div key={pkg} className="text-xs text-red-600 font-mono mt-1">{pkg}</div>
                  ))}</div>
              )}

              {device.warningReason && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                  {device.warningReason}</div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>Last checked: {fmtTime(device.lastCheckedAt)}</span>
                {device.attestationStatus !== 'failed' && (
                  <button onClick={() => handleRevokeDevice(device)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3" /> Revoke
                  </button>
                )}</div>
            </div>
          ))}</div>
      )}

      {/* ── App Blacklist Tab ── */}
      {activeTab === 'blacklist' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">{blacklist.filter(a => a.isActive).length} active rules · {blacklist.filter(a => !a.isActive).length} paused</div>
            <button onClick={() => setShowAddBlacklistModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add to Blacklist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blacklist.map(app => (
              <div key={app.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${app.isActive ? 'border-red-100' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${app.isActive ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <Ban className={`w-4 h-4 ${app.isActive ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{app.appDisplayName}</div>
                      <div className="text-xs font-mono text-gray-400">{app.appPackageName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${threatColors[app.severity]}`}>
                      {app.severity.toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${app.platform === 'android' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                      {app.platform === 'android' ? '🤖 Android' : '🍎 iOS'}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 capitalize mb-2">{app.threatCategory.replace('_', ' ')} threat</div>
                <p className="text-sm text-gray-600 line-clamp-2">{app.description}</p>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold text-red-600">{app.detectedCount}</span> detections · Added by {app.addedBy}</div>
                  <button onClick={() => handleToggleBlacklist(app)}
                    className={`text-xs px-3 py-1 rounded-lg border font-medium ${app.isActive ? 'text-gray-500 border-gray-200 hover:bg-gray-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                    {app.isActive ? 'Pause Rule' : 'Reactivate'}</button>
                </div>
              </div>
            ))}</div>
        </div>
      )}

      {/* ── Add Blacklist Modal ── */}
      {showAddBlacklistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{t('security.add_app_to_blacklist', 'Add App to Blacklist')}</h3>
              <button onClick={() => setShowAddBlacklistModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {[
                { label: 'Package Name *', key: 'appPackageName', placeholder: 'e.g. com.fake.gps.app' },
                { label: 'Display Name', key: 'appDisplayName', placeholder: 'e.g. Fake GPS Pro' },
                { label: 'Description', key: 'description', placeholder: 'Why is this app a threat?' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{field.label}</label>
                  {field.key === 'description' ? (
                    <textarea rows={2} value={(newApp as any)[field.key]} onChange={e => setNewApp(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none" />
                  ) : (
                    <input type="text" value={(newApp as any)[field.key]} onChange={e => setNewApp(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" />
                  )}</div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Platform', key: 'platform', opts: ['android', 'ios', 'both'] },
                  { label: 'Category', key: 'threatCategory', opts: ['gps_spoof', 'root_jailbreak', 'deepfake', 'screen_replay', 'vpn_proxy'] },
                  { label: 'Severity', key: 'severity', opts: ['medium', 'high', 'critical'] },
                ].map(sel => (
                  <div key={sel.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 capitalize">{sel.label}</label>
                    <select value={(newApp as any)[sel.key]} onChange={e => setNewApp(p => ({ ...p, [sel.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20">
                      {sel.opts.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                ))}</div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAddBlacklistModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50">{t('action.cancel', 'Cancel')}</button>
              <button onClick={handleAddBlacklist} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-700">{t('security.add_to_blacklist', 'Add to Blacklist')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Threat Forensic Detail Modal ── */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-red-200">
            <div className={`bg-gradient-to-r ${threatColors[selectedEvent.threatLevel].includes('red') ? 'from-red-600 to-red-700' : 'from-orange-500 to-amber-600'} text-white px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">{t('security.threat_forensic_audit', 'Threat Forensic Audit')}</h3>
                  <p className="text-xs opacity-90">{selectedEvent.eventType.replace('_', ' ').toUpperCase()} · ID: {selectedEvent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-white/80 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Target Employee</span>
                  <span className="font-semibold text-gray-900 text-sm">{selectedEvent.employeeName} ({selectedEvent.employeeCode})</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Detection Time</span>
                  <span className="font-medium text-gray-700">{fmtTime(selectedEvent.detectedAt)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Device Model</span>
                  <span className="font-medium text-gray-700">{selectedEvent.deviceModel}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase mt-0.5 ${statusColors[selectedEvent.status]}`}>
                    {selectedEvent.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Threat Analysis &amp; Findings</h4>
                <p className="text-gray-700 bg-red-50/60 border border-red-100 rounded-xl p-3 text-xs leading-relaxed">
                  {selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <div className="text-gray-400">ML Model Score</div>
                  <div className="text-base font-bold text-red-600 mt-0.5">{selectedEvent.mlModelConfidence}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <div className="text-gray-400">False Positive Prob.</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">{selectedEvent.falsePositiveProbability}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <div className="text-gray-400">Punch Action</div>
                  <div className={`text-base font-bold mt-0.5 ${selectedEvent.punchBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedEvent.punchBlocked ? 'Blocked' : 'Allowed'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Detection Method &amp; Engine</h4>
                <div className="text-xs text-gray-600 font-mono bg-gray-100 rounded-xl p-2.5">
                  {selectedEvent.detectionMethod}</div>
              </div>

              {selectedEvent.resolvedBy && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800">
                  ✔ Resolved by <strong>{selectedEvent.resolvedBy}</strong> on {selectedEvent.resolvedAt ? fmtTime(selectedEvent.resolvedAt) : 'N/A'}</div>
              )}</div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
              {(selectedEvent.status === 'confirmed' || selectedEvent.status === 'under_review') && (
                <button
                  onClick={() => {
                    handleResolveEvent(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Mark Threat Resolved
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 ml-auto"
              >
                {t('action.closeAudit', 'Close Audit')}</button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
