import React, { useState, useEffect } from 'react';
import {
  Truck, MapPin, Navigation, Users, Wrench, CheckCircle2,
  AlertTriangle, Clock, Star, RefreshCw, Zap, ChevronRight,
  Radio, Car, TrendingUp, Package, DollarSign, Route,
  AlertCircle, Send, BarChart3, Eye, ThumbsUp, ThumbsDown,
  CircleDot, Wifi, WifiOff, Shield
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FFDashboard {
  totalFieldEngineers: number; engineersOnSite: number; engineersAvailable: number; engineersOffDuty: number;
  totalJobSites: number; activeJobSites: number; jobsScheduledToday: number; jobsCompletedToday: number;
  jobsInProgress: number; jobsOverdue: number; avgCompletionRate: number; avgCustomerRating: number;
  pendingMileageClaims: number; totalMileageClaimAmountPending: number;
  fleetAvailable: number; fleetAssigned: number; fleetInMaintenance: number;
}
interface JobSite { id: string; siteName: string; siteCode: string; city: string; country: string; territory: string; status: string; clientName: string; totalJobsCompleted: number; averageJobDurationMins: number; latitude: number; longitude: number; geofenceRadiusMeters: number; lastVisitedAt?: string; }
interface FieldEngineer { id: string; employeeId: string; employeeName: string; employeeCode: string; skills: string[]; currentStatus: string; currentJobId?: string; vehicleNumber?: string; totalJobsThisMonth: number; completionRate: number; avgRating: number; territory: string; currentLatitude?: number; currentLongitude?: number; lastLocationUpdatedAt?: string; }
interface JobOrder { id: string; jobCode: string; title: string; description: string; siteName: string; siteAddress: string; clientName: string; assignedEngineerName?: string; assignedEngineerId?: string; priority: 'low' | 'normal' | 'high' | 'critical'; status: string; scheduledAt: string; estimatedDurationMins: number; actualDurationMins?: number; completedAt?: string; completionNotes?: string; partsUsed?: string[]; customerRating?: number; createdAt: string; }
interface SiteCheckIn { id: string; employeeName: string; employeeCode: string; siteName: string; checkInLatitude: number; checkInLongitude: number; distanceFromSiteMeters: number; isWithinGeofence: boolean; checkInAt: string; checkOutAt?: string; durationMins?: number; gpsAccuracyMeters: number; verificationStatus: string; }
interface Vehicle { id: string; vehicleNumber: string; make: string; model: string; year: number; vehicleType: string; status: string; assignedEngineerName?: string; currentOdometerKm: number; nextServiceKm: number; fuelType: string; insuranceExpiryDate: string; territory: string; }
interface MileageClaim { id: string; employeeName: string; employeeCode: string; jobCode: string; vehicleNumber?: string; tripDate: string; fromLocation: string; toLocation: string; distanceKm: number; ratePerKm: number; claimAmount: number; currency: string; status: string; approvedBy?: string; rejectionReason?: string; }

type Tab = 'overview' | 'live-map' | 'jobs' | 'check-ins' | 'fleet' | 'mileage';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtCurr = (n: number, c = 'INR') => `${c === 'INR' ? '₹' : c === 'AED' ? 'AED ' : '$'}${n.toLocaleString('en-IN')}`;
const priorityColors: Record<string, string> = { critical: 'bg-red-100 text-red-700 border-red-200', high: 'bg-orange-100 text-orange-700 border-orange-200', normal: 'bg-blue-100 text-blue-700 border-blue-200', low: 'bg-gray-100 text-gray-500' };
const jobStatusColors: Record<string, string> = { scheduled: 'bg-gray-100 text-gray-600', dispatched: 'bg-blue-100 text-blue-700', en_route: 'bg-indigo-100 text-indigo-700', on_site: 'bg-amber-100 text-amber-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-gray-100 text-gray-400', failed: 'bg-red-100 text-red-700' };
const engStatusColors: Record<string, string> = { available: 'bg-emerald-400', dispatched: 'bg-blue-400', on_site: 'bg-amber-400', off_duty: 'bg-gray-300', on_leave: 'bg-purple-300' };
const claimStatusColors: Record<string, string> = { draft: 'bg-gray-100 text-gray-500', submitted: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', reimbursed: 'bg-blue-100 text-blue-700' };

export const FieldForcePage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotification();
  const [tab, setTab] = useState<Tab>('overview');
  const [summary, setSummary] = useState<FFDashboard | null>(null);
  const [sites, setSites] = useState<JobSite[]>([]);
  const [engineers, setEngineers] = useState<FieldEngineer[]>([]);
  const [jobs, setJobs] = useState<JobOrder[]>([]);
  const [checkIns, setCheckIns] = useState<SiteCheckIn[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mileage, setMileage] = useState<MileageClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobOrder | null>(null);

  useEffect(() => { loadAll(); }, []);

  const arr = (res: any) => Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sumRes, sitesRes, engRes, jobsRes, chkRes, vehRes, milRes] = await Promise.all([
        apiClient.get<FFDashboard>('/field-force/dashboard'),
        apiClient.get<JobSite[]>('/field-force/sites'),
        apiClient.get<FieldEngineer[]>('/field-force/engineers'),
        apiClient.get<JobOrder[]>('/field-force/jobs'),
        apiClient.get<SiteCheckIn[]>('/field-force/check-ins'),
        apiClient.get<Vehicle[]>('/field-force/vehicles'),
        apiClient.get<MileageClaim[]>('/field-force/mileage'),
      ]);
      if (sumRes.data) setSummary(sumRes.data);
      setSites(arr(sitesRes)); setEngineers(arr(engRes)); setJobs(arr(jobsRes));
      setCheckIns(arr(chkRes)); setVehicles(arr(vehRes)); setMileage(arr(milRes));
    } catch { toast.error('Failed to load Field Force data'); }
    finally { setLoading(false); }
  };

  const handleDispatch = async (job: JobOrder) => {
    const available = engineers.filter(e => e.currentStatus === 'available');
    if (available.length === 0) { toast.error('No available engineers to dispatch'); return; }
    const eng = available[0];
    const ok = await confirm({ title: `Dispatch ${eng.employeeName}?`, text: `Assign ${eng.employeeName} to "${job.title}" at ${job.siteName}. Mobile app notification will be sent.`, icon: 'question', confirmButtonText: 'Yes, Dispatch', cancelButtonText: 'Cancel' });
    if (!ok) return;
    const res = await apiClient.post(`/field-force/jobs/${job.id}/dispatch`, { engineerId: eng.employeeId, engineerName: eng.employeeName });
    if (!res.error) { toast.success(`${eng.employeeName} dispatched — mobile app notified 📱`); loadAll(); }
    else toast.error(res.error?.message || 'Dispatch failed');
  };

  const handleComplete = async (job: JobOrder) => {
    const ok = await confirm({ title: 'Mark Job as Completed?', text: `Confirm completion of "${job.title}". This will free up the assigned engineer.`, icon: 'question', confirmButtonText: 'Complete Job', cancelButtonText: 'Cancel' });
    if (!ok) return;
    const res = await apiClient.post(`/field-force/jobs/${job.id}/complete`, { notes: 'Completed via admin panel.', rating: 5, partsUsed: [] });
    if (!res.error) { toast.success('Job completed — engineer is now available'); loadAll(); }
    else toast.error(res.error?.message || 'Completion failed');
  };

  const handleApproveMileage = async (claim: MileageClaim) => {
    const res = await apiClient.post(`/field-force/mileage/${claim.id}/approve`, { approvedBy: 'Vikram Singh' });
    if (!res.error) { toast.success(`Mileage claim approved — ${fmtCurr(claim.claimAmount, claim.currency)} queued for reimbursement`); setMileage(prev => prev.map(m => m.id === claim.id ? { ...m, status: 'approved' } : m)); }
    else toast.error(res.error?.message || 'Approval failed');
  };

  const handleRejectMileage = async (claim: MileageClaim) => {
    const ok = await confirm({ title: 'Reject Mileage Claim?', text: `Reject ${claim.employeeName}'s claim of ${fmtCurr(claim.claimAmount, claim.currency)} for trip to ${claim.toLocation}.`, icon: 'warning', confirmButtonText: 'Reject', cancelButtonText: 'Cancel', isDangerous: true });
    if (!ok) return;
    const res = await apiClient.post(`/field-force/mileage/${claim.id}/reject`, { approvedBy: 'Vikram Singh', rejectionReason: 'Route distance does not match GPS records' });
    if (!res.error) { toast.warning('Mileage claim rejected'); setMileage(prev => prev.map(m => m.id === claim.id ? { ...m, status: 'rejected' } : m)); }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'live-map', label: 'Live Dispatch', icon: Radio },
    { id: 'jobs', label: 'Job Orders', icon: Wrench },
    { id: 'check-ins', label: 'Site Check-Ins', icon: MapPin },
    { id: 'fleet', label: 'Fleet', icon: Car },
    { id: 'mileage', label: 'Mileage Claims', icon: Route },
  ];

  const filteredJobs = jobFilter === 'all' ? jobs : jobs.filter(j => j.status === jobFilter);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 animate-spin text-teal-600" /><span className="ml-3 text-gray-600 font-medium">Loading Field Force Hub…</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl"><Truck className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('field-force.field_force_management', 'Field Force Management')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Live dispatch · GPS check-ins · Fleet tracking · Mileage reimbursement</p>
          </div>
          <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-600 text-white flex items-center gap-1">
            <Zap className="w-3 h-3" /> Add-on
          </span>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {/* Overdue alert */}
      {summary && summary.jobsOverdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 text-sm"><span className="font-semibold text-red-700">{summary.jobsOverdue} overdue job(s)</span><span className="text-red-600 ml-2">— scheduled time passed with no completion confirmation.</span></div>
          <button onClick={() => setTab('jobs')} className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 font-medium">{t('common.view_jobs', 'View Jobs')}</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <t.icon className="w-4 h-4" />{t.label}
              {t.id === 'jobs' && summary && summary.jobsOverdue > 0 && <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-bold">{summary.jobsOverdue}</span>}
              {t.id === 'mileage' && summary && summary.pendingMileageClaims > 0 && <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-bold">{summary.pendingMileageClaims}</span>}</button>
          ))}
        </nav>
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Engineers On-Site', value: summary.engineersOnSite, sub: `${summary.engineersAvailable} available`, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Jobs In Progress', value: summary.jobsInProgress, sub: `${summary.jobsCompletedToday} completed today`, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Avg Completion Rate', value: `${summary.avgCompletionRate}%`, sub: `Avg rating ${summary.avgCustomerRating} ⭐`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending Mileage', value: fmtCurr(summary.totalMileageClaimAmountPending), sub: `${summary.pendingMileageClaims} claim(s) pending`, icon: Route, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
                <div className="text-2xl font-bold text-gray-900">{k.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
                <div className="text-sm text-gray-500 mt-1">{k.label}</div>
              </div>
            ))}</div>

          {/* Engineer status + Fleet status side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">{t('field-force.engineer_status', 'Engineer Status')}</h3>
              <div className="flex rounded-full overflow-hidden h-5 mb-3">
                {[
                  { count: summary.engineersOnSite, color: 'bg-amber-400', label: 'On Site' },
                  { count: engineers.filter(e => e.currentStatus === 'dispatched').length, color: 'bg-blue-400', label: 'Dispatched' },
                  { count: summary.engineersAvailable, color: 'bg-emerald-400', label: 'Available' },
                  { count: summary.engineersOffDuty, color: 'bg-gray-200', label: 'Off Duty' },
                ].map(s => s.count > 0 && (
                  <div key={s.label} className={`${s.color} flex items-center justify-center text-xs text-white font-semibold`} style={{ width: `${(s.count / summary.totalFieldEngineers) * 100}%` }}>{s.count}</div>
                ))}</div>
              <div className="flex flex-wrap gap-3 text-xs">
                {[{l:'On Site',c:'bg-amber-400',v:summary.engineersOnSite},{l:'Dispatched',c:'bg-blue-400',v:engineers.filter(e=>e.currentStatus==='dispatched').length},{l:'Available',c:'bg-emerald-400',v:summary.engineersAvailable},{l:'Off Duty',c:'bg-gray-300',v:summary.engineersOffDuty}].map(s=>(
                  <span key={s.l} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${s.c}`}/>{s.l}: {s.v}</span>
                ))}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Fleet Status ({summary.fleetAvailable + summary.fleetAssigned + summary.fleetInMaintenance} vehicles)</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Assigned', value: summary.fleetAssigned, color: 'bg-blue-500', max: vehicles.length },
                  { label: 'Available', value: summary.fleetAvailable, color: 'bg-emerald-500', max: vehicles.length },
                  { label: 'Maintenance', value: summary.fleetInMaintenance, color: 'bg-red-400', max: vehicles.length },
                ].map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{f.label}</span><span className="font-semibold">{f.value}</span></div>
                    <div className="bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full ${f.color}`} style={{ width: `${(f.value / f.max) * 100}%` }} /></div>
                  </div>
                ))}</div>
            </div>
          </div>

          {/* Top engineers */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">{t('field-force.field_engineer_performance', 'Field Engineer Performance')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {engineers.map(eng => (
                <div key={eng.id} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${engStatusColors[eng.currentStatus] || 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">{eng.employeeName}</div>
                    <div className="text-xs text-gray-400">{eng.territory} · {eng.currentStatus.replace('_', ' ')}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-500">{eng.totalJobsThisMonth} jobs</span>
                      <span className="text-xs text-emerald-600 font-medium">{eng.completionRate}%</span>
                      <span className="text-xs flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3" />{eng.avgRating}</span>
                    </div>
                  </div>
                </div>
              ))}</div>
          </div>
        </div>
      )}

      {/* ── Live Dispatch ── */}
      {tab === 'live-map' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-teal-900 to-cyan-900 rounded-2xl p-6 text-white relative overflow-hidden" style={{ minHeight: '340px' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-teal-300 animate-pulse" /><span className="text-teal-200 text-sm font-medium">LIVE FIELD MAP</span>
                <span className="ml-auto text-xs text-teal-300">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {engineers.filter(e => ['on_site', 'dispatched', 'en_route'].includes(e.currentStatus)).map(eng => (
                  <div key={eng.id} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${eng.currentStatus === 'on_site' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                      <span className="font-semibold text-sm">{eng.employeeName}</span>
                      <span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded-full capitalize">{eng.currentStatus.replace('_',' ')}</span>
                    </div>
                    {eng.currentJobId && (
                      <div className="text-xs text-teal-200">
                        <div>{jobs.find(j=>j.id===eng.currentJobId)?.title || 'Active job'}</div>
                        <div className="text-teal-300 mt-0.5">{jobs.find(j=>j.id===eng.currentJobId)?.siteName}</div>
                      </div>
                    )}
                    <div className="text-xs text-teal-300 mt-1.5 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {eng.currentLatitude ? `${eng.currentLatitude.toFixed(4)}, ${eng.currentLongitude?.toFixed(4)}` : 'En route…'}</div>
                    <div className="text-xs text-teal-400 mt-0.5">🚐 {eng.vehicleNumber || 'No vehicle'}</div>
                  </div>
                ))}</div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm font-medium text-teal-100 mb-2">Unassigned Jobs Needing Dispatch</div>
                <div className="space-y-2">
                  {jobs.filter(j => j.status === 'scheduled' && !j.assignedEngineerId).map(job => (
                    <div key={job.id} className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold border ${priorityColors[job.priority]}`}>{job.priority}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{job.title}</div>
                        <div className="text-xs text-teal-300">{job.siteName} · {fmtDate(job.scheduledAt)}</div>
                      </div>
                      <button onClick={() => handleDispatch(job)} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-white text-xs rounded-lg font-medium">
                        <Send className="w-3 h-3" /> Dispatch
                      </button>
                    </div>
                  ))}
                  {jobs.filter(j => j.status === 'scheduled' && !j.assignedEngineerId).length === 0 && (
                    <div className="text-teal-400 text-sm">✓ All jobs have assigned engineers</div>
                  )}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Job Orders ── */}
      {tab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'scheduled', 'dispatched', 'on_site', 'completed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setJobFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize border transition-colors ${jobFilter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                {f === 'all' ? `All (${jobs.length})` : `${f.replace('_',' ')} (${jobs.filter(j=>j.status===f).length})`}</button>
            ))}</div>
          <div className="space-y-3">
            {filteredJobs.map(job => (
              <div key={job.id} className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${job.priority === 'critical' ? 'border-l-red-500' : job.priority === 'high' ? 'border-l-orange-500' : job.priority === 'normal' ? 'border-l-blue-400' : 'border-l-gray-300'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-gray-400">{job.jobCode}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${priorityColors[job.priority]}`}>{job.priority.toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${jobStatusColors[job.status]}`}>{job.status.replace('_',' ')}</span>
                    </div>
                    <h3 className="font-bold text-gray-800">{job.title}</h3>
                    <div className="text-sm text-gray-500 mt-0.5">{job.siteName} · {job.clientName}</div>
                    <div className="text-xs text-gray-400 mt-1">{job.siteAddress}</div>
                    <div className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                      <span>🕐 Scheduled: {fmtDate(job.scheduledAt)}</span>
                      <span>⏱ Est. {job.estimatedDurationMins} min{job.actualDurationMins ? ` · Actual ${job.actualDurationMins} min` : ''}</span>
                      {job.assignedEngineerName && <span>👷 {job.assignedEngineerName}</span>}</div>
                    {job.customerRating && (
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({length:5}).map((_,i)=><Star key={i} className={`w-3.5 h-3.5 ${i<job.customerRating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}/>)}
                        <span className="text-xs text-gray-500 ml-1">{job.customerRating}/5</span>
                      </div>
                    )}
                    {job.partsUsed && job.partsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.partsUsed.map(p => <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"><Package className="w-3 h-3 inline mr-1"/>{p}</span>)}</div>
                    )}</div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => setSelectedJob(job)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-medium">
                      <Eye className="w-3.5 h-3.5"/> Details
                    </button>
                    {job.status === 'scheduled' && !job.assignedEngineerId && (
                      <button onClick={() => handleDispatch(job)} className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-medium hover:bg-teal-700"><Send className="w-3.5 h-3.5"/> Dispatch</button>
                    )}
                    {(job.status === 'dispatched' || job.status === 'on_site') && (
                      <button onClick={() => handleComplete(job)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700"><CheckCircle2 className="w-3.5 h-3.5"/> Mark Done</button>
                    )}</div>
                </div>
              </div>
            ))}</div>
        </div>
      )}

      {/* ── Site Check-Ins ── */}
      {tab === 'check-ins' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Engineer','Site','Check-In','Check-Out','Duration','Distance','GPS Accuracy','Status'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {checkIns.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50/50 ${!c.isWithinGeofence ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3"><div className="font-medium text-gray-800">{c.employeeName}</div><div className="text-xs text-gray-400">{c.employeeCode}</div></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.siteName}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{fmtDate(c.checkInAt)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.checkOutAt ? fmtDate(c.checkOutAt) : <span className="text-amber-600 font-medium">Active</span>}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.durationMins ? `${c.durationMins} min` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${c.distanceFromSiteMeters <= 150 ? 'text-emerald-600' : c.distanceFromSiteMeters <= 500 ? 'text-amber-600' : 'text-red-600'}`}>{c.distanceFromSiteMeters}m</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">±{c.gpsAccuracyMeters}m</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${c.verificationStatus === 'verified' ? 'text-emerald-600' : c.verificationStatus === 'outside_geofence' ? 'text-red-600' : 'text-amber-600'}`}>
                        {c.verificationStatus === 'verified' ? <Wifi className="w-3.5 h-3.5"/> : <WifiOff className="w-3.5 h-3.5"/>}
                        {c.verificationStatus.replace('_',' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Fleet ── */}
      {tab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => {
            const serviceUrgent = (v.nextServiceKm - v.currentOdometerKm) < 2000;
            return (
              <div key={v.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${v.status === 'maintenance' ? 'border-red-200' : v.status === 'available' ? 'border-emerald-100' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${v.status === 'assigned' ? 'bg-blue-50' : v.status === 'available' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      {v.vehicleType === 'car' ? <Car className={`w-4 h-4 ${v.status==='assigned'?'text-blue-600':v.status==='available'?'text-emerald-600':'text-red-600'}`}/> : <Truck className={`w-4 h-4 ${v.status==='assigned'?'text-blue-600':v.status==='available'?'text-emerald-600':'text-red-600'}`}/>}</div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{v.vehicleNumber}</div>
                      <div className="text-xs text-gray-400">{v.year} {v.make} {v.model}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${v.status==='assigned'?'bg-blue-100 text-blue-700':v.status==='available'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{v.status}</span>
                </div>
                {v.assignedEngineerName && <div className="text-xs text-gray-500 mb-2">👷 Assigned to: <span className="font-medium text-gray-700">{v.assignedEngineerName}</span></div>}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-gray-50 rounded-lg p-2"><div className="font-semibold text-gray-700">{v.currentOdometerKm.toLocaleString()} km</div><div className="text-gray-400">Odometer</div></div>
                  <div className={`rounded-lg p-2 ${serviceUrgent ? 'bg-orange-50' : 'bg-gray-50'}`}><div className={`font-semibold ${serviceUrgent ? 'text-orange-600' : 'text-gray-700'}`}>{(v.nextServiceKm - v.currentOdometerKm).toLocaleString()} km</div><div className="text-gray-400">To Next Service</div></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>⛽ {v.fuelType}</span>
                  <span>🌍 {v.territory}</span>
                </div>
                {serviceUrgent && <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded-lg p-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>Service due soon!</div>}</div>
            );
          })}</div>
      )}

      {/* ── Mileage Claims ── */}
      {tab === 'mileage' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 flex items-start gap-2">
            <Route className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600"/>
            <div><strong>Mileage Reimbursement Policy:</strong> INR ₹8/km (India) · AED 2.5/km (UAE). Approved claims are auto-submitted to the next payroll run for reimbursement.</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Engineer','Job','Trip Date','Route','Distance','Rate','Amount','Status','Actions'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mileage.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50 group">
                      <td className="px-4 py-3"><div className="font-medium text-gray-800">{m.employeeName}</div><div className="text-xs text-gray-400">{m.employeeCode}</div></td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{m.jobCode}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{m.tripDate}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 max-w-xs"><div className="truncate">{m.fromLocation}</div><div className="text-gray-400">→ {m.toLocation}</div></div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium text-xs">{m.distanceKm} km</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{m.currency === 'INR' ? '₹' : 'AED '}{m.ratePerKm}/km</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{fmtCurr(m.claimAmount, m.currency)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${claimStatusColors[m.status]}`}>{m.status}</span></td>
                      <td className="px-4 py-3">
                        {m.status === 'submitted' && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => handleApproveMileage(m)} className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><ThumbsUp className="w-3.5 h-3.5"/></button>
                            <button onClick={() => handleRejectMileage(m)} className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"><ThumbsDown className="w-3.5 h-3.5"/></button>
                          </div>
                        )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Job Order Detail View Modal ── */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-teal-200">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-teal-200 font-semibold">{selectedJob.jobCode}</span>
                <h3 className="font-bold text-lg">{selectedJob.title}</h3>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-teal-100 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Client &amp; Site Name</span>
                  <span className="font-semibold text-gray-900">{selectedJob.clientName} · {selectedJob.siteName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Priority &amp; Status</span>
                  <div className="flex gap-1.5 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${priorityColors[selectedJob.priority]}`}>{selectedJob.priority.toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${jobStatusColors[selectedJob.status]}`}>{selectedJob.status.replace('_',' ')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block">Scheduled Time</span>
                  <span className="font-medium text-gray-700">{fmtDate(selectedJob.scheduledAt)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Assigned Engineer</span>
                  <span className="font-semibold text-teal-700">{selectedJob.assignedEngineerName || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Site Address &amp; Instructions</h4>
                <div className="text-xs text-gray-700 bg-teal-50/50 border border-teal-100 rounded-xl p-3">
                  <div className="font-medium text-teal-900 mb-1">📍 {selectedJob.siteAddress}</div>
                  <p className="text-gray-600 leading-relaxed">{selectedJob.description}</p>
                </div>
              </div>

              {selectedJob.partsUsed && selectedJob.partsUsed.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Parts &amp; Materials Used</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.partsUsed.map(p => (
                      <span key={p} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium border border-gray-200">
                        📦 {p}</span>
                    ))}</div>
                </div>
              )}

              {selectedJob.customerRating && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs flex items-center justify-between">
                  <span className="font-semibold text-amber-900">Customer Feedback Rating:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({length:5}).map((_,i)=><Star key={i} className={`w-4 h-4 ${i<selectedJob.customerRating! ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`}/>)}
                    <span className="font-bold text-amber-700 ml-1">{selectedJob.customerRating}/5</span>
                  </div>
                </div>
              )}</div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
              {selectedJob.status === 'scheduled' && !selectedJob.assignedEngineerId && (
                <button
                  onClick={() => {
                    const job = selectedJob;
                    setSelectedJob(null);
                    handleDispatch(job);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4"/> Dispatch Engineer
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 ml-auto"
              >
                Close Job Order</button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
