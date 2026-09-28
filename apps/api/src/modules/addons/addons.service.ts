import {
  AddonCatalogItemDTO,
  TenantAddonModule,
  TenantAddonSubscriptionDTO,
  SubscribeAddonRequestDTO
} from '@infi-timepro/shared-types';

export class AddonsService {
  private static catalog: AddonCatalogItemDTO[] = [
    {
      id: 'hr_suite',
      name: 'Core HR & Employee Lifecycle Suite',
      tagline: 'End-to-end Onboarding, Document Compliance Vault, Asset Tracking & Performance Reviews',
      description: 'Transform InfiTimePro into an all-in-one HRMS. Automate candidate onboarding checklists, securely store compliance credentials, allocate IT/physical company assets, conduct 360 appraisals, and resolve employee grievances with an integrated HR helpdesk.',
      category: 'Core HR',
      pricePerSeatMonthly: 2.50,
      pricePerSeatAnnual: 24.00, // $2.00/mo billed annually
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
  ];

  // In-memory tenant subscriptions store
  private static tenantSubscriptions: Map<string, TenantAddonSubscriptionDTO[]> = new Map([
    [
      'tenant-001',
      [
        {
          id: 'sub-hr-001',
          tenantId: 'tenant-001',
          addonId: 'hr_suite',
          status: 'active',
          billingCycle: 'annual',
          subscribedSeats: 300,
          unitPrice: 2.00,
          monthlyTotal: 600.00,
          trialEndsAt: undefined,
          renewsAt: '2027-01-15T00:00:00.000Z',
          activatedAt: '2025-01-15T09:00:00.000Z',
          autoRenew: true
        }
      ]
    ]
  ]);

  static async getCatalog(): Promise<AddonCatalogItemDTO[]> {
    return this.catalog;
  }

  static async getTenantSubscriptions(tenantId: string): Promise<TenantAddonSubscriptionDTO[]> {
    return this.tenantSubscriptions.get(tenantId) || [];
  }

  static async isAddonActive(tenantId: string, addonId: TenantAddonModule): Promise<boolean> {
    const subs = this.tenantSubscriptions.get(tenantId) || [];
    const sub = subs.find(s => s.addonId === addonId);
    return sub ? (sub.status === 'active' || sub.status === 'trial') : false;
  }

  static async subscribe(tenantId: string, payload: SubscribeAddonRequestDTO): Promise<TenantAddonSubscriptionDTO> {
    const catalogItem = this.catalog.find(c => c.id === payload.addonId);
    if (!catalogItem) {
      throw new Error(`Addon ${payload.addonId} not found in catalog`);
    }

    const subs = this.tenantSubscriptions.get(tenantId) || [];
    const existingIndex = subs.findIndex(s => s.addonId === payload.addonId);

    const isTrial = payload.startAsTrial ?? false;
    const unitPrice = payload.billingCycle === 'annual' ? (catalogItem.pricePerSeatAnnual / 12) : catalogItem.pricePerSeatMonthly;
    const seats = payload.seats || 300;
    const monthlyTotal = unitPrice * seats;

    const subscription: TenantAddonSubscriptionDTO = {
      id: `sub-${payload.addonId}-${Date.now()}`,
      tenantId,
      addonId: payload.addonId,
      status: isTrial ? 'trial' : 'active',
      billingCycle: payload.billingCycle,
      subscribedSeats: seats,
      unitPrice,
      monthlyTotal,
      trialEndsAt: isTrial ? new Date(Date.now() + catalogItem.trialDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
      renewsAt: new Date(Date.now() + (payload.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      activatedAt: new Date().toISOString(),
      autoRenew: true
    };

    if (existingIndex >= 0) {
      subs[existingIndex] = subscription;
    } else {
      subs.push(subscription);
    }

    this.tenantSubscriptions.set(tenantId, subs);
    return subscription;
  }

  static async cancelSubscription(tenantId: string, addonId: TenantAddonModule): Promise<TenantAddonSubscriptionDTO> {
    const subs = this.tenantSubscriptions.get(tenantId) || [];
    const sub = subs.find(s => s.addonId === addonId);
    if (!sub) {
      throw new Error(`Subscription for addon ${addonId} not found`);
    }

    sub.status = 'cancelled';
    sub.autoRenew = false;
    return sub;
  }

  // -------------------------------------------------------------------------
  // SuperAdmin Management Methods
  // -------------------------------------------------------------------------

  static async updateCatalogItem(item: AddonCatalogItemDTO): Promise<AddonCatalogItemDTO> {
    const idx = this.catalog.findIndex(c => c.id === item.id);
    if (idx >= 0) {
      this.catalog[idx] = { ...this.catalog[idx], ...item };
      return this.catalog[idx];
    } else {
      this.catalog.push(item);
      return item;
    }
  }

  static async getAllTenantSubscriptions(): Promise<{ tenantId: string; subscriptions: TenantAddonSubscriptionDTO[] }[]> {
    const results: { tenantId: string; subscriptions: TenantAddonSubscriptionDTO[] }[] = [];
    this.tenantSubscriptions.forEach((subs, tenantId) => {
      results.push({ tenantId, subscriptions: subs });
    });
    return results;
  }

  static async grantTenantAddonOverride(
    tenantId: string,
    addonId: TenantAddonModule,
    status: 'active' | 'trial' | 'cancelled',
    billingCycle: 'monthly' | 'annual' = 'annual',
    seats: number = 300
  ): Promise<TenantAddonSubscriptionDTO> {
    const catalogItem = this.catalog.find(c => c.id === addonId);
    const unitPrice = catalogItem ? (billingCycle === 'annual' ? catalogItem.pricePerSeatAnnual / 12 : catalogItem.pricePerSeatMonthly) : 2.0;

    const subs = this.tenantSubscriptions.get(tenantId) || [];
    const existingIdx = subs.findIndex(s => s.addonId === addonId);

    const subscription: TenantAddonSubscriptionDTO = {
      id: `sub-override-${addonId}-${Date.now()}`,
      tenantId,
      addonId,
      status,
      billingCycle,
      subscribedSeats: seats,
      unitPrice,
      monthlyTotal: unitPrice * seats,
      activatedAt: new Date().toISOString(),
      renewsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: status === 'active'
    };

    if (existingIdx >= 0) {
      subs[existingIdx] = subscription;
    } else {
      subs.push(subscription);
    }

    this.tenantSubscriptions.set(tenantId, subs);
    return subscription;
  }
}
