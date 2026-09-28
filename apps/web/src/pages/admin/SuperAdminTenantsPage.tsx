import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Users,
  HardDrive,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  Server,
  Activity,
  ArrowUpRight,
  X,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import { TenantDTO, CreateTenantRequestDTO, TenantPlanTier, TenantStatus } from '@infi-timepro/shared-types';
import { useI18n } from '../../context/I18nContext.tsx';

export const SuperAdminTenantsPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<TenantDTO | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  // New Tenant Form
  const [newOrgName, setNewOrgName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newPlan, setNewPlan] = useState<TenantPlanTier>('enterprise');
  const [newMaxSeats, setNewMaxSeats] = useState<number>(300);
  const [newMaxDevices, setNewMaxDevices] = useState<number>(20);
  const [newDataRegion, setNewDataRegion] = useState<'ap-south-1' | 'us-east-1' | 'eu-central-1' | 'ap-southeast-1'>('ap-south-1');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [enabledModules, setEnabledModules] = useState<string[]>([
    'geofencing',
    'biometrics',
    'rosterScheduling',
    'multiTierApprovals',
    'payrollExport',
    'antiSpoofingSensors'
  ]);

  const [tenants, setTenants] = useState<TenantDTO[]>([
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
  ]);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || t.planTier === filterPlan;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleToggleModule = (featureKey: keyof TenantDTO['features']) => {
    if (!selectedTenant) return;
    const updated = {
      ...selectedTenant,
      features: {
        ...selectedTenant.features,
        [featureKey]: !selectedTenant.features[featureKey]
      }
    };
    setSelectedTenant(updated);
    setTenants(tenants.map(t => t.id === updated.id ? updated : t));
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    setTenants(tenants.map(t => {
      if (t.id === tenantId) {
        const nextStatus: TenantStatus = t.status === 'active' ? 'suspended' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    if (selectedTenant && selectedTenant.id === tenantId) {
      setSelectedTenant({
        ...selectedTenant,
        status: selectedTenant.status === 'active' ? 'suspended' : 'active'
      });
    }
  };

  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newSubdomain || !newAdminEmail) return;

    setIsProvisioning(true);
    setTimeout(() => {
      const created: TenantDTO = {
        id: `tenant-${Math.floor(100 + Math.random() * 900)}`,
        code: newSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        name: newOrgName,
        subdomain: `${newSubdomain.toLowerCase()}.infitimepro.com`,
        planTier: newPlan,
        maxSeats: newMaxSeats,
        usedSeats: 1,
        maxDevices: newMaxDevices,
        activeDevices: 0,
        dataRegion: newDataRegion,
        status: 'active',
        primaryAdminEmail: newAdminEmail,
        primaryAdminName: newAdminName || 'Organization Admin',
        features: {
          geofencing: enabledModules.includes('geofencing'),
          biometrics: enabledModules.includes('biometrics'),
          rosterScheduling: enabledModules.includes('rosterScheduling'),
          multiTierApprovals: enabledModules.includes('multiTierApprovals'),
          payrollExport: enabledModules.includes('payrollExport'),
          antiSpoofingSensors: enabledModules.includes('antiSpoofingSensors')
        },
        createdAt: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      setTenants([created, ...tenants]);
      setIsProvisioning(false);
      setProvisionSuccess(true);
      setTimeout(() => {
        setProvisionSuccess(false);
        setShowCreateModal(false);
        setNewOrgName('');
        setNewSubdomain('');
        setNewAdminEmail('');
      }, 1200);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.multi_tenant_superadmin', 'Multi-Tenant SuperAdmin')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              SCR-WEB-026
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provision isolated tenant partitions, manage global subscription tiers, allocate hardware quotas, and toggle real-time feature flags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/payment-gateways"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition shadow-sm"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Payment Gateways & Pricing</span>
          </a>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow"
          >
            <Plus className="w-4 h-4" />
            Provision New Tenant
          </button>
        </div>
      </div>

      {/* Global Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{tenants.length}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Enterprise Tenants</div>
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">100% Schema Isolation</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {tenants.reduce((s, t) => s + t.usedSeats, 0).toLocaleString()}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Licensed Seats</div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
              / {tenants.reduce((s, t) => s + t.maxSeats, 0).toLocaleString()} Capacity
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {tenants.reduce((s, t) => s + t.activeDevices, 0)}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Online Biometric Fleet</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">184.2 Punches / sec</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">99.98%</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">SOC2 SLA Reliability</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Zero Breach Incidents</div>
          </div>
        </div>
      </div>

      {/* Tenant Directory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('admin.tenant_directory_partition_reg', 'Tenant Directory & Partition Registry')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live partitioned multi-tenant instances on `infi_timepro_db` schema.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('admin.search_tenant_or_domain', 'Search tenant or domain...')}
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Plan Filter */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Plans</option>
              <option value="enterprise">Enterprise</option>
              <option value="growth">Growth</option>
              <option value="starter">Starter</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Organization & Domain</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Seat Utilization</th>
                <th className="py-3 px-4 text-center">Hardware Fleet</th>
                <th className="py-3 px-4">Data Region</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTenants.map((tenant) => {
                const percentSeats = Math.round((tenant.usedSeats / tenant.maxSeats) * 100);
                return (
                  <tr key={tenant.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {tenant.name.slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div>{tenant.name}</div>
                          <div className="text-[11px] font-mono font-normal text-slate-400">{tenant.subdomain}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        tenant.planTier === 'enterprise'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200'
                      }`}>
                        {tenant.planTier}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{tenant.usedSeats} / {tenant.maxSeats}</span>
                          <span className="text-slate-400">{percentSeats}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${percentSeats > 90 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                            style={{ width: `${percentSeats}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {tenant.activeDevices} / {tenant.maxDevices} Terminals
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {tenant.dataRegion}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tenant.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : tenant.status === 'trial'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}>
                        {tenant.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3 text-indigo-600" /> Features
                        </button>
                        <button
                          onClick={() => handleToggleTenantStatus(tenant.id)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                            tenant.status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                          }`}
                          title={tenant.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
                        >
                          {tenant.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Flags & Tenant Inspector Slide-Over Drawer */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-bold text-sm">
                    {selectedTenant.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTenant.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedTenant.subdomain}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTenant(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tenant Overview Metadata */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Primary Admin:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedTenant.primaryAdminName}</div>
                  <div className="text-[10px] text-slate-500">{selectedTenant.primaryAdminEmail}</div>
                </div>
                <div>
                  <span className="text-slate-400">Subscription:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{selectedTenant.planTier} Plan</div>
                  <div className="text-[10px] text-emerald-600">Renews {new Date(selectedTenant.renewalDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Feature Flags Module Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Enterprise Feature Modules</h4>
                  <span className="text-[10px] text-indigo-600 font-semibold">Real-time Gating</span>
                </div>

                {([
                  { key: 'geofencing', label: 'Geofencing Operations', desc: 'GPS radius validation & perimeter check-ins' },
                  { key: 'biometrics', label: 'Biometric Terminal Sync', desc: 'Hardware facial recognition & fingerprint device pairing' },
                  { key: 'rosterScheduling', label: 'Shift Rostering & Gantt Calendar', desc: 'Visual rotational scheduling and shift swapping' },
                  { key: 'multiTierApprovals', label: 'Multi-Tier Approvals Hub', desc: 'L1/L2 managerial regularisation & overtime queues' },
                  { key: 'payrollExport', label: 'Payroll ERP Export Engine', desc: 'Cryptographic locking & SAP/ADP/Excel handoff' },
                  { key: 'antiSpoofingSensors', label: 'Anti-Spoofing Mock GPS Filter', desc: 'Hardware sensor heuristics & developer mode detection' },
                ] as { key: keyof TenantDTO['features']; label: string; desc: string }[]).map((feat) => {
                  const isEnabled = selectedTenant.features[feat.key];
                  return (
                    <div key={feat.key} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{feat.label}</div>
                        <div className="text-[10px] text-slate-400">{feat.desc}</div>
                      </div>
                      <button
                        onClick={() => handleToggleModule(feat.key)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                          isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                  );
                })}</div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedTenant(null)}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                Close & Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* Provision New Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.provision_new_tenant_partition', 'Provision New Tenant Partition')}</h3>
                  <p className="text-xs text-slate-500">Create isolated workspace partition and admin account.</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {provisionSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Tenant Provisioned Successfully!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Dedicated partition generated on `infi_timepro_db` schema.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProvisionTenant} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.organization_name', 'Organization Name')}</label>
                    <input
                      type="text"
                      required
                      value={newOrgName}
                      onChange={(e) => {
                        setNewOrgName(e.target.value);
                        if (!newSubdomain) setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }}
                      placeholder={t('admin.e_g_apex_global', 'e.g. Apex Global')}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.subdomain_slug', 'Subdomain Slug')}</label>
                    <div className="flex items-center text-xs">
                      <input
                        type="text"
                        required
                        value={newSubdomain}
                        onChange={(e) => setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder={t('admin.apex', 'apex')}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-l-xl p-2.5 text-slate-800 dark:text-slate-200"
                      />
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-2.5 border border-l-0 border-slate-300 dark:border-slate-700 rounded-r-xl text-slate-500 text-[11px]">
                        .infitimepro.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.plan_tier', 'Plan Tier')}</label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as any)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <option value="enterprise">Enterprise</option>
                      <option value="growth">Growth</option>
                      <option value="starter">Starter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.max_seats', 'Max Seats')}</label>
                    <input
                      type="number"
                      value={newMaxSeats}
                      onChange={(e) => setNewMaxSeats(parseInt(e.target.value))}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.data_region', 'Data Region')}</label>
                    <select
                      value={newDataRegion}
                      onChange={(e) => setNewDataRegion(e.target.value as any)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <option value="ap-south-1">Mumbai (ap-south-1)</option>
                      <option value="us-east-1">N. Virginia (us-east-1)</option>
                      <option value="eu-central-1">Frankfurt (eu-central-1)</option>
                      <option value="ap-southeast-1">Singapore (ap-southeast-1)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.admin_full_name', 'Admin Full Name')}</label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder={t('admin.e_g_ramesh_chandra', 'e.g. Ramesh Chandra')}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.admin_email_address', 'Admin Email Address')}</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder={t('admin.admin_apex_com', 'admin@apex.com')}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel</button>
                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow disabled:opacity-50"
                  >
                    {isProvisioning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Provisioning Partition...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" /> Provision Tenant
                      </>
                    )}</button>
                </div>
              </form>
            )}</div>
        </div>
      )}</div>
  );
};
