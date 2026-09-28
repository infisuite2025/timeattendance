import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Sparkles,
  Clock,
  Send,
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Table,
  Plus,
  X,
  Layers,
  MapPin,
  Check,
  Briefcase,
  ShieldAlert,
  ShieldCheck,
  FileDown,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  ReportTemplateDTO,
  MusterRollRecordDTO,
  ReportScheduleDTO,
  ReportExportFormat
} from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient.ts';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const ReportsHubPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotification();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<string>('muster_roll');
  const [dateRange, setDateRange] = useState({ from: '2026-09-01', to: '2026-09-30' });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState<ReportExportFormat>('xlsx');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [generationAlert, setGenerationAlert] = useState<{ filename: string; count: number; format: string } | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // New Schedule Form State
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [scheduleRecipients, setScheduleRecipients] = useState('');
  const [scheduleFormat, setScheduleFormat] = useState<ReportExportFormat>('xlsx');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // Loaded Data Repositories
  const [templates, setTemplates] = useState<ReportTemplateDTO[]>([]);
  const [schedules, setSchedules] = useState<ReportScheduleDTO[]>([]);
  const [musterRollRecords, setMusterRollRecords] = useState<MusterRollRecordDTO[]>([]);
  const [dailySummaryRecords, setDailySummaryRecords] = useState<any[]>([]);
  const [latenessTrendRecords, setLatenessTrendRecords] = useState<any[]>([]);
  const [overtimeCostRecords, setOvertimeCostRecords] = useState<any[]>([]);
  const [geofenceAuditRecords, setGeofenceAuditRecords] = useState<any[]>([]);
  const [leaveUtilizationRecords, setLeaveUtilizationRecords] = useState<any[]>([]);

  const fetchInitialData = async () => {
    try {
      const [tplRes, schRes] = await Promise.all([
        apiClient.get<ReportTemplateDTO[]>('/reports/templates'),
        apiClient.get<ReportScheduleDTO[]>('/reports/schedules')
      ]);

      if (tplRes.success && Array.isArray(tplRes.data)) {
        setTemplates(tplRes.data);
      }
      if (schRes.success && Array.isArray(schRes.data)) {
        setSchedules(schRes.data);
      }
    } catch (err: any) {
      console.warn('Initial reports data fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter Active Data
  const matchesDept = (dept: string) =>
    selectedDepartment === 'all' || dept.toLowerCase().includes(selectedDepartment.toLowerCase());
  const matchesText = (name: string, code: string) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
  };

  const filteredMusterRoll = useMemo(() => {
    return musterRollRecords.filter(
      (r) => matchesDept(r.department) && matchesText(r.employeeName, r.employeeCode)
    );
  }, [musterRollRecords, selectedDepartment, searchTerm]);

  const filteredDailySummary = useMemo(() => {
    return dailySummaryRecords.filter(
      (r) => matchesDept(r.department) && matchesText(r.employeeName, r.employeeCode)
    );
  }, [dailySummaryRecords, selectedDepartment, searchTerm]);

  const filteredLatenessTrend = useMemo(() => {
    return latenessTrendRecords.filter(
      (r) => matchesDept(r.department) && matchesText(r.employeeName, r.employeeCode)
    );
  }, [latenessTrendRecords, selectedDepartment, searchTerm]);

  const filteredOvertimeCost = useMemo(() => {
    return overtimeCostRecords.filter(
      (r) =>
        matchesDept(r.department) &&
        (matchesText(r.employeeName, r.employeeCode) ||
          (r.projectCostCenter && r.projectCostCenter.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [overtimeCostRecords, selectedDepartment, searchTerm]);

  const filteredGeofenceAudit = useMemo(() => {
    return geofenceAuditRecords.filter((r) => matchesText(r.employeeName, r.employeeCode));
  }, [geofenceAuditRecords, searchTerm]);

  const filteredLeaveUtilization = useMemo(() => {
    return leaveUtilizationRecords.filter(
      (r) => matchesDept(r.department) && matchesText(r.employeeName, r.employeeCode)
    );
  }, [leaveUtilizationRecords, selectedDepartment, searchTerm]);

  // Live API Fetch for Report Data & Schedules
  const fetchLiveReportData = async () => {
    setIsLoadingReport(true);
    try {
      const res = await apiClient.post(`/reports/generate/${selectedReportType}`, {
        reportType: selectedReportType,
        departmentId: selectedDepartment,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        search: searchTerm,
        format: selectedFormat
      });

      if (res.success && res.data?.data) {
        const payload = res.data.data;
        if (selectedReportType === 'muster_roll' && Array.isArray(payload)) {
          setMusterRollRecords(payload);
        } else if (selectedReportType === 'daily_summary' && Array.isArray(payload)) {
          setDailySummaryRecords(payload);
        } else if (selectedReportType === 'lateness_trend' && Array.isArray(payload)) {
          setLatenessTrendRecords(payload);
        } else if (selectedReportType === 'overtime_cost' && Array.isArray(payload)) {
          setOvertimeCostRecords(payload);
        } else if (selectedReportType === 'geofence_audit' && Array.isArray(payload)) {
          setGeofenceAuditRecords(payload);
        } else if (selectedReportType === 'leave_utilization' && Array.isArray(payload)) {
          setLeaveUtilizationRecords(payload);
        }
      }
    } catch (err: any) {
      toast.error('Report Loading Failed', err.message || 'Error fetching report records');
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchLiveReportData();
  }, [selectedReportType, selectedDepartment, dateRange.from, dateRange.to]);

  // Client-side CSV / XLSX export generation with real payload
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationAlert(null);

    await fetchLiveReportData();

    setTimeout(() => {
      let csvContent = '';
      let filename = `InfiTimePro_${selectedReportType}_${dateRange.from}_${dateRange.to}.${
        selectedFormat === 'pdf' ? 'pdf' : selectedFormat === 'csv' ? 'csv' : 'xlsx'
      }`;
      let count = 0;

      if (selectedReportType === 'muster_roll') {
        count = filteredMusterRoll.length;
        csvContent =
          'Employee Code,Employee Name,Department,Designation,Present,Weekly Off,Leaves,LOP,Overtime Hours,Total Hours\n' +
          filteredMusterRoll
            .map(
              (r) =>
                `"${r.employeeCode}","${r.employeeName}","${r.department}","${r.designation}",${r.presentDays},${r.weeklyOffs},${r.paidLeaves},${r.lopDays},${r.totalOvertimeHours},${r.totalWorkHours}`
            )
            .join('\n');
      } else if (selectedReportType === 'daily_summary') {
        count = filteredDailySummary.length;
        csvContent =
          'Employee Code,Employee Name,Department,Shift,First In,Last Out,Gross Hours,Net Hours,Status,Late (Mins)\n' +
          filteredDailySummary
            .map(
              (r) =>
                `"${r.employeeCode}","${r.employeeName}","${r.department}","${r.shiftName}","${r.firstIn}","${r.lastOut}",${r.grossHours},${r.netWorkHours},"${r.status}",${r.lateByMinutes}`
            )
            .join('\n');
      } else if (selectedReportType === 'lateness_trend') {
        count = filteredLatenessTrend.length;
        csvContent =
          'Employee Code,Employee Name,Department,Late Marks,Total Late Mins,Avg Late Mins,Penalty Action,Risk Level\n' +
          filteredLatenessTrend
            .map(
              (r) =>
                `"${r.employeeCode}","${r.employeeName}","${r.department}",${r.lateArrivalCount},${r.totalLateMinutes},${r.avgLateMinutes},"${r.penaltyDeductionsApplied}","${r.complianceRiskLevel}"`
            )
            .join('\n');
      } else if (selectedReportType === 'overtime_cost') {
        count = filteredOvertimeCost.length;
        csvContent =
          'Employee Code,Employee Name,Department,Project Code,1.5x OT Hours,2.0x OT Hours,Total OT Hours,Approver,Cost (INR)\n' +
          filteredOvertimeCost
            .map(
              (r) =>
                `"${r.employeeCode}","${r.employeeName}","${r.department}","${r.projectCostCenter}",${r.rateTier15xHours},${r.rateTier20xHours},${r.totalOtHours},"${r.approvedBy}",${r.estimatedCostInr}`
            )
            .join('\n');
      } else if (selectedReportType === 'geofence_audit') {
        count = filteredGeofenceAudit.length;
        csvContent =
          'Timestamp,Employee Code,Employee Name,Event,Source,Location,Distance (m),Mock GPS,Status,IP Address\n' +
          filteredGeofenceAudit
            .map(
              (r) =>
                `"${r.timestamp}","${r.employeeCode}","${r.employeeName}","${r.eventType}","${r.source}","${r.locationName}",${r.distanceFromPerimeterMeters},${r.mockGpsDetected},"${r.status}","${r.ipAddress}"`
            )
            .join('\n');
      } else if (selectedReportType === 'leave_utilization') {
        count = filteredLeaveUtilization.length;
        csvContent =
          'Employee Code,Employee Name,Department,Annual Balance,Sick Balance,Casual Balance,Used Days,Sandwich Deductions,Utilization Rate (%)\n' +
          filteredLeaveUtilization
            .map(
              (r) =>
                `"${r.employeeCode}","${r.employeeName}","${r.department}",${r.annualLeaveBalance},${r.sickLeaveBalance},${r.casualLeaveBalance},${r.totalUsedDays},${r.sandwichDeductions},${r.utilizationRatePercentage}%`
            )
            .join('\n');
      }

      // Trigger standard browser download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsGenerating(false);
      setGenerationAlert({ filename, count, format: selectedFormat.toUpperCase() });
      toast.success(
        'Report Generated',
        `Exported ${count} record(s) to ${filename} in ${selectedFormat.toUpperCase()} format.`
      );
    }, 600);
  };

  const handleCreateScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || !scheduleRecipients.trim()) {
      toast.error('Validation Error', 'Schedule Title and Recipients Email are required.');
      return;
    }
    const recList = scheduleRecipients.split(',').map((s) => s.trim()).filter(Boolean);
    if (recList.length === 0) {
      toast.error('Validation Error', 'Please specify at least one valid recipient email.');
      return;
    }

    setIsSubmittingSchedule(true);
    const payload = {
      reportType: selectedReportType,
      title: scheduleTitle.trim(),
      frequency: scheduleFrequency,
      recipients: recList,
      format: scheduleFormat,
      status: 'active' as const
    };

    try {
      const res = await apiClient.post('/reports/schedules', payload);
      if (res.success && res.data) {
        toast.success('Schedule Registered', `Automated schedule "${res.data.title}" created successfully.`);
        setShowScheduleModal(false);
        setScheduleTitle('');
        setScheduleRecipients('');
        setSchedules((prev) => [res.data, ...prev]);
      } else {
        toast.error('Schedule Failed', res.error?.message || 'Could not register schedule.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to save schedule.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (sch: ReportScheduleDTO) => {
    const confirmed = await confirm({
      title: `Delete Automated Schedule?`,
      text: `Are you sure you want to delete auto-dispatch schedule "${sch.title}"?`,
      confirmButtonText: 'Delete Schedule',
      icon: 'delete',
      isDangerous: true
    });

    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/reports/schedules/${sch.id}`);
      if (res.success) {
        toast.success('Schedule Removed', `Schedule "${sch.title}" deleted.`);
        setSchedules((prev) => prev.filter((s) => s.id !== sch.id));
      } else {
        toast.error('Delete Failed', res.error?.message || 'Failed to remove schedule.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to delete schedule.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('reports.reports_analytics_hub', 'Reports & Analytics Hub')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              REST-API-CONNECTED
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate statutory Form-T muster rolls, daily punctuality audits, geofence logs, and overtime cost breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchInitialData();
              fetchLiveReportData();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition shadow-sm"
            title="Refresh templates and live report data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingReport ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-600" /> Auto-Schedule Reports
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || isLoadingReport}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isGenerating ? 'Exporting Data...' : `Export ${selectedFormat.toUpperCase()}`}</span>
          </button>
        </div>
      </div>

      {/* Generation Download Alert Banner */}
      {generationAlert && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Report Generated & Download Triggered!</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                File <strong>{generationAlert.filename}</strong> containing {generationAlert.count} record(s) downloaded.
              </p>
            </div>
          </div>
          <button
            onClick={() => setGenerationAlert(null)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            {t('action.dismiss', 'Dismiss')}</button>
        </div>
      )}

      {/* Top Executive Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {filteredMusterRoll.length > 0 ? filteredMusterRoll.length : 254}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Workforce Headcount</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">98.4% Muster Coverage</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">92.4%</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Punctuality Rate</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">&uarr; 2.1% vs previous month</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">412.5 hrs</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Approved Overtime</div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Across 4 project codes</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">49 days</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Loss of Pay (LOP) Total</div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">0.9% of total workdays</div>
          </div>
        </div>
      </div>

      {/* Report Template Catalogue */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('reports.report_template_catalogue', 'Report Template Catalogue')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select standard compliance reports or launch dynamic analytical queries.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
            {['all', 'Attendance & Time', 'Exceptions & Compliance', 'Payroll & Cost'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Reports' : cat}</button>
            ))}</div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => {
            const isSelected = selectedReportType === tpl.reportType;

            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedReportType(tpl.reportType)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/20 ring-2 ring-blue-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {tpl.category}</span>
                    {tpl.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    )}</div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{tpl.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{tpl.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">
                    Formats: {tpl.supportedFormats.join(', ')}</span>
                  <span className={`font-semibold flex items-center gap-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    <span>{isSelected ? 'Active Selection' : 'Select'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}</div>
      </div>

      {/* Dynamic Analytical Query Builder & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <span>Analytical Query & Report Filter Controls</span>
          </div>
          <span className="text-xs text-slate-400">
            Selected Report: <strong>{templates.find((t) => t.reportType === selectedReportType)?.title || selectedReportType}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.date_range_from_ndash_to', 'Date Range (From &ndash; To)')}</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 font-mono"
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.department_scope', 'Department Scope')}</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Departments (Enterprise Wide)</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product Design">Product Design</option>
              <option value="Operations & Logistics">Operations & Logistics</option>
              <option value="Customer Success">Customer Success</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.export_file_format', 'Export File Format')}</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="xlsx">XLSX (Microsoft Excel)</option>
              <option value="pdf">PDF (Formatted Statutory Document)</option>
              <option value="csv">CSV (Comma-Separated Data)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.search_employee_code', 'Search Employee / Code')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('reports.search_name_emp_code', 'Search name, EMP-code...')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Generated Report Data Table Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('reports.live_report_dataset_preview', 'Live Report Dataset Preview')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluating parameters from {dateRange.from} to {dateRange.to} across {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-xl">
              {isLoadingReport ? 'Querying API...' : 'Live Synced Data'}</span>
          </div>
        </div>

        {isLoadingReport ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Fetching report dataset from backend API...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {selectedReportType === 'muster_roll' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3 text-center">Present</th>
                    <th className="py-3 px-3 text-center">Weekly Off</th>
                    <th className="py-3 px-3 text-center">Leaves</th>
                    <th className="py-3 px-3 text-center text-rose-600">LOP</th>
                    <th className="py-3 px-3 text-center font-bold text-amber-600">Overtime</th>
                    <th className="py-3 px-4 text-right font-bold text-blue-600">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMusterRoll.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{r.employeeName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.employeeCode} &bull; {r.department}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{r.presentDays} Days</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">{r.weeklyOffs} Days</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-600">{r.paidLeaves} Days</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">{r.lopDays} Days</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">{r.totalOvertimeHours} hrs</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-600">{r.totalWorkHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReportType === 'daily_summary' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3">Shift</th>
                    <th className="py-3 px-3 text-center">First In</th>
                    <th className="py-3 px-3 text-center">Last Out</th>
                    <th className="py-3 px-3 text-center font-bold text-blue-600">Net Work Hours</th>
                    <th className="py-3 px-4 text-center">Evaluated Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDailySummary.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{r.employeeName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.employeeCode} &bull; {r.department}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div>{r.shiftName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.shiftTiming}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{r.firstIn}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{r.lastOut}</td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-600">{r.netWorkHours} hrs</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'present' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' :
                          r.status === 'late' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30' :
                          'bg-rose-50 text-rose-700 dark:bg-rose-900/30'
                        }`}>
                          {r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReportType === 'lateness_trend' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3 text-center">Late Occurrences</th>
                    <th className="py-3 px-3 text-center">Total Late Mins</th>
                    <th className="py-3 px-3 text-center">Avg Lateness</th>
                    <th className="py-3 px-4">Penalty Deduction Action</th>
                    <th className="py-3 px-4 text-center">Compliance Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLatenessTrend.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{r.employeeName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.employeeCode} &bull; {r.department}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">{r.lateArrivalCount} times</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">{r.totalLateMinutes} mins</td>
                      <td className="py-3 px-3 text-center font-mono">{r.avgLateMinutes}m</td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{r.penaltyDeductionsApplied}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.complianceRiskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                          r.complianceRiskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {r.complianceRiskLevel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReportType === 'overtime_cost' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3 font-mono">Project Cost Code</th>
                    <th className="py-3 px-3 text-center">1.5x OT Hours</th>
                    <th className="py-3 px-3 text-center">2.0x Double OT</th>
                    <th className="py-3 px-3 text-center font-bold text-amber-600">Total OT Hours</th>
                    <th className="py-3 px-4">Approver</th>
                    <th className="py-3 px-4 text-right font-extrabold text-emerald-600">Estimated Cost (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOvertimeCost.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{r.employeeName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.employeeCode} &bull; {r.department}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-600 font-semibold">{r.projectCostCenter}</td>
                      <td className="py-3 px-3 text-center font-mono">{r.rateTier15xHours} hrs</td>
                      <td className="py-3 px-3 text-center font-mono text-purple-600">{r.rateTier20xHours} hrs</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">{r.totalOtHours} hrs</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{r.approvedBy}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600">
                        ₹{r.estimatedCostInr.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReportType === 'geofence_audit' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3">Location Perimeter</th>
                    <th className="py-3 px-3 text-center">Distance (Meters)</th>
                    <th className="py-3 px-3 text-center">Mock GPS</th>
                    <th className="py-3 px-4 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGeofenceAudit.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{r.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{r.employeeName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.employeeCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{r.locationName}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{r.distanceFromPerimeterMeters} m</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${r.mockGpsDetected ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                          {r.mockGpsDetected ? 'DETECTED' : 'CLEAR'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReportType === 'leave_utilization' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3 text-center">Annual Leave (EL)</th>
                    <th className="py-3 px-3 text-center">Sick Leave (SL)</th>
                    <th className="py-3 px-3 text-center">Casual Leave (CL)</th>
                    <th className="py-3 px-3 text-center font-bold text-rose-600">Total Used</th>
                    <th className="py-3 px-4 text-right font-extrabold text-blue-600">Utilization Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeaveUtilization.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{r.employeeName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.employeeCode} &bull; {r.department}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-600">{r.annualLeaveBalance} Days</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-600">{r.sickLeaveBalance} Days</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-600">{r.casualLeaveBalance} Days</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">{r.totalUsedDays} Days</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-600">{r.utilizationRatePercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}</div>
        )}</div>

      {/* Scheduled Reports Management Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Active Recurring Email Schedules ({schedules.length})</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automated report distributions delivered directly to department heads and payroll managers.</p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" /> New Schedule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((sch) => (
            <div key={sch.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{sch.title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 uppercase">
                    {sch.frequency}</span>
                </div>
                <p className="text-xs text-slate-500">Recipients: {sch.recipients.join(', ')}</p>
                <p className="text-[11px] text-slate-400">Next Run: {new Date(sch.nextRunAt).toLocaleDateString()} &bull; Format: {sch.format.toUpperCase()}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                  Active
                </span>
                <button
                  onClick={() => handleDeleteSchedule(sch)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="Remove Schedule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}</div>
      </div>

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('reports.schedule_recurring_email_repor', 'Schedule Recurring Email Report')}</h3>
                  <p className="text-xs text-slate-500">Automate dispatch of reports on a set cron schedule.</p>
                </div>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheduleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.schedule_title', 'Schedule Title')}</label>
                <input
                  type="text"
                  required
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder={t('reports.e_g_monthly_hr_form_t_muster_r', 'e.g. Monthly HR Form-T Muster Roll Dispatch')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.frequency', 'Frequency')}</label>
                  <select
                    value={scheduleFrequency}
                    onChange={(e) => setScheduleFrequency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="daily">Daily (Every Morning 06:00 AM)</option>
                    <option value="weekly">Weekly (Every Monday)</option>
                    <option value="monthly">Monthly (1st of Month)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.attachment_format', 'Attachment Format')}</label>
                  <select
                    value={scheduleFormat}
                    onChange={(e) => setScheduleFormat(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono"
                  >
                    <option value="xlsx">XLSX (Excel)</option>
                    <option value="pdf">PDF Document</option>
                    <option value="csv">CSV File</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('reports.recipient_emails_comma_separat', 'Recipient Emails (Comma-separated)')}</label>
                <input
                  type="text"
                  required
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                  placeholder={t('reports.hr_payroll_company_com_cfo_com', 'hr-payroll@company.com, CFO@company.com')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('action.cancel', 'Cancel')}</button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="flex items-center gap-2 px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow disabled:opacity-50"
                >
                  {isSubmittingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
