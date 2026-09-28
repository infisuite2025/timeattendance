import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  UsersRound,
  FileText,
  Laptop,
  Award,
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Calendar,
  Building,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Check,
  X,
  Smartphone,
  KeyRound,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import {
  OnboardingCandidateDTO,
  EmployeeDocumentDTO,
  CompanyAssetDTO,
  PerformanceReviewDTO,
  HRHelpdeskTicketDTO,
  HRDashboardSummaryDTO,
  DocumentCategory,
  AssetCategory,
  TicketCategory
} from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

type HRTab = 'overview' | 'onboarding' | 'documents' | 'assets' | 'performance' | 'helpdesk';

export const HRHubPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotifications();
  const { user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<HRTab>('overview');
  const [loading, setLoading] = useState(false);

  // Data States
  const [summary, setSummary] = useState<HRDashboardSummaryDTO | null>(null);
  const [candidates, setCandidates] = useState<OnboardingCandidateDTO[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocumentDTO[]>([]);
  const [assets, setAssets] = useState<CompanyAssetDTO[]>([]);
  const [reviews, setReviews] = useState<PerformanceReviewDTO[]>([]);
  const [tickets, setTickets] = useState<HRHelpdeskTicketDTO[]>([]);

  // Filter States
  const [docCategory, setDocCategory] = useState<string>('all');
  const [docSearch, setDocSearch] = useState('');
  const [assetCategory, setAssetCategory] = useState<string>('all');
  const [assetSearch, setAssetSearch] = useState('');
  const [onboardingStageFilter, setOnboardingStageFilter] = useState<string>('all');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');

  // Modal States
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showAllocateAssetModal, setShowAllocateAssetModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [selectedAssetForAllocation, setSelectedAssetForAllocation] = useState<CompanyAssetDTO | null>(null);

  // Form Inputs
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentCategory>('certification');
  const [newDocEmployeeName, setNewDocEmployeeName] = useState('Sarah Jenkins (EMP-1001)');
  const [newDocExpiry, setNewDocExpiry] = useState('');

  const [allocationEmployee, setAllocationEmployee] = useState('EMP-1001');

  const [newTicketCategory, setNewTicketCategory] = useState<TicketCategory>('letter_request');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketLetterType, setNewTicketLetterType] = useState<'bonafide' | 'experience' | 'salary_certificate'>('bonafide');

  const fetchHRData = async () => {
    setLoading(true);
    try {
      const [sumRes, onbRes, docRes, astRes, revRes, tktRes] = await Promise.all([
        apiClient.get<HRDashboardSummaryDTO>('/hr/dashboard'),
        apiClient.get<OnboardingCandidateDTO[]>('/hr/onboarding'),
        apiClient.get<EmployeeDocumentDTO[]>('/hr/documents'),
        apiClient.get<CompanyAssetDTO[]>('/hr/assets'),
        apiClient.get<PerformanceReviewDTO[]>('/hr/performance'),
        apiClient.get<HRHelpdeskTicketDTO[]>('/hr/helpdesk')
      ]);

      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
      if (onbRes.success && onbRes.data) setCandidates(onbRes.data);

      let rawDocs = docRes.success && docRes.data ? docRes.data : [];
      let rawAssets = astRes.success && astRes.data ? astRes.data : [];
      let rawRevs = revRes.success && revRes.data ? revRes.data : [];
      let rawTkts = tktRes.success && tktRes.data ? tktRes.data : [];

      if (role === 'EMPLOYEE') {
        rawDocs = rawDocs.filter(d => d.employeeCode === user.employeeCode || d.employeeCode === 'EMP-1001');
        rawAssets = rawAssets.filter(a => a.allocatedToEmployeeCode === user.employeeCode || a.allocatedToEmployeeCode === 'EMP-1001');
        rawRevs = rawRevs.filter(r => r.employeeCode === user.employeeCode || r.employeeCode === 'EMP-1001');
        rawTkts = rawTkts.filter(t => t.employeeCode === user.employeeCode || t.employeeCode === 'EMP-1001');
      } else if (role === 'MANAGER') {
        const reporteeCodes = ['EMP-1001', 'EMP-1003', 'EMP-1005', 'EMP-1006', 'MGR-104', user.employeeCode];
        rawDocs = rawDocs.filter(d => reporteeCodes.includes(d.employeeCode));
        rawAssets = rawAssets.filter(a => !a.allocatedToEmployeeCode || reporteeCodes.includes(a.allocatedToEmployeeCode));
        rawRevs = rawRevs.filter(r => reporteeCodes.includes(r.employeeCode));
        rawTkts = rawTkts.filter(t => reporteeCodes.includes(t.employeeCode));
      }

      setDocuments(rawDocs);
      setAssets(rawAssets);
      setReviews(rawRevs);
      setTickets(rawTkts);
    } catch (err) {
      console.error('Error fetching HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, []);

  // Handlers
  const handleToggleTask = async (candidateId: string, taskId: string) => {
    try {
      const res = await apiClient.post<OnboardingCandidateDTO>(
        `/hr/onboarding/candidates/${candidateId}/tasks/${taskId}/toggle`,
        {}
      );
      if (res.success && res.data) {
        setCandidates(prev => prev.map(c => (c.id === candidateId ? res.data! : c)));
        toast.success('Onboarding checklist task status updated');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task');
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    try {
      const res = await apiClient.post<EmployeeDocumentDTO>('/hr/documents', {
        title: newDocTitle,
        category: newDocCategory,
        employeeName: newDocEmployeeName.split(' (')[0],
        employeeCode: newDocEmployeeName.includes('(') ? newDocEmployeeName.split('(')[1].replace(')', '') : 'EMP-1001',
        employeeId: 'EMP-1001',
        fileName: `${newDocTitle.replace(/\s+/g, '_')}.pdf`,
        expiryDate: newDocExpiry || undefined
      });

      if (res.success && res.data) {
        setDocuments(prev => [res.data!, ...prev]);
        toast.success(`Document "${newDocTitle}" uploaded & verified in vault!`);
        setShowUploadDocModal(false);
        setNewDocTitle('');
        setNewDocExpiry('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Document upload failed');
    }
  };

  const handleAllocateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForAllocation) return;

    try {
      const res = await apiClient.post<CompanyAssetDTO>(`/hr/assets/${selectedAssetForAllocation.id}/allocate`, {
        employeeId: allocationEmployee,
        employeeName: allocationEmployee === 'EMP-1001' ? 'Sarah Jenkins' : 'Marcus Vance',
        employeeCode: allocationEmployee
      });

      if (res.success && res.data) {
        setAssets(prev => prev.map(a => (a.id === selectedAssetForAllocation.id ? res.data! : a)));
        toast.success(`Asset ${selectedAssetForAllocation.assetTag} allocated to ${res.data.allocatedToEmployeeName}!`);
        setShowAllocateAssetModal(false);
        setSelectedAssetForAllocation(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Asset allocation failed');
    }
  };

  const handleReturnAsset = async (asset: CompanyAssetDTO) => {
    const isConfirmed = await confirm({
      title: `Return Asset ${asset.assetTag}?`,
      text: `Confirm physical return and sign-off for ${asset.name} from ${asset.allocatedToEmployeeName}?`,
      confirmButtonText: 'Confirm Return',
      cancelButtonText: 'Cancel',
      icon: 'question'
    });

    if (!isConfirmed) return;


    try {
      const res = await apiClient.post<CompanyAssetDTO>(`/hr/assets/${asset.id}/return`, {
        condition: 'good'
      });

      if (res.success && res.data) {
        setAssets(prev => prev.map(a => (a.id === asset.id ? res.data! : a)));
        toast.success(`Asset ${asset.assetTag} returned to available inventory.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Return failed');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject) return;

    try {
      const res = await apiClient.post<HRHelpdeskTicketDTO>('/hr/helpdesk', {
        category: newTicketCategory,
        subject: newTicketSubject,
        description: newTicketDescription,
        priority: 'medium',
        requestedLetterType: newTicketCategory === 'letter_request' ? newTicketLetterType : undefined
      });

      if (res.success && res.data) {
        setTickets(prev => [res.data!, ...prev]);
        toast.success(`Ticket ${res.data.ticketNumber} submitted to HR!`);
        setShowCreateTicketModal(false);
        setNewTicketSubject('');
        setNewTicketDescription('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit ticket');
    }
  };

  const handleResolveTicket = async (ticket: HRHelpdeskTicketDTO) => {
    try {
      const res = await apiClient.post<HRHelpdeskTicketDTO>(`/hr/helpdesk/${ticket.id}/resolve`, {
        resolutionNotes: 'Processed by HR Operations. Official letter generated and emailed to employee.'
      });

      if (res.success && res.data) {
        setTickets(prev => prev.map(t => (t.id === ticket.id ? res.data! : t)));
        toast.success(`Ticket ${ticket.ticketNumber} resolved and letter issued!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve ticket');
    }
  };

  // Filtered lists
  const filteredDocs = documents.filter(d => {
    const matchesCat = docCategory === 'all' || d.category === docCategory;
    const matchesSearch =
      !docSearch ||
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.employeeName.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.employeeCode.toLowerCase().includes(docSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredAssets = assets.filter(a => {
    const matchesCat = assetCategory === 'all' || a.category === assetCategory;
    const matchesSearch =
      !assetSearch ||
      a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(assetSearch.toLowerCase()) ||
      (a.allocatedToEmployeeName && a.allocatedToEmployeeName.toLowerCase().includes(assetSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const filteredCandidates = candidates.filter(c => {
    if (onboardingStageFilter === 'all') return true;
    return c.stage === onboardingStageFilter;
  });

  const filteredTickets = tickets.filter(t => {
    if (ticketStatusFilter === 'all') return true;
    return t.status === ticketStatusFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <UsersRound className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{t('hr.core_hr_lifecycle_suite', 'Core HR & Lifecycle Suite')}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Sparkles className="w-3 h-3" />
                ADD-ON MODULE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrated Employee Onboarding, Compliance Vault, Physical/IT Assets, Appraisals & Helpdesk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/admin/addons"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Marketplace & Billing</span>
          </NavLink>
          <button
            onClick={fetchHRData}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
          { id: 'onboarding', label: 'Onboarding Pipeline', icon: UserCheck, count: candidates.length },
          { id: 'documents', label: 'Compliance Vault', icon: FileText, count: documents.length },
          { id: 'assets', label: 'Asset Management', icon: Laptop, count: assets.length },
          { id: 'performance', label: 'Performance Reviews', icon: Award, count: reviews.length },
          { id: 'helpdesk', label: 'HR Helpdesk', icon: MessageSquare, count: tickets.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HRTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}</span>
              )}</button>
          );
        })}</div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Active Onboardings</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{summary?.activeOnboardings ?? 3}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                +12 Completed This Month
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Expiring Documents</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600">{summary?.expiringDocumentsNext30Days ?? 2}</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Within next 45 days</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Allocated Assets</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Laptop className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-indigo-600">
                {summary?.allocatedAssets ?? 5} / {summary?.totalAssetsManaged ?? 6}</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                {summary?.availableAssets ?? 1} Available in Stock
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Open HR Tickets</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-600">{summary?.openHelpdeskTickets ?? 2}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                Avg Resolution: {summary?.averageResolutionHours ?? 4.2}h
              </span>
            </div>
          </div>

          {/* Highlights 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Candidate Pipeline Snapshot */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">{t('hr.upcoming_joiners_onboarding', 'Upcoming Joiners & Onboarding')}</h3>
                </div>
                <button
                  onClick={() => setActiveTab('onboarding')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >{t('common.view_all_rarr_', 'View All &rarr;')}</button>
              </div>

              <div className="divide-y divide-slate-100">
                {candidates.slice(0, 3).map(cand => (
                  <div key={cand.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={cand.candidateName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{cand.candidateName}</span>
                        <span className="text-xs text-slate-500">
                          {cand.designation} • {cand.department}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-indigo-600">{cand.progressPercent}% Ready</span>
                      <span className="text-[10px] text-slate-400 block">Joining: {cand.joiningDate}</span>
                    </div>
                  </div>
                ))}</div>
            </div>

            {/* Document Expiry Alerts */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">{t('hr.compliance_expiry_alarms', 'Compliance & Expiry Alarms')}</h3>
                </div>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >{t('common.view_vault_rarr_', 'View Vault &rarr;')}</button>
              </div>

              <div className="space-y-3">
                {documents
                  .filter(d => d.expiryStatus === 'expiring_soon' || d.expiryStatus === 'expired')
                  .map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white text-amber-600 shadow-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{doc.title}</span>
                          <span className="text-[11px] text-slate-500">
                            {doc.employeeName} ({doc.employeeCode})</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900">
                        {doc.expiryStatus === 'expired' ? 'EXPIRED' : `${doc.daysUntilExpiry}d Left`}</span>
                    </div>
                  ))}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ONBOARDING & PIPELINE */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 mr-2">Filter Stage:</span>
              {['all', 'invited', 'docs_pending', 'it_provisioning', 'induction', 'completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setOnboardingStageFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    onboardingStageFilter === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}</button>
              ))}</div>

            <button
              onClick={() => toast.info('Candidate invitation portal ready for new job applicant')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Invite New Candidate</span>
            </button>
          </div>

          {/* Candidates Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map(candidate => (
              <div
                key={candidate.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={candidate.candidateName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                      />
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{candidate.candidateName}</h4>
                        <span className="text-xs font-semibold text-indigo-600 block">{candidate.designation}</span>
                        <span className="text-[11px] text-slate-500">{candidate.department}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        candidate.stage === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : candidate.stage === 'it_provisioning'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {candidate.stage.replace('_', ' ')}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Onboarding Checklist</span>
                      <span className="text-indigo-600">{candidate.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${candidate.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks Checklist */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Required Milestones:
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {candidate.tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(candidate.id, task.id)}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                            task.completed
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-600'
                              : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-800'
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md mt-0.5 ${
                              task.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                            }`}
                          >
                            {task.completed && <Check className="w-3 h-3" />}</div>
                          <div className="flex-1">
                            <span className={`block font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}>
                              {task.title}</span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              Assigned: {task.assignedToRole}</span>
                          </div>
                        </div>
                      ))}</div>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Joining: {candidate.joiningDate}</span>
                  <span className="font-semibold text-slate-700">{candidate.location}</span>
                </div>
              </div>
            ))}</div>
        </div>
      )}

      {/* TAB 3: COMPLIANCE & DOCUMENT VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Vault Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  placeholder={t('hr.search_by_title_employee', 'Search by title, employee...')}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <select
                value={docCategory}
                onChange={e => setDocCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="identity">Identity & Passport</option>
                <option value="contract">Employment Contracts</option>
                <option value="visa">Visas & Permits</option>
                <option value="certification">Safety & Certifications</option>
                <option value="nda">NDAs & IP Agreements</option>
              </select>
            </div>

            <button
              onClick={() => setShowUploadDocModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Compliance Document</span>
            </button>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Document Title & File</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Identifier / Doc #</th>
                    <th className="py-3.5 px-4">Expiry Date</th>
                    <th className="py-3.5 px-4">Compliance Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.fileName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{doc.employeeName}</span>
                        <span className="text-[10px] text-slate-400">{doc.employeeCode}</span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-600">
                        {doc.category}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">{doc.documentNumber || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{doc.expiryDate || 'Permanent'}</td>
                      <td className="py-3.5 px-4">
                        {doc.expiryStatus === 'valid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            VALID
                          </span>
                        )}
                        {doc.expiryStatus === 'expiring_soon' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            EXPIRING ({doc.daysUntilExpiry}d)</span>
                        )}
                        {doc.expiryStatus === 'expired' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            EXPIRED
                          </span>
                        )}
                        {doc.expiryStatus === 'not_applicable' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            LIFETIME
                          </span>
                        )}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toast.success(`Downloaded ${doc.fileName}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSET MANAGEMENT */}
      {activeTab === 'assets' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={assetSearch}
                  onChange={e => setAssetSearch(e.target.value)}
                  placeholder={t('hr.search_asset_tag_model', 'Search asset tag, model...')}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                />
              </div>

              <select
                value={assetCategory}
                onChange={e => setAssetCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="laptop">Laptops & Desktops</option>
                <option value="monitor">Monitors & Displays</option>
                <option value="mobile_sim">Corporate SIM Cards</option>
                <option value="access_card">Biometric RFID Badges</option>
              </select>
            </div>

            <button
              onClick={() => toast.info('New Asset Barcode Registration scanner active')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Asset</span>
            </button>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => {
              const isAllocated = asset.status === 'allocated';
              return (
                <div
                  key={asset.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                          {asset.category === 'laptop' && <Laptop className="w-5 h-5" />}
                          {asset.category === 'monitor' && <FileSpreadsheet className="w-5 h-5" />}
                          {asset.category === 'mobile_sim' && <Smartphone className="w-5 h-5" />}
                          {asset.category === 'access_card' && <KeyRound className="w-5 h-5" />}</div>
                        <div>
                          <span className="font-mono text-xs font-bold text-indigo-600">{asset.assetTag}</span>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{asset.name}</h4>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isAllocated
                            ? 'bg-blue-100 text-blue-800'
                            : asset.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {asset.status}</span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">{asset.specifications}</p>

                    <div className="p-3 rounded-2xl bg-slate-50 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Serial Number:</span>
                        <span className="font-mono font-bold text-slate-800">{asset.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Condition:</span>
                        <span className="capitalize font-semibold text-slate-700">{asset.condition.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Value:</span>
                        <span className="font-bold text-slate-900">${asset.estimatedValueUsd}</span>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Status & Action */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {isAllocated ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Allocated To:</span>
                          <span className="text-xs font-bold text-slate-900">{asset.allocatedToEmployeeName}</span>
                        </div>
                        <button
                          onClick={() => handleReturnAsset(asset)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                        >
                          Return Asset</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600">Available in Inventory</span>
                        <button
                          onClick={() => {
                            setSelectedAssetForAllocation(asset);
                            setShowAllocateAssetModal(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-xs"
                        >
                          Allocate
                        </button>
                      </div>
                    )}</div>
                </div>
              );
            })}</div>
        </div>
      )}

      {/* TAB 5: PERFORMANCE REVIEWS */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t('hr.active_appraisal_cycles_okrs', 'Active Appraisal Cycles & OKRs')}</h3>
                <p className="text-xs text-slate-500">FY2026 Mid-Year Performance Evaluations & OKR Milestone Tracking</p>
              </div>
              <button
                onClick={() => toast.info('New Appraisal Cycle creation wizard')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
                >{t('common._launch_review_cycle', '+ Launch Review Cycle')}</button>
            </div>

            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{review.employeeName} ({review.employeeCode})</h4>
                        <span className="text-xs text-slate-500">{review.designation} • {review.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Rating</span>
                        <span className="text-xl font-black text-indigo-600">{review.finalRating} / 5.0</span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800">
                        {review.cycleStatus.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Manager Feedback */}
                  {review.managerFeedback && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-1">
                        Reviewer Feedback ({review.reviewerManagerName}):
                      </span>
                      <p className="italic">{review.managerFeedback}</p>
                    </div>
                  )}

                  {/* OKR Goals Progress */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Key Performance Indicators (OKRs):</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {review.goals.map(goal => (
                        <div key={goal.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{goal.title}</span>
                            <span className="text-indigo-600">{goal.progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${goal.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">{goal.targetMetric}</span>
                        </div>
                      ))}</div>
                  </div>
                </div>
              ))}</div>
          </div>
        </div>
      )}

      {/* TAB 6: HR HELPDESK & LETTERS */}
      {activeTab === 'helpdesk' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-2">Filter Status:</span>
              {['all', 'open', 'in_progress', 'resolved'].map(st => (
                <button
                  key={st}
                  onClick={() => setTicketStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    ticketStatusFilter === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}</button>
              ))}</div>

            <button
              onClick={() => setShowCreateTicketModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Raise HR Service Request</span>
            </button>
          </div>

          {/* Tickets Queue */}
          <div className="space-y-4">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">{ticket.ticketNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        ticket.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : ticket.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ticket.priority}</span>
                    <span className="text-xs font-bold text-slate-400">• {ticket.category.replace('_', ' ')}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                  <p className="text-xs text-slate-500">{ticket.description}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                    <span>Requested by: {ticket.employeeName} ({ticket.department})</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {ticket.status === 'resolved' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      RESOLVED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveTicket(ticket)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
                    >
                      {ticket.requestedLetterType ? 'Generate Letter & Resolve' : 'Mark Resolved'}</button>
                  )}</div>
              </div>
            ))}</div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">{t('hr.upload_compliance_document', 'Upload Compliance Document')}</h3>
              <button onClick={() => setShowUploadDocModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('hr.document_title', 'Document Title')}</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  placeholder={t('hr.e_g_hazardous_duty_health_cert', 'e.g. Hazardous Duty Health Certificate')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('hr.document_category', 'Document Category')}</label>
                <select
                  value={newDocCategory}
                  onChange={e => setNewDocCategory(e.target.value as DocumentCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                >
                  <option value="identity">Identity / Passport</option>
                  <option value="contract">Employment Contract</option>
                  <option value="visa">Visa & Work Permit</option>
                  <option value="certification">Safety / Technical Certification</option>
                  <option value="tax">Tax Identification Form</option>
                  <option value="nda">NDA / IP Agreement</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('hr.expiry_date_optional', 'Expiry Date (Optional)')}</label>
                <input
                  type="date"
                  value={newDocExpiry}
                  onChange={e => setNewDocExpiry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
                >{t('hr.upload_verify', 'Upload & Verify')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Asset Modal */}
      {showAllocateAssetModal && selectedAssetForAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Allocate Asset ({selectedAssetForAllocation.assetTag})
              </h3>
              <button onClick={() => setShowAllocateAssetModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAllocateAsset} className="space-y-4 text-xs">
              <p className="text-slate-600">{selectedAssetForAllocation.name}</p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('hr.assign_to_employee', 'Assign to Employee')}</label>
                <select
                  value={allocationEmployee}
                  onChange={e => setAllocationEmployee(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                >
                  <option value="EMP-1001">Sarah Jenkins (EMP-1001 - Engineering)</option>
                  <option value="EMP-1003">Marcus Vance (EMP-1003 - Operations)</option>
                  <option value="EMP-1005">Elena Rostova (EMP-1005 - Operations)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllocateAssetModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
                >{t('hr.confirm_allocation', 'Confirm Allocation')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">{t('hr.raise_hr_service_request', 'Raise HR Service Request')}</h3>
              <button onClick={() => setShowCreateTicketModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('hr.category', 'Category')}</label>
                <select
                  value={newTicketCategory}
                  onChange={e => setNewTicketCategory(e.target.value as TicketCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                >
                  <option value="letter_request">Official Letter / Bonafide Request</option>
                  <option value="policy_clarification">Policy & Shift Clarification</option>
                  <option value="payroll_query">Payroll & Overtime Query</option>
                  <option value="grievance">Confidential HR Grievance</option>
                </select>
              </div>

              {newTicketCategory === 'letter_request' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('hr.letter_type', 'Letter Type')}</label>
                  <select
                    value={newTicketLetterType}
                    onChange={e => setNewTicketLetterType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                  >
                    <option value="bonafide">Bonafide Employment Certificate</option>
                    <option value="salary_certificate">Bank Salary Certificate</option>
                    <option value="experience">Relieving & Experience Certificate</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('hr.subject', 'Subject')}</label>
                <input
                  type="text"
                  required
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  placeholder={t('hr.e_g_request_for_housing_loan_b', 'e.g. Request for Housing Loan Bonafide Letter')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('hr.details_context', 'Details & Context')}</label>
                <textarea
                  rows={3}
                  value={newTicketDescription}
                  onChange={e => setNewTicketDescription(e.target.value)}
                  placeholder={t('hr.provide_any_specific_address_b', 'Provide any specific address, bank name or urgency...')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
                >{t('hr.submit_ticket', 'Submit Ticket')}</button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
