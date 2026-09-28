import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  Calendar,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  Building2,
  Layers,
  UserCheck,
  UserX,
  AlertCircle,
  CalendarDays,
  Home,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';
import { useNotification } from '../../context/NotificationContext.tsx';
import { encodeSecureToken } from '../../utils/routeSecurity.ts';
import { useI18n } from '../../context/I18nContext.tsx';
import { DashboardKPISummaryDTO } from '@infi-timepro/shared-types';

interface LiveEmployeeRecord {
  id: string;
  name: string;
  avatar: string;
  empId: string;
  dept: string;
  shift: string;
  firstIn: string;
  lastOut: string;
  duration: string;
  status: 'present' | 'late' | 'not_arrived' | 'on_leave' | 'wfh' | 'field_duty' | 'missing_punch';
  location: string;
}

export const LiveAttendancePage: React.FC = () => {
  const { toast } = useNotification();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'employee' | 'location' | 'department' | 'shift'>('employee');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDate, setSelectedDate] = useState('2026-09-18');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const [employees, setEmployees] = useState<LiveEmployeeRecord[]>([
    { id: '1', name: 'Srinivas Reddy', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop', empId: 'TP1012', dept: 'Engineering', shift: 'General Shift', firstIn: '08:58 AM', lastOut: '--', duration: '1h 34m', status: 'present', location: 'Hyderabad' },
    { id: '2', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop', empId: 'TP0456', dept: 'Product', shift: 'General Shift', firstIn: '08:47 AM', lastOut: '--', duration: '1h 45m', status: 'present', location: 'Bengaluru' },
    { id: '3', name: 'Amit Kumar', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop', empId: 'TP0783', dept: 'Sales & Marketing', shift: 'General Shift', firstIn: '09:15 AM', lastOut: '--', duration: '1h 17m', status: 'late', location: 'Mumbai' },
    { id: '4', name: 'Neha Singh', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop', empId: 'TP0890', dept: 'Human Resources', shift: 'General Shift', firstIn: '--', lastOut: '--', duration: '--', status: 'not_arrived', location: 'Hyderabad' },
    { id: '5', name: 'Rakesh Varma', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop', empId: 'TP1123', dept: 'Engineering', shift: 'General Shift', firstIn: '08:06 AM', lastOut: '05:32 PM', duration: '9h 26m', status: 'present', location: 'Hyderabad' },
    { id: '6', name: 'Ananya Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop', empId: 'TP1345', dept: 'Finance & Accounts', shift: 'General Shift', firstIn: '08:51 AM', lastOut: '--', duration: '1h 41m', status: 'present', location: 'Bengaluru' },
    { id: '7', name: 'Vikram Mehta', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop', empId: 'TP1678', dept: 'Operations', shift: 'Night Shift', firstIn: '10:05 PM', lastOut: '06:12 AM', duration: '8h 07m', status: 'present', location: 'Delhi' },
    { id: '8', name: 'Kavya Nair', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop', empId: 'TP1890', dept: 'Sales & Marketing', shift: 'General Shift', firstIn: '--', lastOut: '--', duration: '--', status: 'on_leave', location: 'Bengaluru' },
    { id: '9', name: 'Arjun Iyer', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop', empId: 'TP2011', dept: 'Operations', shift: 'General Shift', firstIn: '09:22 AM', lastOut: '--', duration: '1h 10m', status: 'late', location: 'Chennai' },
    { id: '10', name: 'Divya Reddy', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop', empId: 'TP1367', dept: 'Engineering', shift: 'WFH Shift', firstIn: '08:40 AM', lastOut: '--', duration: '1h 52m', status: 'wfh', location: 'Remote' },
    { id: '11', name: 'Sameer Khan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop', empId: 'TP2301', dept: 'Sales & Marketing', shift: 'Field Shift', firstIn: '08:15 AM', lastOut: '--', duration: '2h 17m', status: 'field_duty', location: 'Client Site' },
    { id: '12', name: 'Pooja Kulkarni', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop', empId: 'TP2456', dept: 'Finance & Accounts', shift: 'General Shift', firstIn: '09:00 AM', lastOut: '--', duration: '1h 30m', status: 'missing_punch', location: 'Hyderabad' },
  ]);

  const fetchLiveAttendanceData = async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const [sumRes] = await Promise.all([
        apiClient.get('/analytics/dashboard-summary', { location: selectedLocation, date: selectedDate }),
      ]);
      if (sumRes.success && sumRes.data) {
        setKpis(sumRes.data);
      }
      if (showToast) {
        toast.success('Live Attendance Synchronized', `Updated live feeds for ${selectedLocation} (${selectedDate}).`);
      }
    } catch (err: any) {
      console.warn('Error fetching live attendance:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveAttendanceData(false);
  }, [selectedLocation, selectedDate]);

  const toggleSelectAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelectEmp = (id: string) => {
    setSelectedEmpIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {t('status.present', 'Present')}</span>;
      case 'late':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> {t('status.late', 'Late')}</span>;
      case 'not_arrived':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200"><span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> {t('dashboard.notArrived', 'Not Arrived')}</span>;
      case 'on_leave':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200"><span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span> {t('status.onLeave', 'On Leave')}</span>;
      case 'wfh':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> {t('dashboard.wfhRemote', 'WFH')}</span>;
      case 'field_duty':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200"><span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span> {t('dashboard.onDuty', 'Field Duty')}</span>;
      case 'missing_punch':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200"><span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span> {t('dashboard.singlePunch', 'Missing Punch')}</span>;
      default:
        return null;
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesLocation = selectedLocation === 'All Locations' || emp.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const locationsGrouped = [
    { name: 'Hyderabad Main Office', count: 650, present: 468, late: 31, onLeave: 30, missing: 5 },
    { name: 'Bengaluru Tech Park HQ', count: 302, present: 224, late: 10, onLeave: 14, missing: 2 },
    { name: 'Mumbai Financial Centre', count: 146, present: 100, late: 10, onLeave: 8, missing: 2 },
    { name: 'Delhi Cyber Hub', count: 100, present: 72, late: 8, onLeave: 4, missing: 1 },
    { name: 'Chennai Plant & Remote', count: 50, present: 28, late: 3, onLeave: 2, missing: 0 },
  ];

  const departmentsGrouped = [
    { name: 'Engineering', count: 520, present: 380, late: 24, onLeave: 22 },
    { name: 'Product', count: 180, present: 132, late: 8, onLeave: 10 },
    { name: 'Sales & Marketing', count: 240, present: 168, late: 18, onLeave: 12 },
    { name: 'Human Resources', count: 65, present: 48, late: 3, onLeave: 4 },
    { name: 'Finance & Accounts', count: 95, present: 70, late: 4, onLeave: 5 },
    { name: 'Operations & Support', count: 148, present: 94, late: 5, onLeave: 5 },
  ];

  const shiftsGrouped = [
    { name: 'General Shift (09:00 AM - 06:00 PM)', total: 920, present: 680, late: 48, missing: 8 },
    { name: 'Morning Shift (07:00 AM - 04:00 PM)', total: 180, present: 135, late: 8, missing: 1 },
    { name: 'Night Shift (10:00 PM - 06:00 AM)', total: 104, present: 73, late: 6, missing: 1 },
    { name: 'WFH & Field Shift (Flexible)', total: 44, present: 44, late: 0, missing: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header & Status Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{t('nav.attendance', 'Attendance')}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">{t('nav.attendance', 'Live Attendance')}</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('nav.attendance', 'Live Attendance')} / Who's In – Who's Out
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span> {t('dashboard.liveApi', 'Live API')}</span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time view of workforce biometric telemetry across all locations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-0 text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

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

          <button
            onClick={() => fetchLiveAttendanceData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            title="Refresh live telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 8 Live Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <div
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'all' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.kpiTotalEmp', 'Total Employees')}</p>
          <p className="text-lg font-bold text-slate-900">{kpis.totalEmployees.count.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">{kpis.totalEmployees.changeVsLastMonth} vs last mo</p>
        </div>

        <div
          onClick={() => setStatusFilter('present')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'present' ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('status.present', 'Present')}</p>
          <p className="text-lg font-bold text-emerald-600">{kpis.present.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">{kpis.present.percentage}% of total</p>
        </div>

        <div
          onClick={() => setStatusFilter('not_arrived')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'not_arrived' ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.notArrived', 'Not Arrived')}</p>
          <p className="text-lg font-bold text-rose-600">{kpis.notArrived.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">{kpis.notArrived.percentage}% of total</p>
        </div>

        <div
          onClick={() => setStatusFilter('late')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'late' ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('status.late', 'Late')}</p>
          <p className="text-lg font-bold text-amber-600">{kpis.late.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">{kpis.late.percentage}% of total</p>
        </div>

        <div
          onClick={() => setStatusFilter('on_leave')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'on_leave' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('status.onLeave', 'On Leave')}</p>
          <p className="text-lg font-bold text-purple-600">{kpis.onLeave.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">{kpis.onLeave.percentage}% of total</p>
        </div>

        <div
          onClick={() => setStatusFilter('wfh')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'wfh' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.wfhRemote', 'WFH')}</p>
          <p className="text-lg font-bold text-blue-600">{kpis.wfh.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">{kpis.wfh.percentage}% of total</p>
        </div>

        <div
          onClick={() => setStatusFilter('field_duty')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'field_duty' ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.onDuty', 'Field Duty')}</p>
          <p className="text-lg font-bold text-teal-600">{kpis.fieldDuty.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">{kpis.fieldDuty.percentage}% of total</p>
        </div>

        <div
          onClick={() => setStatusFilter('missing_punch')}
          className={`rounded-xl border p-3 shadow-sm cursor-pointer transition ${statusFilter === 'missing_punch' ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <p className="text-[11px] font-semibold text-slate-500">{t('dashboard.singlePunch', 'Missing Punch')}</p>
          <p className="text-lg font-bold text-rose-600">{kpis.missingPunch.count}</p>
          <p className="text-[10px] text-slate-400 font-medium">{kpis.missingPunch.percentage}% of total</p>
        </div>
      </div>

      {/* Tabs & Live Search Bar Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('employee')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee View ({filteredEmployees.length})</button>
          <button
            onClick={() => setActiveTab('location')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'location' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Location View ({locationsGrouped.length})</button>
          <button
            onClick={() => setActiveTab('department')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'department' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Department View ({departmentsGrouped.length})</button>
          <button
            onClick={() => setActiveTab('shift')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'shift' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shift View ({shiftsGrouped.length})</button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
              Filter: {statusFilter.replace('_', ' ')}
              <button onClick={() => setStatusFilter('all')} className="ml-1 text-blue-600 hover:text-blue-900 font-bold">✕</button>
            </span>
          )}

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, dept..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: EMPLOYEE VIEW TABLE */}
      {activeTab === 'employee' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedEmpIds.length > 0 && selectedEmpIds.length === filteredEmployees.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3">{t('payroll.colEmployee', 'Employee')}</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">{t('payroll.colDept', 'Department')}</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">First In</th>
                <th className="px-4 py-3">Last Out</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">{t('payroll.colStatus', 'Status')}</th>
                <th className="px-4 py-3">Location</th>
                <th className="w-10 px-4 py-3 text-center">{t('payroll.colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEmpIds.includes(emp.id)}
                      onChange={() => toggleSelectEmp(emp.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <NavLink
                      to={`/attendance/day-detail/${encodeSecureToken(emp.empId)}`}
                      className="flex items-center gap-2.5 font-medium text-slate-900 hover:text-blue-600 transition"
                    >
                      <img src={emp.avatar} alt={emp.name} className="h-7 w-7 rounded-full object-cover" />
                      <span>{emp.name}</span>
                    </NavLink>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{emp.empId}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.dept}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.shift}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{emp.firstIn}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.lastOut}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{emp.duration}</td>
                  <td className="px-4 py-3">{getStatusBadge(emp.status)}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.location}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}</div>
  );
};
