import React, { useState, useEffect } from 'react';
import {
  Briefcase, Users, Clock, FileText, BarChart3, DollarSign,
  TrendingUp, CheckCircle2, AlertCircle, RefreshCw, Plus,
  ArrowUpRight, ChevronRight, Download, Send, Eye,
  Building2, Calendar, Layers, Receipt, Star, Zap,
  Filter, Search, Circle
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext.tsx';

// ─── Types (mirrored from shared-types) ──────────────────────────────────────
interface TMDashboardSummary {
  totalActiveClients: number;
  totalActiveProjects: number;
  totalProjectBudgetUSD: number;
  totalBilledUSD: number;
  pendingTimesheetApprovals: number;
  currentWeekBillableHours: number;
  currentWeekNonBillableHours: number;
  overallUtilizationPercent: number;
  outstandingInvoiceAmount: number;
  outstandingInvoiceCount: number;
  overdueInvoiceCount: number;
  totalInvoicedThisMonth: number;
}

interface TMClient {
  id: string;
  name: string;
  code: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  billingCurrency: string;
  country: string;
  status: 'active' | 'inactive';
  contractStartDate: string;
  contractEndDate: string;
  totalBudget: number;
  invoicedToDate: number;
}

interface TMProject {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  budget: number;
  budgetCurrency: string;
  billedToDate: number;
  startDate: string;
  targetEndDate: string;
  projectManagerName: string;
  teamSize: number;
  totalBillableHours: number;
  totalNonBillableHours: number;
  utilizationPercent: number;
  completionPercent: number;
}

interface TMTimesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId?: string;
  projectName: string;
  taskName?: string;
  date: string;
  hoursLogged: number;
  isBillable: boolean;
  hourlyRate: number;
  billedAmount: number;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

interface TMRateCard {
  id: string;
  name: string;
  roleTitle: string;
  clientName?: string;
  currency: string;
  hourlyRate: number;
  overtimeMultiplier: number;
  billingType: string;
  isActive: boolean;
  effectiveFrom?: string;
}

interface TMInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  periodFrom: string;
  periodTo: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  lineItems: { description: string; quantity: number; unitPrice: number; amount: number }[];
  createdAt: string;
}

type ActiveTab = 'overview' | 'projects' | 'timesheets' | 'rate-cards' | 'invoices';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (amount: number, currency = 'USD') => {
  const symbols: Record<string, string> = { USD: '$', INR: '₹', AED: 'AED ', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || currency + ' ';
  return `${sym}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  inactive: 'bg-gray-100 text-gray-500',
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-700',
  sent: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
};

// ─── Component ────────────────────────────────────────────────────────────────
export const TimeMaterialsPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [summary, setSummary] = useState<TMDashboardSummary | null>(null);
  const [clients, setClients] = useState<TMClient[]>([]);
  const [projects, setProjects] = useState<TMProject[]>([]);
  const [timesheets, setTimesheets] = useState<TMTimesheet[]>([]);
  const [rateCards, setRateCards] = useState<TMRateCard[]>([]);
  const [invoices, setInvoices] = useState<TMInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [tsFilter, setTsFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TMInvoice | null>(null);
  const [editingRateCard, setEditingRateCard] = useState<TMRateCard | 'new' | null>(null);
  const [rateCardForm, setRateCardForm] = useState({
    name: '',
    roleTitle: '',
    clientId: '',
    clientName: '',
    currency: 'USD',
    hourlyRate: '150',
    overtimeMultiplier: '1.5',
    billingType: 'time_and_materials',
    isActive: true,
  });
  const [invoiceDiagnostic, setInvoiceDiagnostic] = useState<{
    clientId: string;
    clientName: string;
    pendingCount: number;
    pendingAmount: number;
    approvedCount: number;
    approvedAmount: number;
  } | null>(null);
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  const [newEntry, setNewEntry] = useState({ date: '', projectId: '', hoursLogged: '', description: '', isBillable: true });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, clientsRes, projectsRes, tsRes, rcRes, invRes] = await Promise.all([
        apiClient.get<TMDashboardSummary>('/tm/dashboard'),
        apiClient.get<TMClient[]>('/tm/clients'),
        apiClient.get<TMProject[]>('/tm/projects'),
        apiClient.get<TMTimesheet[]>('/tm/timesheets'),
        apiClient.get<TMRateCard[]>('/tm/rate-cards'),
        apiClient.get<TMInvoice[]>('/tm/invoices'),
      ]);
      if (summaryRes.data) setSummary(summaryRes.data);
      if (clientsRes.data) setClients(Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes.data as any).data || []);
      if (projectsRes.data) setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data as any).data || []);
      if (tsRes.data) setTimesheets(Array.isArray(tsRes.data) ? tsRes.data : (tsRes.data as any).data || []);
      if (rcRes.data) setRateCards(Array.isArray(rcRes.data) ? rcRes.data : (rcRes.data as any).data || []);
      if (invRes.data) setInvoices(Array.isArray(invRes.data) ? invRes.data : (invRes.data as any).data || []);
    } catch (err) {
      toast.error('Failed to load T&M data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTimesheet = async (ts: TMTimesheet) => {
    const confirmed = await confirm({
      title: 'Approve Timesheet Entry?',
      text: `Approve ${ts.hoursLogged}h logged by ${ts.employeeName} on ${ts.date}?`,
      icon: 'question',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
    });
    if (!confirmed) return;
    const res = await apiClient.post(`/tm/timesheets/${ts.id}/approve`, { approverName: 'Vikram Singh' });
    if (!res.error) {
      toast.success(`Timesheet approved — ${fmtCurrency(ts.billedAmount, 'USD')} billable`);
      setTimesheets(prev => prev.map(t => t.id === ts.id ? { ...t, status: 'approved' as const, approvedBy: 'Vikram Singh' } : t));
    } else {
      toast.error(res.error?.message || 'Approval failed');
    }
  };

  const handleRejectTimesheet = async (ts: TMTimesheet) => {
    const confirmed = await confirm({
      title: 'Reject Timesheet?',
      text: `This will send the entry back to ${ts.employeeName} for correction.`,
      icon: 'warning',
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel',
      isDangerous: true,
    });
    if (!confirmed) return;
    const res = await apiClient.post(`/tm/timesheets/${ts.id}/reject`, { approverName: 'Vikram Singh', rejectionNotes: 'Please add more details' });
    if (!res.error) {
      toast.warning('Timesheet sent back for revision');
      setTimesheets(prev => prev.map(t => t.id === ts.id ? { ...t, status: 'rejected' as const } : t));
    }
  };

  const handleSubmitTimesheet = async () => {
    if (!newEntry.date || !newEntry.projectId || !newEntry.hoursLogged) {
      toast.error('Please fill date, project, and hours');
      return;
    }
    const project = projects.find(p => p.id === newEntry.projectId);
    const res = await apiClient.post('/tm/timesheets', {
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      projectId: newEntry.projectId,
      projectName: project?.name || '',
      date: newEntry.date,
      hoursLogged: parseFloat(newEntry.hoursLogged),
      isBillable: newEntry.isBillable,
      rateCardId: 'rc-002',
      description: newEntry.description,
    });
    if (!res.error) {
      toast.success('Timesheet entry submitted successfully');
      setShowTimesheetModal(false);
      setNewEntry({ date: '', projectId: '', hoursLogged: '', description: '', isBillable: true });
      loadAll();
    } else {
      toast.error(res.error?.message || 'Submission failed');
    }
  };

  const openNewRateCardModal = () => {
    setRateCardForm({
      name: '',
      roleTitle: '',
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      currency: 'USD',
      hourlyRate: '150',
      overtimeMultiplier: '1.5',
      billingType: 'time_and_materials',
      isActive: true,
    });
    setEditingRateCard('new');
  };

  const openEditRateCardModal = (card: TMRateCard) => {
    setRateCardForm({
      name: card.name,
      roleTitle: card.roleTitle,
      clientId: card.clientName ? clients.find(c => c.name === card.clientName)?.id || '' : '',
      clientName: card.clientName || '',
      currency: card.currency,
      hourlyRate: String(card.hourlyRate),
      overtimeMultiplier: String(card.overtimeMultiplier),
      billingType: card.billingType,
      isActive: card.isActive,
    });
    setEditingRateCard(card);
  };

  const handleSaveRateCard = async () => {
    if (!rateCardForm.name || !rateCardForm.roleTitle || !rateCardForm.hourlyRate) {
      toast.error('Please fill name, role title, and hourly rate');
      return;
    }
    const selectedClient = clients.find(c => c.id === rateCardForm.clientId);
    const payload = {
      name: rateCardForm.name,
      roleTitle: rateCardForm.roleTitle,
      clientId: rateCardForm.clientId || undefined,
      clientName: selectedClient?.name || rateCardForm.clientName || undefined,
      currency: rateCardForm.currency,
      hourlyRate: parseFloat(rateCardForm.hourlyRate),
      overtimeMultiplier: parseFloat(rateCardForm.overtimeMultiplier),
      billingType: rateCardForm.billingType,
      isActive: rateCardForm.isActive,
    };

    if (editingRateCard === 'new') {
      const res = await apiClient.post('/tm/rate-cards', payload);
      if (!res.error) {
        toast.success(`Rate Card "${rateCardForm.name}" created successfully`);
        setEditingRateCard(null);
        loadAll();
      } else {
        toast.error(res.error?.message || 'Failed to create rate card');
      }
    } else if (editingRateCard && typeof editingRateCard === 'object') {
      const res = await apiClient.put(`/tm/rate-cards/${editingRateCard.id}`, payload);
      if (!res.error) {
        toast.success(`Rate Card "${rateCardForm.name}" updated successfully`);
        setEditingRateCard(null);
        loadAll();
      } else {
        toast.error(res.error?.message || 'Failed to update rate card');
      }
    }
  };

  const handleToggleRateCardActive = async (card: TMRateCard) => {
    const res = await apiClient.put(`/tm/rate-cards/${card.id}`, { isActive: !card.isActive });
    if (!res.error) {
      toast.success(`Rate Card marked as ${!card.isActive ? 'Active' : 'Inactive'}`);
      loadAll();
    }
  };

  const handleGenerateInvoice = async (clientId: string, clientName: string, forceCreate = false) => {
    // Check & Balances Diagnostic Audit
    const clientProjects = projects.filter(p => p.clientId === clientId).map(p => p.id);
    const clientTimesheets = timesheets.filter(t => t.projectId && clientProjects.includes(t.projectId));
    
    const pendingTs = clientTimesheets.filter(t => t.status === 'pending' || t.status === 'draft');
    const pendingAmount = pendingTs.reduce((s, t) => s + (t.isBillable ? (t.billedAmount || t.hoursLogged * (t.hourlyRate || 100)) : 0), 0);
    const approvedBillableTs = clientTimesheets.filter(t => t.status === 'approved' && t.isBillable);
    const approvedAmount = approvedBillableTs.reduce((s, t) => s + t.billedAmount, 0);

    // If approved amount is $0 or pending timesheets exist, show diagnostic warning unless forced
    if (!forceCreate && (approvedAmount === 0 || pendingTs.length > 0)) {
      setInvoiceDiagnostic({
        clientId,
        clientName,
        pendingCount: pendingTs.length,
        pendingAmount,
        approvedCount: approvedBillableTs.length,
        approvedAmount,
      });
      return;
    }

    const periodFrom = '2025-09-01';
    const periodTo = new Date().toISOString().split('T')[0];
    const res = await apiClient.post('/tm/invoices/generate', { clientId, periodFrom, periodTo });
    if (!res.error) {
      toast.success(`Invoice generated for ${clientName} — ${fmtCurrency(res.data?.totalAmount || 0, res.data?.currency || 'USD')}`);
      setInvoiceDiagnostic(null);
      loadAll();
    } else {
      toast.error(res.error?.message || 'Invoice generation failed');
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'Projects & Clients', icon: Briefcase },
    { id: 'timesheets', label: 'Timesheets', icon: Clock },
    { id: 'rate-cards', label: 'Rate Cards', icon: DollarSign },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
  ];

  const filteredTimesheets = timesheets.filter(ts => {
    const matchStatus = tsFilter === 'all' || ts.status === tsFilter;
    const matchSearch = !searchQuery ||
      ts.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ts.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 font-medium">Loading T&M Hub…</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tm.time_amp_materials_hub', 'Time & Materials Hub')}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Client project billing, timesheet approvals & invoice management</p>
            </div>
            <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center gap-1">
              <Zap className="w-3 h-3" /> Add-on
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowTimesheetModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Log Hours
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'timesheets' && timesheets.filter(t => t.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-bold">
                  {timesheets.filter(t => t.status === 'pending').length}</span>
              )}</button>
          ))}
        </nav>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Clients', value: summary.totalActiveClients, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Active Projects', value: summary.totalActiveProjects, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Pending Approvals', value: summary.pendingTimesheetApprovals, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Outstanding Invoices', value: summary.outstandingInvoiceCount, icon: Receipt, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-sm text-gray-500 mt-1">{kpi.label}</div>
              </div>
            ))}</div>

          {/* Revenue Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white col-span-1">
              <div className="text-sm font-medium text-blue-200 mb-1">Total Project Budget (USD eq.)</div>
              <div className="text-3xl font-bold">{fmtCurrency(summary.totalProjectBudgetUSD)}</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-blue-500 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: `${Math.min(100, (summary.totalBilledUSD / summary.totalProjectBudgetUSD) * 100)}%` }} />
                </div>
                <span className="text-sm text-blue-100">{Math.round((summary.totalBilledUSD / summary.totalProjectBudgetUSD) * 100)}% billed</span>
              </div>
              <div className="text-sm text-blue-100 mt-1">Billed: {fmtCurrency(summary.totalBilledUSD)}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">This Week's Hours</div>
              <div className="flex items-end gap-3 mt-2">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{summary.currentWeekBillableHours}h</div>
                  <div className="text-xs text-gray-500">Billable</div>
                </div>
                <div className="text-gray-300 text-xl font-light">|</div>
                <div>
                  <div className="text-2xl font-bold text-gray-400">{summary.currentWeekNonBillableHours}h</div>
                  <div className="text-xs text-gray-500">Non-billable</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-emerald-600">{summary.overallUtilizationPercent}%</span>
                <span className="text-gray-500">utilization rate</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Outstanding Invoices</div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{fmtCurrency(summary.outstandingInvoiceAmount)}</div>
              <div className="text-xs text-gray-400 mt-1">across {summary.outstandingInvoiceCount} invoice(s)</div>
              <div className="mt-3 text-sm">
                <span className="text-gray-500">Invoiced this month: </span>
                <span className="font-semibold text-blue-600">{fmtCurrency(summary.totalInvoicedThisMonth)}</span>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{t('tm.active_projects', 'Active Projects')}</h3>
              <button onClick={() => setActiveTab('projects')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.filter(p => p.status === 'active').slice(0, 3).map(proj => (
                <div key={proj.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{proj.name}</div>
                      <div className="text-xs text-gray-500">{proj.clientName} · {proj.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700">{fmtCurrency(proj.billedToDate, proj.budgetCurrency)}</div>
                      <div className="text-xs text-gray-400">of {fmtCurrency(proj.budget, proj.budgetCurrency)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 rounded-full h-1.5 transition-all" style={{ width: `${proj.completionPercent}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{proj.completionPercent}%</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[proj.status]}`}>{proj.status}</span>
                  </div>
                </div>
              ))}</div>
          </div>
        </div>
      )}

      {/* ── Projects & Clients Tab ── */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Clients Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('tm.client_portfolio', 'Client Portfolio')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {clients.map(client => (
                <div key={client.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm">
                      {client.code.slice(0, 3)}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                      {client.status}</span>
                  </div>
                  <div className="font-semibold text-gray-800 text-sm leading-tight">{client.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{client.industry} · {client.country}</div>
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Invoiced</span>
                      <span className="font-medium text-gray-700">{fmtCurrency(client.invoicedToDate, client.billingCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Contract value</span>
                      <span className="font-medium text-gray-700">{fmtCurrency(client.totalBudget, client.billingCurrency)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateInvoice(client.id, client.name)}
                    className="mt-3 w-full text-xs text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 flex items-center justify-center gap-1"
                  >
                    <Receipt className="w-3 h-3" /> Generate Invoice
                  </button>
                </div>
              ))}</div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{t('tm.all_projects', 'All Projects')}</h3>
              <span className="text-sm text-gray-500">{projects.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Project', 'Client', 'Status', 'PM', 'Team', 'Budget', 'Billed', 'Progress', 'Utilization'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projects.map(proj => (
                    <tr key={proj.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 max-w-xs truncate">{proj.name}</div>
                        <div className="text-xs text-gray-400">{proj.code}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{proj.clientName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[proj.status]}`}>{proj.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{proj.projectManagerName}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{proj.teamSize}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtCurrency(proj.budget, proj.budgetCurrency)}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap">{fmtCurrency(proj.billedToDate, proj.budgetCurrency)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-28">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${proj.completionPercent}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{proj.completionPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${proj.utilizationPercent >= 90 ? 'text-emerald-600' : proj.utilizationPercent >= 75 ? 'text-amber-600' : 'text-red-500'}`}>
                          {proj.utilizationPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Timesheets Tab ── */}
      {activeTab === 'timesheets' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tm.search_by_employee_or_project', 'Search by employee or project…')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected', 'draft'].map(s => (
                <button
                  key={s}
                  onClick={() => setTsFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    tsFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s}
                  {s === 'pending' && timesheets.filter(t => t.status === 'pending').length > 0 && (
                    <span className="ml-1 bg-amber-400 text-white px-1 rounded-full text-xs">
                      {timesheets.filter(t => t.status === 'pending').length}</span>
                  )}</button>
              ))}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Employee', 'Project / Task', 'Date', 'Hours', 'Billable', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTimesheets.map(ts => (
                    <tr key={ts.id} className="hover:bg-gray-50/50 group">
                      <td className="px-4 py-3 font-medium text-gray-800">{ts.employeeName}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 max-w-xs truncate">{ts.projectName}</div>
                        {ts.taskName && <div className="text-xs text-gray-400 truncate">{ts.taskName}</div>}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{ts.date}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{ts.hoursLogged}h</td>
                      <td className="px-4 py-3">
                        {ts.isBillable
                          ? <span className="flex items-center gap-1 text-emerald-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Billable</span>
                          : <span className="flex items-center gap-1 text-gray-400 text-xs"><Circle className="w-3.5 h-3.5" /> Internal</span>
                        }</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        {ts.isBillable ? fmtCurrency(ts.billedAmount) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ts.status]}`}>{ts.status}</span>
                        {ts.approvedBy && <div className="text-xs text-gray-400 mt-0.5">by {ts.approvedBy}</div>}</td>
                      <td className="px-4 py-3">
                        {ts.status === 'pending' && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleApproveTimesheet(ts)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRejectTimesheet(ts)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                              title="Reject"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}</td>
                    </tr>
                  ))}
                  {filteredTimesheets.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No timesheet entries match your filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Rate Cards Tab ── */}
      {activeTab === 'rate-cards' && (
        <div className="space-y-6">
          {/* Help & Guidance Banner */}
          {showHelpBanner && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 relative">
              <button
                onClick={() => setShowHelpBanner(false)}
                className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 text-sm font-bold"
              >
                ✕ {t('action.dismiss', 'Dismiss')}</button>
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-blue-600 text-white rounded-xl mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-2 pr-6">
                  <h4 className="font-bold text-gray-900 text-sm">Guide: Rate Card Configuration & Invoice Calculations</h4>
                  <div className="text-xs text-gray-600 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                      <span className="font-semibold text-blue-800 block mb-1">🛠️ How to Change Rate Cards</span>
                      Click <strong>"Edit Rate Card"</strong> on any card below or press <strong>"+ Add Rate Card"</strong> to modify hourly billing tariffs ($/hr), overtime multipliers, role titles, and client assignments.
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                      <span className="font-semibold text-blue-800 block mb-1">⚖️ Checks & Balances for $0 Invoices</span>
                      Invoices compile only <strong>Approved Billable Timesheets</strong>. If an invoice shows <strong>$0</strong>, ensure timesheets for that client are approved in the <em>Timesheets</em> tab first.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('tm.billing_tariffs_rate_cards', 'Billing Tariffs & Rate Cards')}</h3>
              <p className="text-xs text-gray-500">Manage client hourly rates, overtime multipliers, and billing structures</p>
            </div>
            <button
              onClick={openNewRateCardModal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Rate Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rateCards.map(rc => (
              <div key={rc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRateCardActive(rc)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        rc.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title="Click to toggle active status"
                    >
                      {rc.isActive ? 'Active' : 'Inactive'}</button>
                    <button
                      onClick={() => openEditRateCardModal(rc)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      {t('action.edit', 'Edit')}</button>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800">{rc.name}</h4>
                <div className="text-xs text-gray-500 mt-0.5">{rc.roleTitle}</div>
                {rc.clientName ? (
                  <div className="text-xs text-blue-600 font-medium mt-1">Client: {rc.clientName}</div>
                ) : (
                  <div className="text-xs text-gray-400 mt-1">Global Standard Rate</div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-400">Hourly Rate</div>
                    <div className="text-xl font-bold text-gray-900">{fmtCurrency(rc.hourlyRate, rc.currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">OT Multiplier</div>
                    <div className="text-xl font-bold text-amber-600">{rc.overtimeMultiplier}x</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2">
                  <span className="capitalize">{rc.billingType.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">Effective: {rc.effectiveFrom}</span>
                </div>
              </div>
            ))}</div>
        </div>
      )}

      {/* ── Invoices Tab ── */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Paid', count: invoices.filter(i => i.status === 'paid').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Awaiting Payment', count: invoices.filter(i => i.status === 'sent').length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 ${s.bg} flex items-center justify-between`}>
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.count}</span>
              </div>
            ))}</div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Invoice #', 'Client', 'Period', 'Subtotal', 'Tax', 'Total', 'Due Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 group">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{inv.clientName}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{inv.periodFrom} → {inv.periodTo}</td>
                      <td className="px-4 py-3 text-gray-700">{fmtCurrency(inv.subtotal, inv.currency)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {inv.taxRate > 0 ? `${fmtCurrency(inv.taxAmount, inv.currency)} (${inv.taxRate}%)` : '—'}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{fmtCurrency(inv.totalAmount, inv.currency)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>{inv.status}</span>
                        {inv.paidDate && <div className="text-xs text-gray-400 mt-0.5">Paid {inv.paidDate}</div>}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100" title="View Invoice Details">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100" title="Download PDF" onClick={() => toast.info(`Downloading ${inv.invoiceNumber}…`)}>
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {inv.status === 'draft' && (
                            <button className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Send to Client" onClick={() => toast.success(`Invoice ${inv.invoiceNumber} sent to client`)}>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Hours Modal ── */}
      {showTimesheetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{t('tm.log_hours', 'Log Hours')}</h3>
              <button onClick={() => setShowTimesheetModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('tm.date', 'Date *')}</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('tm.project', 'Project *')}</label>
                <select
                  value={newEntry.projectId}
                  onChange={e => setNewEntry(p => ({ ...p, projectId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select project…</option>
                  {projects.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('tm.hours_logged', 'Hours Logged *')}</label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={newEntry.hoursLogged}
                  onChange={e => setNewEntry(p => ({ ...p, hoursLogged: e.target.value }))}
                  placeholder={t('tm.e_g_7_5', 'e.g. 7.5')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('tm.work_description', 'Work Description')}</label>
                <textarea
                  rows={3}
                  value={newEntry.description}
                  onChange={e => setNewEntry(p => ({ ...p, description: e.target.value }))}
                  placeholder={t('tm.describe_what_you_worked_on', 'Describe what you worked on…')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEntry.isBillable}
                  onChange={e => setNewEntry(p => ({ ...p, isBillable: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Mark as <strong>billable</strong> to client</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowTimesheetModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50"
              >
                {t('action.cancel', 'Cancel')}</button>
              <button
                onClick={handleSubmitTimesheet}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700"
              >
                {t('tm.submit_entry', 'Submit Entry')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Detail View Modal ── */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-200">Invoice Details</div>
                <h3 className="text-xl font-bold font-mono">{selectedInvoice.invoiceNumber}</h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-blue-100 hover:text-white text-2xl leading-none">✕</button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Client Name</div>
                  <div className="font-semibold text-gray-900">{selectedInvoice.clientName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Billing Period</div>
                  <div className="font-medium text-gray-700">{selectedInvoice.periodFrom} to {selectedInvoice.periodTo}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Invoice Status</div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize mt-0.5 ${statusColors[selectedInvoice.status]}`}>
                    {selectedInvoice.status}</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Payment Due Date</div>
                  <div className="font-medium text-gray-700">{selectedInvoice.dueDate}</div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Itemized Breakdown</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Description</th>
                        <th className="px-4 py-2.5 text-right">Hours/Qty</th>
                        <th className="px-4 py-2.5 text-right">Unit Rate</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 ? (
                        selectedInvoice.lineItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-medium text-gray-800">{item.description}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{fmtCurrency(item.unitPrice, selectedInvoice.currency)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtCurrency(item.amount, selectedInvoice.currency)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-gray-400">Standard project billable line item</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm max-w-xs ml-auto">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{fmtCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
                </div>
                {selectedInvoice.taxRate > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({selectedInvoice.taxRate}%):</span>
                    <span className="font-semibold">{fmtCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">{fmtCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => {
                  toast.info(`Downloading PDF for ${selectedInvoice.invoiceNumber}…`);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-2 bg-white hover:bg-blue-50"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                {t('action.closePreview', 'Close Preview')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rate Card Add/Edit Modal ── */}
      {editingRateCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{editingRateCard === 'new' ? 'Create New Rate Card' : 'Edit Rate Card'}</h3>
                <p className="text-xs text-emerald-100">Set hourly billing rates, overtime multipliers, and client scope</p>
              </div>
              <button onClick={() => setEditingRateCard(null)} className="text-emerald-100 hover:text-white text-xl leading-none">✕</button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('tm.rate_card_name', 'Rate Card Name *')}</label>
                <input
                  type="text"
                  value={rateCardForm.name}
                  onChange={e => setRateCardForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={t('tm.e_g_senior_software_engineer_t', 'e.g. Senior Software Engineer - Tier 1')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('tm.role_designating_title', 'Role / Designating Title *')}</label>
                <input
                  type="text"
                  value={rateCardForm.roleTitle}
                  onChange={e => setRateCardForm(p => ({ ...p, roleTitle: e.target.value }))}
                  placeholder={t('tm.e_g_senior_solutions_architect', 'e.g. Senior Solutions Architect')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('tm.hourly_rate_hr_or_local', 'Hourly Rate ($/hr or local) *')}</label>
                  <input
                    type="number"
                    min="1"
                    value={rateCardForm.hourlyRate}
                    onChange={e => setRateCardForm(p => ({ ...p, hourlyRate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('tm.currency', 'Currency')}</label>
                  <select
                    value={rateCardForm.currency}
                    onChange={e => setRateCardForm(p => ({ ...p, currency: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AED">AED (AED)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('tm.overtime_multiplier', 'Overtime Multiplier')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="3"
                    value={rateCardForm.overtimeMultiplier}
                    onChange={e => setRateCardForm(p => ({ ...p, overtimeMultiplier: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('tm.billing_structure', 'Billing Structure')}</label>
                  <select
                    value={rateCardForm.billingType}
                    onChange={e => setRateCardForm(p => ({ ...p, billingType: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="time_and_materials">Time & Materials</option>
                    <option value="fixed_price">Fixed Price Milestone</option>
                    <option value="retainer">Monthly Retainer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('tm.client_scope_optional', 'Client Scope (Optional)')}</label>
                <select
                  value={rateCardForm.clientId}
                  onChange={e => setRateCardForm(p => ({ ...p, clientId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Global (Applies to all clients)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rateCardForm.isActive}
                  onChange={e => setRateCardForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700 font-medium">Rate Card is Active for New Logged Hours</span>
              </label>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditingRateCard(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-100"
              >
                {t('action.cancel', 'Cancel')}</button>
              <button
                onClick={handleSaveRateCard}
                className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-emerald-700"
              >
                {editingRateCard === 'new' ? 'Create Rate Card' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Check & Balances Diagnostic Warning Modal ── */}
      {invoiceDiagnostic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-amber-200">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-amber-100" />
                <div>
                  <h3 className="font-bold text-lg">{t('tm.check_amp_balances_warning', 'Check & Balances Warning')}</h3>
                  <p className="text-xs text-amber-100">Invoice Generation Diagnostic Audit</p>
                </div>
              </div>
              <button onClick={() => setInvoiceDiagnostic(null)} className="text-amber-100 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
                <div className="font-bold text-base mb-1">Why is this invoice generating $0?</div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Invoices automatically pull revenue <strong>ONLY from Approved Billable Timesheets</strong>. Unapproved or pending timesheets cannot be billed to clients under financial governance rules.
                </p>
              </div>

              {/* Diagnostic Breakdown */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50 text-xs">
                <div className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Audit Results for {invoiceDiagnostic.clientName}</div>
                
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Approved Billable Entries:
                  </span>
                  <span className="font-bold text-emerald-700">{invoiceDiagnostic.approvedCount} entries ({fmtCurrency(invoiceDiagnostic.approvedAmount)})</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Timesheets Waiting Approval:
                  </span>
                  <span className="font-bold text-amber-700">{invoiceDiagnostic.pendingCount} entries ({fmtCurrency(invoiceDiagnostic.pendingAmount)})</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2">
                <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Recommended Action:</strong> Go to the <strong>Timesheets</strong> tab and click <span className="text-emerald-700 font-semibold">Approve</span> on the pending entries for {invoiceDiagnostic.clientName}, then re-generate the invoice!
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setInvoiceDiagnostic(null);
                  setActiveTab('timesheets');
                  setTsFilter('pending');
                }}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Go Approve Timesheets First
              </button>
              <button
                onClick={() => handleGenerateInvoice(invoiceDiagnostic.clientId, invoiceDiagnostic.clientName, true)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold"
              >
                {t('tm.generateBlankDraftAnyway', 'Generate Blank $0 Draft Anyway')}</button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
