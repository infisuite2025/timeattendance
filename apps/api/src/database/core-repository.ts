import crypto from 'crypto';
import { DateTime } from 'luxon';
import type { RowDataPacket } from 'mysql2';
import { pool } from './db.js';
import { hashPassword } from './password.js';
import { notifyManagerOf } from '../modules/notifications/push.js';

const ZONE = 'Asia/Kolkata';

export function sendDatabaseError(res: { status: (code: number) => { json: (body: unknown) => void } }, err: unknown): boolean {
  if (!isDatabaseUnavailable(err)) return false;
  res.status(503).json({
    success: false,
    error: {
      code: 'ERR_DATABASE_UNAVAILABLE',
      message: 'MySQL is not running yet. Start MySQL, then apply the project migrations.',
    },
  });
  return true;
}

const databaseErrorCodes = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_NO_SUCH_TABLE',
]);

export function isDatabaseUnavailable(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  if (code && databaseErrorCodes.has(code)) return true;
  const nested = (err as { errors?: Array<{ code?: string }> })?.errors;
  return Array.isArray(nested) && nested.some((item) => !!item?.code && databaseErrorCodes.has(item.code));
}

export interface StoredUser {
  id: string;
  tenantId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  employeeId?: string;
  employeeCode?: string;
  departmentName?: string;
  locationName?: string;
  passwordHash: string;
  permissions: string[];
}

function permissionsFor(role: string): string[] {
  if (role === 'ADMIN') return ['*'];
  if (role === 'MANAGER') {
    return ['self_service.attendance.view', 'self_service.punch.create', 'team.attendance.view', 'approvals.regularisation.action'];
  }
  return ['self_service.attendance.view', 'self_service.punch.create', 'regularisation.create'];
}

function clockLabel(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const text = String(value);
  const match = text.match(/(\d{2}):(\d{2})/);
  if (!match) return text;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${match[2]} ${suffix}`;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const userSelect = `
  SELECT u.id, u.tenant_id, u.email, u.username, u.password_hash, u.first_name, u.last_name, u.avatar_url,
         COALESCE(r.code, 'EMPLOYEE') AS role_code,
         e.id AS employee_id, e.employee_code,
         d.name AS department_name, l.name AS location_name
  FROM tp_users u
  LEFT JOIN tp_user_roles ur ON ur.user_id = u.id
  LEFT JOIN tp_roles r ON r.id = ur.role_id
  LEFT JOIN tp_employees e ON e.user_id = u.id AND e.deleted_at IS NULL
  LEFT JOIN tp_departments d ON d.id = e.department_id
  LEFT JOIN tp_locations l ON l.id = e.location_id
`;

function mapUser(row: RowDataPacket): StoredUser {
  const role = String(row.role_code || 'EMPLOYEE');
  return {
    id: row.id,
    tenantId: row.tenant_id,
    email: row.email,
    username: row.username || '',
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url || undefined,
    role,
    employeeId: row.employee_id || undefined,
    employeeCode: row.employee_code || undefined,
    departmentName: row.department_name || undefined,
    locationName: row.location_name || undefined,
    passwordHash: row.password_hash,
    permissions: permissionsFor(role),
  };
}

export async function findUserByLogin(emailOrUsername: string): Promise<StoredUser | null> {
  const key = emailOrUsername.trim().toLowerCase();
  const [rows] = await pool.query<RowDataPacket[]>(
    `${userSelect}
     WHERE u.deleted_at IS NULL AND u.is_active = 1
       AND (LOWER(u.email) = ? OR LOWER(u.username) = ?)
     LIMIT 1`,
    [key, key]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${userSelect} WHERE u.id = ? AND u.deleted_at IS NULL LIMIT 1`,
    [id]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function listEmployees(tenantId: string, params?: {
  search?: string;
  departmentId?: string;
  locationId?: string;
  status?: string;
}) {
  const where = ['e.tenant_id = ?', 'e.deleted_at IS NULL'];
  const values: unknown[] = [tenantId];
  if (params?.search) {
    where.push('(e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ? OR e.job_title LIKE ?)');
    const q = `%${params.search}%`;
    values.push(q, q, q, q);
  }
  if (params?.departmentId && params.departmentId !== 'all') {
    where.push('(e.department_id = ? OR d.name = ?)');
    values.push(params.departmentId, params.departmentId);
  }
  if (params?.locationId && params.locationId !== 'all') {
    where.push('(e.location_id = ? OR l.name = ?)');
    values.push(params.locationId, params.locationId);
  }
  if (params?.status && params.status !== 'all') {
    where.push('e.employment_status = ?');
    values.push(params.status);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT e.*, d.name AS department_name, l.name AS location_name,
            m.first_name AS manager_first_name, m.last_name AS manager_last_name,
            u.email, u.phone_number
     FROM tp_employees e
     JOIN tp_departments d ON d.id = e.department_id
     JOIN tp_locations l ON l.id = e.location_id
     LEFT JOIN tp_employees m ON m.id = e.reporting_manager_id
     LEFT JOIN tp_users u ON u.id = e.user_id
     WHERE ${where.join(' AND ')}
     ORDER BY e.first_name, e.last_name`,
    values
  );
  return rows.map(mapEmployee);
}

export async function getEmployeeById(tenantId: string, id: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT e.*, d.name AS department_name, l.name AS location_name,
            m.first_name AS manager_first_name, m.last_name AS manager_last_name,
            u.email, u.phone_number,
            s.id AS shift_id, s.code AS shift_code, s.name AS shift_name, s.start_time, s.end_time
     FROM tp_employees e
     JOIN tp_departments d ON d.id = e.department_id
     JOIN tp_locations l ON l.id = e.location_id
     LEFT JOIN tp_employees m ON m.id = e.reporting_manager_id
     LEFT JOIN tp_users u ON u.id = e.user_id
     LEFT JOIN tp_shift_assignments sa ON sa.employee_id = e.id AND sa.status = 'active'
       AND CURDATE() BETWEEN sa.effective_from AND sa.effective_to
     LEFT JOIN tp_shifts s ON s.id = sa.shift_id
     WHERE e.tenant_id = ? AND e.deleted_at IS NULL AND (e.id = ? OR e.employee_code = ?)
     LIMIT 1`,
    [tenantId, id, id]
  );
  if (!rows[0]) return null;
  const employee = mapEmployee(rows[0]);
  const [stats] = await pool.query<RowDataPacket[]>(
    `SELECT
        SUM(day_status IN ('present','late','half_day','wfh','field_duty')) AS present_days,
        SUM(day_status = 'absent') AS absent_days,
        SUM(day_status = 'late' OR is_late = 1) AS late_days,
        SUM(day_status = 'on_leave') AS leave_days,
        SUM(day_status = 'wfh') AS wfh_days,
        SUM(net_work_duration_minutes) AS total_minutes
     FROM tp_attendance_days
     WHERE tenant_id = ? AND employee_id = ?`,
    [tenantId, employee.id]
  );
  const stat = stats[0] || {};
  const present = Number(stat.present_days || 0);
  const absent = Number(stat.absent_days || 0);
  const recorded = present + absent + Number(stat.leave_days || 0);
  return {
    ...employee,
    email: rows[0].email || '',
    phoneNumber: rows[0].phone_number || undefined,
    currentShift: {
      id: rows[0].shift_id || '',
      code: rows[0].shift_code || '',
      name: rows[0].shift_name || 'Unassigned',
      timing: rows[0].start_time ? `${clockLabel(rows[0].start_time)} - ${clockLabel(rows[0].end_time)}` : '',
    },
    attendanceSummary: {
      presentDays: present,
      absentDays: absent,
      lateDays: Number(stat.late_days || 0),
      leaveDays: Number(stat.leave_days || 0),
      wfhDays: Number(stat.wfh_days || 0),
      totalHours: minutesLabel(Number(stat.total_minutes || 0)),
      attendanceRate: recorded ? Math.round((present / recorded) * 100) : 0,
    },
  };
}

function mapEmployee(row: RowDataPacket) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`,
    avatarUrl: row.avatar_url || undefined,
    jobTitle: row.job_title,
    departmentId: row.department_id,
    departmentName: row.department_name,
    locationId: row.location_id,
    locationName: row.location_name,
    reportingManagerId: row.reporting_manager_id || undefined,
    reportingManagerName: row.manager_first_name ? `${row.manager_first_name} ${row.manager_last_name}` : undefined,
    employmentType: row.employment_type,
    employmentStatus: row.employment_status,
    biometricId: row.biometric_id || undefined,
    joiningDate: String(row.joining_date).slice(0, 10),
    overtimeEligible: !!row.overtime_eligible,
    remoteWorkEligible: !!row.remote_work_eligible,
    email: row.email || undefined,
    phoneNumber: row.phone_number || undefined,
  };
}

export async function createEmployee(tenantId: string, payload: any) {
  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  if (!firstName || !lastName || !email) {
    const err: any = new Error('First name, last name, and email are required.');
    err.statusCode = 400;
    throw err;
  }
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM tp_users WHERE tenant_id = ? AND email = ? AND deleted_at IS NULL LIMIT 1',
    [tenantId, email]
  );
  if (existing.length) {
    const err: any = new Error(`Email ${email} is already registered.`);
    err.statusCode = 409;
    throw err;
  }
  const departmentId = payload.departmentId || 'dept_eng_001';
  const locationId = payload.locationId || 'loc_hyd_001';
  const userId = crypto.randomUUID();
  const employeeId = crypto.randomUUID();
  const employeeCode = payload.employeeCode || `TP${Math.floor(1000 + Math.random() * 9000)}`;
  const password = payload.password || crypto.randomBytes(9).toString('base64url');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO tp_users (id, tenant_id, email, username, password_hash, first_name, last_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, tenantId, email, email.split('@')[0], hashPassword(password), firstName, lastName]
    );
    const [roleRows] = await conn.query<RowDataPacket[]>(
      'SELECT id FROM tp_roles WHERE tenant_id = ? AND code = ? LIMIT 1',
      [tenantId, 'EMPLOYEE']
    );
    if (roleRows[0]) {
      await conn.execute('INSERT INTO tp_user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleRows[0].id]);
    }
    await conn.execute(
      `INSERT INTO tp_employees (
         id, tenant_id, user_id, employee_code, first_name, last_name, job_title,
         department_id, location_id, reporting_manager_id, employment_type, employment_status, joining_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURDATE())`,
      [
        employeeId,
        tenantId,
        userId,
        employeeCode,
        firstName,
        lastName,
        payload.jobTitle || 'Employee',
        departmentId,
        locationId,
        payload.reportingManagerId || null,
        payload.employmentType || 'full_time',
      ]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  const created = await getEmployeeById(tenantId, employeeId);
  return { ...created, temporaryPassword: payload.password ? undefined : password };
}

export async function updateEmployee(tenantId: string, id: string, payload: any) {
  const current = await getEmployeeById(tenantId, id);
  if (!current) {
    const err: any = new Error('Employee not found');
    err.statusCode = 404;
    throw err;
  }
  const jobTitle = payload.designation || payload.jobTitle || current.jobTitle;
  const status = payload.status ? String(payload.status).toLowerCase() : current.employmentStatus;
  await pool.execute(
    `UPDATE tp_employees SET job_title = ?, employment_status = ? WHERE tenant_id = ? AND id = ?`,
    [jobTitle, status, tenantId, current.id]
  );
  if (payload.email || payload.phone || payload.phoneNumber) {
    await pool.execute(
      `UPDATE tp_users u
       JOIN tp_employees e ON e.user_id = u.id
       SET u.email = COALESCE(?, u.email), u.phone_number = COALESCE(?, u.phone_number)
       WHERE e.tenant_id = ? AND e.id = ?`,
      [payload.email || null, payload.phone || payload.phoneNumber || null, tenantId, current.id]
    );
  }
  return getEmployeeById(tenantId, current.id);
}

function monthBounds(month: string, year: number) {
  const names = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const numeric = Number(month);
  const index = Number.isFinite(numeric) && numeric >= 1 && numeric <= 12 ? numeric : names.indexOf(month.toLowerCase()) + 1;
  const safeIndex = index >= 1 ? index : DateTime.now().setZone(ZONE).month;
  const start = DateTime.fromObject({ year, month: safeIndex, day: 1 }, { zone: ZONE });
  return { start: start.toISODate()!, end: start.endOf('month').toISODate()!, label: start.toFormat('LLLL') };
}

export async function getMyAttendance(tenantId: string, employeeId: string, month: string, year: number) {
  const bounds = monthBounds(month, year);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.*, s.code AS shift_code, s.name AS shift_name, s.start_time, s.end_time, l.name AS location_name
     FROM tp_attendance_days a
     JOIN tp_shifts s ON s.id = a.shift_id
     JOIN tp_locations l ON l.id = a.location_id
     WHERE a.tenant_id = ? AND a.employee_id = ? AND a.attendance_date BETWEEN ? AND ?
     ORDER BY a.attendance_date`,
    [tenantId, employeeId, bounds.start, bounds.end]
  );
  const days = [];
  let presentDays = 0;
  let lateDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let halfDays = 0;
  let totalMinutes = 0;
  for (const row of rows) {
    const status = String(row.day_status);
    if (status === 'late' || row.is_late) lateDays += 1;
    if (status === 'present' || status === 'late' || status === 'wfh' || status === 'field_duty') presentDays += 1;
    if (status === 'absent') absentDays += 1;
    if (status === 'on_leave') leaveDays += 1;
    if (status === 'half_day') halfDays += 1;
    totalMinutes += Number(row.net_work_duration_minutes || 0);
    const date = String(row.attendance_date).slice(0, 10);
    days.push({
      id: row.id,
      date,
      dayOfWeek: DateTime.fromISO(date, { zone: ZONE }).toFormat('cccc'),
      shiftCode: row.shift_code,
      shiftName: row.shift_name,
      shiftTiming: `${clockLabel(row.start_time)} - ${clockLabel(row.end_time)}`,
      firstIn: clockLabel(row.first_in_time),
      lastOut: clockLabel(row.last_out_time),
      grossDurationMinutes: Number(row.gross_duration_minutes || 0),
      breakDurationMinutes: Number(row.break_duration_minutes || 0),
      netWorkDurationMinutes: Number(row.net_work_duration_minutes || 0),
      status,
      isLate: !!row.is_late || status === 'late',
      lateByMinutes: Number(row.late_by_minutes || 0),
      isEarlyOut: !!row.is_early_out,
      isRegularised: !!row.is_regularised,
      locationName: row.location_name,
    });
  }
  const recorded = presentDays + absentDays + leaveDays;
  return {
    summary: {
      month: bounds.label,
      year,
      totalWorkingDays: recorded,
      presentDays,
      lateDays,
      halfDays,
      absentDays,
      leaveDays,
      holidayDays: 0,
      weeklyOffDays: 0,
      totalWorkDurationHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalOvertimeHours: 0,
      totalShortfallHours: 0,
      attendancePercentage: recorded ? Math.round((presentDays / recorded) * 100) : 0,
      regularisedDaysCount: rows.filter((row) => row.is_regularised).length,
    },
    days,
  };
}

export async function getTeamAttendance(input: {
  tenantId: string;
  employeeId?: string;
  role?: string;
  date?: string;
  department?: string;
}) {
  const date = input.date || DateTime.now().setZone(ZONE).toISODate()!;
  const where = ['e.tenant_id = ?', 'e.deleted_at IS NULL'];
  const values: unknown[] = [input.tenantId];
  if (input.role === 'EMPLOYEE' && input.employeeId) {
    where.push('e.id = ?');
    values.push(input.employeeId);
  } else if (input.role === 'MANAGER' && input.employeeId) {
    where.push('(e.reporting_manager_id = ? OR e.id = ?)');
    values.push(input.employeeId, input.employeeId);
  }
  if (input.department) {
    where.push('d.name = ?');
    values.push(input.department);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT e.id AS employee_id, e.employee_code, e.first_name, e.last_name, e.avatar_url, e.job_title,
            d.name AS department_name, l.name AS location_name,
            a.day_status, a.first_in_time, a.last_out_time, a.net_work_duration_minutes, a.is_late, a.late_by_minutes,
            s.name AS shift_name, s.start_time, s.end_time
     FROM tp_employees e
     JOIN tp_departments d ON d.id = e.department_id
     JOIN tp_locations l ON l.id = e.location_id
     LEFT JOIN tp_attendance_days a ON a.employee_id = e.id AND a.tenant_id = e.tenant_id AND a.attendance_date = ?
     LEFT JOIN tp_shifts s ON s.id = COALESCE(a.shift_id, (
       SELECT sa.shift_id FROM tp_shift_assignments sa
       WHERE sa.employee_id = e.id AND sa.status = 'active' AND ? BETWEEN sa.effective_from AND sa.effective_to
       ORDER BY sa.effective_from DESC LIMIT 1
     ))
     WHERE ${where.join(' AND ')}
     ORDER BY e.first_name`,
    [date, date, ...values]
  );
  const members = rows.map((row) => ({
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    employeeName: `${row.first_name} ${row.last_name}`,
    avatarUrl: row.avatar_url || undefined,
    department: row.department_name,
    designation: row.job_title,
    shiftName: row.shift_name || '',
    shiftTiming: row.start_time ? `${clockLabel(row.start_time)} - ${clockLabel(row.end_time)}` : '',
    todayStatus: row.day_status || 'absent',
    firstIn: clockLabel(row.first_in_time),
    lastOut: clockLabel(row.last_out_time),
    netWorkDurationMinutes: Number(row.net_work_duration_minutes || 0),
    isLate: !!row.is_late,
    lateByMinutes: Number(row.late_by_minutes || 0),
    pendingRequestsCount: 0,
    locationName: row.location_name,
  }));
  const presentCount = members.filter((m) => ['present', 'late', 'wfh', 'field_duty', 'half_day'].includes(m.todayStatus)).length;
  return {
    date,
    totalTeamSize: members.length,
    presentCount,
    absentCount: members.filter((m) => m.todayStatus === 'absent').length,
    lateCount: members.filter((m) => m.isLate || m.todayStatus === 'late').length,
    onLeaveCount: members.filter((m) => m.todayStatus === 'on_leave').length,
    missingPunchCount: members.filter((m) => m.todayStatus === 'missing_punch').length,
    pendingRegularisationsCount: 0,
    teamCompliancePercentage: members.length ? Math.round((presentCount / members.length) * 100) : 0,
    members,
  };
}

export async function getLiveAttendance(tenantId: string, role?: string, employeeId?: string, date?: string) {
  const team = await getTeamAttendance({
    tenantId,
    role,
    employeeId,
    date,
  });
  return team.members.map((member) => ({
    id: member.employeeId,
    employeeId: member.employeeId,
    employeeCode: member.employeeCode,
    employeeName: member.employeeName,
    department: member.department,
    location: member.locationName,
    shiftName: member.shiftName,
    status: member.todayStatus,
    firstInTime: member.firstIn,
    lastOutTime: member.lastOut,
    isLate: member.isLate,
    lateByMinutes: member.lateByMinutes,
  }));
}

export async function getRecentPunches(tenantId: string, employeeId?: string, role?: string) {
  const values: unknown[] = [tenantId];
  let scope = '';
  if (role === 'EMPLOYEE' && employeeId) {
    scope = 'AND p.employee_id = ?';
    values.push(employeeId);
  } else if (role === 'MANAGER' && employeeId) {
    scope = 'AND (e.reporting_manager_id = ? OR e.id = ?)';
    values.push(employeeId, employeeId);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.event_type, p.source, p.punch_timestamp_utc, p.is_flagged, p.flag_reason,
            e.employee_code, e.first_name, e.last_name, l.name AS location_name
     FROM tp_raw_punches p
     JOIN tp_employees e ON e.id = p.employee_id
     LEFT JOIN tp_locations l ON l.id = p.location_id
     WHERE p.tenant_id = ? ${scope}
     ORDER BY p.punch_timestamp_utc DESC
     LIMIT 20`,
    values
  );
  return rows.map((row) => ({
    id: row.id,
    employeeCode: row.employee_code,
    employeeName: `${row.first_name} ${row.last_name}`,
    eventType: row.event_type,
    source: row.source,
    locationName: row.location_name || '',
    timeDisplay: DateTime.fromSQL(String(row.punch_timestamp_utc).replace('T', ' ').slice(0, 19), { zone: 'utc' }).setZone(ZONE).toFormat('hh:mm a'),
    status: row.is_flagged ? 'flagged' : 'accepted',
    flagReason: row.flag_reason || undefined,
  }));
}

export async function listShifts(tenantId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM tp_shifts WHERE tenant_id = ? ORDER BY start_time',
    [tenantId]
  );
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    shiftType: row.shift_type,
    shiftCategory: row.shift_category,
    colorHex: row.color_hex,
    startTime: clockLabel(row.start_time),
    endTime: clockLabel(row.end_time),
    duration: minutesLabel(Number(row.duration_minutes || 0)),
    breakDuration: minutesLabel(Number(row.break_duration_minutes || 0)),
    graceInMinutes: Number(row.grace_in_minutes || 0),
    graceOutMinutes: Number(row.grace_out_minutes || 0),
    status: row.status,
  }));
}

export async function listLocations(tenantId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT l.*,
        (SELECT COUNT(*) FROM tp_employees e WHERE e.location_id = l.id AND e.deleted_at IS NULL) AS employee_count,
        (SELECT COUNT(*) FROM tp_devices d WHERE d.location_id = l.id AND d.status = 'online') AS active_devices
     FROM tp_locations l
     WHERE l.tenant_id = ?
     ORDER BY l.name`,
    [tenantId]
  );
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    addressLine1: row.address_line1,
    city: row.city,
    state: row.state,
    country: row.country,
    timezone: row.timezone,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    geofenceRadiusMeters: Number(row.geofence_radius_meters),
    employeeCount: Number(row.employee_count || 0),
    activeDevicesCount: Number(row.active_devices || 0),
    status: row.is_active ? 'operational' : 'inactive',
  }));
}

export async function listDepartments(tenantId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT d.*, (SELECT COUNT(*) FROM tp_employees e WHERE e.department_id = d.id AND e.deleted_at IS NULL) AS employee_count
     FROM tp_departments d WHERE d.tenant_id = ? ORDER BY d.name`,
    [tenantId]
  );
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    headEmployeeId: row.head_employee_id || undefined,
    employeeCount: Number(row.employee_count || 0),
    isActive: !!row.is_active,
  }));
}

export async function getDashboardSummary(tenantId: string, location?: string, date?: string) {
  const day = date || DateTime.now().setZone(ZONE).toISODate()!;
  const locationFilter = location && location !== 'All Locations';
  const [employees] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM tp_employees e
     JOIN tp_locations l ON l.id = e.location_id
     WHERE e.tenant_id = ? AND e.deleted_at IS NULL AND e.employment_status IN ('active','probation','notice_period')
       ${locationFilter ? 'AND (l.name LIKE ? OR l.city LIKE ?)' : ''}`,
    locationFilter ? [tenantId, `%${location}%`, `%${location}%`] : [tenantId]
  );
  const total = Number(employees[0]?.total || 0);
  const [counts] = await pool.query<RowDataPacket[]>(
    `SELECT a.day_status, COUNT(*) AS total
     FROM tp_attendance_days a
     JOIN tp_employees e ON e.id = a.employee_id
     JOIN tp_locations l ON l.id = e.location_id
     WHERE a.tenant_id = ? AND a.attendance_date = ?
       ${locationFilter ? 'AND (l.name LIKE ? OR l.city LIKE ?)' : ''}
     GROUP BY a.day_status`,
    locationFilter ? [tenantId, day, `%${location}%`, `%${location}%`] : [tenantId, day]
  );
  const byStatus = new Map(counts.map((row) => [String(row.day_status), Number(row.total)]));
  const present = byStatus.get('present') || 0;
  const late = byStatus.get('late') || 0;
  const onLeave = byStatus.get('on_leave') || 0;
  const wfh = byStatus.get('wfh') || 0;
  const fieldDuty = byStatus.get('field_duty') || 0;
  const missingPunch = byStatus.get('missing_punch') || 0;
  const accounted = [...byStatus.values()].reduce((sum, value) => sum + value, 0);
  const notArrived = Math.max(0, total - accounted);
  const pct = (count: number) => (total ? Number(((count / total) * 100).toFixed(1)) : 0);
  return {
    totalEmployees: { count: total, changeVsLastMonth: '—' },
    present: { count: present, percentage: pct(present) },
    notArrived: { count: notArrived, percentage: pct(notArrived) },
    late: { count: late, percentage: pct(late) },
    onLeave: { count: onLeave, percentage: pct(onLeave) },
    wfh: { count: wfh, percentage: pct(wfh) },
    fieldDuty: { count: fieldDuty, percentage: pct(fieldDuty) },
    missingPunch: { count: missingPunch, percentage: pct(missingPunch) },
  };
}

export async function getHourlyTrend(tenantId: string, location?: string, date?: string) {
  const day = date || DateTime.now().setZone(ZONE).toISODate()!;
  const start = DateTime.fromISO(day, { zone: ZONE }).startOf('day').toUTC();
  const end = DateTime.fromISO(day, { zone: ZONE }).endOf('day').toUTC();
  const locationFilter = location && location !== 'All Locations';
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.employee_id, p.punch_timestamp_utc
     FROM tp_raw_punches p
     JOIN tp_employees e ON e.id = p.employee_id
     JOIN tp_locations l ON l.id = e.location_id
     WHERE p.tenant_id = ? AND p.event_type = 'IN'
       AND p.punch_timestamp_utc BETWEEN ? AND ?
       ${locationFilter ? 'AND (l.name LIKE ? OR l.city LIKE ?)' : ''}`,
    locationFilter
      ? [tenantId, start.toFormat('yyyy-LL-dd HH:mm:ss'), end.toFormat('yyyy-LL-dd HH:mm:ss'), `%${location}%`, `%${location}%`]
      : [tenantId, start.toFormat('yyyy-LL-dd HH:mm:ss'), end.toFormat('yyyy-LL-dd HH:mm:ss')]
  );
  const summary = await getDashboardSummary(tenantId, location, day);
  const hours = [6, 8, 10, 12, 14, 16, 18, 20];
  return hours.map((hour) => {
    const seen = new Set<string>();
    for (const row of rows) {
      const local = DateTime.fromSQL(String(row.punch_timestamp_utc).replace('T', ' ').slice(0, 19), { zone: 'utc' }).setZone(ZONE);
      if (local.hour <= hour) seen.add(String(row.employee_id));
    }
    return {
      hour: DateTime.fromObject({ hour }, { zone: ZONE }).toFormat('h a'),
      present: seen.size,
      expected: summary.totalEmployees.count,
    };
  });
}

export async function getLocationDistribution(tenantId: string) {
  const locations = await listLocations(tenantId);
  const total = locations.reduce((sum, location) => sum + location.employeeCount, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'];
  return locations.map((location, index) => ({
    location: location.name,
    count: location.employeeCount,
    percentage: total ? Number(((location.employeeCount / total) * 100).toFixed(0)) : 0,
    color: colors[index % colors.length],
  }));
}

export async function ingestPunch(tenantId: string, payload: {
  employeeId?: string;
  timestamp?: string;
  eventType?: string;
  source?: string;
  latitude?: number;
  longitude?: number;
  isMockLocation?: boolean;
}) {
  if (!payload.employeeId || !payload.timestamp || !payload.eventType || !payload.source) {
    const err: any = new Error('employeeId, timestamp, eventType and source are required');
    err.statusCode = 400;
    throw err;
  }
  const [employees] = await pool.query<RowDataPacket[]>(
    `SELECT e.id, e.location_id, l.latitude, l.longitude, l.geofence_radius_meters
     FROM tp_employees e
     JOIN tp_locations l ON l.id = e.location_id
     WHERE e.tenant_id = ? AND e.deleted_at IS NULL AND (e.id = ? OR e.employee_code = ?)
     LIMIT 1`,
    [tenantId, payload.employeeId, payload.employeeId]
  );
  const employee = employees[0];
  if (!employee) {
    const err: any = new Error('Employee was not found in this workspace.');
    err.statusCode = 404;
    throw err;
  }
  const local = DateTime.fromISO(payload.timestamp, { setZone: true }).setZone(ZONE);
  if (!local.isValid) {
    const err: any = new Error('timestamp must be a valid date');
    err.statusCode = 400;
    throw err;
  }
  const utc = local.toUTC().toFormat('yyyy-LL-dd HH:mm:ss');
  let flagged = !!payload.isMockLocation;
  let flagReason: string | null = payload.isMockLocation ? 'Mock location detected' : null;
  if (payload.latitude != null && payload.longitude != null) {
    const distance = haversineMeters(Number(payload.latitude), Number(payload.longitude), Number(employee.latitude), Number(employee.longitude));
    if (distance > Number(employee.geofence_radius_meters)) {
      flagged = true;
      flagReason = `Outside assigned site geofence by ${distance} meters`;
    }
  }
  const idempotency = crypto.createHash('sha256').update(`${tenantId}|${employee.id}|${utc}|${payload.eventType}`).digest('hex');
  const punchId = crypto.randomUUID();
  try {
    await pool.execute(
      `INSERT INTO tp_raw_punches (
         id, tenant_id, employee_id, punch_timestamp_utc, device_timezone, event_type, source,
         location_id, latitude, longitude, is_flagged, flag_reason, idempotency_hash
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        punchId,
        tenantId,
        employee.id,
        utc,
        ZONE,
        payload.eventType,
        payload.source,
        employee.location_id,
        payload.latitude ?? null,
        payload.longitude ?? null,
        flagged,
        flagReason,
        idempotency,
      ]
    );
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return { success: false, status: 'duplicate', message: 'This punch was already recorded.' };
    }
    throw err;
  }
  await upsertAttendanceDay(tenantId, employee.id, employee.location_id, local, String(payload.eventType));
  if (flagged && flagReason) {
    await recordGeofenceException(tenantId, employee.id, local.toISODate()!, flagReason);
  }
  return {
    success: true,
    status: flagged ? 'flagged' : 'accepted',
    id: punchId,
    message: flagReason || 'Punch saved to the workspace database.',
  };
}

async function upsertAttendanceDay(tenantId: string, employeeId: string, locationId: string, local: DateTime, eventType: string) {
  const date = local.toISODate()!;
  const time = local.toFormat('HH:mm:ss');
  const [shifts] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.start_time, s.grace_in_minutes
     FROM tp_shift_assignments sa
     JOIN tp_shifts s ON s.id = sa.shift_id
     WHERE sa.tenant_id = ? AND sa.employee_id = ? AND sa.status = 'active' AND ? BETWEEN sa.effective_from AND sa.effective_to
     ORDER BY sa.effective_from DESC LIMIT 1`,
    [tenantId, employeeId, date]
  );
  const shift = shifts[0];
  const shiftId = shift?.id || 'shf_gen_001';
  const start = String(shift?.start_time || '09:00:00').slice(0, 8);
  const grace = Number(shift?.grace_in_minutes || 15);
  const startMinutes = toMinutes(start) + grace;
  const punchMinutes = toMinutes(time);
  const isIn = eventType === 'IN';
  const isOut = eventType === 'OUT';
  const lateBy = isIn ? Math.max(0, punchMinutes - startMinutes) : 0;
  const isLate = lateBy > 0;
  const status = isLate ? 'late' : 'present';
  await pool.execute(
    `INSERT INTO tp_attendance_days (
       id, tenant_id, employee_id, attendance_date, shift_id, location_id, day_status,
       first_in_time, last_out_time, is_late, late_by_minutes
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) AS new
     ON DUPLICATE KEY UPDATE
       first_in_time = IF(new.first_in_time IS NOT NULL AND (tp_attendance_days.first_in_time IS NULL OR new.first_in_time < tp_attendance_days.first_in_time), new.first_in_time, tp_attendance_days.first_in_time),
       last_out_time = IF(new.last_out_time IS NOT NULL AND (tp_attendance_days.last_out_time IS NULL OR new.last_out_time > tp_attendance_days.last_out_time), new.last_out_time, tp_attendance_days.last_out_time),
       is_late = IF(new.is_late = 1, 1, tp_attendance_days.is_late),
       late_by_minutes = GREATEST(tp_attendance_days.late_by_minutes, new.late_by_minutes),
       day_status = IF(new.is_late = 1 OR tp_attendance_days.is_late = 1, 'late', 'present')`,
    [
      crypto.randomUUID(),
      tenantId,
      employeeId,
      date,
      shiftId,
      locationId,
      status,
      isIn ? time : null,
      isOut ? time : null,
      isLate ? 1 : 0,
      lateBy,
    ]
  );
  await pool.execute(
    `UPDATE tp_attendance_days
     SET gross_duration_minutes = IF(first_in_time IS NULL OR last_out_time IS NULL, gross_duration_minutes,
           IF(TIMEDIFF(last_out_time, first_in_time) < 0,
              ROUND(TIME_TO_SEC(TIMEDIFF(last_out_time, first_in_time)) / 60) + 1440,
              ROUND(TIME_TO_SEC(TIMEDIFF(last_out_time, first_in_time)) / 60))),
         net_work_duration_minutes = IF(first_in_time IS NULL OR last_out_time IS NULL, net_work_duration_minutes,
           GREATEST(0, IF(TIMEDIFF(last_out_time, first_in_time) < 0,
              ROUND(TIME_TO_SEC(TIMEDIFF(last_out_time, first_in_time)) / 60) + 1440,
              ROUND(TIME_TO_SEC(TIMEDIFF(last_out_time, first_in_time)) / 60)) - break_duration_minutes))
     WHERE tenant_id = ? AND employee_id = ? AND attendance_date = ?`,
    [tenantId, employeeId, date]
  );
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${String(rest).padStart(2, '0')}m`;
}

function sqlTime(value?: string | null): string | null {
  if (!value) return null;
  const match = String(value).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = match[2];
  const seconds = match[3] || '00';
  const suffix = match[4]?.toUpperCase();
  if (suffix === 'PM' && hours < 12) hours += 12;
  if (suffix === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
}

function sqlDate(value?: string | null): string {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = value ? DateTime.fromJSDate(new Date(value)) : DateTime.now();
  const zoned = (parsed.isValid ? parsed : DateTime.now()).setZone(ZONE);
  return zoned.toISODate()!;
}

function regularisationType(value?: string): string {
  switch (value) {
    case 'wfh':
      return 'wfh';
    case 'field_duty':
    case 'client_visit':
      return 'field_duty';
    case 'full_day':
    case 'full_day_present':
      return 'full_day_present';
    case 'half_day':
    case 'half_day_present':
      return 'half_day_present';
    case 'missing_punch':
    case 'missed_punch':
    case 'check_in':
    case 'check_out':
      return 'missing_punch';
    default:
      return 'time_adjustment';
  }
}

function scopeClause(role?: string, employeeId?: string) {
  if (role === 'EMPLOYEE' && employeeId) return { sql: 'AND r.employee_id = ?', values: [employeeId] };
  if (role === 'MANAGER' && employeeId) return { sql: 'AND (e.reporting_manager_id = ? OR e.id = ?)', values: [employeeId, employeeId] };
  return { sql: '', values: [] as unknown[] };
}

const regularisationSelect = `
  SELECT r.*, e.employee_code, e.first_name, e.last_name, e.avatar_url, d.name AS department_name,
         s.name AS shift_name, s.start_time, s.end_time, m.first_name AS manager_first, m.last_name AS manager_last
  FROM tp_regularisation_requests r
  JOIN tp_employees e ON e.id = r.employee_id
  LEFT JOIN tp_departments d ON d.id = e.department_id
  LEFT JOIN tp_employees m ON m.id = e.reporting_manager_id
  LEFT JOIN tp_shifts s ON s.id = (
    SELECT sa.shift_id FROM tp_shift_assignments sa
    WHERE sa.employee_id = e.id AND sa.status = 'active' AND r.attendance_date BETWEEN sa.effective_from AND sa.effective_to
    ORDER BY sa.effective_from DESC LIMIT 1
  )
`;

function mapRegularisation(row: RowDataPacket) {
  const manager = `${row.manager_first || ''} ${row.manager_last || ''}`.trim() || 'Reporting manager';
  return {
    id: row.id,
    requestCode: row.request_code,
    tenantId: row.tenant_id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    employeeName: `${row.first_name} ${row.last_name}`,
    department: row.department_name || '',
    avatarUrl: row.avatar_url || undefined,
    attendanceDate: String(row.attendance_date).slice(0, 10),
    targetDate: String(row.attendance_date).slice(0, 10),
    shiftName: row.shift_name || 'General Shift',
    shiftTiming: row.start_time ? `${clockLabel(row.start_time)} - ${clockLabel(row.end_time)}` : '',
    requestType: row.request_type,
    category: 'regularisation',
    title: 'Attendance regularisation',
    summaryDetails: row.reason,
    originalValues: `IN: ${clockLabel(row.original_in_time) || '--'} | OUT: ${clockLabel(row.original_out_time) || '--'}`,
    requestedValues: `IN: ${clockLabel(row.requested_in_time) || '--'} | OUT: ${clockLabel(row.requested_out_time) || '--'}`,
    originalIn: clockLabel(row.original_in_time) || '--',
    originalOut: clockLabel(row.original_out_time) || '--',
    requestedIn: clockLabel(row.requested_in_time) || '--',
    requestedOut: clockLabel(row.requested_out_time) || '--',
    reasonCategory: row.request_type,
    reasonText: row.reason,
    status: row.status,
    priority: 'medium',
    slaHoursRemaining: 24,
    currentTier: 1,
    maxTiers: 1,
    approvers: [{ tier: 1, approverName: manager, role: 'Reporting Manager', status: row.status === 'pending' ? 'pending' : row.status }],
    submittedAt: row.created_at,
  };
}

export async function listRegularisations(tenantId: string, role?: string, employeeId?: string) {
  const scope = scopeClause(role, employeeId);
  const [rows] = await pool.query<RowDataPacket[]>(
    `${regularisationSelect} WHERE r.tenant_id = ? ${scope.sql} ORDER BY r.created_at DESC`,
    [tenantId, ...scope.values]
  );
  return rows.map(mapRegularisation);
}

export async function createRegularisation(tenantId: string, employeeId: string, payload: {
  attendanceDate?: string;
  requestType?: string;
  requestedIn?: string;
  requestedOut?: string;
  reasonCategory?: string;
  reasonText?: string;
}) {
  const id = `reg_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const requestCode = `REG-${Date.now().toString().slice(-6)}`;
  const reason = [payload.reasonCategory, payload.reasonText].filter(Boolean).join(': ') || 'Attendance correction';
  await pool.query(
    `INSERT INTO tp_regularisation_requests
      (id, tenant_id, request_code, employee_id, attendance_date, request_type, reason, requested_in_time, requested_out_time, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      tenantId,
      requestCode,
      employeeId,
      sqlDate(payload.attendanceDate),
      regularisationType(payload.requestType),
      reason,
      sqlTime(payload.requestedIn),
      sqlTime(payload.requestedOut),
    ]
  );
  const [rows] = await pool.query<RowDataPacket[]>(`${regularisationSelect} WHERE r.id = ? LIMIT 1`, [id]);
  const [managers] = await pool.query<RowDataPacket[]>(
    `SELECT u.id
     FROM tp_employees e
     JOIN tp_employees m ON m.id = e.reporting_manager_id
     JOIN tp_users u ON u.id = m.user_id AND u.deleted_at IS NULL
     WHERE e.tenant_id = ? AND e.id = ?
     LIMIT 1`,
    [tenantId, employeeId]
  );
  let assigneeId = managers[0]?.id as string | undefined;
  if (!assigneeId) {
    const [admins] = await pool.query<RowDataPacket[]>(
      `SELECT u.id
       FROM tp_users u
       JOIN tp_user_roles ur ON ur.user_id = u.id
       JOIN tp_roles r ON r.id = ur.role_id
       WHERE u.tenant_id = ? AND r.code = 'ADMIN' AND u.deleted_at IS NULL
       LIMIT 1`,
      [tenantId]
    );
    assigneeId = admins[0]?.id as string | undefined;
  }
  if (assigneeId) {
    await pool.query(
      `INSERT INTO tp_approval_instances
        (id, tenant_id, entity_type, entity_id, current_step, total_steps, current_assignee_id, status)
       VALUES (?, ?, 'regularisation', ?, 1, 1, ?, 'pending')`,
      [`appr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`, tenantId, id, assigneeId]
    );
  }
  const saved = mapRegularisation(rows[0]);
  void notifyManagerOf(
    tenantId,
    employeeId,
    'Attendance request',
    `${saved.employeeName || 'An employee'} sent a request that needs a decision.`
  ).catch(() => undefined);
  return saved;
}

export async function listApprovalInbox(tenantId: string, role?: string, employeeId?: string) {
  if (role === 'EMPLOYEE') return [];
  const scope = scopeClause(role === 'ADMIN' ? undefined : role, employeeId);
  const [rows] = await pool.query<RowDataPacket[]>(
    `${regularisationSelect} WHERE r.tenant_id = ? AND r.status = 'pending' ${scope.sql} ORDER BY r.created_at DESC`,
    [tenantId, ...scope.values]
  );
  return rows.map(mapRegularisation);
}

export async function listApprovalHistory(tenantId: string, role?: string, employeeId?: string) {
  const scope = scopeClause(role, employeeId);
  const [rows] = await pool.query<RowDataPacket[]>(
    `${regularisationSelect} WHERE r.tenant_id = ? AND r.status <> 'pending' ${scope.sql} ORDER BY r.updated_at DESC`,
    [tenantId, ...scope.values]
  );
  return rows.map((row) => ({
    id: row.id,
    requestCode: row.request_code,
    category: 'regularisation',
    employeeName: `${row.first_name} ${row.last_name}`,
    employeeCode: row.employee_code,
    decision: row.status === 'approved' ? 'approved' : row.status === 'rejected' ? 'rejected' : row.status,
    approverName: `${row.manager_first || ''} ${row.manager_last || ''}`.trim() || 'Manager',
    approverRole: 'Reporting Manager',
    decisionTimestamp: row.updated_at,
    comments: row.reason,
  }));
}

export async function approvalMetrics(tenantId: string, role?: string, employeeId?: string) {
  const pending = await listApprovalInbox(tenantId, role, employeeId);
  const history = await listApprovalHistory(tenantId, role, employeeId);
  return {
    pendingMyActionCount: pending.length,
    escalatedCount: 0,
    approvalsCompletedThisMonth: history.length,
    avgTurnaroundHours: 0,
    regularisationsPending: pending.length,
    overtimePending: 0,
    shiftSwapsPending: 0,
  };
}

export async function decideRegularisation(tenantId: string, id: string, decision: string, actorUserId?: string, actorRole?: string, comments?: string) {
  const status = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'sent_back';
  const [result] = await pool.query(
    `UPDATE tp_regularisation_requests SET status = ? WHERE id = ? AND tenant_id = ?`,
    [status, id, tenantId]
  );
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    const err: any = new Error('Regularisation request not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query(
    `INSERT INTO tp_approval_history (id, tenant_id, approval_instance_id, step_number, action, actor_user_id, actor_role, comments)
     SELECT ?, ?, id, 1, ?, ?, ?, ?
     FROM tp_approval_instances WHERE entity_id = ? AND tenant_id = ? LIMIT 1`,
    [`ah_${crypto.randomUUID().slice(0, 8)}`, tenantId, status === 'sent_back' ? 'sent_back' : status, actorUserId || 'system', actorRole || 'MANAGER', comments || '', id, tenantId]
  ).catch(() => undefined);
  const [rows] = await pool.query<RowDataPacket[]>(`${regularisationSelect} WHERE r.id = ? LIMIT 1`, [id]);
  return mapRegularisation(rows[0]);
}

export async function getLiveSchedule(tenantId: string, role?: string, employeeId?: string) {
  const today = DateTime.now().setZone(ZONE);
  const start = today.minus({ days: today.weekday - 1 }).startOf('day');
  const end = start.plus({ days: 6 });
  const values: unknown[] = [today.toISODate(), tenantId];
  let scope = '';
  if (role === 'EMPLOYEE' && employeeId) {
    scope = 'AND e.id = ?';
    values.push(employeeId);
  } else if (role === 'MANAGER' && employeeId) {
    scope = 'AND (e.reporting_manager_id = ? OR e.id = ?)';
    values.push(employeeId, employeeId);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT e.first_name, e.last_name, e.employee_code, s.code AS shift_code, s.name AS shift_name, s.start_time, s.end_time
     FROM tp_employees e
     LEFT JOIN tp_shift_assignments sa
       ON sa.employee_id = e.id AND sa.tenant_id = e.tenant_id AND sa.status = 'active'
      AND ? BETWEEN sa.effective_from AND sa.effective_to
     LEFT JOIN tp_shifts s ON s.id = sa.shift_id
     WHERE e.tenant_id = ? AND e.deleted_at IS NULL ${scope}
     ORDER BY e.first_name, e.last_name`,
    values
  );
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const schedule = rows.map((row) => ({
    employeeName: `${row.first_name} ${row.last_name}`.trim(),
    employeeCode: row.employee_code,
    shifts: dayNames.map((dayName, index) => {
      const date = start.plus({ days: index });
      const weekend = index >= 5;
      const timing = row.start_time && row.end_time ? `${clockLabel(row.start_time)} – ${clockLabel(row.end_time)}` : '';
      return {
        date: date.toISODate(),
        dayName,
        shiftCode: weekend ? 'OFF' : (row.shift_code || 'GS'),
        shiftName: weekend ? 'Weekly Off' : (row.shift_name || 'General Shift'),
        timing: weekend ? 'Off' : timing,
        isOff: weekend,
      };
    }),
  }));
  return {
    weekRange: `${start.toFormat('LLL d')} – ${end.toFormat('LLL d, yyyy')}`,
    scheduledEmployees: schedule.length,
    schedule,
  };
}

async function recordGeofenceException(tenantId: string, employeeId: string, attendanceDate: string, details: string) {
  const [days] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM tp_attendance_days WHERE tenant_id = ? AND employee_id = ? AND attendance_date = ? LIMIT 1`,
    [tenantId, employeeId, attendanceDate]
  );
  const dayId = days[0]?.id as string | undefined;
  if (!dayId) return;
  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM tp_attendance_exceptions
     WHERE tenant_id = ? AND attendance_day_id = ? AND exception_type = 'geofence_breach' AND status = 'open'
     LIMIT 1`,
    [tenantId, dayId]
  );
  if (existing.length > 0) return;
  await pool.query(
    `INSERT INTO tp_attendance_exceptions
      (id, tenant_id, attendance_day_id, employee_id, exception_type, severity, status, details)
     VALUES (?, ?, ?, ?, 'geofence_breach', 'high', 'open', ?)`,
    [`exc_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`, tenantId, dayId, employeeId, details]
  );
}

export async function listExceptions(tenantId: string, role?: string, employeeId?: string) {
  await pool.query(
    `INSERT INTO tp_attendance_exceptions
      (id, tenant_id, attendance_day_id, employee_id, exception_type, severity, status, details)
     SELECT CONCAT('exc_', LEFT(a.id, 12)), p.tenant_id, a.id, p.employee_id, 'geofence_breach', 'high', 'open', MAX(p.flag_reason)
     FROM tp_raw_punches p
     JOIN tp_attendance_days a
       ON a.tenant_id = p.tenant_id AND a.employee_id = p.employee_id
      AND a.attendance_date = DATE(CONVERT_TZ(p.punch_timestamp_utc, '+00:00', '+05:30'))
     WHERE p.tenant_id = ? AND p.is_flagged = 1 AND p.flag_reason LIKE 'Outside%'
       AND NOT EXISTS (
         SELECT 1 FROM tp_attendance_exceptions x
         WHERE x.attendance_day_id = a.id AND x.exception_type = 'geofence_breach'
       )
     GROUP BY p.tenant_id, a.id, p.employee_id`,
    [tenantId]
  );
  const values: unknown[] = [tenantId];
  let scope = '';
  if (role === 'EMPLOYEE' && employeeId) {
    scope = 'AND e.id = ?';
    values.push(employeeId);
  } else if (role === 'MANAGER' && employeeId) {
    scope = 'AND (e.reporting_manager_id = ? OR e.id = ?)';
    values.push(employeeId, employeeId);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT x.id, x.exception_type, x.severity, x.status, x.details,
            e.first_name, e.last_name, e.employee_code
     FROM tp_attendance_exceptions x
     JOIN tp_employees e ON e.id = x.employee_id
     WHERE x.tenant_id = ? ${scope}
     ORDER BY x.created_at DESC
     LIMIT 100`,
    values
  );
  return rows.map((row) => ({
    id: row.id,
    employeeName: `${row.first_name} ${row.last_name}`.trim(),
    employeeCode: row.employee_code,
    exceptionType: row.exception_type,
    severity: row.severity,
    status: row.status,
    description: row.details,
  }));
}

export async function resolveException(tenantId: string, exceptionId: string, action: string, notes: string | undefined, resolvedBy: string | undefined) {
  const status = action === 'waive' ? 'resolved' : action === 'reject' ? 'rejected' : 'resolved';
  const [result] = await pool.query(
    `UPDATE tp_attendance_exceptions
     SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
     WHERE tenant_id = ? AND id = ? AND status = 'open'`,
    [status, notes || null, resolvedBy || null, tenantId, exceptionId]
  );
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    const error = new Error('No open exception matches this request.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  return { id: exceptionId, status, resolutionNotes: notes || '' };
}

async function ensureSwapTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tp_shift_swaps (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL,
      request_code VARCHAR(50) NOT NULL,
      requester_employee_id VARCHAR(36) NOT NULL,
      swap_with_employee_id VARCHAR(36) NULL,
      swap_date DATE NOT NULL,
      current_shift VARCHAR(100) NOT NULL,
      requested_shift VARCHAR(100) NOT NULL,
      reason TEXT NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

function mapSwap(row: RowDataPacket) {
  return {
    id: row.id,
    requestCode: row.request_code,
    requesterId: row.requester_employee_id,
    requesterName: `${row.requester_first || ''} ${row.requester_last || ''}`.trim(),
    swapWithId: row.swap_with_employee_id,
    swapWithName: `${row.target_first || ''} ${row.target_last || ''}`.trim() || 'Team',
    date: String(row.swap_date).slice(0, 10),
    currentShift: row.current_shift,
    requestedShift: row.requested_shift,
    reason: row.reason,
    status: row.status,
  };
}

const swapSelect = `
  SELECT s.*, r.first_name AS requester_first, r.last_name AS requester_last,
         t.first_name AS target_first, t.last_name AS target_last
  FROM tp_shift_swaps s
  JOIN tp_employees r ON r.id = s.requester_employee_id
  LEFT JOIN tp_employees t ON t.id = s.swap_with_employee_id
`;

export async function listShiftSwaps(tenantId: string, role?: string, employeeId?: string) {
  await ensureSwapTable();
  const values: unknown[] = [tenantId];
  let scope = '';
  if (role === 'EMPLOYEE' && employeeId) {
    scope = 'AND s.requester_employee_id = ?';
    values.push(employeeId);
  } else if (role === 'MANAGER' && employeeId) {
    scope = 'AND (r.reporting_manager_id = ? OR s.requester_employee_id = ?)';
    values.push(employeeId, employeeId);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `${swapSelect} WHERE s.tenant_id = ? ${scope} ORDER BY s.created_at DESC`,
    values
  );
  return rows.map(mapSwap);
}

export async function createShiftSwap(tenantId: string, employeeId: string, payload: {
  swapWithId?: string;
  date?: string;
  currentShift?: string;
  requestedShift?: string;
  reason?: string;
}) {
  await ensureSwapTable();
  const id = `swp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const code = `SSW-${Date.now().toString().slice(-6)}`;
  const swapDate = String(payload.date || DateTime.now().setZone(ZONE).toISODate());
  await pool.query(
    `INSERT INTO tp_shift_swaps
      (id, tenant_id, request_code, requester_employee_id, swap_with_employee_id, swap_date, current_shift, requested_shift, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, tenantId, code, employeeId, payload.swapWithId || null, swapDate, payload.currentShift || 'General Shift', payload.requestedShift || 'General Shift', payload.reason || 'Shift swap']
  );
  const [rows] = await pool.query<RowDataPacket[]>(`${swapSelect} WHERE s.id = ?`, [id]);
  return mapSwap(rows[0]);
}

export async function decideShiftSwap(tenantId: string, id: string, status: 'approved' | 'rejected') {
  await ensureSwapTable();
  const [result] = await pool.query(
    `UPDATE tp_shift_swaps SET status = ? WHERE tenant_id = ? AND id = ? AND status = 'pending'`,
    [status, tenantId, id]
  );
  if ((result as { affectedRows?: number }).affectedRows === 0) return null;
  const [rows] = await pool.query<RowDataPacket[]>(`${swapSelect} WHERE s.id = ?`, [id]);
  return rows[0] ? mapSwap(rows[0]) : null;
}

export async function databaseReachable(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
