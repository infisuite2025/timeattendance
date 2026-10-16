-- Assigns the seeded users to roles and replaces the placeholder password hash.
-- Demo application password remains the one documented in 001_seed_demo_data.sql.
-- This file does not drop tables or delete attendance rows.

USE infi_timepro_db;

CREATE TABLE IF NOT EXISTS tp_user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES tp_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES tp_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tp_user_roles (user_id, role_id) VALUES
('usr_naresh_001', 'role_admin_001'),
('usr_srinivas_002', 'role_manager_002'),
('usr_priya_003', 'role_employee_003'),
('usr_rohan_004', 'role_employee_003'),
('usr_aarav_005', 'role_employee_003')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

UPDATE tp_users
SET password_hash = 'scrypt$b215e47956045aeeb47d47706954bd58$f637adeb2f0f337025720106091ef70b395f5fe51518923282f30eea6e9c5b46'
WHERE tenant_id = 'ten_acme_001'
  AND email IN (
    'naresh@company.com',
    'srinivas.reddy@company.com',
    'priya.nair@company.com',
    'rohan.mehta@company.com',
    'aarav.sharma@company.com'
  );

UPDATE tp_employees SET reporting_manager_id = 'emp_naresh_001' WHERE id = 'emp_srinivas_002';
UPDATE tp_employees SET reporting_manager_id = 'emp_srinivas_002' WHERE id IN ('emp_priya_003', 'emp_rohan_004', 'emp_aarav_005');

UPDATE tp_shift_assignments
SET effective_to = '2027-12-31'
WHERE tenant_id = 'ten_acme_001' AND effective_to < '2027-12-31';

INSERT INTO tp_shift_assignments (id, tenant_id, employee_id, shift_id, effective_from, effective_to, assigned_by, status)
VALUES
('sa_naresh_004', 'ten_acme_001', 'emp_naresh_001', 'shf_gen_001', '2025-01-01', '2027-12-31', 'emp_naresh_001', 'active'),
('sa_aarav_005', 'ten_acme_001', 'emp_aarav_005', 'shf_gen_001', '2025-01-01', '2027-12-31', 'emp_naresh_001', 'active')
ON DUPLICATE KEY UPDATE effective_to = VALUES(effective_to), status = VALUES(status);
