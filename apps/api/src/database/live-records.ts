import crypto from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { pool } from './db.js';

export async function ensureRecords() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tp_saved_records (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL,
      kind VARCHAR(40) NOT NULL,
      payload JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_saved_kind (tenant_id, kind)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

export async function listRecords<T>(tenantId: string, kind: string): Promise<T[]> {
  await ensureRecords();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, payload FROM tp_saved_records WHERE tenant_id = ? AND kind = ? ORDER BY created_at DESC`,
    [tenantId, kind]
  );
  return rows.map((row) => {
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    return { ...payload, id: row.id } as T;
  });
}

export async function saveRecord<T extends Record<string, unknown>>(tenantId: string, kind: string, payload: T): Promise<T & { id: string }> {
  await ensureRecords();
  const id = String(payload.id || `${kind.slice(0, 3)}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`);
  const stored = { ...payload, id };
  await pool.query(
    `INSERT INTO tp_saved_records (id, tenant_id, kind, payload) VALUES (?, ?, ?, ?)`,
    [id, tenantId, kind, JSON.stringify(stored)]
  );
  return stored as T & { id: string };
}

export async function replaceRecord<T>(tenantId: string, kind: string, id: string, payload: T): Promise<T | null> {
  await ensureRecords();
  const [result] = await pool.query(
    `UPDATE tp_saved_records SET payload = ? WHERE tenant_id = ? AND kind = ? AND id = ?`,
    [JSON.stringify({ ...(payload as object), id }), tenantId, kind, id]
  );
  if ((result as { affectedRows?: number }).affectedRows === 0) return null;
  return { ...(payload as object), id } as T;
}

export async function removeRecord(tenantId: string, kind: string, id: string): Promise<boolean> {
  await ensureRecords();
  const [result] = await pool.query(
    `DELETE FROM tp_saved_records WHERE tenant_id = ? AND kind = ? AND id = ?`,
    [tenantId, kind, id]
  );
  return (result as { affectedRows?: number }).affectedRows === 1;
}

export async function musterRoll(tenantId: string, dateFrom: string, dateTo: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.job_title, d.name AS department,
            a.attendance_date, a.day_status, a.net_work_duration_minutes, a.overtime_duration_minutes
     FROM tp_employees e
     LEFT JOIN tp_departments d ON d.id = e.department_id
     LEFT JOIN tp_attendance_days a
       ON a.employee_id = e.id AND a.tenant_id = e.tenant_id
      AND a.attendance_date BETWEEN ? AND ?
     WHERE e.tenant_id = ? AND e.deleted_at IS NULL
     ORDER BY e.first_name, a.attendance_date`,
    [dateFrom, dateTo, tenantId]
  );
  const people = new Map<string, any>();
  for (const row of rows) {
    if (!people.has(row.id)) {
      people.set(row.id, {
        employeeId: row.id,
        employeeCode: row.employee_code,
        employeeName: `${row.first_name} ${row.last_name}`.trim(),
        department: row.department || '',
        designation: row.job_title || '',
        totalDays: 0,
        presentDays: 0,
        weeklyOffs: 0,
        paidLeaves: 0,
        holidays: 0,
        lopDays: 0,
        totalWorkHours: 0,
        totalOvertimeHours: 0,
        dailyStatus: {},
      });
    }
    if (!row.attendance_date) continue;
    const person = people.get(row.id);
    const day = new Date(row.attendance_date).getDate();
    const present = ['present', 'late', 'early_departure', 'wfh', 'field_duty', 'half_day'].includes(row.day_status);
    person.totalDays += 1;
    if (present) person.presentDays += row.day_status === 'half_day' ? 0.5 : 1;
    if (row.day_status === 'weekly_off') person.weeklyOffs += 1;
    if (row.day_status === 'on_leave') person.paidLeaves += 1;
    if (row.day_status === 'holiday') person.holidays += 1;
    if (row.day_status === 'absent') person.lopDays += 1;
    person.totalWorkHours += Number(row.net_work_duration_minutes || 0) / 60;
    person.totalOvertimeHours += Number(row.overtime_duration_minutes || 0) / 60;
    person.dailyStatus[day] = present ? 'P' : row.day_status === 'weekly_off' ? 'WO' : row.day_status === 'on_leave' ? 'L' : row.day_status === 'holiday' ? 'H' : 'A';
  }
  const records = [...people.values()].map((person) => ({
    ...person,
    totalWorkHours: Math.round(person.totalWorkHours * 10) / 10,
    totalOvertimeHours: Math.round(person.totalOvertimeHours * 10) / 10,
  }));
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalHeadcount: records.length,
      period: `${dateFrom} to ${dateTo}`,
      department: 'All departments',
    },
    records,
  };
}

export async function payPeriod(tenantId: string) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [counts] = await pool.query<RowDataPacket[]>(
    `SELECT
       (SELECT COUNT(*) FROM tp_employees WHERE tenant_id = ? AND deleted_at IS NULL) AS employees,
       (SELECT COUNT(*) FROM tp_attendance_days WHERE tenant_id = ? AND attendance_date BETWEEN ? AND ? AND day_status IN ('present','late','wfh','field_duty')) AS present_days,
       (SELECT COUNT(*) FROM tp_attendance_exceptions WHERE tenant_id = ? AND status = 'open') AS open_exceptions,
       (SELECT COUNT(*) FROM tp_regularisation_requests WHERE tenant_id = ? AND status = 'pending') AS pending_requests`,
    [tenantId, tenantId, start, end, tenantId, tenantId]
  );
  const row = counts[0] || {};
  return {
    id: `prd_${start}`,
    tenantId,
    periodCode: `PAY-${start.slice(0, 7)}`,
    name: `Pay period ${start} to ${end}`,
    startDate: start,
    endDate: end,
    status: 'open',
    totalEmployees: Number(row.employees || 0),
    totalPayableDays: Number(row.present_days || 0),
    totalPresentDays: Number(row.present_days || 0),
    totalPaidLeaves: 0,
    totalLopDays: 0,
    totalOvertimeHours: 0,
    pendingExceptionsCount: Number(row.open_exceptions || 0),
    pendingRegularisationsCount: Number(row.pending_requests || 0),
    readinessPercentage: Number(row.open_exceptions || 0) === 0 ? 100 : 80,
  };
}
