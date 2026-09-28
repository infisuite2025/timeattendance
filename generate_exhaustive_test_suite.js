import fs from 'fs';
import path from 'path';

// Master Exhaustive Field-Level Test Suite Generator
const testCases = [];

let tcCounter = 1;
function addTC(page, field, level, role, title, rule, pre, steps, input, expected, priority, type) {
  const id = `TC-FLD-${String(tcCounter++).padStart(4, '0')}`;
  testCases.push({
    id, page, field, level, role, title, rule, pre, steps, input, expected, priority, type
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. LOGIN & AUTHENTICATION PAGE (/login)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Login Page', 'Persona Dropdown', 'Unit/Field-Level', 'ALL', 'Persona Selection Default Value', 'Required dropdown selection', 'On /login page', '1. Click Persona dropdown. 2. Inspect available options.', 'ADMIN, MANAGER, EMPLOYEE', 'Dropdown contains 3 distinct personas: ADMIN (Naresh), MANAGER (Vikram), EMPLOYEE (Sarah). Default option is selected.', 'P0 - Critical', 'Positive');
addTC('Login Page', 'Persona Dropdown', 'Unit/Field-Level', 'ALL', 'Persona Selection Switch Behavior', 'Required', 'On /login page', '1. Select "MANAGER (Vikram)". 2. Observe avatar and title update.', 'MANAGER persona', 'Avatar icon updates to Manager branding, helper text shows "Logged in as Vikram Singh (Manager)".', 'P1 - High', 'UI/UX');
addTC('Login Page', 'Password Input', 'Unit/Field-Level', 'ALL', 'Password Masking Character Verification', 'Masked input (type="password")', 'On /login page', '1. Type password into input field.', 'Pass@123', 'Password characters are masked with dots/bullets.', 'P0 - Critical', 'Security');
addTC('Login Page', 'Password Input', 'Unit/Field-Level', 'ALL', 'Password Show/Hide Toggle Button', 'Interactive toggle', 'On /login page', '1. Type password. 2. Click Eye icon toggle.', 'Pass@123', 'Password text toggles between masked dots and plain text.', 'P2 - Medium', 'UI/UX');
addTC('Login Page', 'Password Input', 'Unit/Field-Level', 'ALL', 'Empty Password Submission Validation', 'Required field validation', 'On /login page', '1. Leave password input blank. 2. Click Sign In.', 'Empty string', 'Inline validation error "Password is required" displayed under input field; form submission prevented.', 'P0 - Critical', 'Negative');
addTC('Login Page', 'Password Input', 'Unit/Field-Level', 'ALL', 'SQL Injection Payload in Password Field', 'Sanitization check', 'On /login page', '1. Enter SQL injection payload in password.', "' OR '1'='1", 'Authentication fails cleanly; system sanitizes input, displays "Invalid credentials" without DB exception leaks.', 'P0 - Critical', 'Security');
addTC('Login Page', 'Password Input', 'Unit/Field-Level', 'ALL', 'XSS Script Payload in Password Field', 'XSS prevention', 'On /login page', '1. Enter XSS payload in password field.', '<script>alert(1)</script>', 'Input is encoded safely; no alert script executes; error message shown safely.', 'P0 - Critical', 'Security');
addTC('Login Page', 'Sign In Button', 'Unit/Field-Level', 'ALL', 'Sign In Button Loading State', 'State indicator', 'On /login page', '1. Fill credentials. 2. Click "Sign In".', 'Valid credentials', 'Button shows spinner icon, text changes to "Signing in...", button is disabled during API request.', 'P1 - High', 'UI/UX');
addTC('Login Page', 'Sign In Button', 'Unit/Field-Level', 'ALL', 'Enter Key Keyboard Submission Trigger', 'Form submission keypress', 'Password field focused', '1. Type password. 2. Press "Enter" key on keyboard.', 'Valid credentials', 'Form submits automatically without needing mouse click on Sign In button.', 'P2 - Medium', 'UI/UX');

// ═══════════════════════════════════════════════════════════════════════════
// 2. DASHBOARD / COMMAND CENTRE (/dashboard)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Dashboard', 'Top KPI Cards', 'Unit/Field-Level', 'ADMIN', 'Total Employees KPI Widget Format & Value', 'Integer display', 'Logged in as ADMIN', '1. View "Total Employees" KPI card.', 'Live DB query', 'Renders exact non-zero integer count (e.g. 1,250) with trend indicator.', 'P1 - High', 'Positive');
addTC('Dashboard', 'Top KPI Cards', 'Unit/Field-Level', 'ADMIN', 'Present Today KPI Widget Percentage Calculation', 'Percentage format', 'Logged in as ADMIN', '1. View "Present Today" KPI card.', 'Present count / Total count', 'Displays count and calculated percentage (e.g. 1,180 / 94.4%) matching database.', 'P1 - High', 'Positive');
addTC('Dashboard', 'Clock In Button', 'Unit/Field-Level', 'EMPLOYEE', 'Clock In Button Initial State & Click Action', 'Stateful button toggle', 'Logged in as EMPLOYEE (Not clocked in)', '1. View Clock In button on dashboard.', 'Click action', 'Button displays green icon "Clock In". Upon click, triggers API, starts live timer widget.', 'P0 - Critical', 'Positive');
addTC('Dashboard', 'Clock Out Button', 'Unit/Field-Level', 'EMPLOYEE', 'Clock Out Button Active Shift State', 'Stateful button toggle', 'Logged in as EMPLOYEE (Clocked in)', '1. View Clock Out button.', 'Click action', 'Button displays red/amber icon "Clock Out", shows elapsed shift timer (e.g. 04:32:15). Upon click, records end time.', 'P0 - Critical', 'Positive');
addTC('Dashboard', 'Pending Approvals Badge', 'Unit/Field-Level', 'MANAGER', 'Pending Leave Requests Badge Counter', 'Numeric badge', 'Logged in as MANAGER with 3 pending requests', '1. Inspect header notification badge.', 'Pending requests count = 3', 'Badge displays "3" in red circle; clicking opens approval list.', 'P1 - High', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 3. EMPLOYEE PROFILE & MANAGEMENT (/profile & /employees)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Employee Profile', 'Full Name Input', 'Unit/Field-Level', 'ADMIN', 'Full Name Required & Max Length Check', 'Required, Text max 100 chars', 'Editing Employee profile', '1. Clear Full Name input. 2. Attempt Save.', 'Empty string', 'Inline validation error "Full Name is required".', 'P1 - High', 'Negative');
addTC('Employee Profile', 'Full Name Input', 'Unit/Field-Level', 'ADMIN', 'Full Name Special Character & Accent Support', 'Unicode string support', 'Editing Employee profile', '1. Enter name with accents & hyphens.', 'François René-D\'Silva', 'Name saves correctly with accents preserved in DB and UI.', 'P2 - Medium', 'Positive');
addTC('Employee Profile', 'Email Address Input', 'Unit/Field-Level', 'ADMIN', 'Email Format Syntax Validation', 'Email regex format', 'Editing Employee profile', '1. Enter invalid email syntax.', 'sarah.jenkins@company', 'Inline error "Please enter a valid email address (e.g. user@domain.com)".', 'P0 - Critical', 'Negative');
addTC('Employee Profile', 'Email Address Input', 'Unit/Field-Level', 'ADMIN', 'Duplicate Email Uniqueness Check', 'Unique constraint', 'Editing Employee profile', '1. Enter email already assigned to Vikram.', 'vikram.singh@company.com', 'API returns error "Email address already registered to another employee".', 'P0 - Critical', 'Negative');
addTC('Employee Profile', 'Employee Code Input', 'Unit/Field-Level', 'ADMIN', 'Employee Code Read-Only / Immutable Check', 'Immutable primary identifier', 'Editing Employee profile', '1. Inspect Employee Code field.', 'EMP-1001', 'Field is disabled / read-only; cannot be altered once created.', 'P1 - High', 'Security');
addTC('Employee Profile', 'Department Dropdown', 'Unit/Field-Level', 'ADMIN', 'Department Selection Dropdown List', 'Enum selection', 'Editing Employee profile', '1. Click Department dropdown.', 'Engineering, HR, Sales, Operations, Finance', 'List contains all configured active company departments.', 'P2 - Medium', 'Positive');
addTC('Employee Profile', 'Designation Input', 'Unit/Field-Level', 'ADMIN', 'Designation Max Length 50 Chars', 'String max 50 chars', 'Editing Employee profile', '1. Type designation exceeding 50 chars.', 'Senior Lead Principal Staff Software System Architect Specialist', 'Input truncates at 50 characters or shows validation warning.', 'P2 - Medium', 'Boundary');
addTC('Employee Profile', 'Date of Joining Picker', 'Unit/Field-Level', 'ADMIN', 'Date of Joining Format & Future Date Warning', 'ISO Date YYYY-MM-DD', 'Editing Employee profile', '1. Select joining date in future (e.g. 2026-12-01).', '2026-12-01', 'Warning badge displayed "Future Joining Date". Saved successfully.', 'P2 - Medium', 'Positive');
addTC('Employee Profile', 'Base Salary Input', 'Unit/Field-Level', 'ADMIN', 'Base Salary Non-Negative Numeric Format', 'Numeric > 0, max 2 decimal places', 'Editing Employee profile', '1. Enter negative salary.', '-50000', 'Inline error "Base Salary must be a positive number".', 'P0 - Critical', 'Negative');
addTC('Employee Profile', 'Base Salary Input', 'Unit/Field-Level', 'EMPLOYEE', 'Base Salary Visibility & Edit Lock for Employee Persona', 'Role-restricted edit', 'Logged in as EMPLOYEE', '1. Open /profile page. 2. Inspect Base Salary field.', 'Sarah profile', 'Base salary displays value (or redacted as per privacy setting), EDIT button is completely hidden.', 'P0 - Critical', 'Security');

// ═══════════════════════════════════════════════════════════════════════════
// 4. ATTENDANCE & GEOFENCING PAGE (/attendance & /geofencing)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Geofencing', 'Latitude Input', 'Unit/Field-Level', 'ADMIN', 'Latitude Range Validation (-90 to +90)', 'Decimal -90.0 to +90.0', 'On /geofencing config', '1. Enter latitude out of range.', '105.4321', 'Validation error "Latitude must be between -90 and +90 degrees".', 'P1 - High', 'Boundary');
addTC('Geofencing', 'Longitude Input', 'Unit/Field-Level', 'ADMIN', 'Longitude Range Validation (-180 to +180)', 'Decimal -180.0 to +180.0', 'On /geofencing config', '1. Enter longitude out of range.', '-200.1234', 'Validation error "Longitude must be between -180 and +180 degrees".', 'P1 - High', 'Boundary');
addTC('Geofencing', 'Geofence Radius Input', 'Unit/Field-Level', 'ADMIN', 'Radius Minimum Value Validation (>= 10m)', 'Integer 10 to 5000 meters', 'On /geofencing config', '1. Enter radius = 0m or -5m.', '0', 'Validation error "Radius must be at least 10 meters".', 'P1 - High', 'Boundary');
addTC('Attendance', 'Punch Notes Input', 'Unit/Field-Level', 'EMPLOYEE', 'Optional Punch Notes Max 200 Chars', 'Optional text max 200', 'On /attendance web punch modal', '1. Enter 250 characters note. 2. Punch.', 'Text string > 200 chars', 'Note truncates at 200 characters cleanly.', 'P2 - Medium', 'Boundary');
addTC('Attendance', 'On-Site Status Badge', 'Unit/Field-Level', 'EMPLOYEE', 'Geofence Verification Status Badge Render', 'Enum status badge', 'After GPS punch', '1. Inspect status badge.', 'Distance <= 100m', 'Displays green badge "VERIFIED_INSIDE (42m from site)".', 'P0 - Critical', 'Positive');
addTC('Attendance', 'Outside Radius Alert Badge', 'Unit/Field-Level', 'EMPLOYEE', 'Outside Geofence Red Warning Render', 'Enum status badge', 'After GPS punch 2km away', '1. Inspect status badge.', 'Distance = 2,450m', 'Displays red warning badge "OUTSIDE_GEOFENCE (2,450m from site)".', 'P0 - Critical', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 5. ATTENDANCE REGULARIZATION (/attendance/regularize)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Regularization', 'Missing Date Selector', 'Unit/Field-Level', 'EMPLOYEE', 'Date Selection Limit to Past 30 Days', 'Date picker past 30d', 'On /attendance/regularize', '1. Attempt selecting date 60 days ago or future date.', '2024-01-01', 'Future dates disabled; dates older than 30 days show warning or disabled.', 'P1 - High', 'Boundary');
addTC('Regularization', 'Regularization Reason Dropdown', 'Unit/Field-Level', 'EMPLOYEE', 'Reason Classification Select Options', 'Required Enum', 'On /attendance/regularize', '1. Open Reason dropdown.', 'Client Site Visit, Technical Issue, Forgot Clock-Out, Medical Emergency, Other', 'Contains 5 predefined categories.', 'P2 - Medium', 'Positive');
addTC('Regularization', 'Detailed Remarks Textarea', 'Unit/Field-Level', 'EMPLOYEE', 'Remarks Required Min Length 10 Chars', 'Required string min 10 chars', 'On /attendance/regularize', '1. Type 3 characters "Did". 2. Click Submit.', 'Short text', 'Validation error "Remarks must be at least 10 characters explaining reason".', 'P1 - High', 'Negative');

// ═══════════════════════════════════════════════════════════════════════════
// 6. SHIFTS & SCHEDULING (/shifts & /team-schedule)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Shift Library', 'Shift Name Input', 'Unit/Field-Level', 'ADMIN', 'Shift Name Unique Validation', 'Required unique text', 'On /shifts/library', '1. Create shift with existing name "General Day Shift".', 'General Day Shift', 'Error message "A shift with name \'General Day Shift\' already exists".', 'P1 - High', 'Negative');
addTC('Shift Library', 'Start Time Input', 'Unit/Field-Level', 'ADMIN', 'Start Time 24h Time Format (HH:mm)', 'Time HH:mm', 'On /shifts/library', '1. Select 09:00.', '09:00', 'Start time stored accurately in 24h format.', 'P1 - High', 'Positive');
addTC('Shift Library', 'End Time Input', 'Unit/Field-Level', 'ADMIN', 'End Time Overnight Cross-Midnight Support', 'Time HH:mm', 'On /shifts/library', '1. Set Start = 22:00, End = 06:00.', 'Start 22:00, End 06:00', 'System recognizes overnight shift (8 hours total across midnight).', 'P0 - Critical', 'Positive');
addTC('Shift Library', 'Break Duration Input', 'Unit/Field-Level', 'ADMIN', 'Break Duration Non-Negative Minutes', 'Integer 0 to 180 mins', 'On /shifts/library', '1. Enter break = -15 mins.', '-15', 'Validation error "Break duration cannot be negative".', 'P2 - Medium', 'Negative');
addTC('Team Schedule', 'Roster Grid Cell', 'Unit/Field-Level', 'MANAGER', 'Grid Cell Drag & Drop Shift Assign', 'Interactive grid cell', 'On /team-schedule weekly view', '1. Drag "Night Shift" onto Employee Sarah on Tuesday cell.', 'Drag & drop action', 'Cell updates immediately to Night Shift color badge, unsaved indicator shown.', 'P1 - High', 'UI/UX');

// ═══════════════════════════════════════════════════════════════════════════
// 7. LEAVES & ENCASHMENT (/leaves)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Leave Application', 'Leave Type Dropdown', 'Unit/Field-Level', 'EMPLOYEE', 'Leave Type Selection List & Balance Display', 'Enum dropdown', 'On /leaves apply modal', '1. Open Leave Type dropdown.', 'Casual (8 left), Sick (5 left), Earned (12 left)', 'Dropdown shows each leave type alongside real available balance counter.', 'P0 - Critical', 'Positive');
addTC('Leave Application', 'Start Date Picker', 'Unit/Field-Level', 'EMPLOYEE', 'Start Date Selection Rule', 'Date picker', 'On /leaves apply modal', '1. Select Start Date.', '2025-10-15', 'Start date selected; End date picker auto-sets minimum date to Start Date.', 'P1 - High', 'Positive');
addTC('Leave Application', 'End Date Picker', 'Unit/Field-Level', 'EMPLOYEE', 'End Date Before Start Date Validation', 'Date logic end >= start', 'On /leaves apply modal', '1. Set Start Date = 2025-10-15. 2. Set End Date = 2025-10-10.', 'End before Start', 'Validation error "End Date cannot be earlier than Start Date".', 'P0 - Critical', 'Negative');
addTC('Leave Application', 'Half Day Checkbox', 'Unit/Field-Level', 'EMPLOYEE', 'Half Day Toggle & Session Selection (First/Second Half)', 'Boolean + Enum', 'On /leaves apply modal', '1. Check "Half Day". 2. Select "First Half".', 'Half Day = true', 'Leave duration calculated as 0.5 days instead of 1.0 day.', 'P1 - High', 'Positive');
addTC('Leave Encashment', 'Encashment Days Input', 'Unit/Field-Level', 'ADMIN', 'Encashment Days Max Limit Check', 'Integer <= Available Earned Leave', 'On /leaves/encashment', '1. Employee has 10 Earned Leaves. Enter 15 days encashment.', '15', 'Validation error "Encashment days (15) cannot exceed available Earned Leave balance (10)".', 'P0 - Critical', 'Boundary');
addTC('Leave Encashment', 'Calculated Amount Preview', 'Unit/Field-Level', 'ADMIN', 'Encashment Formula Preview Display', 'Currency formula calculation', 'On /leaves/encashment', '1. Select employee with ₹60,000 Basic and 5 Encashment Days.', 'Basic = 60000, Days = 5', 'Formula preview displays `(₹60,000 / 30) × 5 = ₹10,000` accurately.', 'P0 - Critical', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 8. OVERTIME & POLICY ENGINE (/policies)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Policy Engine', 'Standard OT Multiplier Input', 'Unit/Field-Level', 'ADMIN', 'OT Multiplier Range Validation (1.0x to 3.0x)', 'Decimal 1.0 to 3.0', 'On /policies page', '1. Enter OT multiplier = 0.5x or 5.0x.', '0.5', 'Validation error "Overtime multiplier must be between 1.0x and 3.0x".', 'P1 - High', 'Boundary');
addTC('Policy Engine', 'Max OT Hours Per Day Input', 'Unit/Field-Level', 'ADMIN', 'Max Daily OT Limit (0 to 8 hours)', 'Integer 0 to 8', 'On /policies page', '1. Enter Max OT = 12 hours.', '12', 'Validation error "Max OT hours per day cannot exceed statutory limit of 8 hours".', 'P1 - High', 'Boundary');
addTC('Policy Engine', 'Policy Save Button', 'Unit/Field-Level', 'EMPLOYEE', 'Save Policy Button Hidden for Employee Persona', 'Role-based authorization', 'Logged in as EMPLOYEE on /policies', '1. Inspect page controls.', 'Sarah persona', 'Save / Edit buttons are completely hidden; text displays "Read-Only Mode".', 'P0 - Critical', 'Security');

// ═══════════════════════════════════════════════════════════════════════════
// 9. REPORTS & ANALYTICS (/reports)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Reports Hub', 'Report Type Dropdown', 'Unit/Field-Level', 'ADMIN', 'Report Classification Options', 'Required Enum', 'On /reports page', '1. Click Report Type dropdown.', 'Attendance Summary, Late Coming, Overtime, Leave Balance, Audit Trail', 'Contains all 5 standard company report classifications.', 'P1 - High', 'Positive');
addTC('Reports Hub', 'Date Range Picker', 'Unit/Field-Level', 'ADMIN', 'Custom Date Range Filter', 'Date range YYYY-MM-DD', 'On /reports page', '1. Select Date Range: 2025-09-01 to 2025-09-15.', 'Start 09-01, End 09-15', 'Report table filters results strictly within selected 15-day date range.', 'P1 - High', 'Positive');
addTC('Reports Hub', 'Export to CSV Button', 'Unit/Field-Level', 'ADMIN', 'CSV Download Trigger & Format Verification', 'File download trigger', 'Report displayed on screen', '1. Click "Export to CSV".', 'Click event', 'Browser downloads `.csv` file with correct headers, UTF-8 BOM, and matching table rows.', 'P2 - Medium', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 10. ADD-ON 1: CORE HR SUITE & MARKETPLACE (/hr & /marketplace)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Marketplace', 'Add-on Subscribe Toggle', 'Unit/Field-Level', 'ADMIN', 'Add-on Activation Toggle Switch', 'Boolean toggle', 'On /marketplace', '1. Toggle "Core HR Suite" switch to ON.', 'Toggle click', 'Modal appears confirming subscription cost; upon confirmation, module status becomes "Active".', 'P0 - Critical', 'Positive');
addTC('Core HR', 'Onboarding Employee Name', 'Unit/Field-Level', 'ADMIN', 'New Hire Onboarding Required Name', 'Required string', 'On /hr/onboarding modal', '1. Leave Name blank. 2. Submit.', 'Empty string', 'Validation error "Onboarding Employee Name is required".', 'P1 - High', 'Negative');
addTC('Core HR', 'Asset Clearance Checkbox', 'Unit/Field-Level', 'ADMIN', 'Exit Clearance IT Asset Handover Toggle', 'Boolean checkbox', 'On /hr/offboarding clearance', '1. Check "Laptop Returned". 2. Check "ID Badge Returned".', 'Checked = true', 'Clearance progress updates to 100%; "Generate Exit Letter" button becomes enabled.', 'P1 - High', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 11. ADD-ON 2: TIME & MATERIALS (T&M) PROJECT BILLING (/tm)
// ═══════════════════════════════════════════════════════════════════════════
addTC('T&M Billing', 'Client Name Input', 'Unit/Field-Level', 'ADMIN', 'Client Name Unique Validation', 'Required unique text', 'On /tm/clients', '1. Add Client with existing name "Acme Corp".', 'Acme Corp', 'Error message "Client \'Acme Corp\' already exists".', 'P1 - High', 'Negative');
addTC('T&M Billing', 'Hourly Rate Input', 'Unit/Field-Level', 'ADMIN', 'Rate Card Hourly Billing Rate (> $0)', 'Numeric > 0', 'On /tm/rate-cards', '1. Enter hourly rate = $0 or -$50.', '0', 'Validation error "Hourly rate must be greater than 0".', 'P0 - Critical', 'Boundary');
addTC('T&M Billing', 'Timesheet Hours Logged Input', 'Unit/Field-Level', 'EMPLOYEE', 'Timesheet Daily Hours Limit (0.5 to 24.0 hrs)', 'Decimal 0.5 to 24.0', 'On /tm/timesheets', '1. Enter hours logged = 28 hrs.', '28', 'Validation error "Hours logged cannot exceed 24 hours per day".', 'P0 - Critical', 'Boundary');
addTC('T&M Billing', 'Invoice Currency Dropdown', 'Unit/Field-Level', 'ADMIN', 'Multi-Currency Selection (USD, EUR, GBP, INR, AED)', 'Enum dropdown', 'On /tm/invoices', '1. Select Currency "AED".', 'AED', 'Invoice summary converts currency symbol to "AED " and formats decimal totals accordingly.', 'P1 - High', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 12. ADD-ON 3: AI BIOMETRIC ANTI-SPOOFING (/security)
// ═══════════════════════════════════════════════════════════════════════════
addTC('AI Security', 'Liveness Score Threshold Slider', 'Unit/Field-Level', 'ADMIN', 'Liveness Confidence Threshold Setting (50% to 99%)', 'Range slider 0.50 to 0.99', 'On /security/settings', '1. Drag slider to 95%. 2. Save.', '0.95', 'Punches with liveness score < 95% will be automatically rejected as spoof attempts.', 'P0 - Critical', 'Positive');
addTC('AI Security', 'App Blacklist Package Name Input', 'Unit/Field-Level', 'ADMIN', 'Blacklist Package Name Format Validation', 'Android package format (com.xxx.yyy)', 'On /security/blacklist', '1. Enter invalid package format "fake-gps".', 'fake-gps', 'Validation error "Package name must follow reverse-domain format (e.g. com.fake.gps)".', 'P2 - Medium', 'Negative');

// ═══════════════════════════════════════════════════════════════════════════
// 13. ADD-ON 4: AUTOMATED DIRECT PAYROLL DISBURSEMENT (/payroll-disbursement)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Direct Payroll', 'Bank Account Number Input', 'Unit/Field-Level', 'ADMIN', 'Bank Account Number Format & Length', 'Digits 9 to 18 chars', 'On /payroll-disbursement/bank-accounts', '1. Enter non-numeric chars "ABC12345".', 'ABC12345', 'Validation error "Bank Account Number must contain digits only".', 'P0 - Critical', 'Negative');
addTC('Direct Payroll', 'IFSC / IBAN / ABA Code Input', 'Unit/Field-Level', 'ADMIN', 'Bank Routing Code Syntax Validation', 'Alpha-numeric syntax', 'On /payroll-disbursement/bank-accounts', '1. Enter valid IFSC "SBIN0001234".', 'SBIN0001234', 'Routing code validated successfully; bank branch auto-populated.', 'P1 - High', 'Positive');
addTC('Direct Payroll', 'EWA Requested Amount Input', 'Unit/Field-Level', 'EMPLOYEE', 'Earned Wage Access Available Accrued Limit Check', 'Numeric <= Accrued Salary', 'On /payroll-disbursement/ewa', '1. Accrued Salary = ₹15,000. Enter withdrawal request = ₹25,000.', '25000', 'Validation error "Requested amount exceeds max available accrued balance of ₹15,000".', 'P0 - Critical', 'Boundary');

// ═══════════════════════════════════════════════════════════════════════════
// 14. ADD-ON 5: FIELD FORCE MANAGEMENT (/field-force)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Field Force', 'Job Priority Dropdown', 'Unit/Field-Level', 'MANAGER', 'Job Order Priority Enum Options', 'Required Enum', 'On /field-force/jobs modal', '1. Open Priority dropdown.', 'low, normal, high, critical', 'Contains 4 priority levels with distinct color-coding (Critical = Red border).', 'P1 - High', 'Positive');
addTC('Field Force', 'Odometer Reading Input', 'Unit/Field-Level', 'MANAGER', 'Fleet Odometer Non-Decreasing Check', 'Integer >= Current Odometer', 'On /field-force/fleet', '1. Current Odometer = 45,000 km. Enter new reading = 42,000 km.', '42000', 'Validation error "New odometer reading cannot be less than current odometer (45,000 km)".', 'P1 - High', 'Negative');
addTC('Field Force', 'Mileage Distance Km Input', 'Unit/Field-Level', 'EMPLOYEE', 'Mileage Claim Distance Range Check (0.1 to 1000 km)', 'Numeric 0.1 to 1000.0', 'On /field-force/mileage', '1. Enter distance = -50 km.', '-50', 'Validation error "Distance travelled must be greater than 0 km".', 'P1 - High', 'Negative');

// ═══════════════════════════════════════════════════════════════════════════
// 15. ADD-ON 6: MULTI-COUNTRY GLOBAL PAYROLL ENGINE (/global-payroll)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Global Payroll', 'Country Selector Dropdown', 'Unit/Field-Level', 'ADMIN', '15 Country Profiles Availability', 'Enum select 15 codes', 'On /global-payroll/calculator', '1. Open Country dropdown.', 'IN, AE, SA, QA, DE, FR, ES, GB, AU, CA, US, BR, JP, SG, KR, SE', 'Lists all 15 supported country rate-table profiles with flags and currency symbols.', 'P0 - Critical', 'Positive');
addTC('Global Payroll', 'Gross Annual Salary Input', 'Unit/Field-Level', 'ADMIN', 'Gross Annual Salary Positive Numeric Input', 'Numeric > 0', 'On /global-payroll/calculator', '1. Enter Gross Annual = 0 or -10000.', '0', 'Validation error "Gross Annual Salary must be greater than 0".', 'P0 - Critical', 'Negative');
addTC('Global Payroll', 'Basic Salary % Slider', 'Unit/Field-Level', 'ADMIN', 'Basic Salary Range Slider (30% to 80%)', 'Range 0.30 to 0.80', 'On /global-payroll/calculator', '1. Drag slider to 50%.', '0.50', 'Calculates Basic Annual = 50% of Gross Annual; updates EPF/EOSB basis in real-time.', 'P1 - High', 'Positive');
addTC('Global Payroll', 'Years of Service Input', 'Unit/Field-Level', 'ADMIN', 'Years of Service Integer Input (1 to 30 years)', 'Integer 1 to 30', 'On /global-payroll/calculator', '1. Enter Years = 6 for UAE profile.', '6', 'EOSB gratuity engine applies 21 days/year for first 5 years + 30 days/year for year 6.', 'P0 - Critical', 'Positive');
addTC('Global Payroll', 'IsNational Checkbox Toggle', 'Unit/Field-Level', 'ADMIN', 'GCC National Social Security Pension Applicability Toggle', 'Boolean checkbox', 'On /global-payroll/calculator (UAE/Saudi selected)', '1. Check "Is Country National".', 'Checked = true', 'Applies GPSSA 5% employee + 12.5% employer pension for UAE national; 0% if unchecked (expat).', 'P0 - Critical', 'Positive');
addTC('Global Payroll', 'Net Take-Home Calculation Display', 'Unit/Field-Level', 'ADMIN', 'Gross-to-Net Formula Output Accuracy', 'Computed currency output', 'After calculation', '1. Inspect Net Annual output.', 'Gross - Tax - EmpSS', 'Net Annual equals `Gross Annual - Income Tax - Total Employee Social Security` exactly.', 'P0 - Critical', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 16. MOBILE APP SIMULATOR (/mobile)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Mobile Simulator', 'Offline Mode Toggle', 'Unit/Field-Level', 'EMPLOYEE', 'Offline Network Simulation Switch', 'Boolean switch', 'On /mobile/simulator', '1. Toggle "Offline Mode" ON.', 'Offline = true', 'Mobile status changes to "OFFLINE (Queuing punches locally)", banner turns orange.', 'P1 - High', 'Positive');
addTC('Mobile Simulator', 'Buffered Events Queue Counter', 'Unit/Field-Level', 'EMPLOYEE', 'Offline Queue Item Counter', 'Integer counter', 'Offline mode enabled', '1. Punch In twice while offline.', '2 punches offline', 'Buffer counter displays "2 Pending Events Queued".', 'P1 - High', 'Positive');

// ═══════════════════════════════════════════════════════════════════════════
// 17. MULTI-TENANCY & AUDIT LOGS (/admin/audit-logs)
// ═══════════════════════════════════════════════════════════════════════════
addTC('Multi-Tenancy', 'x-tenant-id API Header', 'Unit/Field-Level', 'SYSTEM', 'Tenant Header Segregation Check', 'Header string validation', 'API Request', '1. Send request with header `x-tenant-id: tenant-999`.', 'tenant-999', 'Returns empty array for tenant-001 data; absolute zero cross-tenant data leakage.', 'P0 - Critical', 'Security');
addTC('Audit Logs', 'Action Filter Dropdown', 'Unit/Field-Level', 'ADMIN', 'Audit Event Action Classification Filter', 'Enum dropdown', 'On /admin/audit-logs', '1. Select Action "PAYROLL_APPROVED".', 'PAYROLL_APPROVED', 'Audit log table filters strictly for payroll approval audit entries with timestamp and user ID.', 'P1 - High', 'Positive');

// CSV Formatter
function generateCSV() {
  const headers = [
    'Test Case ID',
    'Page / View',
    'Component / Field Name',
    'Test Level',
    'User Role',
    'Test Case Title',
    'Field Validation Rule',
    'Pre-conditions',
    'Test Steps',
    'Sample Input Data',
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
    escapeCSV(tc.page),
    escapeCSV(tc.field),
    escapeCSV(tc.level),
    escapeCSV(tc.role),
    escapeCSV(tc.title),
    escapeCSV(tc.rule),
    escapeCSV(tc.pre),
    escapeCSV(tc.steps),
    escapeCSV(tc.input),
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
   <Interior ss:Color="#1E1B4B" ss:Pattern="Solid"/>
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
 <Worksheet ss:Name="Exhaustive Field Level Tests">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="140"/>
   <Column ss:Width="160"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>
   <Column ss:Width="240"/>
   <Column ss:Width="180"/>
   <Column ss:Width="180"/>
   <Column ss:Width="260"/>
   <Column ss:Width="140"/>
   <Column ss:Width="280"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Row ss:Height="28">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Case ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Page / View</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Component / Field</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Level</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">User Role</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Case Title</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Field Validation Rule</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Pre-conditions</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Steps</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Sample Input Data</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Expected Result</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Priority</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Type</Data></Cell>
   </Row>`;

  testCases.forEach(tc => {
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const pStyle = tc.priority.includes('P0') ? 'P0' : tc.priority.includes('P1') ? 'P1' : 'P2';

    xml += `
   <Row ss:Height="45">
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.id)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.page)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.field)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.level)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.role)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.title)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.rule)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.pre)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.steps)}</Data></Cell>
    <Cell ss:StyleID="Cell"><Data ss:Type="String">${esc(tc.input)}</Data></Cell>
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

const csvContent = generateCSV();
const xmlContent = generateExcelXML();

const rootDir = process.cwd();
const csvPath = path.join(rootDir, 'TimeAndAttendance_Granular_Field_Level_Test_Suite.csv');
const xlsPath = path.join(rootDir, 'TimeAndAttendance_Granular_Field_Level_Test_Suite.xls');

fs.writeFileSync(csvPath, csvContent, 'utf-8');
fs.writeFileSync(xlsPath, xmlContent, 'utf-8');

console.log(`✅ CSV generated: ${csvPath}`);
console.log(`✅ Excel (.xls) generated: ${xlsPath}`);
console.log(`Total Granular Field-Level Test Cases: ${testCases.length}`);
