import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Save,
  Key,
  Layers,
  Building,
  Check,
  FileText,
  Percent,
  Plus
} from 'lucide-react';
import {
  PaymentGatewayConfigDTO,
  PlatformPricingTierDTO,
  GlobalRevenueSummaryDTO,
  TenantInvoiceDTO
} from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const PaymentGatewayConfigPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotifications();
  const [activeTab, setActiveTab] = useState<'gateways' | 'pricing' | 'ledger'>('gateways');
  const [loading, setLoading] = useState(true);

  // Repositories
  const [gateways, setGateways] = useState<PaymentGatewayConfigDTO[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PlatformPricingTierDTO[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<GlobalRevenueSummaryDTO | null>(null);

  // Selected Gateway Form State
  const [selectedProvider, setSelectedProvider] = useState<string>('stripe');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Gateway Form Fields
  const [env, setEnv] = useState<'live' | 'sandbox'>('sandbox');
  const [currency, setCurrency] = useState('USD');
  const [pubKey, setPubKey] = useState('');
  const [secKey, setSecKey] = useState('');
  const [webhookSec, setWebhookSec] = useState('');
  const [vpa, setVpa] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [feePercent, setFeePercent] = useState(2.9);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gwRes, tierRes, revRes] = await Promise.all([
        apiClient.get<PaymentGatewayConfigDTO[]>('/billing/gateway-config'),
        apiClient.get<PlatformPricingTierDTO[]>('/billing/pricing-plans'),
        apiClient.get<GlobalRevenueSummaryDTO>('/billing/global-revenue')
      ]);

      if (gwRes.success && Array.isArray(gwRes.data)) {
        setGateways(gwRes.data);
        const stripeGw = gwRes.data.find((g) => g.provider === 'stripe') || gwRes.data[0];
        if (stripeGw) {
          loadGatewayToForm(stripeGw);
        }
      }
      if (tierRes.success && Array.isArray(tierRes.data)) {
        setPricingTiers(tierRes.data);
      }
      if (revRes.success && revRes.data) {
        setRevenueSummary(revRes.data);
      }
    } catch (err: any) {
      toast.error('Failed to load billing configuration', err.message || 'API Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadGatewayToForm = (gw: PaymentGatewayConfigDTO) => {
    setSelectedProvider(gw.provider);
    setEnv(gw.environment);
    setCurrency(gw.currency || 'USD');
    setPubKey(gw.publishableKey || '');
    setSecKey(gw.secretKey || '');
    setWebhookSec(gw.webhookSecret || '');
    setVpa(gw.merchantVpa || '');
    setBankDetails(gw.bankAccountRouting || '');
    setFeePercent(gw.processingFeePercent || 2.5);
  };

  const handleProviderSelect = (provider: string) => {
    const found = gateways.find((g) => g.provider === provider);
    if (found) {
      loadGatewayToForm(found);
    } else {
      setSelectedProvider(provider);
      setEnv('sandbox');
      setCurrency(provider === 'razorpay' || provider === 'upi_wire' ? 'INR' : 'USD');
      setPubKey('');
      setSecKey('');
      setWebhookSec('');
      setVpa('');
      setBankDetails('');
      setFeePercent(provider === 'razorpay' ? 2.0 : provider === 'upi_wire' ? 0.0 : 2.9);
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      provider: selectedProvider,
      environment: env,
      currency,
      publishableKey: pubKey,
      secretKey: secKey,
      webhookSecret: webhookSec,
      merchantVpa: vpa,
      bankAccountRouting: bankDetails,
      processingFeePercent: feePercent,
      isActive: true
    };

    try {
      const res = await apiClient.post<PaymentGatewayConfigDTO>('/billing/gateway-config', payload);
      if (res.success && res.data) {
        toast.success(
          'Payment Gateway Configured',
          `${selectedProvider.toUpperCase()} settings saved successfully in ${env.toUpperCase()} mode.`
        );
        setGateways((prev) => {
          const filtered = prev.filter((g) => g.provider !== selectedProvider);
          return [...filtered, res.data!];
        });
      } else {
        toast.error('Save Failed', res.error?.message || 'Could not update gateway');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to save gateway config');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTierPrice = async (id: string, newMonthly: number, newAnnual: number) => {
    try {
      const res = await apiClient.put<PlatformPricingTierDTO>(`/billing/pricing-plans/${id}`, {
        baseSeatPriceMonthly: newMonthly,
        baseSeatPriceAnnual: newAnnual
      });
      if (res.success && res.data) {
        toast.success('Pricing Updated', `Platform pricing tier updated.`);
        setPricingTiers((prev) => prev.map((t) => (t.id === id ? res.data! : t)));
      }
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not update tier pricing');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.super_admin_payment_gateway_bi', 'Super Admin Payment Gateway & Billing')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              SUPER-ADMIN-ONLY
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure global SaaS payment gateways (Stripe, Razorpay, UPI), manage tenant pricing tiers, and audit platform MRR ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Gateway Configs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 font-semibold text-xs">
        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'gateways'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateway Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'pricing'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Platform Subscription Pricing Tiers</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Global Revenue Ledger & MRR Analytics</span>
        </button>
      </div>

      {/* Tab 1: Payment Gateway Setup */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider Selection Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('admin.supported_payment_gateways', 'Supported Payment Gateways')}</h3>

            {[
              {
                id: 'stripe',
                name: 'Stripe Global Payments',
                badge: 'Recommended (US/EU)',
                desc: 'Supports Credit Cards, Apple Pay, Google Pay, ACH Direct Debit in 135+ currencies.',
                icon: CreditCard
              },
              {
                id: 'razorpay',
                name: 'Razorpay Enterprise India',
                badge: 'INR Standard',
                desc: 'UPI, RuPay cards, NetBanking, and auto-debit recurring mandates for India region.',
                icon: Zap
              },
              {
                id: 'upi_wire',
                name: 'Direct UPI & Bank Wire Transfer',
                badge: 'Zero Fee',
                desc: 'Manual VPA QR payment verification & direct corporate ACH bank wire instructions.',
                icon: Building
              }
            ].map((prov) => {
              const isSelected = selectedProvider === prov.id;
              const gwData = gateways.find((g) => g.provider === prov.id);
              const Icon = prov.icon;

              return (
                <div
                  key={prov.id}
                  onClick={() => handleProviderSelect(prov.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-900/20 ring-2 ring-indigo-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <span>{prov.name}</span>
                    </div>
                    {gwData?.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {gwData.environment.toUpperCase()} ACTIVE
                      </span>
                    )}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{prov.desc}</p>
                </div>
              );
            })}</div>

          {/* Configuration Form Column */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  Configure {selectedProvider.replace('_', ' ')} Gateway
                </h3>
                <p className="text-xs text-slate-500">
                  Set API credentials, webhook signatures, processing fees, and currency rules.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Mode:</span>
                <button
                  type="button"
                  onClick={() => setEnv(env === 'live' ? 'sandbox' : 'live')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    env === 'live'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {env === 'live' ? 'LIVE PRODUCTION' : 'SANDBOX / TEST MODE'}</button>
              </div>
            </div>

            <form onSubmit={handleSaveGateway} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.primary_settlement_currency', 'Primary Settlement Currency')}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  >
                    <option value="USD">USD ($ - United States Dollar)</option>
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.gateway_processing_fee_markup', 'Gateway Processing Fee Markup (%)')}</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={feePercent}
                      onChange={(e) => setFeePercent(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                    />
                    <Percent className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {selectedProvider !== 'upi_wire' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.publishable_key_id', 'Publishable / Key ID')}</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={pubKey}
                        onChange={(e) => setPubKey(e.target.value)}
                        placeholder={t('admin.pk_test', 'pk_test_...')}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.secret_key_api_token', 'Secret Key / API Token')}</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showSecret ? 'text' : 'password'}
                        required
                        value={secKey}
                        onChange={(e) => setSecKey(e.target.value)}
                        placeholder={t('admin.sk_test', 'sk_test_...')}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.webhook_verification_endpoint_', 'Webhook Verification Endpoint Secret')}</label>
                    <input
                      type="text"
                      value={webhookSec}
                      onChange={(e) => setWebhookSec(e.target.value)}
                      placeholder={t('admin.whsec', 'whsec_...')}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                    />
                  </div>
                </>
              )}

              {selectedProvider === 'upi_wire' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.merchant_vpa_handle_upi_qr', 'Merchant VPA Handle (UPI QR)')}</label>
                    <input
                      type="text"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      placeholder={t('admin.infitimepro_icici', 'infitimepro@icici')}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.corporate_wire_routing_swift_i', 'Corporate Wire Routing / Swift Instructions')}</label>
                    <textarea
                      rows={3}
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      placeholder={t('admin.bank_name_state_bank_of_india_', 'Bank Name: State Bank of India, IFSC: SBIN0004928, Account #992810...')}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Gateway Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing Tiers Management */}
      {activeTab === 'pricing' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.global_subscription_pricing_ti', 'Global Subscription Pricing Tiers')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage base per-seat rates, device quotas, and annual discount percentages enforced platform-wide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold uppercase tracking-wider text-indigo-600">
                    {tier.tierName} Plan
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900">
                    {tier.discountPercentAnnual}% Annual Discount
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">{t('admin.monthly_rate_seat_mo', 'Monthly Rate ($/seat/mo)')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tier.baseSeatPriceMonthly}
                      onChange={(e) =>
                        handleUpdateTierPrice(tier.id, parseFloat(e.target.value), tier.baseSeatPriceAnnual)
                      }
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">{t('admin.annual_rate_seat_yr', 'Annual Rate ($/seat/yr)')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tier.baseSeatPriceAnnual}
                      onChange={(e) =>
                        handleUpdateTierPrice(tier.id, tier.baseSeatPriceMonthly, parseFloat(e.target.value))
                      }
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <span className="text-slate-400">Included Modules:</span>
                  <div className="flex flex-wrap gap-1">
                    {tier.includedModules.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold">
                        {m}</span>
                    ))}</div>
                </div>
              </div>
            ))}</div>
        </div>
      )}

      {/* Tab 3: Global Revenue Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${revenueSummary?.mrr.toLocaleString()}</div>
                <div className="text-xs font-medium text-slate-500">Monthly Recurring Revenue (MRR)</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${revenueSummary?.arr.toLocaleString()}</div>
                <div className="text-xs font-medium text-slate-500">Annual Run Rate (ARR)</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {revenueSummary?.totalTenantsCount}</div>
                <div className="text-xs font-medium text-slate-500">Total Billed Tenants</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${revenueSummary?.totalRevenueCollected.toLocaleString()}</div>
                <div className="text-xs font-medium text-slate-500">Total Payments Processed</div>
              </div>
            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">{t('admin.global_tenant_billing_transact', 'Global Tenant Billing Transactions')}</h3>
              <span className="text-xs font-semibold text-slate-400">Real-time Gateway Sync</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Tenant Organization</th>
                    <th className="py-3 px-3">Billing Period</th>
                    <th className="py-3 px-3 font-bold text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Payment Method / Txn ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {revenueSummary?.recentTransactions.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{inv.tenantName}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        {inv.billingPeriodFrom} to {inv.billingPeriodTo}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        ${inv.totalAmount.toFixed(2)} USD
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {inv.status}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <div>{inv.paymentMethodUsed}</div>
                        <div className="text-[10px] text-slate-400">{inv.transactionId}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}</div>
  );
};
