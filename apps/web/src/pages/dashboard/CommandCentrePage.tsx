import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  CalendarDays,
  Home,
  Briefcase,
  AlertTriangle,
  Zap,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import { DashboardKPISummaryDTO, HourlyAttendanceTrendItem, LocationDistributionItem } from '@infi-timepro/shared-types';

export const CommandCentrePage: React.FC = () => {
  const { toast } = useNotification();
  const { t } = useI18n();
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDate, setSelectedDate] = useState('2026-09-18');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Metric State with resilient defaults
  const [kpis, setKpis] = useState<DashboardKPISummaryDTO>({
    totalEmployees: { count: 1248, changeVsLastMonth: '+2.4%' },
    present: { count: 892, percentage: 71.5 },
    notArrived: { count: 156, percentage: 12.5 },
    late: { count: 62, percentage: 5.0 },
    onLeave: { count: 58, percentage: 4.6 },
    wfh: { count: 44, percentage: 3.5 },
    fieldDuty: { count: 26, percentage: 2.1 },
    missingPunch: { count: 10, percentage: 0.8 },
  });

  const [hourlyTrend, setHourlyTrend] = useState<HourlyAttendanceTrendItem[]>([
    { hour: '6 AM', present: 50, expected: 80 },
    { hour: '8 AM', present: 480, expected: 550 },
    { hour: '10 AM', present: 892, expected: 920 },
    { hour: '12 PM', present: 885, expected: 920 },
    { hour: '2 PM', present: 870, expected: 920 },
    { hour: '4 PM', present: 860, expected: 920 },
    { hour: '6 PM', present: 720, expected: 850 },
    { hour: '8 PM', present: 310, expected: 400 },
  ]);

  const [locationDist, setLocationDist] = useState<LocationDistributionItem[]>([
    { location: 'Hyderabad Main Office', count: 650, percentage: 52, color: '#3B82F6' },
    { location: 'Bengaluru Tech Park', count: 302, percentage: 24, color: '#10B981' },
    { location: 'Mumbai Financial Centre', count: 146, percentage: 12, color: '#F59E0B' },
    { location: 'Delhi Cyber Hub', count: 100, percentage: 8, color: '#8B5CF6' },
    { location: 'Remote / Field Locations', count: 50, percentage: 4, color: '#64748B' },
  ]);

  const fetchLiveAnalytics = async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const [summaryRes, trendRes, locRes] = await Promise.all([
        apiClient.get('/analytics/dashboard-summary', { location: selectedLocation, date: selectedDate }),
        apiClient.get('/analytics/hourly-trend', { location: selectedLocation }),
        apiClient.get('/analytics/location-distribution'),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setKpis(summaryRes.data);
      }
      if (trendRes.success && Array.isArray(trendRes.data)) {
        setHourlyTrend(trendRes.data);
      }
      if (locRes.success && Array.isArray(locRes.data)) {
        setLocationDist(locRes.data);
      }

      if (showToast) {
        toast.success('Live Analytics Synchronized', `Updated metrics for ${selectedLocation} (${selectedDate}).`);
      }
    } catch (err: any) {
      console.warn('Live analytics fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveAnalytics(false);
  }, [selectedLocation, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{t('dashboard.breadcrumbExec', 'Executive Dashboard')}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">{t('dashboard.breadcrumbCommand', 'Command Centre')}</span>
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {t('dashboard.liveApi', 'Live API')}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {t('dashboard.title', 'Workforce Command & Analytics Centre')}</h1>
          <p className="text-xs text-slate-500">
            {t('dashboard.subtitle', 'Real-time biometric attendance metrics, intraday punch curves, and operational radar.')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Selector */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-0 text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent border-0 text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All Locations">{t('dashboard.allLocations', 'All Locations')} (1,248 Staff)</option>
              <option value="Hyderabad Main Office">Hyderabad Main Office</option>
              <option value="Bengaluru Tech Park">Bengaluru Tech Park</option>
              <option value="Mumbai Financial Centre">Mumbai Financial Centre</option>
              <option value="Delhi Cyber Hub">Delhi Cyber Hub</option>
            </select>
          </div>

          {/* Manual Refresh Trigger */}
          <button
            onClick={() => fetchLiveAnalytics(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            title="Refresh live metrics"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Quote Banner */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-3 text-white shadow-sm">
        <p className="text-xs font-medium italic opacity-95">
          {t('dashboard.quote', '"Punctuality and real-time visibility empower autonomous, high-trust teams."')}</p>
        <span className="text-[11px] font-semibold text-blue-100 bg-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {t('dashboard.telemetryConnected', 'Live Telemetry Connected')}</span>
      </div>

      {/* 8 Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {/* Total Employees */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-blue-600">
            <Users className="h-4 w-4" />
            <span className="flex items-center text-[10px] font-bold text-emerald-600">
              <TrendingUp className="mr-0.5 h-3 w-3" /> {kpis.totalEmployees.changeVsLastMonth}</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('dashboard.kpiTotalEmp', 'Total Employees')}</p>
          <p className="text-xl font-bold text-slate-900">{kpis.totalEmployees.count.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.inSelectedScope', 'in selected scope')}</p>
        </div>

        {/* Present */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-emerald-600">
            <UserCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold text-emerald-600">{kpis.present.percentage}%</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('status.present', 'Present')}</p>
          <p className="text-xl font-bold text-emerald-600">{kpis.present.count}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.punchedInToday', 'punched in today')}</p>
        </div>

        {/* Not Arrived */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-rose-500">
            <UserX className="h-4 w-4" />
            <span className="text-[10px] font-bold text-rose-500">{kpis.notArrived.percentage}%</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('dashboard.notArrived', 'Not Arrived')}</p>
          <p className="text-xl font-bold text-rose-600">{kpis.notArrived.count}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.pendingPunch', 'pending punch')}</p>
        </div>

        {/* Late */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-amber-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-[10px] font-bold text-amber-600">{kpis.late.percentage}%</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('dashboard.lateArrival', 'Late Arrival')}</p>
          <p className="text-xl font-bold text-amber-600">{kpis.late.count}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.pastShiftGrace', 'past shift grace')}</p>
        </div>

        {/* On Leave */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-purple-600">
            <CalendarDays className="h-4 w-4" />
            <span className="text-[10px] font-bold text-purple-600">{kpis.onLeave.percentage}%</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('status.onLeave', 'On Leave')}</p>
          <p className="text-xl font-bold text-purple-600">{kpis.onLeave.count}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.approvedLeaves', 'approved leaves')}</p>
        </div>

        {/* WFH */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-blue-500">
            <Home className="h-4 w-4" />
            <span className="text-[10px] font-bold text-blue-600">{kpis.wfh.percentage}%</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('dashboard.wfhRemote', 'WFH Remote')}</p>
          <p className="text-xl font-bold text-blue-600">{kpis.wfh.count}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.geofenceExempt', 'geofence exempt')}</p>
        </div>

        {/* Field Duty */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-teal-600">
            <Briefcase className="h-4 w-4" />
            <span className="text-[10px] font-bold text-teal-600">{kpis.fieldDuty.percentage}%</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('dashboard.onDuty', 'On Duty (OD)')}</p>
          <p className="text-xl font-bold text-teal-600">{kpis.fieldDuty.count}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.clientSiteField', 'client site / field')}</p>
        </div>

        {/* Missing Punch */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-rose-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-[10px] font-bold text-rose-600">{kpis.missingPunch.percentage}%</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('dashboard.singlePunch', 'Single Punch')}</p>
          <p className="text-xl font-bold text-rose-600">{kpis.missingPunch.count}</p>
          <p className="text-[10px] text-slate-400">{t('dashboard.needsCheckout', 'needs checkout')}</p>
        </div>
      </div>

      {/* Middle Row: Charts & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Hourly Attendance Trend Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('dashboard.intradayTrend', 'Intraday Attendance Trend')}</h3>
              <p className="text-xs text-slate-500">{t('dashboard.intradaySubtitle', 'Live hourly telemetry vs. expected staffing')}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> {t('status.present', 'Present')}</span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-300"></span> {t('dashboard.expected', 'Expected')}</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex h-56 items-end justify-between gap-2 border-b border-slate-100 pb-2 pt-6">
            {hourlyTrend.map((bar) => {
              const maxVal = Math.max(...hourlyTrend.map(b => b.expected || 100), 100);
              const presentHeight = Math.min(100, Math.round((bar.present / maxVal) * 100));
              const expectedHeight = Math.min(100, Math.round((bar.expected / maxVal) * 100));

              return (
                <div key={bar.hour} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center gap-1 h-44">
                    <div
                      style={{ height: `${presentHeight}%` }}
                      className="w-3.5 rounded-t-sm bg-emerald-500 transition-all hover:bg-emerald-600"
                      title={`${bar.hour}: ${bar.present} present`}
                    ></div>
                    <div
                      style={{ height: `${expectedHeight}%` }}
                      className="w-3.5 rounded-t-sm bg-blue-300 opacity-60 hover:opacity-90"
                      title={`${bar.hour}: ${bar.expected} expected`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{bar.hour}</span>
                </div>
              );
            })}</div>
        </div>

        {/* Attendance by Location (Donut / Distribution) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">{t('dashboard.workforceByLocation', 'Workforce by Location')}</h3>
            <p className="text-xs text-slate-500">{t('dashboard.locationSubtitle', 'Geographic headcount & attendance density')}</p>
          </div>

          <div className="flex items-center justify-between gap-6 py-2">
            {/* Visual Ring */}
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-8 border-blue-600 border-t-emerald-500 border-r-amber-400 border-b-purple-500 shadow-inner">
              <div className="text-center">
                <span className="text-xl font-bold text-slate-900">{kpis.totalEmployees.count}</span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{t('dashboard.headcount', 'Headcount')}</p>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-2 text-xs">
              {locationDist.map((item) => (
                <div key={item.location} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color || '#3B82F6' }}></span>
                    <span className="truncate">{item.location.replace(' Main Office', '').replace(' Tech Park', '').replace(' Financial Centre', '')}</span>
                  </span>
                  <span className="font-semibold text-slate-900 shrink-0">{item.count} ({item.percentage}%)</span>
                </div>
              ))}</div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3 flex flex-col justify-between">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <Zap className="h-4 w-4" />
            <h3 className="text-sm font-bold text-slate-900">{t('dashboard.quickLinks', 'Executive Quick Links')}</h3>
          </div>

          <div className="space-y-2">
            <NavLink
              to="/reports"
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <span>{t('dashboard.linkMusterRoll', 'Statutory Muster Roll')}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </NavLink>

            <NavLink
              to="/attendance/regularisations"
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <span>{t('dashboard.linkExceptions', 'Exception Approvals')}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </NavLink>

            <NavLink
              to="/shifts/schedule"
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <span>{t('dashboard.linkRosterMatrix', 'Roster Schedule Matrix')}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </NavLink>

            <NavLink
              to="/payroll/periods"
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <span>{t('dashboard.linkPayFinalisation', 'Pay Period Finalisation')}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
