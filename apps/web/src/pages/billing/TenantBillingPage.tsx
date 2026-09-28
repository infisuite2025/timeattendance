import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  Zap,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  X,
  Loader2,
  Check,
  Receipt
} from 'lucide-react';
import { TenantInvoiceDTO, TenantAddonSubscriptionDTO } from '@infi-timepro/shared-types';
import { apiClient } from '../../services/apiClient.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const TenantBillingPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotifications();
  const { user } = useAuth();

  const [invoices, setInvoices] = useState<TenantInvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<TenantInvoiceDTO | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  const fetchTenantBilling = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<TenantInvoiceDTO[]>('/billing/tenant-invoices?tenantId=tenant-001');
      if (res.success && Array.isArray(res.data)) {
        setInvoices(res.data);
      }
    } catch (err: any) {
      toast.error('Billing Load Failed', err.message || 'Error fetching invoice ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantBilling();
  }, []);

  const handlePayInvoice = async () => {
    if (!selectedInvoiceToPay) return;
    setIsProcessingPayment(true);

    try {
      const methodLabel =
        paymentMethod === 'card'
          ? `Visa ending in ${cardNumber.slice(-4)} (Stripe Gateway)`
          : paymentMethod === 'upi'
          ? 'UPI Instant Pay (Razorpay Gateway)'
          : 'Corporate ACH Direct Debit';

      const res = await apiClient.post<TenantInvoiceDTO>('/billing/pay-invoice', {
        invoiceId: selectedInvoiceToPay.id,
        paymentMethod: methodLabel
      });

      if (res.success && res.data) {
        toast.success(
          'Payment Successful!',
          `Invoice ${res.data.invoiceNumber} paid via ${methodLabel}. Transaction ID: ${res.data.transactionId}`
        );
        setInvoices((prev) => prev.map((i) => (i.id === res.data!.id ? res.data! : i)));
        setSelectedInvoiceToPay(null);
      } else {
        toast.error('Payment Failed', res.error?.message || 'Could not process transaction');
      }
    } catch (err: any) {
      toast.error('Payment Error', err.message || 'Gateway transaction failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const pendingInvoice = invoices.find((i) => i.status === 'PENDING' || i.status === 'OVERDUE');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('billing.tenant_subscription_billing', 'Tenant Subscription & Billing')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              TENANT-PORTAL
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your organization's subscription plan, active add-on licenses, payment gateway checkout, and itemized invoice history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTenantBilling}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subscription Active Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Active Organization Plan</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase">
              ENTERPRISE TIER
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">300 Seats</div>
            <div className="text-xs text-slate-300 mt-1">ACME Global Industries (Subdomain: acme.infitimepro.com)</div>
          </div>
          <div className="pt-3 border-t border-white/10 text-xs flex items-center justify-between text-slate-300">
            <span>Renews: 15-Jan-2027</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Autopay Active
            </span>
          </div>
        </div>

        {/* Current Due Banner */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Upcoming Invoice Due</span>
            {pendingInvoice ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                DUE OCT 15
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ALL PAID
              </span>
            )}</div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              ${pendingInvoice ? pendingInvoice.totalAmount.toFixed(2) : '0.00'} USD
            </div>
            <div className="text-xs text-slate-500 mt-1">Base Plan ($600) + HR Add-on ($150) + Tax ($135)</div>
          </div>
          <div className="pt-2">
            {pendingInvoice ? (
              <button
                onClick={() => setSelectedInvoiceToPay(pendingInvoice)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Invoice Now</span>
              </button>
            ) : (
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No outstanding dues on record
              </div>
            )}</div>
        </div>

        {/* Add-on Investment Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Subscribed Add-on Modules</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
              1 ACTIVE
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">$150.00 / mo</div>
            <div className="text-xs text-slate-500 mt-1">Core HR & Employee Lifecycle Suite (300 Seats)</div>
          </div>
          <div className="pt-2">
            <a
              href="/admin/addons"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Marketplace Add-ons</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('billing.tenant_invoice_history_receipt', 'Tenant Invoice History & Receipts')}</h3>
            <p className="text-xs text-slate-500">Official tax invoices for corporate expense accounting</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Currency: USD ($)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-3 text-right">Base Plan</th>
                <th className="py-3 px-3 text-right">Add-ons</th>
                <th className="py-3 px-3 text-right font-bold">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action / Checkout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {inv.billingPeriodFrom} to {inv.billingPeriodTo}</td>
                  <td className="py-3.5 px-3 text-right font-mono">${inv.basePlanFee.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right font-mono">${inv.addonFee.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                    ${inv.totalAmount.toFixed(2)} USD
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {inv.status}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.status === 'PENDING' ? (
                      <button
                        onClick={() => setSelectedInvoiceToPay(inv)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                      >
                        Pay Now</button>
                    ) : (
                      <button
                        onClick={() => toast.info(`Downloading invoice ${inv.invoiceNumber}...`)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1"
                        title="Download Tax PDF Invoice"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" /> Receipt
                      </button>
                    )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Checkout Modal */}
      {selectedInvoiceToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('billing.online_payment_gateway_checkou', 'Online Payment Gateway Checkout')}</h3>
                  <p className="text-xs text-slate-500">Invoice: {selectedInvoiceToPay.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceToPay(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 p-4 space-y-2 bg-slate-50">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Invoice Amount:</span>
                  <span>${selectedInvoiceToPay.totalAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Processing Fee (0%):</span>
                  <span>$0.00 USD</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between text-base font-extrabold text-slate-900">
                  <span>Total Charge:</span>
                  <span className="text-blue-600">${selectedInvoiceToPay.totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">{t('billing.select_configured_payment_meth', 'Select Configured Payment Method')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card', name: 'Credit / Debit Card', gateway: 'Stripe' },
                    { id: 'upi', name: 'UPI / QR Code', gateway: 'Razorpay' },
                    { id: 'ach', name: 'ACH Wire Transfer', gateway: 'Direct Bank' }
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        paymentMethod === pm.id
                          ? 'border-blue-600 bg-blue-50 font-bold text-blue-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{pm.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pm.gateway}</div>
                    </button>
                  ))}</div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-slate-700">{t('billing.card_number', 'Card Number')}</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
              )}</div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInvoiceToPay(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel</button>
              <button
                disabled={isProcessingPayment}
                onClick={handlePayInvoice}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md transition disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Gateway Charge...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Authorize ${selectedInvoiceToPay.totalAmount.toFixed(2)} Charge</span>
                  </>
                )}</button>
            </div>
          </div>
        </div>
      )}</div>
  );
};
