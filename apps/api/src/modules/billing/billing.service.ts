import {
  PaymentGatewayConfigDTO,
  PlatformPricingTierDTO,
  TenantInvoiceDTO,
  GlobalRevenueSummaryDTO
} from '@infi-timepro/shared-types';

export class BillingService {
  private static gatewayConfigs: Record<string, PaymentGatewayConfigDTO> = {
    stripe: {
      provider: 'stripe',
      environment: 'sandbox',
      currency: 'USD',
      publishableKey: 'pk_test_51MzInfiTimeProStripeLiveKeyDemo992831',
      secretKey: 'sk_test_51MzInfiTimeProStripeSecretKeyDemo992831',
      webhookSecret: 'whsec_9938472849201847562918',
      processingFeePercent: 2.9,
      isActive: true,
      updatedAt: '2026-09-20T12:00:00.000Z'
    },
    razorpay: {
      provider: 'razorpay',
      environment: 'live',
      currency: 'INR',
      publishableKey: 'rzp_live_InfiTimeProKeyId8827',
      secretKey: 'rzp_secret_InfiTimeProSecret9921',
      webhookSecret: 'whsec_rzp_8827361928',
      merchantVpa: 'infitimepro@icici',
      processingFeePercent: 2.0,
      isActive: true,
      updatedAt: '2026-09-18T10:30:00.000Z'
    },
    upi_wire: {
      provider: 'upi_wire',
      environment: 'live',
      currency: 'INR',
      merchantVpa: 'infitimepro.billing@okicici',
      bankAccountRouting: 'SBIN0004928 - Account #992810482019',
      processingFeePercent: 0.0,
      isActive: true,
      updatedAt: '2026-09-15T08:00:00.000Z'
    }
  };

  private static pricingTiers: PlatformPricingTierDTO[] = [
    {
      id: 'tier-starter',
      tierName: 'starter',
      baseSeatPriceMonthly: 1.50,
      baseSeatPriceAnnual: 14.40,
      maxDeviceQuota: 5,
      includedModules: ['attendance', 'leaves', 'shiftRostering'],
      discountPercentAnnual: 20
    },
    {
      id: 'tier-growth',
      tierName: 'growth',
      baseSeatPriceMonthly: 2.50,
      baseSeatPriceAnnual: 24.00,
      maxDeviceQuota: 15,
      includedModules: ['attendance', 'leaves', 'shiftRostering', 'multiTierApprovals', 'geofencing'],
      discountPercentAnnual: 20
    },
    {
      id: 'tier-enterprise',
      tierName: 'enterprise',
      baseSeatPriceMonthly: 3.50,
      baseSeatPriceAnnual: 33.60,
      maxDeviceQuota: 50,
      includedModules: ['attendance', 'leaves', 'shiftRostering', 'multiTierApprovals', 'geofencing', 'biometrics', 'payrollExport', 'antiSpoofingSensors'],
      discountPercentAnnual: 20
    }
  ];

  private static invoices: TenantInvoiceDTO[] = [
    {
      id: 'inv-2026-001',
      invoiceNumber: 'INV-2026-09-001',
      tenantId: 'tenant-001',
      tenantName: 'ACME Global Industries',
      billingPeriodFrom: '2026-09-01',
      billingPeriodTo: '2026-09-30',
      basePlanFee: 600.00,
      addonFee: 150.00,
      taxAmount: 135.00,
      totalAmount: 885.00,
      currency: 'USD',
      status: 'PAID',
      dueDate: '2026-09-15T00:00:00.000Z',
      paidAt: '2026-09-10T14:22:00.000Z',
      paymentMethodUsed: 'Visa ending in 4242 (Stripe)',
      transactionId: 'ch_3MzStripeTxn_992810'
    },
    {
      id: 'inv-2026-002',
      invoiceNumber: 'INV-2026-09-002',
      tenantId: 'tenant-002',
      tenantName: 'TechNova Cloud Solutions',
      billingPeriodFrom: '2026-09-01',
      billingPeriodTo: '2026-09-30',
      basePlanFee: 1200.00,
      addonFee: 300.00,
      taxAmount: 270.00,
      totalAmount: 1770.00,
      currency: 'USD',
      status: 'PAID',
      dueDate: '2026-09-15T00:00:00.000Z',
      paidAt: '2026-09-12T09:15:00.000Z',
      paymentMethodUsed: 'MasterCard ending in 8812 (Stripe)',
      transactionId: 'ch_3MzStripeTxn_883912'
    },
    {
      id: 'inv-2026-003',
      invoiceNumber: 'INV-2026-09-003',
      tenantId: 'tenant-003',
      tenantName: 'BioPharm Healthcare Laboratories',
      billingPeriodFrom: '2026-09-01',
      billingPeriodTo: '2026-09-30',
      basePlanFee: 3500.00,
      addonFee: 900.00,
      taxAmount: 792.00,
      totalAmount: 5192.00,
      currency: 'USD',
      status: 'PAID',
      dueDate: '2026-09-15T00:00:00.000Z',
      paidAt: '2026-09-05T11:40:00.000Z',
      paymentMethodUsed: 'Corporate ACH Wire Transfer',
      transactionId: 'ach_wire_de_992104'
    },
    {
      id: 'inv-2026-004',
      invoiceNumber: 'INV-2026-10-001',
      tenantId: 'tenant-001',
      tenantName: 'ACME Global Industries',
      billingPeriodFrom: '2026-10-01',
      billingPeriodTo: '2026-10-31',
      basePlanFee: 600.00,
      addonFee: 150.00,
      taxAmount: 135.00,
      totalAmount: 885.00,
      currency: 'USD',
      status: 'PENDING',
      dueDate: '2026-10-15T00:00:00.000Z'
    }
  ];

  static async getPaymentGatewayConfigs(): Promise<PaymentGatewayConfigDTO[]> {
    return Object.values(this.gatewayConfigs);
  }

  static async updatePaymentGatewayConfig(payload: Partial<PaymentGatewayConfigDTO> & { provider: string }): Promise<PaymentGatewayConfigDTO> {
    const existing = this.gatewayConfigs[payload.provider] || {
      provider: payload.provider as any,
      environment: 'sandbox',
      currency: 'USD',
      processingFeePercent: 2.5,
      isActive: true,
      updatedAt: new Date().toISOString()
    };

    const updated: PaymentGatewayConfigDTO = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString()
    };

    this.gatewayConfigs[payload.provider] = updated;
    return updated;
  }

  static async getPricingTiers(): Promise<PlatformPricingTierDTO[]> {
    return this.pricingTiers;
  }

  static async updatePricingTier(id: string, payload: Partial<PlatformPricingTierDTO>): Promise<PlatformPricingTierDTO> {
    const idx = this.pricingTiers.findIndex(t => t.id === id);
    if (idx === -1) {
      throw new Error(`Pricing tier ${id} not found`);
    }
    const updated = { ...this.pricingTiers[idx], ...payload };
    this.pricingTiers[idx] = updated;
    return updated;
  }

  static async getTenantInvoices(tenantId?: string): Promise<TenantInvoiceDTO[]> {
    if (tenantId) {
      return this.invoices.filter(i => i.tenantId === tenantId);
    }
    return this.invoices;
  }

  static async payInvoice(invoiceId: string, paymentMethod: string): Promise<TenantInvoiceDTO> {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    inv.status = 'PAID';
    inv.paidAt = new Date().toISOString();
    inv.paymentMethodUsed = paymentMethod;
    inv.transactionId = `txn_${Math.random().toString(36).substring(2, 10)}`;
    return inv;
  }

  static async getGlobalRevenueSummary(): Promise<GlobalRevenueSummaryDTO> {
    const paidInvoices = this.invoices.filter(i => i.status === 'PAID');
    const totalCollected = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      mrr: 7847.00,
      arr: 94164.00,
      totalTenantsCount: 4,
      activePaidTenants: 3,
      pastDueTenants: 0,
      totalInvoicesPaidCount: paidInvoices.length,
      totalRevenueCollected: totalCollected,
      recentTransactions: paidInvoices.slice(0, 5)
    };
  }
}
