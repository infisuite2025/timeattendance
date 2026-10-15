import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../database/db.js';
import type { RowDataPacket } from 'mysql2';

const projectId = 'infitimepro';

function serviceAccount(): { client_email: string; private_key: string } | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const file = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../firebase-service-account.json');
  try {
    const raw = inline || (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

function accessToken(account: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = signer.sign(account.private_key).toString('base64url');
  const assertion = `${header}.${claim}.${signature}`;
  return fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  }).then(async (response) => {
    const body = await response.json() as { access_token?: string; error?: string };
    if (!response.ok || !body.access_token) throw new Error(body.error || 'Firebase auth failed');
    return body.access_token;
  });
}

export async function notifyEmployee(tenantId: string, employeeId: string, title: string, body: string) {
  if (!employeeId) return { sent: false, reason: 'No employee to notify.' };
  const account = serviceAccount();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT token FROM tp_push_tokens WHERE tenant_id = ? AND employee_id = ?`,
    [tenantId, employeeId]
  ).catch(() => [[]] as [RowDataPacket[]]);
  const tokens = (rows as RowDataPacket[]).map((row) => String(row.token)).filter(Boolean);
  if (!account) {
    return { sent: false, reason: 'Add the Firebase service-account JSON so the server can send messages.', tokens: tokens.length };
  }
  if (tokens.length === 0) return { sent: false, reason: 'This person has not opened the app since notifications were turned on.', tokens: 0 };
  const bearer = await accessToken(account);
  let delivered = 0;
  for (const token of tokens) {
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          android: { notification: { channel_id: 'infitimepro_alerts' } },
        },
      }),
    });
    if (response.ok) delivered += 1;
  }
  return { sent: delivered > 0, delivered, tokens: tokens.length };
}

export async function notifyManagerOf(tenantId: string, employeeId: string, title: string, body: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT reporting_manager_id FROM tp_employees WHERE tenant_id = ? AND id = ? LIMIT 1`,
    [tenantId, employeeId]
  );
  const managerId = rows[0]?.reporting_manager_id as string | undefined;
  if (!managerId) return { sent: false, reason: 'No manager is assigned.' };
  return notifyEmployee(tenantId, managerId, title, body);
}
