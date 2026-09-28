import {
  TenantDTO,
  SuperAdminMetricsDTO,
  CreateTenantRequestDTO,
  UpdateTenantStatusRequestDTO
} from '@infi-timepro/shared-types';

export class SuperAdminService {
  private static tenants: TenantDTO[] = [
    {
      id: 'tenant-001',
      code: 'acme-corp',
      name: 'ACME Global Industries',
      subdomain: 'acme.infitimepro.com',
      planTier: 'enterprise',
      maxSeats: 300,
      usedSeats: 254,
      maxDevices: 20,
      activeDevices: 12,
      dataRegion: 'ap-south-1',
      status: 'active',
      primaryAdminEmail: 'naresh@company.com',
      primaryAdminName: 'Naresh Andukoori',
      features: {
        geofencing: true,
        biometrics: true,
        rosterScheduling: true,
        multiTierApprovals: true,
        payrollExport: true,
        antiSpoofingSensors: true
      },
      createdAt: '2025-01-15T09:00:00.000Z',
      renewalDate: '2027-01-15T09:00:00.000Z'
    },
    {
      id: 'tenant-002',
      code: 'technova',
      name: 'TechNova Cloud Solutions',
      subdomain: 'technova.infitimepro.com',
      planTier: 'growth',
      maxSeats: 500,
      usedSeats: 480,
      maxDevices: 30,
      activeDevices: 24,
      dataRegion: 'us-east-1',
      status: 'active',
      primaryAdminEmail: 'admin@technovacloud.io',
      primaryAdminName: 'Sarah Jenkins',
      features: {
        geofencing: true,
        biometrics: true,
        rosterScheduling: true,
        multiTierApprovals: true,
        payrollExport: true,
        antiSpoofingSensors: false
      },
      createdAt: '2025-03-10T11:30:00.000Z',
      renewalDate: '2026-03-10T11:30:00.000Z'
    },
    {
      id: 'tenant-003',
      code: 'biopharm',
      name: 'BioPharm Healthcare Laboratories',
      subdomain: 'biopharm.infitimepro.com',
      planTier: 'enterprise',
      maxSeats: 1500,
      usedSeats: 1420,
      maxDevices: 80,
      activeDevices: 76,
      dataRegion: 'eu-central-1',
      status: 'active',
      primaryAdminEmail: 'compliance@biopharmlabs.de',
      primaryAdminName: 'Dr. Klaus Becker',
      features: {
        geofencing: true,
        biometrics: true,
        rosterScheduling: true,
        multiTierApprovals: true,
        payrollExport: true,
        antiSpoofingSensors: true
      },
      createdAt: '2025-06-01T08:00:00.000Z',
      renewalDate: '2026-06-01T08:00:00.000Z'
    },
    {
      id: 'tenant-004',
      code: 'zenith-retail',
      name: 'Zenith Omni Retail Stores',
      subdomain: 'zenith.infitimepro.com',
      planTier: 'growth',
      maxSeats: 200,
      usedSeats: 185,
      maxDevices: 15,
      activeDevices: 14,
      dataRegion: 'ap-southeast-1',
      status: 'trial',
      primaryAdminEmail: 'ops@zenithretail.sg',
      primaryAdminName: 'Tan Wei Ming',
      features: {
        geofencing: true,
        biometrics: false,
        rosterScheduling: true,
        multiTierApprovals: true,
        payrollExport: false,
        antiSpoofingSensors: true
      },
      createdAt: '2026-09-01T10:00:00.000Z',
      renewalDate: '2026-09-30T10:00:00.000Z'
    }
  ];

  static async getMetrics(): Promise<SuperAdminMetricsDTO> {
    const totalTenants = this.tenants.length;
    const activeTenants = this.tenants.filter(t => t.status === 'active' || t.status === 'trial').length;
    const totalSeatsUtilized = this.tenants.reduce((sum, t) => sum + t.usedSeats, 0);
    const totalLicensedSeats = this.tenants.reduce((sum, t) => sum + t.maxSeats, 0);
    const totalGlobalDevices = this.tenants.reduce((sum, t) => sum + t.activeDevices, 0);

    return {
      totalTenants,
      activeTenants,
      totalSeatsUtilized,
      totalLicensedSeats,
      totalGlobalDevices,
      globalIngestionRateRps: 184.2,
      systemHealthScore: 99.98
    };
  }

  static async getTenants(): Promise<TenantDTO[]> {
    return this.tenants;
  }

  static async getTenantById(id: string): Promise<TenantDTO | undefined> {
    return this.tenants.find(t => t.id === id || t.code === id);
  }

  static async createTenant(payload: CreateTenantRequestDTO): Promise<TenantDTO> {
    const newTenant: TenantDTO = {
      id: `tenant-${Math.floor(100 + Math.random() * 900)}`,
      code: payload.code.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: payload.name,
      subdomain: `${payload.subdomain.toLowerCase()}.infitimepro.com`,
      planTier: payload.planTier,
      maxSeats: payload.maxSeats,
      usedSeats: 1,
      maxDevices: payload.maxDevices,
      activeDevices: 0,
      dataRegion: payload.dataRegion,
      status: 'active',
      primaryAdminEmail: payload.adminEmail,
      primaryAdminName: payload.adminName,
      features: {
        geofencing: payload.enabledModules.includes('geofencing'),
        biometrics: payload.enabledModules.includes('biometrics'),
        rosterScheduling: payload.enabledModules.includes('rosterScheduling'),
        multiTierApprovals: payload.enabledModules.includes('multiTierApprovals'),
        payrollExport: payload.enabledModules.includes('payrollExport'),
        antiSpoofingSensors: payload.enabledModules.includes('antiSpoofingSensors')
      },
      createdAt: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.tenants.unshift(newTenant);
    return newTenant;
  }

  static async updateStatus(payload: UpdateTenantStatusRequestDTO): Promise<TenantDTO> {
    const tenant = this.tenants.find(t => t.id === payload.tenantId);
    if (!tenant) throw new Error('Tenant not found');

    tenant.status = payload.status;
    return tenant;
  }

  static async toggleFeature(tenantId: string, featureKey: string, enabled: boolean): Promise<TenantDTO> {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error('Tenant not found');

    (tenant.features as any)[featureKey] = enabled;
    return tenant;
  }
}
