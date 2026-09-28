import {
  DepartmentDTO,
  LocationDTO,
  TenantOrganizationSettingsDTO,
  AdminUserDTO,
  TenantQuotaUsageDTO
} from '@infi-timepro/shared-types';

export class OrganizationService {
  private locations: LocationDTO[] = [
    {
      id: 'loc_hyd_001',
      code: 'LOC-HYD',
      name: 'Hyderabad Main Office',
      addressLine1: 'Plot No. 5, HITEC City, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      timezone: 'Asia/Kolkata',
      latitude: 17.4435,
      longitude: 78.3772,
      geofenceRadiusMeters: 150,
      employeeCount: 650,
      activeDevicesCount: 4,
      status: 'operational',
    },
    {
      id: 'loc_blr_002',
      code: 'LOC-BLR',
      name: 'Bengaluru HQ',
      addressLine1: 'Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      timezone: 'Asia/Kolkata',
      latitude: 12.9352,
      longitude: 77.6245,
      geofenceRadiusMeters: 200,
      employeeCount: 302,
      activeDevicesCount: 3,
      status: 'operational',
    },
    {
      id: 'loc_mum_003',
      code: 'LOC-MUM',
      name: 'Mumbai Office',
      addressLine1: 'Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      timezone: 'Asia/Kolkata',
      latitude: 19.0664,
      longitude: 72.8677,
      geofenceRadiusMeters: 150,
      employeeCount: 146,
      activeDevicesCount: 2,
      status: 'operational',
    },
    {
      id: 'loc_del_004',
      code: 'LOC-DEL',
      name: 'Delhi Office',
      addressLine1: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      timezone: 'Asia/Kolkata',
      latitude: 28.6304,
      longitude: 77.2177,
      geofenceRadiusMeters: 150,
      employeeCount: 100,
      activeDevicesCount: 2,
      status: 'operational',
    },
    {
      id: 'loc_chn_005',
      code: 'LOC-CHN',
      name: 'Chennai Plant',
      addressLine1: 'Sriperumbudur Industrial Corridor',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      timezone: 'Asia/Kolkata',
      latitude: 12.9716,
      longitude: 79.9416,
      geofenceRadiusMeters: 500,
      employeeCount: 50,
      activeDevicesCount: 1,
      status: 'alert',
    },
  ];

  private departments: DepartmentDTO[] = [
    { id: 'dept_eng_001', code: 'ENG', name: 'Engineering', employeeCount: 520, isActive: true },
    { id: 'dept_prod_002', code: 'PROD', name: 'Product', employeeCount: 180, isActive: true },
    { id: 'dept_sales_003', code: 'SALES', name: 'Sales & Marketing', employeeCount: 240, isActive: true },
    { id: 'dept_hr_004', code: 'HR', name: 'Human Resources', employeeCount: 65, isActive: true },
    { id: 'dept_fin_005', code: 'FIN', name: 'Finance & Accounts', employeeCount: 95, isActive: true },
    { id: 'dept_ops_006', code: 'OPS', name: 'Operations & Support', employeeCount: 148, isActive: true },
  ];

  private settings: TenantOrganizationSettingsDTO = {
    id: 'org-set-001',
    tenantId: 'tenant-001',
    organizationName: 'ACME Global Industries',
    subdomain: 'acme.infitimepro.com',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop',
    primaryAdminName: 'Naresh Andukoori',
    primaryAdminEmail: 'naresh@company.com',
    primaryAdminPhone: '+91 98765 43210',
    taxRegistrationId: '27AAACA12341Z5 (GSTIN)',
    corporateAddress: 'Building 14, Mindspace IT Park, HITEC City',
    city: 'Hyderabad',
    country: 'India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    fiscalYearStartMonth: 4, // April
    workWeekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    mfaEnforced: true,
    passwordRotationDays: 90,
    sessionTimeoutMinutes: 30,
    ipWhitelistingEnabled: false,
    allowedIpRanges: ['103.21.144.0/24', '49.207.198.0/24'],
    updatedAt: new Date().toISOString()
  };

  private adminUsers: AdminUserDTO[] = [
    {
      id: 'adm-001',
      tenantId: 'tenant-001',
      name: 'Naresh Andukoori',
      email: 'naresh@company.com',
      role: 'ADMIN',
      designation: 'Chief Administrator',
      department: 'People Operations & IT',
      status: 'active',
      lastActiveAt: '2026-09-21T19:00:00.000Z',
      invitedAt: '2025-01-15T09:00:00.000Z'
    },
    {
      id: 'adm-002',
      tenantId: 'tenant-001',
      name: 'Anita Desai',
      email: 'anita.desai@company.com',
      role: 'CORPORATE_HR',
      designation: 'VP Human Resources',
      department: 'Human Resources',
      status: 'active',
      lastActiveAt: '2026-09-20T16:30:00.000Z',
      invitedAt: '2025-02-01T10:00:00.000Z'
    },
    {
      id: 'adm-003',
      tenantId: 'tenant-001',
      name: 'Vikram Singh',
      email: 'vikram.singh@company.com',
      role: 'MANAGER',
      designation: 'Operations Lead',
      department: 'Production & Rostering',
      status: 'active',
      lastActiveAt: '2026-09-21T14:15:00.000Z',
      invitedAt: '2025-03-10T11:00:00.000Z'
    }
  ];

  private quotas: TenantQuotaUsageDTO = {
    tenantId: 'tenant-001',
    maxSeats: 300,
    usedSeats: 254,
    maxDevices: 20,
    usedDevices: 12,
    maxStorageGb: 50.0,
    usedStorageGb: 14.2,
    lastCalculatedAt: new Date().toISOString()
  };

  getLocations(): LocationDTO[] {
    return this.locations;
  }

  getDepartments(): DepartmentDTO[] {
    return this.departments;
  }

  getSettings(): TenantOrganizationSettingsDTO {
    return this.settings;
  }

  updateSettings(payload: Partial<TenantOrganizationSettingsDTO>): TenantOrganizationSettingsDTO {
    this.settings = {
      ...this.settings,
      ...payload,
      updatedAt: new Date().toISOString()
    };
    return this.settings;
  }

  getQuotas(): TenantQuotaUsageDTO {
    this.quotas.lastCalculatedAt = new Date().toISOString();
    return this.quotas;
  }

  updateQuotas(payload: Partial<TenantQuotaUsageDTO>): TenantQuotaUsageDTO {
    this.quotas = {
      ...this.quotas,
      ...payload,
      lastCalculatedAt: new Date().toISOString()
    };
    return this.quotas;
  }

  getAdminUsers(): AdminUserDTO[] {
    return this.adminUsers;
  }

  inviteAdminUser(payload: Partial<AdminUserDTO>): AdminUserDTO {
    const newUser: AdminUserDTO = {
      id: `adm-${Math.floor(100 + Math.random() * 900)}`,
      tenantId: 'tenant-001',
      name: payload.name || 'New Admin User',
      email: payload.email || 'admin@company.com',
      role: payload.role || 'ADMIN',
      designation: payload.designation || 'Administrator',
      department: payload.department || 'Operations',
      status: 'invited',
      invitedAt: new Date().toISOString()
    };
    this.adminUsers.unshift(newUser);
    return newUser;
  }

  updateAdminUserRole(id: string, role?: string, status?: 'active' | 'invited' | 'disabled'): AdminUserDTO {
    const user = this.adminUsers.find(u => u.id === id);
    if (!user) {
      throw new Error(`Admin user with ID ${id} not found`);
    }
    if (role) user.role = role as any;
    if (status) user.status = status;
    return user;
  }
}

export const organizationService = new OrganizationService();
