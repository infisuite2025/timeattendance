import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Users,
  UserPlus,
  Clock,
  Globe,
  DollarSign,
  Save,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HardDrive,
  Calendar,
  Check,
  X,
  Mail,
  Smartphone,
  MapPin,
  TabletSmartphone,
  Eye,
  ShieldAlert,
  Loader2,
  Crown,
  Zap,
  Download
} from 'lucide-react';
import { TenantOrganizationSettingsDTO, AdminUserDTO, UserRole, TenantAddonSubscriptionDTO, TenantQuotaUsageDTO, AuditLogEntryDTO } from '@infi-timepro/shared-types';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const TenantSettingsPage: React.FC = () => {
  const { t } = useI18n();
  const { toast, confirm } = useNotifications();
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'rbac' | 'security' | 'quotas' | 'audit'>('profile');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<TenantOrganizationSettingsDTO | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserDTO[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantAddonSubscriptionDTO[]>([]);
  const [quotas, setQuotas] = useState<TenantQuotaUsageDTO | null>(null);

  // Quota Modal State
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [editMaxSeats, setEditMaxSeats] = useState(300);
  const [editMaxDevices, setEditMaxDevices] = useState(20);
  const [editMaxStorageGb, setEditMaxStorageGb] = useState(50);
  const [isSavingQuota, setIsSavingQuota] = useState(false);

  // Form Fields
  const [orgName, setOrgName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');
  const [currency, setCurrency] = useState('');
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [passwordRotation, setPasswordRotation] = useState(90);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(4);

  // Invite Admin Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('ADMIN');
  const [isInviting, setIsInviting] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [setRes, usrRes, subRes, qtaRes, audRes] = await Promise.all([
        apiClient.get<TenantOrganizationSettingsDTO>('/organization/settings'),
        apiClient.get<AdminUserDTO[]>('/organization/admin-users'),
        apiClient.get<TenantAddonSubscriptionDTO[]>('/addons/subscriptions'),
        apiClient.get<TenantQuotaUsageDTO>('/organization/quotas'),
        apiClient.get<AuditLogEntryDTO[]>('/audit/logs')
      ]);

      if (setRes.success && setRes.data) {
        setSettings(setRes.data);
        populateForm(setRes.data);
      }
      if (usrRes.success && Array.isArray(usrRes.data)) {
        setAdminUsers(usrRes.data);
      }
      if (subRes.success && Array.isArray(subRes.data)) {
        setSubscriptions(subRes.data);
      } else {
        // Fallback default active HR suite add-on
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
      if (qtaRes.success && qtaRes.data) {
        setQuotas(qtaRes.data);
        setEditMaxSeats(qtaRes.data.maxSeats);
        setEditMaxDevices(qtaRes.data.maxDevices);
        setEditMaxStorageGb(qtaRes.data.maxStorageGb);
      } else {
        setQuotas({
          tenantId: 'tenant-001',
          maxSeats: 300,
          usedSeats: 254,
          maxDevices: 20,
          usedDevices: 12,
          maxStorageGb: 50.0,
          usedStorageGb: 14.2,
          lastCalculatedAt: new Date().toISOString()
        });
      }
      if (audRes.success && Array.isArray(audRes.data)) {
        setAuditLogs(audRes.data);
      }
    } catch (err: any) {
      toast.error('Load Failed', err.message || 'Error fetching organization settings');
    } finally {
      setLoading(false);
    }
  };

  const [auditLogs, setAuditLogs] = useState<AuditLogEntryDTO[]>([]);

  const handleExportAuditReport = async () => {
    try {
      const res = await apiClient.post('/audit/export', {});
      if (res.success && res.data) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `SOC2_GDPR_Audit_Compliance_Report_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('SOC2 & GDPR Compliance Export Generated', 'Cryptographic audit report downloaded successfully.');
      }
    } catch {
      toast.error('Export Failed', 'Could not generate compliance report.');
    }
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingQuota(true);
    try {
      const res = await apiClient.post<TenantQuotaUsageDTO>('/organization/quotas', {
        maxSeats: editMaxSeats,
        maxDevices: editMaxDevices,
        maxStorageGb: editMaxStorageGb
      });
      if (res.success && res.data) {
        setQuotas(res.data);
        toast.success('Tenant Quota Re-allocated', `Updated capacity to ${editMaxSeats} Seats, ${editMaxDevices} Devices, ${editMaxStorageGb} GB Storage.`);
        setShowQuotaModal(false);
      } else {
        toast.error('Quota Update Failed', res.error?.message || 'Could not update quota');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to update tenant quotas');
    } finally {
      setIsSavingQuota(false);
    }
  };

  const getAvailableRoles = (): { value: UserRole; label: string }[] => {
    const roles: { value: UserRole; label: string }[] = [
      { value: 'ADMIN', label: 'ADMIN (Full Tenant Admin)' },
      { value: 'MANAGER', label: 'MANAGER (Team Supervisor)' },
      { value: 'EMPLOYEE', label: 'EMPLOYEE (Self-Service ESS)' },
      { value: 'DATA_PROTECTION_OFFICER', label: 'DATA_PROTECTION_OFFICER (DPDPA Statutory DPO)' }
    ];

    const hasHrSuite = subscriptions.some(s => s.addonId === 'hr_suite' && (s.status === 'active' || s.status === 'trial'));
    const hasPayrollSuite = subscriptions.some(s => s.addonId === 'payroll_disbursement' && (s.status === 'active' || s.status === 'trial'));

    if (hasHrSuite) {
      roles.splice(1, 0, { value: 'CORPORATE_HR', label: 'CORPORATE_HR (Core HR Admin)' });
    }
    if (hasPayrollSuite) {
      roles.splice(hasHrSuite ? 2 : 1, 0, { value: 'PAYROLL_ADMIN', label: 'PAYROLL_ADMIN (Payroll Disbursement Lead)' });
    }

    return roles;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const populateForm = (data: TenantOrganizationSettingsDTO) => {
    setOrgName(data.organizationName || '');
    setPrimaryEmail(data.primaryAdminEmail || '');
    setPrimaryPhone(data.primaryAdminPhone || '');
    setTaxId(data.taxRegistrationId || '');
    setAddress(data.corporateAddress || '');
    setCity(data.city || '');
    setCountry(data.country || '');
    setTimezone(data.timezone || 'Asia/Kolkata');
    setCurrency(data.currency || 'INR');
    setMfaEnforced(data.mfaEnforced ?? true);
    setPasswordRotation(data.passwordRotationDays || 90);
    setSessionTimeout(data.sessionTimeoutMinutes || 30);
    setFiscalYearStartMonth(data.fiscalYearStartMonth || 4);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      organizationName: orgName,
      primaryAdminEmail: primaryEmail,
      primaryAdminPhone: primaryPhone,
      taxRegistrationId: taxId,
      corporateAddress: address,
      city,
      country,
      timezone,
      currency,
      mfaEnforced,
      passwordRotationDays: passwordRotation,
      sessionTimeoutMinutes: sessionTimeout,
      fiscalYearStartMonth: fiscalYearStartMonth
    };

    try {
      const res = await apiClient.post<TenantOrganizationSettingsDTO>('/organization/settings', payload);
      if (res.success && res.data) {
        setSettings(res.data);
        toast.success(
          'Settings Saved Successfully',
          'Organization profile, security rules, and localization parameters updated.'
        );
      } else {
        toast.error('Save Failed', res.error?.message || 'Could not save organization settings');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to save organization settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    setIsInviting(true);
    try {
      const res = await apiClient.post<AdminUserDTO>('/organization/admin-users', {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole
      });

      if (res.success && res.data) {
        toast.success('Invitation Sent', `Sent administrative invitation to ${inviteEmail}.`);
        setAdminUsers((prev) => [res.data!, ...prev]);
        setShowInviteModal(false);
        setInviteName('');
        setInviteEmail('');
      } else {
        toast.error('Invite Failed', res.error?.message || 'Could not send invitation');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Invitation failed');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await apiClient.put<AdminUserDTO>(`/organization/admin-users/${userId}`, { role: newRole });
      if (res.success) {
        setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success('Role Updated', `Updated user role to ${newRole}.`);
      } else {
        toast.error('Update Failed', res.error?.message || 'Could not update role');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to update user role');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.tenant_administration_settings', 'Tenant Administration & Settings')}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              TENANT-ADM-001
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure enterprise organization profiles, RBAC role permissions, MFA security rules, and data retention quotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 font-semibold text-xs overflow-x-auto">
        {[
          { id: 'profile', label: 'Organization Profile', icon: Building2 },
          { id: 'rbac', label: 'RBAC Roles & Admin Users', icon: Users },
          { id: 'security', label: 'Security & Password Rules', icon: ShieldCheck },
          { id: 'quotas', label: 'License Quotas & Data Storage', icon: HardDrive },
          { id: 'audit', label: 'Security Audit Trail', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}</div>

      {/* Tab 1: Organization Profile & Branding */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.organization_entity_details', 'Organization & Entity Details')}</h3>
              <p className="text-xs text-slate-500">Legal entity information and regional localization parameters.</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.organization_legal_name', 'Organization Legal Name')}</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.tax_registration_gstin_ein', 'Tax Registration / GSTIN / EIN')}</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.primary_admin_email', 'Primary Admin Email')}</label>
              <input
                type="email"
                required
                value={primaryEmail}
                onChange={(e) => setPrimaryEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.primary_support_phone', 'Primary Support Phone')}</label>
              <input
                type="text"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.corporate_timezone', 'Corporate Timezone')}</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">UTC (+00:00 Standard)</option>
                <option value="America/New_York">America/New_York (EST -05:00)</option>
                <option value="Europe/London">Europe/London (GMT +00:00)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.reporting_currency', 'Reporting Currency')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="AED">AED (AED UAE Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.fiscal_year_start_month', 'Fiscal Year Start Month')}</label>
              <select
                value={fiscalYearStartMonth}
                onChange={(e) => setFiscalYearStartMonth(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold"
              >
                <option value={4}>April (Financial Year Apr - Mar)</option>
                <option value={1}>January (Calendar Year Jan - Dec)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.corporate_address', 'Corporate Address')}</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
            />
          </div>
        </form>
      )}

      {/* Tab 2: RBAC Roles & Admin Users */}
      {activeTab === 'rbac' && (
        <div className="space-y-6 text-xs">
          {/* Admin Users Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.administrative_users_role_assi', 'Administrative Users & Role Assignments')}</h3>
                <p className="text-xs text-slate-500">Users authorized with portal management permissions.</p>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite New Admin</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-3">Assigned System Role</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Invited Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3.5 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 focus:ring-2 focus:ring-purple-500 cursor-pointer uppercase shadow-2xs"
                        >
                          {getAvailableRoles().map((roleOpt) => (
                            <option key={roleOpt.value} value={roleOpt.value}>
                              {roleOpt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{u.department}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {new Date(u.invitedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security Rules */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.authentication_password_securi', 'Authentication & Password Security Policies')}</h3>
              <p className="text-xs text-slate-500">Configure corporate password rotation, MFA, and session guards.</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Security Policy</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Multi-Factor Authentication (MFA / TOTP)</span>
                <span className="text-slate-500 text-[11px]">Require mandatory 2FA authenticator app tokens for all admin users.</span>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnforced(!mfaEnforced)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  mfaEnforced ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.mandatory_password_rotation', 'Mandatory Password Rotation')}</label>
                <select
                  value={passwordRotation}
                  onChange={(e) => setPasswordRotation(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                >
                  <option value={30}>Every 30 Days (Strict)</option>
                  <option value={60}>Every 60 Days</option>
                  <option value={90}>Every 90 Days (Standard Corporate)</option>
                  <option value={180}>Every 180 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.session_auto_timeout', 'Session Auto-Timeout')}</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                >
                  <option value={15}>15 Minutes of Inactivity</option>
                  <option value={30}>30 Minutes of Inactivity</option>
                  <option value={60}>60 Minutes of Inactivity</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: License Quotas */}
      {activeTab === 'quotas' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.tenant_license_quotas_capacity', 'Tenant License Quotas & Capacity')}</h3>
              <p className="text-xs text-slate-500">Live resource utilization metrics for your organization partition.</p>
            </div>

            {role === 'SUPER_ADMIN' ? (
              <button
                onClick={() => setShowQuotaModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition shadow"
              >
                <Sliders className="w-4 h-4" />
                <span>👑 Re-allocate Tenant Quotas (SuperAdmin)</span>
              </button>
            ) : (
              <NavLink
                to="/billing"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow text-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Request Headcount / Capacity Upgrade</span>
              </NavLink>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Headcount Seats */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold block">Active Headcount Seats</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  {Math.min(100, Math.round(((quotas?.usedSeats ?? 254) / (quotas?.maxSeats ?? 300)) * 100))}% Used
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {quotas?.usedSeats ?? 254} / {quotas?.maxSeats ?? 300} Seats
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((quotas?.usedSeats ?? 254) / (quotas?.maxSeats ?? 300)) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">
                {(quotas?.maxSeats ?? 300) - (quotas?.usedSeats ?? 254)} Available Seats Remaining
              </span>
            </div>

            {/* Hardware Terminals Fleet */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold block">Hardware Terminals Fleet</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  {Math.min(100, Math.round(((quotas?.usedDevices ?? 12) / (quotas?.maxDevices ?? 20)) * 100))}% Allocated
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {quotas?.usedDevices ?? 12} / {quotas?.maxDevices ?? 20} Devices
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((quotas?.usedDevices ?? 12) / (quotas?.maxDevices ?? 20)) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-purple-600 font-bold block">
                {(quotas?.maxDevices ?? 20) - (quotas?.usedDevices ?? 12)} Device Quota Available
              </span>
            </div>

            {/* Encrypted Document Vault */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold block">Encrypted Document Vault</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {Math.min(100, Math.round(((quotas?.usedStorageGb ?? 14.2) / (quotas?.maxStorageGb ?? 50)) * 100))}% Used
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {quotas?.usedStorageGb ?? 14.2} GB / {quotas?.maxStorageGb ?? 50} GB
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((quotas?.usedStorageGb ?? 14.2) / (quotas?.maxStorageGb ?? 50)) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">
                SOC2 Compliant Storage ({((quotas?.maxStorageGb ?? 50) - (quotas?.usedStorageGb ?? 14.2)).toFixed(1)} GB Free)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.administrative_security_audit_', 'Administrative Security Audit Trail')}</h3>
              <p className="text-xs text-slate-500">Immutable record of security mutations, administrative logins, and compliance events.</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportAuditReport}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SOC2 / GDPR Report</span>
              </button>
              <NavLink
                to="/admin/audit-logs"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Full Audit Explorer</span>
              </NavLink>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor Email</th>
                  <th className="py-3 px-3">Event Action</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                {auditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-700/25 transition">
                    <td className="py-3 px-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{log.actorEmail}</td>
                    <td className="py-3 px-3 text-indigo-600 font-bold">{log.eventCode}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{log.targetEntity}: {log.targetId}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.invite_administrative_user', 'Invite Administrative User')}</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.full_name', 'Full Name')}</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder={t('admin.e_g_rajesh_kumar', 'e.g. Rajesh Kumar')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.corporate_email', 'Corporate Email')}</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('admin.rajesh_company_com', 'rajesh@company.com')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin.assigned_role', 'Assigned Role')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  {getAvailableRoles().map((roleOpt) => (
                    <option key={roleOpt.value} value={roleOpt.value}>
                      {roleOpt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel</button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex items-center gap-2 px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow disabled:opacity-50"
                >
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Send Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SuperAdmin Re-allocate Quota Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-purple-200 dark:border-purple-900 p-6 shadow-2xl space-y-5 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">👑 SuperAdmin Tenant Quota Allocator</h3>
                  <p className="text-[11px] text-purple-600 font-semibold">Override partition capacity limits for ACME Corporation</p>
                </div>
              </div>
              <button onClick={() => setShowQuotaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuota} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Headcount Seats</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editMaxSeats}
                  onChange={(e) => setEditMaxSeats(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Hardware Devices</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editMaxDevices}
                  onChange={(e) => setEditMaxDevices(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Encrypted Storage (GB)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editMaxStorageGb}
                  onChange={(e) => setEditMaxStorageGb(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowQuotaModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuota}
                  className="flex items-center gap-2 px-5 py-2 font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow disabled:opacity-50"
                >
                  {isSavingQuota ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Quota Re-allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
