import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileText,
  FileCode,
  Layers,
  ArrowRight,
  Database,
  History,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Sliders,
  RefreshCw,
  Building,
  Calendar,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PayrollExportBatchDTO, PayPeriodDTO } from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext.tsx';

export const PayrollExportPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotification();

  const [periods, setPeriods] = useState<PayPeriodDTO[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('prd-001');
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv' | 'sap_json' | 'adp' | 'workday'>('xlsx');
  const [includeOvertimeBreakdown, setIncludeOvertimeBreakdown] = useState(true);
  const [includeLopDetails, setIncludeLopDetails] = useState(true);
  const [includeAllowances, setIncludeAllowances] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedBatchId, setCopiedBatchId] = useState<string | null>(null);

  const [batches, setBatches] = useState<PayrollExportBatchDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [periodsRes, historyRes] = await Promise.all([
        apiClient.get<PayPeriodDTO[]>('/finalisation/periods'),
        apiClient.get<PayrollExportBatchDTO[]>('/finalisation/export-history')
      ]);

      if (periodsRes.data) {
        const fetched = Array.isArray(periodsRes.data) ? periodsRes.data : (periodsRes.data as any).data || [];
        setPeriods(fetched);
        if (fetched.length > 0 && !fetched.some((p: PayPeriodDTO) => p.id === selectedPeriod)) {
          setSelectedPeriod(fetched[0].id);
        }
      }

      if (historyRes.data) {
        const historyList = Array.isArray(historyRes.data) ? historyRes.data : (historyRes.data as any).data || [];
        setBatches(historyList);
      }
    } catch {
      toast.error('Failed to load payroll export data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient.post<PayrollExportBatchDTO>('/finalisation/export', {
        periodId: selectedPeriod,
        format: selectedFormat,
        includeOvertimeBreakdown,
        includeLopDetails,
        includeAllowances
      });

      if (res.data) {
        toast.success(`Export batch ${res.data.batchId} generated successfully!`);
        await loadData();
      } else if (res.error) {
        toast.error(res.error.message || 'Export failed');
      }
    } catch {
      toast.error('Error executing export');
    } finally {
      setIsExporting(false);
    }
  };

  const copyLockHash = (hash: string, batchId: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedBatchId(batchId);
    setTimeout(() => setCopiedBatchId(null), 2000);
  };

  const formatOptions = [
    {
      id: 'xlsx',
      name: 'Microsoft Excel (.xlsx)',
      desc: 'Multi-tab payroll register with department summaries, overtime breakdowns, and LOP records.',
      icon: FileSpreadsheet,
      tag: 'Most Popular'
    },
    {
      id: 'csv',
      name: 'Standard CSV Register',
      desc: 'Flat comma-delimited export formatted for quick import into custom payroll engines.',
      icon: FileText,
      tag: 'Universal'
    },
    {
      id: 'sap_json',
      name: 'SAP SuccessFactors JSON',
      desc: 'Native JSON schema payload mapped directly to SAP SuccessFactors Time & Attendance APIs.',
      icon: FileCode,
      tag: 'Enterprise ERP'
    },
    {
      id: 'adp',
      name: 'ADP Paydata Format',
      desc: 'Batch file format compatible with ADP Vantage HCM & ADP Workforce Now.',
      icon: Database,
      tag: 'ADP Integration'
    },
    {
      id: 'workday',
      name: 'Workday Time Tracking CSV',
      desc: 'Standard Workday EIB inbound integration format with worker reference IDs.',
      icon: Layers,
      tag: 'Workday EIB'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-slate-600 dark:text-slate-300 font-medium">Loading Payroll Export Engine...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('payroll.payroll_export_engine', 'Payroll Export Engine')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              SCR-WEB-024
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export cryptographically locked attendance summaries, payable hours, LOP deductions, and approved overtime into enterprise payroll formats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/attendance/finalisation"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium text-sm transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Finalisation Reconciliation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Export Configuration & Format Selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Pay Period */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">1</span>
              Select Target Locked Pay Period
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {periods.map(period => (
                <div
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedPeriod === period.id
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{period.name}</span>
                    {period.status === 'locked' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Sealed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{period.periodCode} • {period.totalEmployees} Employees</div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                    {period.totalPayableDays.toLocaleString()} Payable Days • {period.totalOvertimeHours} hrs OT
                  </div>
                </div>
              ))}</div>
          </div>

          {/* Step 2: Target ERP Format */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">2</span>
              Choose ERP & Payroll Output Format
            </div>

            <div className="space-y-2.5">
              {formatOptions.map((fmt) => {
                const IconComponent = fmt.icon;
                const isSelected = selectedFormat === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id as any)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{fmt.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {fmt.tag}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{fmt.desc}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}</div>
                  </div>
                );
              })}</div>
          </div>
        </div>

        {/* Right Column: Parameters & Generate Action */}
        <div className="space-y-6">
          {/* Step 3: Fields & Parameters */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">3</span>
              Included Data Attributes
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOvertimeBreakdown}
                  onChange={(e) => setIncludeOvertimeBreakdown(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Approved Overtime Hours</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Regular OT, Holiday OT, and 2.0x Night OT slabs</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLopDetails}
                  onChange={(e) => setIncludeLopDetails(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Loss of Pay (LOP) & Deductions</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Unapproved absences and late penalty half-days</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAllowances}
                  onChange={(e) => setIncludeAllowances(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Attendance Allowance Badges</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">100% punctuality and perfect attendance criteria</div>
                </div>
              </label>
            </div>

            {/* Generate Batch Button */}
            <div className="pt-2">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Export Batch...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate & Download Export Batch
                  </>
                )}</button>
            </div>
          </div>

          {/* Audit Non-Repudiation Badge */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Immutable Export Guarantee
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each generated batch includes the cryptographic period SHA-256 seal embedded in header metadata for strict SOX and labor audit compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Export Batches Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('payroll.export_batch_history_audit_tra', 'Export Batch History & Audit Trail')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Archived payroll export payloads with verified cryptographic lock hashes.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4 text-center">Records</th>
                <th className="py-3 px-4">Exported By</th>
                <th className="py-3 px-4">Cryptographic Hash</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {batches.map((batch) => (
                <tr key={batch.batchId} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {batch.batchId}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {batch.periodName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 uppercase">
                      {batch.format}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {batch.recordCount} employees
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <div>{batch.exportedBy}</div>
                    <div className="text-[10px] text-slate-400">{new Date(batch.exportedAt).toLocaleString()}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[140px]">{batch.lockHash}</span>
                      <button
                        onClick={() => copyLockHash(batch.lockHash, batch.batchId)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition"
                        title="Copy Hash"
                      >
                        {copiedBatchId === batch.batchId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}</button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={batch.downloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No export history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
