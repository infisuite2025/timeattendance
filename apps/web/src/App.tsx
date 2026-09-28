import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout.tsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { CommandCentrePage } from './pages/dashboard/CommandCentrePage.tsx';
import { LiveAttendancePage } from './pages/attendance/LiveAttendancePage.tsx';
import { DayDetailPage } from './pages/attendance/DayDetailPage.tsx';
import { PunchTimelinePage } from './pages/attendance/PunchTimelinePage.tsx';
import { MyAttendancePage } from './pages/attendance/MyAttendancePage.tsx';
import { TeamAttendancePage } from './pages/attendance/TeamAttendancePage.tsx';
import { AttendanceExceptionsPage } from './pages/attendance/AttendanceExceptionsPage.tsx';
import { RegularisationRequestsPage } from './pages/attendance/RegularisationRequestsPage.tsx';
import { OvertimeRequestsPage } from './pages/attendance/OvertimeRequestsPage.tsx';
import { EmployeeListPage } from './pages/employees/EmployeeListPage.tsx';
import { EmployeeDetailPage } from './pages/employees/EmployeeDetailPage.tsx';
import { EmployeeProfilePage } from './pages/employees/EmployeeProfilePage.tsx';
import { LocationsPage } from './pages/organization/LocationsPage.tsx';
import { GeofenceOperationsPage } from './pages/organization/GeofenceOperationsPage.tsx';
import { DeviceManagementPage } from './pages/devices/DeviceManagementPage.tsx';

// Shifts & Rostering Pages
import { ShiftLibraryPage } from './pages/shifts/ShiftLibraryPage.tsx';
import { CreateShiftPage } from './pages/shifts/CreateShiftPage.tsx';
import { ShiftGroupsPage } from './pages/shifts/ShiftGroupsPage.tsx';
import { ShiftAssignmentsPage } from './pages/shifts/ShiftAssignmentsPage.tsx';
import { ShiftSwapsPage } from './pages/shifts/ShiftSwapsPage.tsx';
import { TeamSchedulePage } from './pages/shifts/TeamSchedulePage.tsx';

// Policy Engine Pages
import { PolicyListPage } from './pages/policies/PolicyListPage.tsx';
import { PolicyEditorPage } from './pages/policies/PolicyEditorPage.tsx';
import { LeavePoliciesPage } from './pages/policies/LeavePoliciesPage.tsx';

// Approvals Workflow Hub
import { ApprovalsHubPage } from './pages/approvals/ApprovalsHubPage.tsx';

// Payroll & Finalisation Pages
import { AttendanceFinalisationPage } from './pages/payroll/AttendanceFinalisationPage.tsx';
import { PayrollExportPage } from './pages/payroll/PayrollExportPage.tsx';

// Reports & Analytics Suite
import { ReportsHubPage } from './pages/reports/ReportsHubPage.tsx';

// SuperAdmin & Tenant Management
import { SuperAdminTenantsPage } from './pages/admin/SuperAdminTenantsPage.tsx';
import { AddonMarketplacePage } from './pages/admin/AddonMarketplacePage.tsx';
import { PaymentGatewayConfigPage } from './pages/admin/PaymentGatewayConfigPage.tsx';
import { TenantBillingPage } from './pages/billing/TenantBillingPage.tsx';
import { TenantSettingsPage } from './pages/admin/TenantSettingsPage.tsx';

// Core HR & Employee Lifecycle Suite (Add-on)
import { HRHubPage } from './pages/hr/HRHubPage.tsx';

// Time & Materials / Project Billing (Add-on)
import { TimeMaterialsPage } from './pages/tm/TimeMaterialsPage.tsx';

// Advanced AI Biometric Anti-Spoofing (Add-on)
import { BiometricSecurityPage } from './pages/security/BiometricSecurityPage.tsx';

// Automated Direct Payroll Disbursement (Add-on)
import { DirectPayrollPage } from './pages/payroll-disbursement/DirectPayrollPage.tsx';

// Field Force Management (Add-on)
import { FieldForcePage } from './pages/field-force/FieldForcePage.tsx';

// Multi-Country Global Payroll Engine (Add-on)
import { GlobalPayrollPage } from './pages/global-payroll/GlobalPayrollPage.tsx';

// Compliance & Audit Trail
import { AuditLogExplorerPage } from './pages/admin/AuditLogExplorerPage.tsx';
import { DpoWorkspacePage } from './pages/compliance/DpoWorkspacePage.tsx';

// Mobile Flutter Simulator
import { MobileAppSimulatorPage } from './pages/mobile/MobileAppSimulatorPage.tsx';

// Integrations & Webhooks Engine
import { IntegrationsHubPage } from './pages/integrations/IntegrationsHubPage.tsx';

import { I18nProvider } from './context/I18nContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';

// Smart Persona Root Redirect Component
const RootRedirect: React.FC = () => {
  const { role } = useAuth();
  if (role === 'SUPER_ADMIN') return <Navigate to="/admin/tenants" replace />;
  if (role === 'EMPLOYEE') return <Navigate to="/attendance/my" replace />;
  if (role === 'MANAGER') return <Navigate to="/attendance/team" replace />;
  if (role === 'DATA_PROTECTION_OFFICER') return <Navigate to="/compliance/dpo-workspace" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <I18nProvider>
          <NotificationProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/auth/login" element={<LoginPage />} />

              {/* Protected Application Chrome Layout */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<RootRedirect />} />

                {/* ========================================================== */}
                {/* 1. SUPER_ADMIN ONLY ROUTES                                  */}
                {/* ========================================================== */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DATA_PROTECTION_OFFICER']} />}>
                  <Route path="/admin/tenants" element={<SuperAdminTenantsPage />} />
                  <Route path="/admin/superadmin" element={<SuperAdminTenantsPage />} />
                  <Route path="/admin/payment-gateways" element={<PaymentGatewayConfigPage />} />
                  <Route path="/admin/superadmin-billing" element={<PaymentGatewayConfigPage />} />
                  <Route path="/admin/addons" element={<AddonMarketplacePage />} />
                  <Route path="/addons/marketplace" element={<AddonMarketplacePage />} />
                  <Route path="/admin/audit-logs" element={<AuditLogExplorerPage />} />
                  <Route path="/compliance/audit-trail" element={<AuditLogExplorerPage />} />
                </Route>

                {/* ========================================================== */}
                {/* 2. ADMIN ONLY ROUTES (Tenant Administration)                */}
                {/* ========================================================== */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/dashboard" element={<CommandCentrePage />} />
                  <Route path="/attendance/live" element={<LiveAttendancePage />} />
                  <Route path="/attendance/exceptions" element={<AttendanceExceptionsPage />} />
                  <Route path="/attendance/finalisation" element={<AttendanceFinalisationPage />} />
                  <Route path="/attendance/punches" element={<PunchTimelinePage />} />
                  <Route path="/attendance/raw-events" element={<PunchTimelinePage />} />
                  <Route path="/attendance/day-detail/:id" element={<DayDetailPage />} />

                  <Route path="/payroll/finalisation" element={<AttendanceFinalisationPage />} />
                  <Route path="/payroll/export" element={<PayrollExportPage />} />

                  <Route path="/locations" element={<LocationsPage />} />
                  <Route path="/geofencing" element={<GeofenceOperationsPage />} />
                  <Route path="/devices" element={<DeviceManagementPage />} />

                  <Route path="/shifts/library" element={<ShiftLibraryPage />} />
                  <Route path="/shifts/create" element={<CreateShiftPage />} />
                  <Route path="/shifts/groups" element={<ShiftGroupsPage />} />
                  <Route path="/shifts/assignments" element={<ShiftAssignmentsPage />} />

                  <Route path="/policies" element={<PolicyListPage />} />
                  <Route path="/policies/create" element={<PolicyEditorPage />} />
                  <Route path="/policies/edit/:id" element={<PolicyEditorPage />} />

                  <Route path="/admin" element={<TenantSettingsPage />} />
                  <Route path="/admin/settings" element={<TenantSettingsPage />} />
                  <Route path="/billing" element={<TenantBillingPage />} />
                  <Route path="/tenant/billing" element={<TenantBillingPage />} />

                  <Route path="/integrations" element={<IntegrationsHubPage />} />
                  <Route path="/integrations/webhooks" element={<IntegrationsHubPage />} />
                </Route>

                {/* ========================================================== */}
                {/* 3. ADMIN & MANAGER ROUTES (Supervisor Management)          */}
                {/* ========================================================== */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DATA_PROTECTION_OFFICER']} />}>
                  <Route path="/attendance/team" element={<TeamAttendancePage />} />
                  <Route path="/approvals" element={<ApprovalsHubPage />} />
                  <Route path="/approvals/history" element={<ApprovalsHubPage />} />
                  <Route path="/employees" element={<EmployeeListPage />} />
                  <Route path="/employees/:id" element={<EmployeeDetailPage />} />
                  <Route path="/reports" element={<ReportsHubPage />} />
                  <Route path="/reports/muster-roll" element={<ReportsHubPage />} />
                  <Route path="/reports/scheduled" element={<ReportsHubPage />} />
                </Route>

                {/* ========================================================== */}
                {/* 4. SHARED ACCESSIBLE ROUTES (ALL ROLES)                     */}
                {/* ========================================================== */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'DATA_PROTECTION_OFFICER']} />}>
                  <Route path="/profile" element={<EmployeeProfilePage />} />
                  <Route path="/employees/my-profile" element={<EmployeeProfilePage />} />
                  <Route path="/compliance/dpo-workspace" element={<DpoWorkspacePage />} />
                  <Route path="/dpo" element={<DpoWorkspacePage />} />
                  <Route path="/attendance/my" element={<MyAttendancePage />} />
                  <Route path="/attendance/regularisations" element={<RegularisationRequestsPage />} />
                  <Route path="/attendance/overtime" element={<OvertimeRequestsPage />} />

                  <Route path="/shifts/schedule" element={<TeamSchedulePage />} />
                  <Route path="/shifts/swaps" element={<ShiftSwapsPage />} />

                  <Route path="/policies/leaves" element={<LeavePoliciesPage />} />
                  <Route path="/leaves/policies" element={<LeavePoliciesPage />} />

                  {/* Add-on Modules with internal role-based component scoping */}
                  <Route path="/hr" element={<HRHubPage />} />
                  <Route path="/hr/*" element={<HRHubPage />} />
                  <Route path="/tm" element={<TimeMaterialsPage />} />
                  <Route path="/tm/*" element={<TimeMaterialsPage />} />
                  <Route path="/security" element={<BiometricSecurityPage />} />
                  <Route path="/security/*" element={<BiometricSecurityPage />} />
                  <Route path="/payroll-disbursement" element={<DirectPayrollPage />} />
                  <Route path="/payroll-disbursement/*" element={<DirectPayrollPage />} />
                  <Route path="/field-force" element={<FieldForcePage />} />
                  <Route path="/field-force/*" element={<FieldForcePage />} />
                  <Route path="/global-payroll" element={<GlobalPayrollPage />} />
                  <Route path="/global-payroll/*" element={<GlobalPayrollPage />} />

                  {/* Mobile App Simulator */}
                  <Route path="/mobile" element={<MobileAppSimulatorPage />} />
                  <Route path="/mobile/simulator" element={<MobileAppSimulatorPage />} />
                  <Route path="/mobile/*" element={<MobileAppSimulatorPage />} />
                </Route>
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </I18nProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
};

export default App;
