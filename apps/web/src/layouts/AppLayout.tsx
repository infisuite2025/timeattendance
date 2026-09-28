import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Users,
  CalendarRange,
  TabletSmartphone,
  MapPin,
  FileText,
  Share2,
  BarChart3,
  Settings,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  CheckSquare,
  FileSpreadsheet,
  Smartphone,
  Palmtree,
  UserCheck,
  Shield,
  Briefcase,
  User,
  UsersRound,
  Zap,
  Sparkles,
  ShieldAlert,
  WalletCards,
  Truck,
  Globe2,
  Building2,
  Lock
} from 'lucide-react';
import { useI18n } from '../context/I18nContext.tsx';
import { useAuth, UserRole } from '../context/AuthContext.tsx';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';
import { HelpBotWidget } from '../components/help/HelpBotWidget.tsx';

export const AppLayout: React.FC = () => {
  const { t, isRtl } = useI18n();
  const { user, role, switchPersona, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDemoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true' || (import.meta as any).env?.DEV;

  const getNavItems = () => {
    if (role === 'SUPER_ADMIN') {
      return [
        { label: 'Tenant Registry & Partitions', path: '/admin/tenants', icon: Building2 },
        { label: 'Payment Gateway Setup', path: '/admin/payment-gateways', icon: Zap },
        { label: 'Platform Billing & Pricing', path: '/admin/superadmin-billing', icon: WalletCards },
        { label: 'Add-on Marketplace Admin', path: '/admin/addons', icon: Sparkles },
        { label: 'Audit Trail Explorer', path: '/admin/audit-logs', icon: ShieldAlert },
      ];
    }

    if (role === 'EMPLOYEE') {
      return [
        { label: t('nav.attendance'), path: '/attendance/my', icon: Clock },
        { label: t('nav.approvals'), path: '/attendance/regularisations', icon: CheckSquare },
        { label: t('nav.finalisation'), path: '/attendance/overtime', icon: FileSpreadsheet },
        { label: t('nav.shifts'), path: '/shifts/schedule', icon: CalendarRange },
        { label: t('nav.leaves'), path: '/policies/leaves', icon: Palmtree },
        { label: t('nav.coreHr'), path: '/hr', icon: UsersRound, badge: t('payroll.addon', 'Add-on') },
        { label: t('nav.employees'), path: '/profile', icon: User },
        { label: t('nav.mobile'), path: '/mobile/simulator', icon: Smartphone },
      ];
    }

    if (role === 'MANAGER') {
      return [
        { label: t('nav.attendance'), path: '/attendance/team', icon: Users },
        { label: t('nav.approvals'), path: '/approvals', icon: CheckSquare },
        { label: t('nav.shifts'), path: '/shifts/schedule', icon: CalendarRange },
        { label: t('nav.coreHr'), path: '/hr', icon: UsersRound, badge: t('payroll.addon', 'Add-on') },
        { label: t('nav.tmBilling'), path: '/tm', icon: Briefcase, badge: t('payroll.addon', 'Add-on') },
        { label: t('nav.aiSecurity'), path: '/security', icon: ShieldAlert, badge: t('payroll.addon', 'Add-on') },
        { label: t('nav.payrollDisbursement'), path: '/payroll-disbursement', icon: WalletCards, badge: t('payroll.addon', 'Add-on') },
        { label: t('nav.fieldForce'), path: '/field-force', icon: Truck, badge: t('payroll.addon', 'Add-on') },
        { label: t('nav.globalPayroll'), path: '/global-payroll', icon: Globe2, badge: t('payroll.addon', 'Add-on') },
        { label: t('nav.reports'), path: '/reports', icon: BarChart3 },
        { label: t('nav.mobile'), path: '/mobile/simulator', icon: Smartphone },
      ];
    }

    if (role === 'DATA_PROTECTION_OFFICER') {
      return [
        { label: 'DPDPA DPO Workspace', path: '/compliance/dpo-workspace', icon: Shield },
        { label: 'Audit Trail Explorer', path: '/admin/audit-logs', icon: ShieldAlert },
        { label: 'Data Principals Register', path: '/employees', icon: Users },
      ];
    }

    // Default ADMIN Navigation
    return [
      { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
      { label: t('nav.attendance'), path: '/attendance/live', icon: Clock },
      { label: t('nav.approvals'), path: '/approvals', icon: CheckSquare },
      { label: t('nav.finalisation'), path: '/attendance/finalisation', icon: FileSpreadsheet },
      { label: t('nav.employees'), path: '/employees', icon: Users },
      { label: t('nav.coreHr'), path: '/hr', icon: UsersRound, badge: t('payroll.addon', 'Add-on') },
      { label: t('nav.tmBilling'), path: '/tm', icon: Briefcase, badge: t('payroll.addon', 'Add-on') },
      { label: t('nav.aiSecurity'), path: '/security', icon: ShieldAlert, badge: t('payroll.addon', 'Add-on') },
      { label: t('nav.payrollDisbursement'), path: '/payroll-disbursement', icon: WalletCards, badge: t('payroll.addon', 'Add-on') },
      { label: t('nav.fieldForce'), path: '/field-force', icon: Truck, badge: t('payroll.addon', 'Add-on') },
      { label: t('nav.globalPayroll'), path: '/global-payroll', icon: Globe2, badge: t('payroll.addon', 'Add-on') },
      { label: t('nav.shifts'), path: '/shifts/library', icon: CalendarRange },
      { label: t('nav.devices'), path: '/devices', icon: TabletSmartphone },
      { label: t('nav.geofencing'), path: '/geofencing', icon: MapPin },
      { label: t('nav.policies'), path: '/policies', icon: FileText },
      { label: t('nav.leaves'), path: '/policies/leaves', icon: Palmtree },
      { label: t('nav.mobile'), path: '/mobile/simulator', icon: Smartphone },
      { label: t('nav.integrations'), path: '/integrations', icon: Share2 },
      { label: t('nav.reports'), path: '/reports', icon: BarChart3 },
      { label: t('nav.admin'), path: '/admin', icon: Settings },
      { label: t('nav.tenantBilling'), path: '/billing', icon: WalletCards },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fa]">
      {/* Left Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold tracking-tight text-blue-600">Infi</span>
              <span className="text-lg font-bold tracking-tight text-slate-900">TimePro</span>
            </div>
            <p className="text-[10px] text-slate-500">{t('brand.tagline')}</p>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-4 pt-3">
          <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold ${
            role === 'ADMIN'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
              : role === 'MANAGER'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
          }`}>
            <span className="flex items-center gap-1.5">
              {role === 'ADMIN' && <Shield className="w-3.5 h-3.5" />}
              {role === 'MANAGER' && <Briefcase className="w-3.5 h-3.5" />}
              {role === 'EMPLOYEE' && <UserCheck className="w-3.5 h-3.5" />}
              <span>{role === 'ADMIN' ? 'Admin Portal' : role === 'MANAGER' ? 'Manager Portal' : 'Employee Self-Service'}</span>
            </span>
            <span className="text-[9px] font-mono opacity-80">{user.employeeCode}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSubrouteActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path + '/')) ||
              (item.path === '/policies' && location.pathname.startsWith('/policies/edit')) ||
              (item.path === '/attendance/live' && location.pathname.startsWith('/attendance/day-detail'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: exactActive }) =>
                  `group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    exactActive || isSubrouteActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      isSubrouteActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>


        {/* Sidebar Footer Tagline */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-lg bg-blue-50/60 p-3">
            <p className="text-xs font-semibold text-blue-900">{t('brand.smartPeople')}</p>
            <p className="text-[11px] text-blue-700">{t('brand.brighterWorkplaces')}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          {/* Search Box */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={role === 'EMPLOYEE' ? 'Search shifts, leaves, punches...' : t('header.searchPlaceholder')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* User & Notification Controls */}
          <div className="flex items-center gap-3">
            {/* Global Language & RTL Switcher */}
            <LanguageSwitcher />

            {/* Notification Bell */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {role === 'EMPLOYEE' ? 1 : 3}
              </span>
            </button>

            {/* Help Button */}
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-slate-100"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[11px] text-slate-500">{user.designation}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className={`absolute mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 ${isRtl ? 'left-0' : 'right-0'}`}>
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                        {user.employeeCode}
                      </span>
                      <span className="text-[10px] text-slate-400">• {user.department}</span>
                    </div>
                  </div>

                  {/* Switch Persona Quick Toggles (Rendered only in Demo / Development Mode) */}
                  {isDemoMode && (
                    <div className="px-2 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Switch View / Persona (Demo Mode)</p>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            switchPersona('SUPER_ADMIN');
                            setUserDropdownOpen(false);
                            navigate('/admin/tenants');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                            role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">👑 SuperAdmin (Platform Owner)</span>
                          {role === 'SUPER_ADMIN' && <span className="text-[10px] bg-purple-200 text-purple-800 px-1 rounded">Active</span>}
                        </button>

                        <button
                          onClick={() => {
                            switchPersona('ADMIN');
                            setUserDropdownOpen(false);
                            navigate('/dashboard');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                            role === 'ADMIN' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">🏢 Tenant Administrator</span>
                          {role === 'ADMIN' && <span className="text-[10px] bg-blue-200 text-blue-800 px-1 rounded">Active</span>}
                        </button>

                        <button
                          onClick={() => {
                            switchPersona('MANAGER');
                            setUserDropdownOpen(false);
                            navigate('/attendance/team');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                            role === 'MANAGER' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">👔 Manager / Supervisor</span>
                          {role === 'MANAGER' && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 rounded">Active</span>}
                        </button>

                        <button
                          onClick={() => {
                            switchPersona('EMPLOYEE');
                            setUserDropdownOpen(false);
                            navigate('/attendance/my');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                            role === 'EMPLOYEE' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">👷 Employee (ESS)</span>
                          {role === 'EMPLOYEE' && <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1 rounded">Active</span>}
                        </button>

                        <button
                          onClick={() => {
                            switchPersona('DATA_PROTECTION_OFFICER' as any);
                            setUserDropdownOpen(false);
                            navigate('/compliance/dpo-workspace');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                            role === 'DATA_PROTECTION_OFFICER' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">🛡️ Data Protection Officer (DPO)</span>
                          {role === 'DATA_PROTECTION_OFFICER' && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 rounded">Active</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  <NavLink
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>My Profile & Security</span>
                  </NavLink>

                  {role === 'ADMIN' && (
                    <NavLink
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>{t('header.tenantSettings')}</span>
                    </NavLink>
                  )}

                  <NavLink
                    to="/auth/login"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t('header.signOut')}</span>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {role === 'SUPER_ADMIN' &&
          !['/admin/tenants', '/admin/payment-gateways', '/admin/superadmin-billing', '/admin/addons', '/admin/audit-logs', '/profile'].some((p) =>
            location.pathname.startsWith(p)
          ) ? (
            <div className="p-8 max-w-3xl mx-auto mt-12 bg-white dark:bg-slate-800 rounded-3xl border border-purple-200 dark:border-purple-800 shadow-xl text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Super Admin Privacy Boundary Guard</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                As the <strong>SaaS Application Platform Owner</strong>, your role is strictly scoped to managing multi-tenant partitions, subscription pricing tiers, global payment gateways, and tenant billings.
                <br /><br />
                <strong>Operational tenant data</strong> (such as employee punch logs, shift rosters, and leave applications) is end-to-end encrypted and isolated for tenant privacy. Super Admin cannot inspect individual tenant operational data.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <NavLink
                  to="/admin/payment-gateways"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Open Payment Gateway Setup
                </NavLink>
                <NavLink
                  to="/admin/tenants"
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  View Tenant Directory
                </NavLink>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Floating AI Help Desk Assistant Bot */}
      <HelpBotWidget />
    </div>
  );
};
