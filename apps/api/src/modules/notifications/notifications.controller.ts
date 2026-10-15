import crypto from 'crypto';
import { Router, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { AuthenticatedRequest, authGuard } from '../../middleware/auth-guard.js';
import { pool } from '../../database/db.js';
import { notifyEmployee } from './push.js';

export const notificationsRouter = Router();

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tp_push_tokens (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      token VARCHAR(512) NOT NULL,
      platform VARCHAR(20) NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_push_token (token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

notificationsRouter.post('/device', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = String(req.body?.token || '').trim();
    const employeeId = req.user?.employeeId;
    const tenantId = req.user?.tenantId || 'ten_acme_001';
    if (!token || !employeeId) {
      return res.status(400).json({ success: false, error: { message: 'A signed-in employee and a device token are required.' } });
    }
    await ensureTable();
    await pool.query(
      `INSERT INTO tp_push_tokens (id, tenant_id, employee_id, token, platform)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE employee_id = VALUES(employee_id), tenant_id = VALUES(tenant_id), platform = VALUES(platform)`,
      [`push_${crypto.randomUUID().slice(0, 8)}`, tenantId, employeeId, token, String(req.body?.platform || 'android')]
    );
    res.json({ success: true, data: { registered: true } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

notificationsRouter.post('/test', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await notifyEmployee(
      req.user?.tenantId || 'ten_acme_001',
      req.user?.employeeId || '',
      'InfiTimePro',
      'Push notifications are connected for this phone.'
    );
    res.status(result.sent ? 200 : 503).json({ success: result.sent, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export async function tokensFor(tenantId: string, employeeId: string): Promise<string[]> {
  await ensureTable();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT token FROM tp_push_tokens WHERE tenant_id = ? AND employee_id = ?`,
    [tenantId, employeeId]
  );
  return rows.map((row) => String(row.token));
}
