import fs from 'fs';
import path from 'path';

const testCases = [
  // ─── 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) ─────────────────────
  {
    id: 'TC-AUTH-001',
    module: 'Authentication & RBAC',
    level: 'Unit/Functional',
    role: 'ADMIN',
    title: 'Valid Admin Login with credentials & tenant header injection',
    preconditions: 'User is on Login page (/login)',
    steps: '1. Select persona "ADMIN (Naresh - ADM-001)". 2. Enter valid password. 3. Click "Sign In".',
    expected: 'System authenticates successfully, stores JWT token and x-tenant-id header (tenant-001), redirects to /dashboard with full Admin sidebar.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-AUTH-002',
    module: 'Authentication & RBAC',
    level: 'Unit/Functional',
    role: 'MANAGER',
    title: 'Valid Manager Login with team scope',
    preconditions: 'User is on Login page (/login)',
    steps: '1. Select persona "MANAGER (Vikram - MGR-104)". 2. Enter valid password. 3. Click "Sign In".',
    expected: 'System authenticates, redirects to /dashboard with Manager sidebar and direct-report team scope.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-AUTH-003',
    module: 'Authentication & RBAC',
    level: 'Unit/Functional',
    role: 'EMPLOYEE',
    title: 'Valid Employee Login with self-service scope',
    preconditions: 'User is on Login page (/login)',
    steps: '1. Select persona "EMPLOYEE (Sarah - EMP-1001)". 2. Enter valid password. 3. Click "Sign In".',
    expected: 'System authenticates, redirects to /dashboard with Employee self-service view.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-AUTH-004',
    module: 'Authentication & RBAC',
    level: 'Security',
    role: 'ALL',
    title: 'Invalid Password Error Handling & Access Denial',
    preconditions: 'User is on Login page',
    steps: '1. Enter incorrect password. 2. Click "Sign In".',
    expected: 'System displays inline error "Invalid credentials", token is not generated, access denied.',
    priority: 'P0 - Critical',
    type: 'Negative'
  },
  {
    id: 'TC-AUTH-005',
    module: 'Authentication & RBAC',
    level: 'Security',
    role: 'EMPLOYEE',
    title: 'Employee Access Blocked on Policy Configuration Page',
    preconditions: 'Logged in as EMPLOYEE (Sarah)',
    steps: '1. Attempt to navigate directly to /policies via URL address bar.',
    expected: 'Access blocked; UI displays "Access Restricted — Employee role cannot modify company policies".',
    priority: 'P1 - High',
    type: 'Security'
  },
  {
    id: 'TC-AUTH-006',
    module: 'Authentication & RBAC',
    level: 'Integration',
    role: 'ALL',
    title: 'Session Logout & Token Invalidation',
    preconditions: 'User is logged in',
    steps: '1. Click User Profile avatar dropdown. 2. Click "Sign Out". 3. Click browser Back button.',
    expected: 'Tokens cleared from localStorage, user redirected to /login, back button prevented from restoring session.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },

  // ─── 2. DASHBOARD & COMMAND CENTRE ────────────────────────────────────────
  {
    id: 'TC-DASH-001',
    module: 'Dashboard & Command Centre',
    level: 'Unit/Functional',
    role: 'ADMIN',
    title: 'Admin Dashboard Live KPI Cards Verification',
    preconditions: 'Logged in as ADMIN',
    steps: '1. Navigate to /dashboard. 2. Inspect Top KPI cards.',
    expected: 'KPI widgets render real numbers: Total Employees (1,250), Present Today, On Leave, Late Arrivals, Geofence Alerts.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-DASH-002',
    module: 'Dashboard & Command Centre',
    level: 'User Scenario',
    role: 'MANAGER',
    title: 'Manager Team Overview & Pending Approvals Widget',
    preconditions: 'Logged in as MANAGER',
    steps: '1. Navigate to /dashboard. 2. Review team attendance summary and pending approval badges.',
    expected: 'Manager views live present/absent status of direct reports and quick action links for pending leave/regularization approvals.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-DASH-003',
    module: 'Dashboard & Command Centre',
    level: 'Integration',
    role: 'EMPLOYEE',
    title: 'Employee One-Touch Quick Clock In / Clock Out',
    preconditions: 'Logged in as EMPLOYEE',
    steps: '1. On /dashboard, click "Clock In". 2. Verify timer starts. 3. Click "Clock Out".',
    expected: 'Punch event recorded instantly, status updates to "On Duty", timestamp logged in database.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },

  // ─── 3. EMPLOYEE PROFILE & HR DATA ────────────────────────────────────────
  {
    id: 'TC-EMP-001',
    module: 'Employee Self-Service',
    level: 'Unit/Functional',
    role: 'EMPLOYEE',
    title: 'Employee View Personal Profile & Salary Details',
    preconditions: 'Logged in as EMPLOYEE',
    steps: '1. Navigate to /profile. 2. Review personal info, job title, department, manager name, base pay.',
    expected: 'All profile details display accurately. Policy and salary edit controls are hidden/disabled.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-EMP-002',
    module: 'Employee Self-Service',
    level: 'Security',
    role: 'EMPLOYEE',
    title: 'Employee Strict Policy & Salary Edit Restriction',
    preconditions: 'Logged in as EMPLOYEE',
    steps: '1. Attempt to edit salary component or policy fields on profile page.',
    expected: 'Input fields are read-only; no save action available for policy parameters.',
    priority: 'P0 - Critical',
    type: 'Security'
  },
  {
    id: 'TC-EMP-003',
    module: 'Employee Management',
    level: 'Functional',
    role: 'ADMIN',
    title: 'Admin Edit Employee Designation & Department',
    preconditions: 'Logged in as ADMIN',
    steps: '1. Go to /employees. 2. Click "Edit" on employee record. 3. Change Department to "Engineering". 4. Save.',
    expected: 'Employee profile updated in DB, success toast displayed, audit log entry created.',
    priority: 'P1 - High',
    type: 'Positive'
  },

  // ─── 4. ATTENDANCE, PUNCHING & GEOFENCING ──────────────────────────────────
  {
    id: 'TC-ATT-001',
    module: 'Attendance & Geofencing',
    level: 'Integration',
    role: 'EMPLOYEE',
    title: 'Web GPS Punch Inside Geofence Radius',
    preconditions: 'Browser mock location set inside HQ geofence (28.6139° N, 77.2090° E)',
    steps: '1. Go to /attendance. 2. Click "Web Punch In". 3. Allow location access.',
    expected: 'Coordinates captured, distance <= 100m, punch status "VERIFIED_INSIDE", timestamp logged.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-ATT-002',
    module: 'Attendance & Geofencing',
    level: 'Integration',
    role: 'EMPLOYEE',
    title: 'Web GPS Punch Outside Geofence Alert Trigger',
    preconditions: 'Browser location set 5 km away from HQ geofence',
    steps: '1. Click "Web Punch In" from remote location.',
    expected: 'Distance measured > geofence radius limit, punch flagged as "OUTSIDE_GEOFENCE", alert sent to manager.',
    priority: 'P0 - Critical',
    type: 'Boundary'
  },
  {
    id: 'TC-ATT-003',
    module: 'Attendance & Geofencing',
    level: 'User Scenario',
    role: 'EMPLOYEE',
    title: 'Submit Manual Attendance Regularization Request',
    preconditions: 'Employee missed a clock-out yesterday',
    steps: '1. Go to /attendance/regularize. 2. Select missing punch date. 3. Enter reason "Client site visit". 4. Submit.',
    expected: 'Regularization request created with status "PENDING", queued for Manager approval.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-ATT-004',
    module: 'Attendance & Geofencing',
    level: 'User Scenario',
    role: 'MANAGER',
    title: 'Manager Approval of Attendance Regularization',
    preconditions: 'Pending regularization request from direct report',
    steps: '1. Log in as MANAGER. 2. Go to /attendance/approvals. 3. Click "Approve".',
    expected: 'Status updated to "APPROVED", attendance record regularized, employee notified.',
    priority: 'P1 - High',
    type: 'Positive'
  },

  // ─── 5. SHIFTS & SCHEDULING ────────────────────────────────────────────────
  {
    id: 'TC-SHFT-001',
    module: 'Shifts & Scheduling',
    level: 'Functional',
    role: 'ADMIN',
    title: 'Create Shift Definition in Shift Library',
    preconditions: 'Logged in as ADMIN',
    steps: '1. Go to /shifts/library. 2. Click "Add Shift". 3. Enter Name: "Night Shift B", Start: 22:00, End: 06:00, Break: 45m. 4. Save.',
    expected: 'Shift template created and available in roster assignment list.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-SHFT-002',
    module: 'Shifts & Scheduling',
    level: 'User Scenario',
    role: 'MANAGER',
    title: 'Manager Weekly & Monthly Grid Roster Navigation',
    preconditions: 'Logged in as MANAGER (Vikram)',
    steps: '1. Open /shifts or /team-schedule. 2. Toggle between "Weekly View" and "Monthly View". 3. Navigate weeks.',
    expected: 'Grid view renders employee shifts seamlessly, weekly/monthly totals calculate accurately.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-SHFT-003',
    module: 'Shifts & Scheduling',
    level: 'Integration',
    role: 'MANAGER',
    title: 'Shift Collision & Double Booking Prevention',
    preconditions: 'Employee already assigned Day Shift (09:00 - 17:00)',
    steps: '1. Attempt to assign overlapping Night Shift (16:00 - 00:00) on same date.',
    expected: 'System displays collision alert "Shift overlap detected", prevents duplicate booking.',
    priority: 'P1 - High',
    type: 'Negative'
  },

  // ─── 6. LEAVES & ENCASHMENT ────────────────────────────────────────────────
  {
    id: 'TC-LV-001',
    module: 'Leaves & Encashment',
    level: 'Functional',
    role: 'EMPLOYEE',
    title: 'Submit Leave Application',
    preconditions: 'Logged in as EMPLOYEE (Sarah) with 10 Casual Leaves available',
    steps: '1. Go to /leaves. 2. Click "Apply Leave". 3. Select Casual Leave, dates Oct 10–12. 4. Submit.',
    expected: 'Leave request created in "PENDING" status, leave balance reserved.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-LV-002',
    module: 'Leaves & Encashment',
    level: 'Boundary',
    role: 'EMPLOYEE',
    title: 'Insufficient Leave Balance Validation',
    preconditions: 'Employee has 2 Sick Leaves remaining',
    steps: '1. Apply for 5 Sick Leaves.',
    expected: 'System blocks request with error "Insufficient Sick Leave balance (Available: 2, Requested: 5)".',
    priority: 'P1 - High',
    type: 'Boundary'
  },
  {
    id: 'TC-LV-003',
    module: 'Leaves & Encashment',
    level: 'User Scenario',
    role: 'MANAGER',
    title: 'Manager Reject Leave Request with Rejection Reason',
    preconditions: 'Pending leave request from team member',
    steps: '1. Log in as MANAGER. 2. Go to Leave Approvals. 3. Click "Reject". 4. Enter reason "Critical project launch". 5. Confirm.',
    expected: 'Leave status changed to "REJECTED", employee leave balance restored.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-LV-004',
    module: 'Leaves & Encashment',
    level: 'Integration',
    role: 'ADMIN',
    title: 'Annual Leave Encashment Calculation & Approval',
    preconditions: 'Employee has 15 unused Earned Leaves at year end',
    steps: '1. Go to /leaves/encashment. 2. Select employee. 3. Click "Calculate Encashment". 4. Approve.',
    expected: 'Encashment formula `(Basic / 30) * Days` computed correctly, amount queued for payroll.',
    priority: 'P1 - High',
    type: 'Positive'
  },

  // ─── 7. OVERTIME & POLICY ENGINE ───────────────────────────────────────────
  {
    id: 'TC-POL-001',
    module: 'Policy Engine',
    level: 'Unit/Functional',
    role: 'ADMIN',
    title: 'Configure Overtime Rate Multiplier Policy',
    preconditions: 'Logged in as ADMIN',
    steps: '1. Go to /policies. 2. Set Standard OT = 1.5x, Holiday OT = 2.0x. 3. Save Policy.',
    expected: 'Policy rules updated in DB, policy engine applies new rates to subsequent shifts.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-POL-002',
    module: 'Policy Engine',
    level: 'Integration',
    role: 'SYSTEM',
    title: 'Automated Overtime Evaluation on Shift Completion',
    preconditions: 'Shift duration is 8 hours. Employee worked 10.5 hours on Sunday.',
    steps: '1. System runs end-of-day attendance evaluation.',
    expected: 'System detects 2.5 excess hours, applies 2.0x Sunday OT rate, credits 5.0 payable OT hours.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },

  // ─── 8. REPORTS & REAL ANALYTICS ───────────────────────────────────────────
  {
    id: 'TC-REP-001',
    module: 'Reports & Analytics',
    level: 'Functional',
    role: 'ADMIN',
    title: 'Daily Attendance Summary Report Generation with Real Data',
    preconditions: 'Logged in as ADMIN',
    steps: '1. Go to /reports. 2. Select "Attendance Summary", Date Range "Current Month". 3. Click "Generate".',
    expected: 'Report renders real database metrics (no placeholder mock text), showing present/absent/late counts.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-REP-002',
    module: 'Reports & Analytics',
    level: 'Integration',
    role: 'ADMIN',
    title: 'Export Attendance Report to CSV / Excel',
    preconditions: 'Report displayed on screen',
    steps: '1. Click "Export to CSV".',
    expected: 'CSV file downloads with correct headers, UTF-8 encoding, exact row data matching screen report.',
    priority: 'P2 - Medium',
    type: 'Positive'
  },

  // ─── 9. ADD-ON 1: CORE HR SUITE & MARKETPLACE ──────────────────────────────
  {
    id: 'TC-HR-001',
    module: 'Add-on: Core HR Suite',
    level: 'Functional',
    role: 'ADMIN',
    title: 'Marketplace Add-on Activation & Subscription',
    preconditions: 'Logged in as ADMIN on /marketplace',
    steps: '1. Locate "Core HR Suite" card. 2. Toggle "Subscribe / Activate". 3. Confirm modal.',
    expected: 'Module status updates to "Active", HR Hub nav items visible in sidebar with "Add-on" badge.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-HR-002',
    module: 'Add-on: Core HR Suite',
    level: 'User Scenario',
    role: 'ADMIN',
    title: 'Complete Employee Onboarding Workflow',
    preconditions: 'Core HR Suite active',
    steps: '1. Go to /hr/onboarding. 2. Click "New Onboarding". 3. Fill employee details & joining date. 4. Assign Onboarding Checklist. 5. Save.',
    expected: 'Onboarding record created (hr_ prefix), checklist items assigned, welcome notification sent.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-HR-003',
    module: 'Add-on: Core HR Suite',
    level: 'User Scenario',
    role: 'ADMIN',
    title: 'Employee Offboarding & Exit Clearance Workflow',
    preconditions: 'Resigned employee record',
    steps: '1. Go to /hr/offboarding. 2. Initiate Offboarding. 3. Mark IT Asset Handover, Finance NOC as Completed. 4. Generate Exit Letter.',
    expected: 'Exit clearance completed, exit letter generated, employee account scheduled for deactivation.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-HR-004',
    module: 'Add-on: Core HR Suite',
    level: 'Functional',
    role: 'ALL',
    title: 'Interactive Organizational Hierarchy Tree',
    preconditions: 'HR module active',
    steps: '1. Go to /hr/org-chart. 2. Expand CEO -> Dept Heads -> Managers -> Direct Reports.',
    expected: 'Org tree renders hierarchy dynamically with employee photos, designations, department counts.',
    priority: 'P2 - Medium',
    type: 'Positive'
  },

  // ─── 10. ADD-ON 2: TIME & MATERIALS (T&M) PROJECT BILLING ─────────────────
  {
    id: 'TC-TM-001',
    module: 'Add-on: Time & Materials',
    level: 'Functional',
    role: 'ADMIN',
    title: 'Create Client & T&M Project with Hourly Rate Cards',
    preconditions: 'T&M module active on /tm',
    steps: '1. Go to /tm/projects. 2. Add Client "Acme Corp". 3. Add Project "Cloud Migration". 4. Set Rate Card: Senior Dev = $120/hr. 5. Save.',
    expected: 'Client and Project saved with tm_ domain prefix, rate card attached to project tasks.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-TM-002',
    module: 'Add-on: Time & Materials',
    level: 'User Scenario',
    role: 'EMPLOYEE',
    title: 'Employee T&M Timesheet Log Submission',
    preconditions: 'Employee assigned to T&M project task',
    steps: '1. Go to /tm/timesheets. 2. Select Project "Cloud Migration", Task "API Dev". 3. Log 7.5 hours with work notes. 4. Submit.',
    expected: 'Timesheet entry logged in "SUBMITTED" state, marked billable.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-TM-003',
    module: 'Add-on: Time & Materials',
    level: 'Integration',
    role: 'MANAGER',
    title: 'Timesheet Approval & Automated Invoice Generation',
    preconditions: 'Submitted timesheets available for billing period',
    steps: '1. Log in as MANAGER. 2. Go to /tm/invoices. 3. Select Client "Acme Corp", Period "Sep 2025". 4. Click "Generate Invoice".',
    expected: 'Invoice computed: Hours × Rate Card amount + tax. Invoice PDF preview generated with payment terms.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },

  // ─── 11. ADD-ON 3: AI BIOMETRIC ANTI-SPOOFING & SECURITY ─────────────────
  {
    id: 'TC-SEC-001',
    module: 'Add-on: AI Security Hub',
    level: 'Integration',
    role: 'EMPLOYEE',
    title: 'Real-Time Anti-Spoofing Liveness Verification on Punch',
    preconditions: 'AI Security module active',
    steps: '1. On Mobile/Web camera punch, capture selfie face. 2. System runs 3D passive liveness check.',
    expected: 'Liveness confidence score computed (e.g. 98.4%), spoof check passes, punch proceeds.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-SEC-002',
    module: 'Add-on: AI Security Hub',
    level: 'Security',
    role: 'EMPLOYEE',
    title: 'Photo Attack / Screen Playback Spoof Detection',
    preconditions: 'Tester presents photo printed on paper / tablet screen to camera',
    steps: '1. Attempt punch using printed photo image.',
    expected: 'AI engine detects low liveness (0.12 score), flags "SPOOF_ATTACK_DETECTED", blocks punch, logs alert in /security.',
    priority: 'P0 - Critical',
    type: 'Security'
  },
  {
    id: 'TC-SEC-003',
    module: 'Add-on: AI Security Hub',
    level: 'Functional',
    role: 'ADMIN',
    title: 'App Blacklist Management & Fake GPS Detection',
    preconditions: 'Logged in as ADMIN on /security/blacklist',
    steps: '1. Add package "com.fake.gps.location" to blacklist policy.',
    expected: 'Mobile app detects blacklisted package on device, blocks punch with security warning.',
    priority: 'P1 - High',
    type: 'Security'
  },

  // ─── 12. ADD-ON 4: AUTOMATED DIRECT PAYROLL DISBURSEMENT ───────────────────
  {
    id: 'TC-PAY-001',
    module: 'Add-on: Direct Payroll',
    level: 'Integration',
    role: 'ADMIN',
    title: 'Execute Monthly Payroll Run & Generate Bank Payment Batch',
    preconditions: 'Finalized attendance and leave encashment data ready',
    steps: '1. Go to /payroll-disbursement. 2. Select Run "Sep 2025 Payroll". 3. Click "Calculate Net Payroll". 4. Click "Approve & Generate Bank Transfer File".',
    expected: 'Net pay calculated for all employees, direct bank transfer file generated (NEFT/ACH), status "DISBURSED".',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-PAY-002',
    module: 'Add-on: Direct Payroll',
    level: 'User Scenario',
    role: 'EMPLOYEE',
    title: 'Earned Wage Access (EWA) On-Demand Salary Request',
    preconditions: 'Employee worked 15 days in current month, eligible for EWA',
    steps: '1. Go to /payroll-disbursement/ewa. 2. View accrued balance. 3. Request withdrawal ₹5,000. 4. Submit.',
    expected: 'EWA request approved against earned salary, transaction logged, deducted automatically from monthly net pay.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-PAY-003',
    module: 'Add-on: Direct Payroll',
    level: 'Functional',
    role: 'EMPLOYEE',
    title: 'Employee Tax Slip / Payslip Download',
    preconditions: 'Payroll run disbursed',
    steps: '1. Go to /payroll-disbursement/tax-slips. 2. Click "Download Payslip (PDF)" for Sep 2025.',
    expected: 'Payslip PDF generated displaying Basic, HRA, Allowances, PF deduction, TDS tax, Net Pay, Bank A/C details.',
    priority: 'P1 - High',
    type: 'Positive'
  },

  // ─── 13. ADD-ON 5: FIELD FORCE MANAGEMENT ─────────────────────────────────
  {
    id: 'TC-FF-001',
    module: 'Add-on: Field Force',
    level: 'Functional',
    role: 'MANAGER',
    title: 'Live Engineer Radar Map & Status Monitoring',
    preconditions: 'Field Force active on /field-force',
    steps: '1. Open Live Dispatch tab on /field-force. 2. Inspect radar panel.',
    expected: 'Engineers displayed with live status badges (On Site, Dispatched, Available, Off Duty) and GPS coordinates.',
    priority: 'P1 - High',
    type: 'Positive'
  },
  {
    id: 'TC-FF-002',
    module: 'Add-on: Field Force',
    level: 'User Scenario',
    role: 'MANAGER',
    title: 'Dispatch Engineer to Scheduled Field Job Order',
    preconditions: 'Unassigned job order "HQ HVAC Repair" in scheduled status',
    steps: '1. Click "Dispatch" on job order. 2. Select available engineer "Arjun Mehta". 3. Confirm.',
    expected: 'Job status changes to "dispatched", engineer status updates to "dispatched", push notification sent to mobile app.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-FF-003',
    module: 'Add-on: Field Force',
    level: 'Integration',
    role: 'EMPLOYEE',
    title: 'Field Engineer Site Check-In with Geofence Radius Verification',
    preconditions: 'Engineer arrives at client job site',
    steps: '1. Open Check-Ins tab / mobile app. 2. Click "Check-In at Site".',
    expected: 'System measures distance from site geofence; if <= 150m, status recorded as "VERIFIED_ON_SITE". If > 150m, flagged "OUTSIDE_GEOFENCE".',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-FF-004',
    module: 'Add-on: Field Force',
    level: 'Functional',
    role: 'MANAGER',
    title: 'Fleet Vehicle Tracking & Service Due Alerting',
    preconditions: 'Vehicle odometer near service limit',
    steps: '1. Go to /field-force/fleet. 2. Inspect vehicle cards.',
    expected: 'Vehicles display odometer, assigned engineer, and service warning badge if service is due within 2,000 km.',
    priority: 'P2 - Medium',
    type: 'Positive'
  },
  {
    id: 'TC-FF-005',
    module: 'Add-on: Field Force',
    level: 'User Scenario',
    role: 'MANAGER',
    title: 'Mileage Claim Approval & Payroll Queuing',
    preconditions: 'Submitted mileage claim (120 km @ ₹8/km = ₹960)',
    steps: '1. Go to /field-force/mileage. 2. Review trip route. 3. Click "Approve".',
    expected: 'Claim status updated to "APPROVED", reimbursement queued for next monthly payroll run.',
    priority: 'P1 - High',
    type: 'Positive'
  },

  // ─── 14. ADD-ON 6: MULTI-COUNTRY GLOBAL PAYROLL ENGINE ─────────────────────
  {
    id: 'TC-GPR-001',
    module: 'Add-on: Global Payroll',
    level: 'Functional',
    role: 'ADMIN',
    title: 'Browse 15 Country Profiles Across 7 Framework Clusters',
    preconditions: 'Global Payroll Engine active on /global-payroll',
    steps: '1. Go to /global-payroll/directory. 2. Filter by cluster "GCC". 3. Select country "UAE 🇦🇪".',
    expected: 'Displays UAE profile: 0% personal income tax, WPS compliance rule, EOSB gratuity 21d/30d formula, GPSSA national pension rates.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-GPR-002',
    module: 'Add-on: Global Payroll',
    level: 'Unit/Functional',
    role: 'ADMIN',
    title: 'India Gross-to-Net Payroll Calculation (TDS + EPF + ESI + Gratuity)',
    preconditions: 'On Interactive Calculator tab',
    steps: '1. Select Country "India 🇮🇳". 2. Enter Gross Annual = ₹1,200,000. 3. Basic % = 40%. 4. Click "Calculate".',
    expected: 'Accurately computes: Monthly Gross ₹100k, Basic ₹40k, Standard Deduction ₹75k, TDS income tax, EPF 12% capped at ₹1,800/mo, ESI 0%, net take-home, and employer cost.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-GPR-003',
    module: 'Add-on: Global Payroll',
    level: 'Unit/Functional',
    role: 'ADMIN',
    title: 'UAE Expat Payroll Calculation (0% Tax, 0% Expat SS, EOSB Accrual)',
    preconditions: 'On Interactive Calculator tab',
    steps: '1. Select Country "UAE 🇦🇪". 2. Enter Gross Annual = AED 240,000. 3. Toggle IsNational = False. 4. Click "Calculate".',
    expected: 'Income Tax = 0 (0%), Employee SS = 0, Net Monthly Take-Home = AED 20,000 (100%), EOSB gratuity annual accrual calculated on basic salary.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-GPR-004',
    module: 'Add-on: Global Payroll',
    level: 'Unit/Functional',
    role: 'ADMIN',
    title: 'Singapore CPF Calculation with Ordinary Wage Cap (S$7,400)',
    preconditions: 'On Interactive Calculator tab',
    steps: '1. Select Country "Singapore 🇸🇬". 2. Enter Gross Annual = S$180,000 (S$15k/mo). 3. Toggle IsNational = True. 4. Click "Calculate".',
    expected: 'Employee CPF contribution capped at 20% of S$7,400 OW ceiling = S$1,480/month. Employer CPF capped at 17% of S$7,400 = S$1,258/month.',
    priority: 'P0 - Critical',
    type: 'Boundary'
  },
  {
    id: 'TC-GPR-005',
    module: 'Add-on: Global Payroll',
    level: 'Unit/Functional',
    role: 'ADMIN',
    title: 'Germany Lohnsteuer & 4 Social Security Pillars Calculation',
    preconditions: 'On Interactive Calculator tab',
    steps: '1. Select Country "Germany 🇩🇪". 2. Enter Gross Annual = €80,000. 3. Click "Calculate".',
    expected: 'Calculates progressive Lohnsteuer tax, 4 SS pillars (Pension 9.3%, Health 7.3%, Unemployment 1.3%, Care 1.525%), total employer cost > €80,000.',
    priority: 'P0 - Critical',
    type: 'Positive'
  },
  {
    id: 'TC-GPR-006',
    module: 'Add-on: Global Payroll',
    level: 'Integration',
    role: 'ADMIN',
    title: 'Statutory Compliance Calendar Radar & Overdue Filing Warnings',
    preconditions: 'On /global-payroll/compliance',
    steps: '1. View Statutory Compliance Calendar table. 2. Filter by status "overdue" or "due_soon".',
    expected: 'Displays filings (India Form 24Q/EPF, UAE WPS, UK RTI FPS, US 941) with due dates, statutory authority names, and penalty warnings.',
    priority: 'P1 - High',
    type: 'Positive'
  },

  // ─── 15. MOBILE APP SIMULATOR ──────────────────────────────────────────────
  {
    id: 'TC-MOB-001',
    module: 'Mobile App Simulator',
    level: 'Functional',
    role: 'EMPLOYEE',
    title: 'Mobile App Punch In with Offline Buffer & Auto-Sync',
    preconditions: 'Open /mobile/simulator',
    steps: '1. Toggle "Offline Mode" ON. 2. Tap "Punch In". 3. Verify queued event in local buffer. 4. Toggle "Offline Mode" OFF.',
    expected: 'Queued punch event automatically syncs to backend API upon network restoration with original offline timestamp.',
    priority: 'P1 - High',
    type: 'Positive'
  },

  // ─── 16. MULTI-TENANCY & SECURITY ISOLATION ───────────────────────────────
  {
    id: 'TC-SEC-TENANT',
    module: 'Security & Multi-Tenancy',
    level: 'System',
    role: 'ALL',
    title: 'Strict Tenant Data Segregation Enforcement',
    preconditions: 'User authenticated with x-tenant-id: tenant-999',
    steps: '1. Send API requests for attendance, payroll runs, employees, and field force orders under tenant-999.',
    expected: 'API returns empty array / zero counts. Absolute zero data leakage from tenant-001.',
    priority: 'P0 - Critical',
    type: 'Security'
  },
  {
    id: 'TC-AUDIT-001',
    module: 'Audit & Compliance',
    level: 'System',
    role: 'ADMIN',
    title: 'Audit Log Explorer Event Recording',
    preconditions: 'Admin performs critical action (e.g. approve payroll, modify policy)',
    steps: '1. Go to /admin/audit-logs. 2. Search recent audit logs.',
    expected: 'Action is captured with timestamp, IP address, user persona, action code, before/after diff.',
    priority: 'P1 - High',
    type: 'Positive'
  }
];

// CSV Formatter
function generateCSV() {
  const headers = [
    'Test Case ID',
    'Module / Feature',
    'Test Level',
    'User Role',
    'Test Case Title',
    'Pre-conditions',
    'Test Steps',
    'Expected Result',
    'Priority',
    'Test Type'
  ];

  const escapeCSV = (str) => {
    if (!str) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = testCases.map(tc => [
    escapeCSV(tc.id),
    escapeCSV(tc.module),
    escapeCSV(tc.level),
    escapeCSV(tc.role),
    escapeCSV(tc.title),
    escapeCSV(tc.preconditions),
    escapeCSV(tc.steps),
    escapeCSV(tc.expected),
    escapeCSV(tc.priority),
    escapeCSV(tc.type)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

// Generate Excel-compatible XML Spreadsheet (.xls)
function generateExcelXML() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
   <Interior ss:Color="#312E81" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="Cell">
   <Font ss:Size="10"/>
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="P0">
   <Font ss:Bold="1" ss:Color="#991B1B" ss:Size="10"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
  </Style>
  <Style ss:ID="P1">
   <Font ss:Bold="1" ss:Color="#9A3412" ss:Size="10"/>
   <Interior ss:Color="#FFEDD5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
  </Style>
  <Style ss:ID="P2">
   <Font ss:Size="10"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Master Manual Test Suite">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="160"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>
   <Column ss:Width="250"/>
   <Column ss:Width="200"/>
   <Column ss:Width="300"/>
   <Column ss:Width="300"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Row ss:Height="28">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Case ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Module / Feature</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Level</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">User Role</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Case Title</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Pre-conditions</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Steps</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Expected Result</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Priority</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Type</Data></Cell>
   </Row>`;

  testCases.forEach(tc => {
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const pStyle = tc.priority.includes('P0') ? 'P0' : tc.priority.includes('P1') ? 'P1' : 'P2';

    xml += `
   <Row ss:Height="40">
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.id)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.module)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.level)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.role)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.title)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.preconditions)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.steps)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.expected)}</Data></Cell>
    <Cell ss:StyleID="${pStyle}"><Data ss:Type="String">${esc(tc.priority)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.type)}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}

// Write outputs
const csvContent = generateCSV();
const xmlContent = generateExcelXML();

const rootDir = process.cwd();
const csvPath = path.join(rootDir, 'TimeAndAttendance_Master_Manual_Test_Suite.csv');
const xlsPath = path.join(rootDir, 'TimeAndAttendance_Master_Manual_Test_Suite.xls');

fs.writeFileSync(csvPath, csvContent, 'utf-8');
fs.writeFileSync(xlsPath, xmlContent, 'utf-8');

console.log(`✅ CSV generated successfully at: ${csvPath}`);
console.log(`✅ Formatted Excel (.xls) generated successfully at: ${xlsPath}`);
console.log(`Total Test Cases generated: ${testCases.length}`);
