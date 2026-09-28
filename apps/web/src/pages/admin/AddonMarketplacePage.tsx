import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Briefcase,
  UsersRound,
  WalletCards,
  ArrowRight,
  Zap,
  Check,
  CreditCard,
  Building,
  Calendar,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  X,
  Layers,
  FileCheck,
  Award,
  Crown,
  Edit3,
  Sliders,
  Shield,
  Save
} from 'lucide-react';
import { AddonCatalogItemDTO, TenantAddonSubscriptionDTO, TenantAddonModule } from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const AddonMarketplacePage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotifications();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [catalog, setCatalog] = useState<AddonCatalogItemDTO[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantAddonSubscriptionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe Modal State
  const [selectedAddon, setSelectedAddon] = useState<AddonCatalogItemDTO | null>(null);
  const [modalBillingCycle, setModalBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [modalIsTrial, setModalIsTrial] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // SuperAdmin Addon Management State
  const [editingCatalogItem, setEditingCatalogItem] = useState<AddonCatalogItemDTO | null>(null);
  const [overrideTenantId, setOverrideTenantId] = useState('tenant-001');
  const [overrideAddonId, setOverrideAddonId] = useState<TenantAddonModule>('hr_suite');
  const [overrideStatus, setOverrideStatus] = useState<'active' | 'trial' | 'cancelled'>('active');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [isSavingSuperAdmin, setIsSavingSuperAdmin] = useState(false);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      const [catalogRes, subsRes] = await Promise.all([
        apiClient.get<AddonCatalogItemDTO[]>('/addons/catalog'),
        apiClient.get<TenantAddonSubscriptionDTO[]>('/addons/subscriptions')
      ]);

      if (catalogRes.success && catalogRes.data) {
        setCatalog(catalogRes.data);
      } else {
        // Fallback default catalog
        setCatalog([
          {
            id: 'hr_suite',
            name: 'Core HR & Employee Lifecycle Suite',
            tagline: 'End-to-end Onboarding, Document Compliance Vault, Asset Tracking & Performance Reviews',
            description: 'Transform InfiTimePro into an all-in-one HRMS. Automate candidate onboarding checklists, securely store compliance credentials, allocate IT/physical company assets, conduct 360 appraisals, and resolve employee grievances with an integrated HR helpdesk.',
            category: 'Core HR',
            pricePerSeatMonthly: 2.50,
            pricePerSeatAnnual: 24.00,
            trialDays: 14,
            badge: 'Most Popular',
            popular: true,
            iconName: 'UsersRound',
            features: [
              'Candidate Onboarding & Offboarding Pipelines',
              'Digital Document & Compliance Vault with Expiry Alarms',
              'Company Hardware & SIM Asset Management',
              'Continuous Performance Reviews & OKR Tracking',
              'Employee HR Helpdesk & Automated Letter Issuance'
            ]
          },
          {
            id: 'time_and_materials',
            name: 'Time & Materials / Project Billing',
            tagline: 'Client project timesheets, billable hour rate cards & contractor invoicing',
            description: 'Track billable vs non-billable client projects with multi-tier billing rates, timesheet audit approvals, milestone tracking, and automated QuickBooks/NetSuite invoice exports.',
            category: 'Productivity',
            pricePerSeatMonthly: 3.00,
            pricePerSeatAnnual: 28.80,
            trialDays: 14,
            badge: 'Enterprise',
            popular: false,
            iconName: 'Briefcase',
            features: [
              'Client & Project Cost Center Hierarchy',
              'Multi-Tier Billable Hourly Rate Cards',
              'Weekly Timesheet Submission & Approval Workflows',
              'Project Profitability & Utilization Analytics',
              'Direct ERP / Accounting Invoice Generation'
            ]
          },
          {
            id: 'ai_anti_spoofing',
            name: 'Advanced AI Biometric Anti-Spoofing',
            tagline: '3D facial liveness verification, GPS mock sensor detection & deepfake protection',
            description: 'Elevate mobile punch security with deep neural network liveness verification, dynamic blink/head-turn challenge responses, and hardware-attested sensor validation.',
            category: 'Security & Biometrics',
            pricePerSeatMonthly: 1.50,
            pricePerSeatAnnual: 14.40,
            trialDays: 14,
            badge: 'High Security',
            popular: false,
            iconName: 'ShieldCheck',
            features: [
              '3D Passive & Active Facial Liveness Detection',
              'Deepfake & Screen-Playback Detection Algorithms',
              'Hardware-level Android/iOS Root & Jailbreak Attestation',
              'Mock GPS Spoof App Signature Blacklisting',
              'Real-time Biometric Re-authentication Prompts'
            ]
          },
          {
            id: 'payroll_disbursement',
            name: 'Automated Direct Payroll Disbursement',
            tagline: '1-Click bank batch payout transfer, wage card sync & statutory tax remittances',
            description: 'Disburse employee salaries instantly via ACH, SEPA, UPI, or WPS (UAE) bank protocols with cryptographic multi-sign approval and statutory deductions reconciliation.',
            category: 'Financial & Payroll',
            pricePerSeatMonthly: 2.00,
            pricePerSeatAnnual: 19.20,
            trialDays: 14,
            badge: 'Fintech',
            popular: false,
            iconName: 'WalletCards',
            features: [
              'Multi-Country Direct Banking Integration (ACH, SEPA, WPS)',
              'Dual-Custody Cryptographic Transfer Authorization',
              'Automated Tax Slip & Form 16 / W-2 Generation',
              'Real-time Remittance Status Webhooks',
              'Early Wage Access (EWA) On-Demand Pay Module'
            ]
          }
        ]);
      }

      if (subsRes.success && subsRes.data) {
        setSubscriptions(subsRes.data);
      } else {
        setSubscriptions([
          {
            id: 'sub-hr-001',
            tenantId: 'tenant-001',
            addonId: 'hr_suite',
            status: 'active',
            billingCycle: 'annual',
            subscribedSeats: 300,
            unitPrice: 2.00,
            monthlyTotal: 600.00,
            renewsAt: '2027-01-15T00:00:00.000Z',
            activatedAt: '2025-01-15T09:00:00.000Z',
            autoRenew: true
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const getSubscriptionForAddon = (addonId: TenantAddonModule) => {
    return subscriptions.find(s => s.addonId === addonId);
  };

  const handleOpenSubscribe = (addon: AddonCatalogItemDTO, asTrial = false) => {
    setSelectedAddon(addon);
    setModalBillingCycle(billingCycle);
    setModalIsTrial(asTrial);
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedAddon) return;

    setIsSubscribing(true);
    try {
      const res = await apiClient.post<TenantAddonSubscriptionDTO>('/addons/subscribe', {
        addonId: selectedAddon.id,
        billingCycle: modalBillingCycle,
        seats: 300,
        startAsTrial: modalIsTrial
      });

      if (res.success && res.data) {
        setSubscriptions(prev => {
          const filtered = prev.filter(s => s.addonId !== selectedAddon.id);
          return [...filtered, res.data!];
        });
        toast.success(
          modalIsTrial
            ? `14-Day Free Trial activated for ${selectedAddon.name}!`
            : `Subscribed to ${selectedAddon.name} successfully!`
        );
        setSelectedAddon(null);
      } else {
        toast.error(res.error?.message || 'Failed to activate add-on');
      }
    } catch (err: any) {
      toast.error(err.message || 'Subscription failed');
    } finally {
      setIsSubscribing(false);
    }
  };


  const handleCancelAddon = async (addon: AddonCatalogItemDTO) => {
    const isConfirmed = await confirm({
      title: `Cancel ${addon.name}?`,
      text: `Are you sure you want to deactivate ${addon.name}? You will retain access until the end of the current billing period.`,
      confirmButtonText: 'Yes, Cancel Subscription',
      cancelButtonText: 'Keep Active',
      icon: 'warning',
      isDangerous: true
    });

    if (!isConfirmed) return;


    try {
      const res = await apiClient.post<TenantAddonSubscriptionDTO>('/addons/cancel', {
        addonId: addon.id
      });

      if (res.success && res.data) {
        setSubscriptions(prev =>
          prev.map(s => (s.addonId === addon.id ? { ...s, status: 'cancelled', autoRenew: false } : s))
        );
        toast.info(`${addon.name} subscription cancelled.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Cancellation failed');
    }
  };

  const getAddonIcon = (iconName: string) => {
    switch (iconName) {
      case 'UsersRound':
        return <UsersRound className="w-6 h-6 text-indigo-600" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-blue-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
      case 'WalletCards':
        return <WalletCards className="w-6 h-6 text-amber-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-purple-600" />;
    }
  };

  const handleSaveCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalogItem) return;

    setIsSavingSuperAdmin(true);
    try {
      const res = await apiClient.post<AddonCatalogItemDTO>('/addons/catalog/item', editingCatalogItem);
      if (res.success && res.data) {
        setCatalog(prev => {
          const filtered = prev.filter(c => c.id !== editingCatalogItem.id);
          return [...filtered, res.data!];
        });
        toast.success('Catalog Item Saved', `Updated ${editingCatalogItem.name} pricing & parameters.`);
        setEditingCatalogItem(null);
      } else {
        toast.error(res.error?.message || 'Failed to save catalog item');
      }
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setIsSavingSuperAdmin(false);
    }
  };

  const handleSaveOverrideGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSuperAdmin(true);
    try {
      const res = await apiClient.post<TenantAddonSubscriptionDTO>('/addons/override-grant', {
        tenantId: overrideTenantId,
        addonId: overrideAddonId,
        status: overrideStatus,
        billingCycle: 'annual',
        seats: 300
      });
      if (res.success && res.data) {
        toast.success(
          'Tenant Addon License Overridden',
          `Granted ${overrideStatus.toUpperCase()} license for ${overrideAddonId} to tenant ${overrideTenantId}.`
        );
        setShowOverrideModal(false);
        fetchMarketplaceData();
      } else {
        toast.error(res.error?.message || 'Failed to grant license');
      }
    } catch (err: any) {
      toast.error(err.message || 'Override grant failed');
    } finally {
      setIsSavingSuperAdmin(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* SuperAdmin Control Center Bar */}
      {role === 'SUPER_ADMIN' && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-purple-900 text-white p-4 rounded-2xl border border-purple-700 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-700 text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">SuperAdmin Add-on Control Center</h3>
              <p className="text-xs text-purple-200">Global SaaS add-on catalog pricing, trial rules, and multi-tenant license overrides</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Grant Tenant License Override</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-8 h-60 w-60 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modular SaaS Platform Add-ons</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">{t('admin.extend_infitimepro_with_enterp', 'Extend InfiTimePro with Enterprise Add-ons')}</h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Unlock powerful specialized modules tailored to your workforce needs. Activate 14-day zero-risk trials, scale seats seamlessly, and manage tenant licenses in 1-click.
            </p>
          </div>

          {/* Quick Tenant Stats Box */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-300 block uppercase font-medium">Subscribed Tenant</span>
              <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Building className="w-4 h-4 text-indigo-400" />
                ACME Global (300 Seats)</span>
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block" />
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-300 block uppercase font-medium">Active Add-ons</span>
              <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                {subscriptions.filter(s => s.status === 'active' || s.status === 'trial').length} Active
              </span>
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block" />
            <NavLink
              to="/billing"
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing & Invoices</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Billing Cycle Selector & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-800">Billing Cadence:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            14-Day Free Trial
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-blue-600" />
            Cancel Anytime
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            Instant Activation
          </span>
        </div>
      </div>

      {/* Add-ons Marketplace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {catalog.map(addon => {
          const sub = getSubscriptionForAddon(addon.id);
          const isActive = sub?.status === 'active';
          const isTrial = sub?.status === 'trial';
          const effectiveMonthlyPrice =
            billingCycle === 'annual'
              ? (addon.pricePerSeatAnnual / 12).toFixed(2)
              : addon.pricePerSeatMonthly.toFixed(2);

          return (
            <div
              key={addon.id}
              className={`relative flex flex-col justify-between rounded-3xl bg-white p-7 border transition-all hover:shadow-lg ${
                isActive || isTrial
                  ? 'border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {/* Top Badge */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                    {getAddonIcon(addon.iconName)}</div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {addon.category}</span>
                    <h3 className="text-xl font-bold text-slate-900">{addon.name}</h3>
                  </div>
                </div>

                {isActive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Active Plan
                  </span>
                )}
                {isTrial && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Trial Active
                  </span>
                )}
                {!sub && addon.badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3 h-3" />
                    {addon.badge}</span>
                )}</div>

              {/* Tagline & Description */}
              <div className="space-y-2 mb-6">
                <p className="text-sm font-semibold text-slate-700">{addon.tagline}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{addon.description}</p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 py-4 border-t border-b border-slate-100 mb-6 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Included Capabilities:
                </span>
                <ul className="space-y-2">
                  {addon.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900">${effectiveMonthlyPrice}</span>
                    <span className="text-xs font-medium text-slate-500">/ seat / month</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {billingCycle === 'annual' ? 'Billed annually ($24.00/yr)' : 'Billed monthly'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => setEditingCatalogItem({ ...addon })}
                      className="px-3 py-2 rounded-xl bg-purple-100 text-purple-900 font-bold text-xs hover:bg-purple-200 transition-all flex items-center gap-1.5"
                      title="Edit Catalog Module Parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Catalog</span>
                    </button>
                  )}

                  {isActive || isTrial ? (
                    addon.id === 'hr_suite' ? (
                      <NavLink
                        to="/hr"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
                      >
                        <span>Open HR Suite</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </NavLink>
                    ) : (
                      <button
                        onClick={() => handleCancelAddon(addon)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        Manage</button>
                    )
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenSubscribe(addon, true)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        14-Day Free Trial</button>
                      <button
                        onClick={() => handleOpenSubscribe(addon, false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Subscribe</span>
                      </button>
                    </>
                  )}</div>
              </div>
            </div>
          );
        })}</div>

      {/* Active Subscriptions & Invoicing Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('admin.tenant_subscription_status_lic', 'Tenant Subscription Status & Licenses')}</h3>
            <p className="text-xs text-slate-500">Live active add-on licenses linked to tenant organization</p>
          </div>
          <button
            onClick={fetchMarketplaceData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Add-on Module</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscribed Seats</th>
                <th className="py-3 px-4">Billing Frequency</th>
                <th className="py-3 px-4">Monthly Investment</th>
                <th className="py-3 px-4">Renewal / Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {subscriptions.map(sub => {
                const catalogItem = catalog.find(c => c.id === sub.addonId);
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                          {getAddonIcon(catalogItem?.iconName || 'Sparkles')}</div>
                        <div>
                          <span className="font-bold text-slate-900 block">{catalogItem?.name || sub.addonId}</span>
                          <span className="text-[10px] text-slate-400">{sub.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === 'active' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      )}
                      {sub.status === 'trial' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          FREE TRIAL
                        </span>
                      )}
                      {sub.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          CANCELLED
                        </span>
                      )}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{sub.subscribedSeats} Seats</td>
                    <td className="py-3.5 px-4 capitalize">{sub.billingCycle}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${sub.monthlyTotal.toFixed(2)}/mo</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {sub.renewsAt ? new Date(sub.renewsAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.addonId === 'hr_suite' && sub.status !== 'cancelled' && (
                        <NavLink
                          to="/hr"
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100"
                        >
                          Open Module
                        </NavLink>
                      )}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscribe / Checkout Modal */}
      {selectedAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  {getAddonIcon(selectedAddon.iconName)}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {modalIsTrial ? `Activate 14-Day Free Trial` : `Subscribe to ${selectedAddon.name}`}</h3>
                  <p className="text-xs text-slate-500">ACME Global Industries (300 Licensed Seats)</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAddon(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Calculation Box */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Billing Cycle</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalBillingCycle('monthly')}
                    className={`px-3 py-1 rounded-lg font-bold ${
                      modalBillingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Monthly (${selectedAddon.pricePerSeatMonthly}/seat)</button>
                  <button
                    onClick={() => setModalBillingCycle('annual')}
                    className={`px-3 py-1 rounded-lg font-bold ${
                      modalBillingCycle === 'annual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Annual ($2.00/seat)</button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs text-slate-600 bg-slate-50/50">
                <div className="flex justify-between">
                  <span>Subscribed Headcount:</span>
                  <span className="font-bold text-slate-900">300 Seats</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Rate:</span>
                  <span className="font-bold text-slate-900">
                    ${modalBillingCycle === 'annual' ? '2.00' : selectedAddon.pricePerSeatMonthly.toFixed(2)} / seat / mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trial Period:</span>
                  <span className="font-bold text-emerald-600">{modalIsTrial ? '14 Days Free (Zero Charge Today)' : 'None (Immediate Activation)'}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Due Today:</span>
                  <span className="text-indigo-600">
                    {modalIsTrial ? '$0.00 USD' : modalBillingCycle === 'annual' ? '$7,200.00 USD / yr' : '$750.00 USD / mo'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Default payment method: Visa ending in •••• 4242</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedAddon(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={isSubscribing}
                onClick={handleConfirmSubscribe}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
              >
                {isSubscribing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>{modalIsTrial ? 'Start Free Trial Now' : 'Confirm & Subscribe'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SuperAdmin Edit Catalog Item Modal */}
      {editingCatalogItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-purple-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">👑 Edit SaaS Add-on Catalog Item</h3>
                  <p className="text-xs text-purple-600 font-semibold">SuperAdmin Platform Global Catalog Configurator</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCatalogItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCatalogItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Add-on Module ID</label>
                  <input
                    type="text"
                    disabled
                    value={editingCatalogItem.id}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                  <select
                    value={editingCatalogItem.category}
                    onChange={e => setEditingCatalogItem({ ...editingCatalogItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="Core HR">Core HR</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Security & Biometrics">Security & Biometrics</option>
                    <option value="Financial & Payroll">Financial & Payroll</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Module Name</label>
                <input
                  type="text"
                  required
                  value={editingCatalogItem.name}
                  onChange={e => setEditingCatalogItem({ ...editingCatalogItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={editingCatalogItem.tagline}
                  onChange={e => setEditingCatalogItem({ ...editingCatalogItem, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingCatalogItem.description}
                  onChange={e => setEditingCatalogItem({ ...editingCatalogItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rate ($/seat)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingCatalogItem.pricePerSeatMonthly}
                    onChange={e => setEditingCatalogItem({ ...editingCatalogItem, pricePerSeatMonthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual Rate ($/seat/yr)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingCatalogItem.pricePerSeatAnnual}
                    onChange={e => setEditingCatalogItem({ ...editingCatalogItem, pricePerSeatAnnual: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trial Days</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingCatalogItem.trialDays}
                    onChange={e => setEditingCatalogItem({ ...editingCatalogItem, trialDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={editingCatalogItem.badge || ''}
                    onChange={e => setEditingCatalogItem({ ...editingCatalogItem, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Most Popular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Icon Name</label>
                  <select
                    value={editingCatalogItem.iconName}
                    onChange={e => setEditingCatalogItem({ ...editingCatalogItem, iconName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="UsersRound">UsersRound (Core HR)</option>
                    <option value="Briefcase">Briefcase (Timesheets & Projects)</option>
                    <option value="ShieldCheck">ShieldCheck (Security / AI Anti-Spoofing)</option>
                    <option value="WalletCards">WalletCards (Payroll & Disbursements)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCatalogItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSuperAdmin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold hover:bg-purple-800 shadow-md transition-all disabled:opacity-50"
                >
                  {isSavingSuperAdmin ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Catalog Parameters</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SuperAdmin Override License Grant Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-purple-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">👑 Grant Tenant Add-on License Override</h3>
                  <p className="text-xs text-purple-600 font-semibold">SuperAdmin Multi-Tenant License Grant & Overrides</p>
                </div>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverrideGrant} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Tenant ID</label>
                <select
                  value={overrideTenantId}
                  onChange={e => setOverrideTenantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  <option value="tenant-001">tenant-001 (ACME Global / Primary Tenant)</option>
                  <option value="tenant-002">tenant-002 (Stark Logistics)</option>
                  <option value="tenant-003">tenant-003 (Wayne Enterprise)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Add-on Module</label>
                <select
                  value={overrideAddonId}
                  onChange={e => setOverrideAddonId(e.target.value as TenantAddonModule)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  {catalog.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Override License Status</label>
                <select
                  value={overrideStatus}
                  onChange={e => setOverrideStatus(e.target.value as 'active' | 'trial' | 'cancelled')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-bold"
                >
                  <option value="active">ACTIVE (Full Subscription Unlocked)</option>
                  <option value="trial">TRIAL (14-Day Free Evaluation Access)</option>
                  <option value="cancelled">CANCELLED (Access Suspended)</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 text-xs leading-relaxed flex items-start gap-2">
                <Shield className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>
                  SuperAdmin overrides bypass Stripe payment collection and immediately activate/deactivate module entitlement flags across the target tenant organization.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSuperAdmin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold hover:bg-purple-800 shadow-md transition-all disabled:opacity-50"
                >
                  {isSavingSuperAdmin ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Crown className="w-3.5 h-3.5" />
                  )}
                  <span>Apply License Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

