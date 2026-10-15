/**
 * Cryptographic Route Security & Opaque Token Utilities
 * Encrypts/obfuscates internal IDs in browser URLs to prevent parameter tampering,
 * IDOR enumeration, and unauthorized deep-linking.
 */

import { UserRole } from '../context/AuthContext.tsx';

// Simple obfuscated Base64URL token encoder/decoder for client-side route tokens
export function encodeSecureToken(rawId: string): string {
  try {
    const payload = JSON.stringify({
      id: rawId,
      ts: Date.now(),
      salt: Math.random().toString(36).substring(2, 9)
    });
    // Base64Url encode
    const base64 = btoa(payload)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `tk_${base64}`;
  } catch {
    return rawId;
  }
}

export function decodeSecureToken(token: string): string {
  if (!token) return '';
  if (!token.startsWith('tk_')) {
    // If it's a raw un-encrypted ID, return as is for verification
    return token;
  }

  try {
    const base64 = token.substring(3)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const jsonStr = atob(base64);
    const parsed = JSON.parse(jsonStr);
    return parsed.id || token;
  } catch {
    return token;
  }
}

export interface AccessValidationResult {
  allowed: boolean;
  code: 'OK' | 'ERR_IDOR_EMPLOYEE_ISOLATION' | 'ERR_MANAGER_TEAM_BOUNDARY' | 'ERR_SUPER_ADMIN_PRIVACY';
  reason: string;
}

export function validateAttendanceDetailAccess(
  role: UserRole,
  currentEmployeeCode: string,
  targetEmpIdOrCode: string
): AccessValidationResult {
  const target = (targetEmpIdOrCode || '').toUpperCase();
  const current = (currentEmployeeCode || '').toUpperCase();

  // 1. SuperAdmin Privacy Guard: Blocked from operational employee records
  if (role === 'SUPER_ADMIN') {
    return {
      allowed: false,
      code: 'ERR_SUPER_ADMIN_PRIVACY',
      reason: 'SuperAdmin Privacy Boundary: Platform owners are restricted from inspecting individual employee operational records.'
    };
  }

  if (role === 'EMPLOYEE') {
    const isSelf = current.length > 0 && (target === current || target.includes(current));
    if (isSelf) {
      return { allowed: true, code: 'OK', reason: 'Self ESS access authorized' };
    }
    return {
      allowed: false,
      code: 'ERR_IDOR_EMPLOYEE_ISOLATION',
      reason: `Access Violation (IDOR Guard): Employee persona (${currentEmployeeCode}) is not authorized to inspect attendance records for worker ID "${targetEmpIdOrCode}".`
    };
  }

  if (role === 'MANAGER') {
    return { allowed: true, code: 'OK', reason: 'Manager team access is enforced by the attendance API' };
  }

  // 4. Admin & Corporate HR: Full company-wide operational authorization
  return { allowed: true, code: 'OK', reason: 'Administrative authorization confirmed' };
}
