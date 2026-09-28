-- =========================================================================
-- InfiTimePro - Enterprise Time & Attendance SaaS Platform
-- Database: infi_timepro_db
-- Seed: 001_seed_demo_data.sql
-- =========================================================================

USE infi_timepro_db;

-- 1. Insert Demo Tenants
INSERT INTO tp_tenants (id, code, name, subdomain, status, default_timezone, default_currency, default_language, date_format, time_format)
VALUES 
('ten_acme_001', 'ACME', 'ACME Corporation Global', 'acme', 'active', 'Asia/Kolkata', 'INR', 'en-US', 'DD/MM/YYYY', '12h'),
('ten_tech_002', 'TECH', 'TechCorp Worldwide', 'techcorp', 'active', 'America/New_York', 'USD', 'en-US', 'YYYY-MM-DD', '24h')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Core Locations
INSERT INTO tp_locations (id, tenant_id, code, name, address_line1, city, state, country, postal_code, timezone, latitude, longitude, geofence_radius_meters)
VALUES
('loc_hyd_001', 'ten_acme_001', 'LOC-HYD', 'Hyderabad Main Office', 'Plot No. 5, HITEC City, Madhapur', 'Hyderabad', 'Telangana', 'India', '500081', 'Asia/Kolkata', 17.44350000, 78.37720000, 150),
('loc_blr_002', 'ten_acme_001', 'LOC-BLR', 'Bengaluru HQ', 'Koramangala 4th Block', 'Bengaluru', 'Karnataka', 'India', '560034', 'Asia/Kolkata', 12.93520000, 77.62450000, 200),
('loc_mum_003', 'ten_acme_001', 'LOC-MUM', 'Mumbai Office', 'Bandra Kurla Complex', 'Mumbai', 'Maharashtra', 'India', '400051', 'Asia/Kolkata', 19.06640000, 72.86770000, 150),
('loc_del_004', 'ten_acme_001', 'LOC-DEL', 'Delhi Office', 'Connaught Place', 'New Delhi', 'Delhi', 'India', '110001', 'Asia/Kolkata', 28.63040000, 77.21770000, 150),
('loc_chn_005', 'ten_acme_001', 'LOC-CHN', 'Chennai Plant', 'Sriperumbudur Industrial Corridor', 'Chennai', 'Tamil Nadu', 'India', '602105', 'Asia/Kolkata', 12.97160000, 79.94160000, 500)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Departments
INSERT INTO tp_departments (id, tenant_id, code, name)
VALUES
('dept_eng_001', 'ten_acme_001', 'ENG', 'Engineering'),
('dept_prod_002', 'ten_acme_001', 'PROD', 'Product'),
('dept_sales_003', 'ten_acme_001', 'SALES', 'Sales & Marketing'),
('dept_hr_004', 'ten_acme_001', 'HR', 'Human Resources'),
('dept_fin_005', 'ten_acme_001', 'FIN', 'Finance & Accounts'),
('dept_ops_006', 'ten_acme_001', 'OPS', 'Operations & Support')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Roles
INSERT INTO tp_roles (id, tenant_id, code, name, description, is_system)
VALUES
('role_admin_001', 'ten_acme_001', 'ADMIN', 'Attendance Administrator', 'Full administrative permissions', TRUE),
('role_manager_002', 'ten_acme_001', 'MANAGER', 'Reporting Manager', 'Team attendance and approval management', TRUE),
('role_employee_003', 'ten_acme_001', 'EMPLOYEE', 'Standard Employee', 'Self-service attendance and requests', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Insert Users (Password: Admin@123 / argon2id hash)
INSERT INTO tp_users (id, tenant_id, email, username, password_hash, first_name, last_name, avatar_url, phone_number, is_active)
VALUES
('usr_naresh_001', 'ten_acme_001', 'naresh@company.com', 'naresh', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$q+x2xN5M9R8d2VzV1W8Lz1z5B7J8w3H2Y1P4Q5R6S7T', 'Naresh', 'Andukoori', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop', '+91 9876543210', TRUE),
('usr_srinivas_002', 'ten_acme_001', 'srinivas.reddy@company.com', 'srinivas', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$q+x2xN5M9R8d2VzV1W8Lz1z5B7J8w3H2Y1P4Q5R6S7T', 'Srinivas', 'Reddy', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop', '+91 9876543211', TRUE),
('usr_priya_003', 'ten_acme_001', 'priya.nair@company.com', 'priya', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$q+x2xN5M9R8d2VzV1W8Lz1z5B7J8w3H2Y1P4Q5R6S7T', 'Priya', 'Nair', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop', '+91 9876543212', TRUE),
('usr_rohan_004', 'ten_acme_001', 'rohan.mehta@company.com', 'rohan', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$q+x2xN5M9R8d2VzV1W8Lz1z5B7J8w3H2Y1P4Q5R6S7T', 'Rohan', 'Mehta', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop', '+91 9876543213', TRUE),
('usr_aarav_005', 'ten_acme_001', 'aarav.sharma@company.com', 'aarav', '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$q+x2xN5M9R8d2VzV1W8Lz1z5B7J8w3H2Y1P4Q5R6S7T', 'Aarav', 'Sharma', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop', '+91 9876543214', TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 6. Insert Employees
INSERT INTO tp_employees (id, tenant_id, user_id, employee_code, biometric_id, first_name, last_name, avatar_url, job_title, department_id, location_id, joining_date, overtime_eligible)
VALUES
('emp_naresh_001', 'ten_acme_001', 'usr_naresh_001', 'TP0001', 'BIO-EMP-001', 'Naresh', 'Andukoori', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop', 'Administrator', 'dept_hr_004', 'loc_hyd_001', '2020-01-01', TRUE),
('emp_srinivas_002', 'ten_acme_001', 'usr_srinivas_002', 'TP1012', 'BIO-EMP-012', 'Srinivas', 'Reddy', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop', 'Product Manager', 'dept_prod_002', 'loc_hyd_001', '2022-03-15', TRUE),
('emp_priya_003', 'ten_acme_001', 'usr_priya_003', 'TP00234', 'BIO-EMP-234', 'Priya', 'Nair', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop', 'HR Executive', 'dept_hr_004', 'loc_blr_002', '2023-01-10', TRUE),
('emp_rohan_004', 'ten_acme_001', 'usr_rohan_004', 'EMP-0026', 'BIO-EMP-026', 'Rohan', 'Mehta', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop', 'Software Engineer', 'dept_eng_001', 'loc_blr_002', '2023-06-01', TRUE),
('emp_aarav_005', 'ten_acme_001', 'usr_aarav_005', 'EMP-001', 'BIO-EMP-001', 'Aarav', 'Sharma', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop', 'Frontend Engineer', 'dept_eng_001', 'loc_blr_002', '2023-08-01', TRUE)
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- 7. Insert Shifts
INSERT INTO tp_shifts (id, tenant_id, code, name, description, shift_type, shift_category, color_hex, start_time, end_time, duration_minutes, break_duration_minutes, grace_in_minutes, grace_out_minutes, status)
VALUES
('shf_gen_001', 'ten_acme_001', 'GS', 'General Shift', 'Standard 9 to 6 corporate shift', 'fixed', 'general', '#3B82F6', '09:00:00', '18:00:00', 540, 60, 15, 15, 'active'),
('shf_morn_002', 'ten_acme_001', 'MS', 'Morning Shift', 'Early shift for operations', 'fixed', 'production', '#10B981', '07:00:00', '16:00:00', 540, 60, 10, 10, 'active'),
('shf_eve_003', 'ten_acme_001', 'ES', 'Evening Shift', 'Second shift', 'fixed', 'production', '#F59E0B', '14:00:00', '23:00:00', 540, 60, 10, 10, 'active'),
('shf_night_004', 'ten_acme_001', 'NS', 'Night Shift', 'Overnight cross-midnight shift', 'cross_midnight', 'support', '#8B5CF6', '22:00:00', '07:00:00', 540, 60, 15, 15, 'active'),
('shf_flex_005', 'ten_acme_001', 'FS', 'Flexi Shift', 'Flexible timing with 8h core work', 'flexible', 'management', '#06B6D4', '09:00:00', '18:00:00', 540, 60, 30, 30, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. Insert Shift Assignments
INSERT INTO tp_shift_assignments (id, tenant_id, employee_id, shift_id, effective_from, effective_to, assigned_by, status)
VALUES
('sa_srinivas_001', 'ten_acme_001', 'emp_srinivas_002', 'shf_gen_001', '2025-01-01', '2025-12-31', 'emp_naresh_001', 'active'),
('sa_priya_002', 'ten_acme_001', 'emp_priya_003', 'shf_gen_001', '2025-01-01', '2025-12-31', 'emp_naresh_001', 'active'),
('sa_rohan_003', 'ten_acme_001', 'emp_rohan_004', 'shf_gen_001', '2025-01-01', '2025-12-31', 'emp_naresh_001', 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 9. Insert Devices
INSERT INTO tp_devices (id, tenant_id, device_identifier, name, device_type, location_id, ip_address, status)
VALUES
('dev_bio_001', 'ten_acme_001', 'BIO-01', 'Hyderabad HQ Main Entrance Biometric', 'biometric_terminal', 'loc_hyd_001', '192.168.1.101', 'online'),
('dev_fr_002', 'ten_acme_001', 'FR-01', 'Hyderabad Face Recognition Turnstile', 'face_recognition', 'loc_hyd_001', '192.168.1.102', 'online'),
('dev_bio_003', 'ten_acme_001', 'BIO-02', 'Bengaluru Reception Biometric', 'biometric_terminal', 'loc_blr_002', '192.168.2.101', 'online')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10. Insert Sample Processed Attendance (Date: 2025-04-28 matching reference UI)
INSERT INTO tp_attendance_days (id, tenant_id, employee_id, attendance_date, shift_id, location_id, day_status, first_in_time, last_out_time, gross_duration_minutes, break_duration_minutes, net_work_duration_minutes, regular_hours_minutes, overtime_duration_minutes, is_late)
VALUES
('att_srinivas_001', 'ten_acme_001', 'emp_srinivas_002', '2025-04-28', 'shf_gen_001', 'loc_hyd_001', 'present', '08:58:00', '18:08:00', 550, 60, 490, 480, 10, FALSE),
('att_priya_002', 'ten_acme_001', 'emp_priya_003', '2025-04-28', 'shf_gen_001', 'loc_blr_002', 'present', '08:47:00', '18:01:00', 554, 60, 494, 480, 14, FALSE),
('att_rohan_003', 'ten_acme_001', 'emp_rohan_004', '2025-04-28', 'shf_gen_001', 'loc_blr_002', 'late', '09:15:00', '18:18:00', 543, 60, 483, 480, 3, TRUE)
ON DUPLICATE KEY UPDATE day_status=VALUES(day_status);
