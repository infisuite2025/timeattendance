import { RAGArticle } from './help-bot.types.js';

export const KNOWLEDGE_BASE: RAGArticle[] = [
  // ── 1. Dashboard & Authentication ──
  {
    id: 'dashboard',
    title: 'Command Centre & Real-time Operational Dashboard',
    keywords: ['dashboard', 'command centre', 'kpi', 'metrics', 'live count', 'present Today', 'late count', 'ot hours'],
    module: 'Dashboard',
    navigationPath: '/dashboard',
    content: `The Command Centre (/dashboard) serves as the primary operational hub:
- Real-time KPIs display Live Present Staff, Late Arrivals, On Leave, and Overtime Hours logged today.
- View live biometric punch logs and mobile geofence check-ins in the activity feed.
- Quick action shortcuts allow managers to jump to Approvals (/approvals), Shift Matrix (/shifts/schedule), or Punch Timeline (/attendance/punches).`
  },
  {
    id: 'auth-login',
    title: 'Authentication, Multi-Tenant SSO & Security Login',
    keywords: ['login', 'auth', 'sign in', 'sso', 'mfa', 'password', 'tenant login', 'security portal'],
    module: 'Authentication',
    navigationPath: '/auth/login',
    content: `Login & Security Portal (/auth/login):
- Secure sign-in supporting Email/Password, Multi-Tenant Domain SSO, and OAuth 2.0.
- Switch roles (Employee ESS, Manager, Tenant Admin, Super Admin) using persona quick toggles during development.
- Forgot Password link triggers an automated password reset email with temporary OTP verification.`
  },

  // ── 2. Attendance & Punch Tracking ──
  {
    id: 'attendance-live',
    title: 'Live Attendance Stream & Real-time Punch Feeds',
    keywords: ['live attendance', 'realtime punches', 'clock in feed', 'biometric stream', 'live status'],
    module: 'Attendance',
    navigationPath: '/attendance/live',
    content: `Live Attendance (/attendance/live) tracks real-time employee check-in and check-out events:
- View live streaming punch feeds from IoT biometric devices and mobile app GPS check-ins.
- Filter by department, location, or attendance status (On Time, Late, Missing Punch).
- Click any employee row to open their Day Detail breakdown (/attendance/day-detail).`
  },
  {
    id: 'attendance-my',
    title: 'My Attendance & ESS Personal Calendar View',
    keywords: ['my attendance', 'personal attendance', 'ess calendar', 'my punches', 'worked hours', 'my shortfall'],
    module: 'Attendance',
    navigationPath: '/attendance/my',
    content: `My Attendance (/attendance/my) provides employees with a monthly self-service calendar:
- Color-coded daily status badges (Present, Late, Absent, Weekly Off, Leave).
- Inspect daily gross duration, break times, net worked hours, regular hours, and OT earned.
- Submit missing punch regularization requests directly from any flagged calendar day.`
  },
  {
    id: 'attendance-team',
    title: 'Team Attendance & Manager Supervisor Overview',
    keywords: ['team attendance', 'manager view', 'department attendance', 'direct reports', 'team present', 'subordinates'],
    module: 'Attendance',
    navigationPath: '/attendance/team',
    content: `Team Attendance (/attendance/team) gives managers full oversight of direct reports:
- View daily and monthly attendance compliance percentages across your team.
- Quickly spot missing punches, unapproved late arrivals, or unexcused absences.
- Broadcast roster reminders or submit bulk regularizations for your team.`
  },
  {
    id: 'attendance-exceptions',
    title: 'Attendance Exceptions & Automated Penalty Rules',
    keywords: ['exceptions', 'flagged attendance', 'missing punch', 'mispunch', 'late arrival penalty', 'sandwich rule'],
    module: 'Attendance',
    navigationPath: '/attendance/exceptions',
    content: `Attendance Exceptions (/attendance/exceptions) flags rule discrepancies automatically:
- Identifies missing IN or OUT swipes, lateness beyond grace period, and early departures.
- Enforces configured Sandwich Penalty rules (unexcused absences surrounding weekly offs).
- Managers can resolve exceptions by waiving penalties, approving regularizations, or marking as unpaid leave.`
  },
  {
    id: 'attendance-regularisations',
    title: 'Regularisation Requests & Punch Correction Workflow',
    keywords: ['regularisation', 'regularization', 'punch correction', 'fix mispunch', 'biometric failure request'],
    module: 'Attendance',
    navigationPath: '/attendance/regularisations',
    content: `Regularisation Requests (/attendance/regularisations):
- Submit correction requests for missing punches or official outdoor duties.
- Provide supporting documentation or select reason categories (Biometric Device Failure, Client Visit, Traffic Delay).
- Requires manager approval. Once approved, worked hours and daily status update automatically.`
  },
  {
    id: 'attendance-overtime',
    title: 'Overtime (OT) Requests, Rules & Multipliers',
    keywords: ['overtime', 'ot', 'ot calculation', 'ot approval', '1.5x multiplier', 'double time', 'ot hours'],
    module: 'Attendance',
    navigationPath: '/attendance/overtime',
    content: `Overtime Management (/attendance/overtime):
- Computes OT duration exceeding standard shift hours (e.g. 8h/day).
- Applies rate multipliers (1.5x standard weekday OT, 2.0x weekend/holiday OT).
- Pre-approved and post-approved OT workflows route to Approvals Hub (/approvals) before syncing to global payroll.`
  },
  {
    id: 'attendance-punches',
    title: 'Raw Punch Timeline & Multi-Channel Event Logs',
    keywords: ['punches', 'raw punches', 'punch timeline', 'rfid swipes', 'face recognition log', 'gps coordinate log'],
    module: 'Attendance',
    navigationPath: '/attendance/punches',
    content: `Punch Timeline (/attendance/punches) displays raw, immutable punch logs:
- Audit every check-in/out event across all hardware channels (Face Recognition, Fingerprint, RFID, Mobile GPS, Web Portal).
- Inspect raw device UUIDs, GPS lat/long coordinates, and facial match confidence scores.
- Filter logs by date range, location, or device ID.`
  },
  {
    id: 'attendance-day-detail',
    title: 'Daily Attendance Breakdown & In-Out Timeline',
    keywords: ['day detail', 'daily breakdown', 'punch sequence', 'break duration', 'net hours', 'supervisor remarks'],
    module: 'Attendance',
    navigationPath: '/attendance/day-detail/att_1',
    content: `Day Detail (/attendance/day-detail/:id) provides a microscopic view of a single employee workday:
- Detailed timeline showing every IN, BREAK-OUT, BREAK-IN, and OUT event.
- Calculates gross duration, break time, net worked hours, shortfall, and OT.
- View GPS check-in location maps and add supervisor audit remarks.`
  },

  // ── 3. Shifts & Rostering ──
  {
    id: 'shifts-schedule',
    title: 'Master Team Schedule Matrix & Roster Planner',
    keywords: ['schedule matrix', 'roster', 'team schedule', 'shift grid', 'shift allocation', 'weekly roster'],
    module: 'Shifts',
    navigationPath: '/shifts/schedule',
    content: `Team Schedule Matrix (/shifts/schedule):
- Visual multi-tier shift roster planner supporting Weekly Grid and Monthly Calendar views.
- Click any employee shift cell to reassign shift templates, set floating shifts, or assign weekly offs.
- Publish rosters to broadcast automated SMS/email/app notifications to scheduled staff.`
  },
  {
    id: 'shifts-library',
    title: 'Shift Library & Shift Template Catalog',
    keywords: ['shift library', 'shift definition', 'shift template', 'general shift', 'night shift', 'rotational shift'],
    module: 'Shifts',
    navigationPath: '/shifts/library',
    content: `Shift Library (/shifts/library) manages shift definition templates:
- Configure shift timings (e.g. General Shift 09:00 AM - 06:00 PM, Night Shift 10:00 PM - 06:30 AM).
- Set lateness grace periods (e.g. 15 minutes grace), early departure limits, and mandatory lunch break windows.
- Configure fixed vs flexible shift types.`
  },
  {
    id: 'shifts-create',
    title: 'Shift Creation Wizard & Overtime Thresholds',
    keywords: ['create shift', 'new shift', 'shift wizard', 'flexi shift setup', 'break window setup'],
    module: 'Shifts',
    navigationPath: '/shifts/create',
    content: `Create Shift (/shifts/create) provides a step-by-step wizard to build new shift templates:
- Define shift code, name, start time, end time, and color badge.
- Configure overtime eligibility rules and min/max break durations.
- Set up flexible shift windows allowing employees to complete core hours within a 12-hour window.`
  },
  {
    id: 'shifts-groups',
    title: 'Shift Groups & Automated Rotation Patterns',
    keywords: ['shift groups', 'rotation pattern', 'rotational group', '4-on-2-off', 'plant shift group'],
    module: 'Shifts',
    navigationPath: '/shifts/groups',
    content: `Shift Groups (/shifts/groups) handles automated shift rotation:
- Group employees into operational cohorts (e.g. Assembly Line Group A, Night Maintenance Group).
- Configure repeating rotation rules (e.g. 4 Morning Shifts -> 2 Days Off -> 4 Night Shifts).
- Auto-assign rotational schedules across departments without manual week-to-week editing.`
  },
  {
    id: 'shifts-assignments',
    title: 'Bulk Shift Assignments & Emergency Overrides',
    keywords: ['shift assignments', 'bulk assignment', 'effective dates', 'shift override', 'roster assignment'],
    module: 'Shifts',
    navigationPath: '/shifts/assignments',
    content: `Shift Assignments (/shifts/assignments):
- Assign shift templates to individual employees, departments, or entire locations.
- Specify effective date ranges (e.g. Oct 1 to Dec 31).
- Perform instant emergency shift overrides during unexpected operational demands.`
  },
  {
    id: 'shifts-swaps',
    title: 'Shift Swaps & Peer Exchange Requests',
    keywords: ['shift swap', 'trade shift', 'peer swap', 'swap request', 'exchange shift'],
    module: 'Shifts',
    navigationPath: '/shifts/swaps',
    content: `Shift Swaps (/shifts/swaps):
- Peer-to-peer shift exchange portal for employees.
- Select date, select peer employee, and specify replacement shift.
- Manager approves request in Approvals Hub (/approvals). Once approved, system automatically updates rosters for both workers.`
  },

  // ── 4. Employees & Core HR ──
  {
    id: 'employees-list',
    title: 'Employee Directory & Workforce Management',
    keywords: ['employees', 'employee list', 'workforce directory', 'staff directory', 'employee status'],
    module: 'Employees',
    navigationPath: '/employees',
    content: `Employee Directory (/employees):
- Search and filter active, probation, notice period, or archived employees.
- Filter by department, designation, location, or shift group.
- Quick action links to view profiles, edit details, or reassign managers.`
  },
  {
    id: 'employees-detail',
    title: 'Employee 360° Profile & Biometric Tokens',
    keywords: ['employee detail', 'employee 360', 'face token', 'card id', 'biometric token', 'emergency contacts'],
    module: 'Employees',
    navigationPath: '/employees/emp-001',
    content: `Employee 360° Profile (/employees/:id):
- Complete employee master record: Personal details, job title, supervisor, emergency contacts, bank info.
- Biometric Credentials tab: View enrolled Face Recognition tokens, Fingerprint IDs, and RFID Card numbers.
- View historical attendance compliance, leave balances, and shift history.`
  },
  {
    id: 'employees-profile',
    title: 'My Profile & Personal ESS Security',
    keywords: ['my profile', 'ess profile', 'change password', 'contact info', 'personal details'],
    module: 'Employees',
    navigationPath: '/profile',
    content: `My Profile (/profile):
- Employee Self-Service profile management.
- Update contact details, emergency contacts, and notification preferences.
- Change password and review logged-in sessions.`
  },
  {
    id: 'hr-hub',
    title: 'Core HR Suite, Assets, Onboarding & Helpdesk',
    keywords: ['hr', 'core hr', 'onboarding', 'assets', 'documents', 'performance', 'hr helpdesk'],
    module: 'Core HR',
    navigationPath: '/hr',
    content: `Core HR Hub (/hr):
- Onboarding & Offboarding: Track employee onboarding checklists and exit clearances.
- Asset Management: Assign company laptops, mobile devices, and access badges.
- Document Repository: Upload contracts, IDs, and tax documents.
- Internal HR Helpdesk: Submit and track internal HR inquiry tickets.`
  },

  // ── 5. Policy Engine & Leaves ──
  {
    id: 'policies-list',
    title: 'Policy Engine Catalog & Enterprise Rules',
    keywords: ['policies', 'policy list', 'attendance policy', 'policy engine', 'rules catalog'],
    module: 'Policies',
    navigationPath: '/policies',
    content: `Policy List (/policies):
- Master catalog of active company attendance and leave policy rules.
- Policy rules define lateness grace minutes, core working hours, sandwich rule enforcement, and overtime calculation formulas.
- Assign policies to specific employee tiers, departments, or geographic regions.`
  },
  {
    id: 'policies-editor',
    title: 'Visual Policy Builder & Rule Configurator',
    keywords: ['policy editor', 'create policy', 'policy builder', 'rule setup', 'grace period config'],
    module: 'Policies',
    navigationPath: '/policies/create',
    content: `Policy Builder (/policies/create):
- Visual configurator to build customized enterprise attendance policies.
- Configure lateness grace period (e.g. 15 mins), early departure threshold, and half-day minimum hours.
- Toggle Sandwich Rule (unexcused absence before/after holidays) and Comp-Off validity periods.`
  },
  {
    id: 'policies-leaves',
    title: 'Leave Application, Universal Policies, Accruals & Encashment',
    keywords: ['apply leave', 'apply for leave', 'request leave', 'how to apply leave', 'how can i apply leave', 'leave application', 'submit leave', 'take leave', 'leave request', 'applying leave', 'apply', 'leave policy', 'leave accrual', 'leave encashment', 'earned leave', 'gcc 30 day leave', 'sick leave', 'casual leave', 'annual leave', 'comp off'],
    module: 'Policies & Leaves',
    navigationPath: '/policies/leaves',
    content: `To apply for leave in InfiTimePro, follow these simple steps:
1. Navigate to **Leave Management & Policies** (/policies/leaves) or **My Attendance** (/attendance/my).
2. Click the **Apply Leave** button.
3. Select your **Leave Type** (Earned Leave, Casual Leave, Sick Leave, or Comp-Off).
4. Select your **Start Date** and **End Date** (or choose Half-Day if applicable).
5. Enter your reason / notes and click **Submit Request**. Your request will immediately route to your supervisor in the **Approvals Hub** (/approvals)!

Leave Policies & Accruals:
- Manage universal leave types: Earned Leave (EL), Casual Leave (CL), Sick Leave (SL), GCC Statutory 30-Day Annual Leave, and Comp-Off.
- Configure accrual modes: Monthly Pro-Rata vs Annual Front-Loaded.
- Set carryforward caps and Leave Encashment formulas (encashing unused leave against basic pay divisor).`
  },

  // ── 6. Approvals Workflow Hub ──
  {
    id: 'approvals-hub',
    title: 'Unified Approvals Workflow Hub & SLA Tracking',
    keywords: ['approvals', 'approvals hub', 'leave approval', 'ot approval', 'regularisation approval', 'sla timer'],
    module: 'Approvals',
    navigationPath: '/approvals',
    content: `Approvals Hub (/approvals):
- Single unified inbox for managers and admins to review pending requests (Leaves, Shift Swaps, Overtime, Regularizations).
- Visual SLA timers highlight urgent requests requiring turnaround.
- Perform single or bulk Approve / Reject decisions with audit comments.`
  },

  // ── 7. Time & Materials (T&M) ──
  {
    id: 'tm-projects',
    title: 'Time & Materials (T&M) Client Projects & Invoicing',
    keywords: ['t&m', 'time and materials', 'project billing', 'timesheets', 'billable hours', 'client invoices'],
    module: 'Time & Materials',
    navigationPath: '/tm',
    content: `Time & Materials Hub (/tm):
- Client & Project Management: Create client profiles, billable hourly rates, and project budgets.
- Timesheet Tracking: Log and approve billable vs non-billable employee project hours.
- Invoicing: Generate client invoices, track outstanding payments, and monitor overall utilization percentage.`
  },

  // ── 8. Field Force & Geofencing ──
  {
    id: 'field-force',
    title: 'Field Force Management, Mobile GPS & Fleet Tracking',
    keywords: ['field force', 'gps tracking', 'fleet', 'field jobs', 'mileage', 'route tracking', 'field engineer', 'dispatch routes'],
    module: 'Field Force',
    navigationPath: '/field-force',
    content: `Field Force Hub (/field-force):
- Manage remote, mobile, and field engineers.
- Assign field tasks/jobs, monitor live GPS coordinates, and track route history.
- Log fleet vehicle mileage and reimburse field travel expenses.`
  },
  {
    id: 'geofencing',
    title: 'Geofence Operations & GPS Boundary Radius Editor',
    keywords: ['geofencing', 'geofence zone', 'gps radius', 'polygonal geofence', 'mobile clock in location', 'outside geofence', 'geofence boundary', 'authorized geofence'],
    module: 'Organization',
    navigationPath: '/geofencing',
    content: `Geofence Operations (/geofencing):
- Define authorized circular or polygonal GPS geofence zones on an interactive map.
- Assign employees or field teams to specific geofences.
- Mobile clock-in requests outside the authorized GPS radius are flagged or rejected.`
  },
  {
    id: 'locations',
    title: 'Corporate Locations, Branch Offices & Plant Directory',
    keywords: ['locations', 'branch offices', 'headquarters', 'plant sites', 'office locations'],
    module: 'Organization',
    navigationPath: '/locations',
    content: `Corporate Locations (/locations):
- Directory of company headquarters, regional branches, factory plants, and warehouses.
- Set timezone, working days, and default shift assignment per location.`
  },
  {
    id: 'devices',
    title: 'IoT Biometric Device Management & Push API Sync',
    keywords: ['devices', 'biometric devices', 'push api', 'face recognition terminal', 'fingerprint scanner', 'device uuid', 'hardware sync', 'face sync', 'offline status'],
    module: 'Devices',
    navigationPath: '/devices',
    content: `Device Management (/devices):
- Manage IoT biometric terminals (Face Recognition, Fingerprint, RFID turnstiles).
- Monitor live device heartbeats, online/offline status, and Push API sync logs.
- Trigger remote biometric template sync or device reboot.`
  },
  {
    id: 'mobile-simulator',
    title: 'Mobile App ESS Simulator & Mobile Punches',
    keywords: ['mobile', 'mobile simulator', 'ess app', 'selfie punch', 'mobile clock in'],
    module: 'Mobile',
    navigationPath: '/mobile/simulator',
    content: `Mobile ESS Simulator (/mobile/simulator):
- Test the mobile employee self-service experience directly in the browser.
- Simulate GPS geofenced punches, selfie liveness clock-ins, leave applications, and shift swap requests.`
  },

  // ── 9. Payroll & Disbursement ──
  {
    id: 'payroll-finalisation',
    title: 'Monthly Attendance Finalisation & Cutoff Lock',
    keywords: ['attendance finalisation', 'payroll lock', 'cutoff date', 'unpaid leave deduction', 'lock attendance'],
    module: 'Payroll',
    navigationPath: '/attendance/finalisation',
    content: `Attendance Finalisation (/payroll/finalisation):
- Monthly payroll pre-processing workflow.
- Review and lock monthly attendance, approved OT hours, shortfall deductions, and unpaid leaves.
- Once finalized, attendance records lock to prevent retrospective edits during payroll calculation.`
  },
  {
    id: 'payroll-export',
    title: 'Payroll Export & Third-Party Integration Files',
    keywords: ['payroll export', 'csv export', 'excel export', 'sap payroll', 'workday payroll export'],
    module: 'Payroll',
    navigationPath: '/payroll/export',
    content: `Payroll Export (/payroll/export):
- Generate payroll integration files for external payroll engines (SAP, Workday, ADP, Tally, QuickBooks).
- Export customized CSV/Excel files containing payable days, OT hours, LWP (Leave Without Pay), and allowance adjustments.`
  },
  {
    id: 'global-payroll',
    title: 'Multi-Country Global Payroll & Tax Deductions',
    keywords: ['global payroll', 'multi country payroll', 'tax deductions', 'paye', 'tds', 'social security'],
    module: 'Payroll',
    navigationPath: '/global-payroll',
    content: `Global Payroll Engine (/global-payroll):
- Multi-currency payroll engine supporting regional tax rules (US W-2/PAYE, India TDS/PF/ESI, GCC WPS).
- Compute gross-to-net salary, statutory tax deductions, and employer contributions across global entities.`
  },
  {
    id: 'payroll-disbursement',
    title: 'Direct Bank Payroll Disbursement & Payslips',
    keywords: ['payroll disbursement', 'direct deposit', 'bank transfer', 'payslip', 'ewa', 'earned wage access'],
    module: 'Payroll',
    navigationPath: '/payroll-disbursement',
    content: `Payroll Disbursement (/payroll-disbursement):
- Execute automated bank salary payouts via direct payment gateway integrations.
- Generate digital payslips and Form 16 / tax breakdown sheets for employees.
- Manage Earned Wage Access (EWA) early salary withdrawal programs.`
  },

  // ── 10. Admin, Security & Audit ──
  {
    id: 'security-liveness',
    title: 'AI Biometric Anti-Spoofing & Liveness Detection',
    keywords: ['security', 'ai security', 'liveness detection', 'anti spoofing', 'device blacklist', 'photo spoof'],
    module: 'Security',
    navigationPath: '/security',
    content: `AI Biometric Security (/security):
- AI-powered anti-spoofing engine detects photo/video presentation attacks on biometric face devices.
- Review high-risk flagged punch attempts and manage blacklisted devices/users.`
  },
  {
    id: 'admin-settings',
    title: 'Tenant Settings & Organization Preferences',
    keywords: ['tenant settings', 'company profile', 'working days', 'default timezone', 'organization config', 'invite admin', 'tenant administrator', 'password rotation', 'mfa'],
    module: 'Admin',
    navigationPath: '/admin',
    content: `Tenant Settings (/admin):
- Configure tenant profile, company name, logo, default timezone, and currency.
- Define standard weekly working days (e.g. Mon-Fri or Sun-Thu for GCC) and fiscal year start.`
  },
  {
    id: 'billing-tenant',
    title: 'Tenant Subscription Plan & Billing Portal',
    keywords: ['billing', 'tenant billing', 'subscription plan', 'seat count', 'invoices', 'upgrade plan', 'quota', 'license usage', 'active seats'],
    module: 'Billing',
    navigationPath: '/billing',
    content: `Tenant Billing (/billing):
- Manage subscription plans (Starter, Professional, Enterprise).
- View active user seat counts, monthly renewal invoices, and add-on module subscriptions.`
  },
  {
    id: 'admin-tenants',
    title: 'SuperAdmin Tenant Partition Registry',
    keywords: ['superadmin tenants', 'tenant registry', 'multi tenant', 'provision tenant', 'partition isolation'],
    module: 'SuperAdmin',
    navigationPath: '/admin/tenants',
    content: `SuperAdmin Tenants Registry (/admin/tenants):
- Platform owner control panel for managing multi-tenant SaaS partitions.
- Provision new client tenants, inspect partition health, and enforce tenant isolation security.`
  },
  {
    id: 'admin-addons',
    title: 'Add-on Marketplace & Enterprise Modules',
    keywords: ['addons', 'marketplace', 'enable module', 'field force addon', 't&m addon', 'global payroll addon'],
    module: 'Marketplace',
    navigationPath: '/admin/addons',
    content: `Add-on Marketplace (/admin/addons):
- Enable or disable enterprise add-on modules: Field Force GPS, Time & Materials, Core HR, AI Biometric Anti-Spoofing, and Global Payroll.
- Try add-on modules with 14-day free trial options.`
  },
  {
    id: 'admin-gateways',
    title: 'Payment Gateway Configuration (Stripe, Razorpay)',
    keywords: ['payment gateways', 'stripe', 'razorpay', 'paypal', 'superadmin gateway config'],
    module: 'SuperAdmin',
    navigationPath: '/admin/payment-gateways',
    content: `Payment Gateway Setup (/admin/payment-gateways):
- Configure global payment processor credentials (Stripe, Razorpay, PayPal).
- Manage webhook endpoints for automated subscription billing renewal callbacks.`
  },
  {
    id: 'audit-logs',
    title: 'Immutable Audit Trail & Compliance Explorer',
    keywords: ['audit logs', 'compliance', 'audit trail', 'ip tracking', 'security events', 'user activity log'],
    module: 'Audit',
    navigationPath: '/admin/audit-logs',
    content: `Audit Log Explorer (/admin/audit-logs):
- Immutable trail logging every user login, data edit, approval decision, and system configuration change.
- Inspect IP addresses, user roles, timestamps, and request payloads for SOC 2 and GDPR compliance.`
  },
  {
    id: 'reports-hub',
    title: 'Reports Hub, Muster Roll & Automated Exports',
    keywords: ['reports', 'muster roll', 'attendance report', 'scheduled reports', 'export excel', 'pdf summary', 'pdf export', 'form-t', 'daily pdf'],
    module: 'Reports',
    navigationPath: '/reports',
    content: `Reports Hub (/reports):
- Generate statutory Muster Roll reports, monthly attendance sheets, OT summaries, and leave usage reports.
- Export in Excel, CSV, or PDF formats.
- Schedule automated recurring email reports for management.`
  },
  {
    id: 'integrations-hub',
    title: 'Integrations & Webhooks Engine',
    keywords: ['integrations', 'webhooks', 'api keys', 'sap integration', 'workday integration', 'slack notifications', 'teams bot'],
    module: 'Integrations',
    navigationPath: '/integrations',
    content: `Integrations & Webhooks (/integrations):
- Connect InfiTimePro with HRIS, ERP, and messaging platforms (Slack, Microsoft Teams, SAP, Workday, BambooHR).
- Generate secure API keys and configure HTTP webhook event listeners for real-time punch feeds and leave updates.`
  }
];
