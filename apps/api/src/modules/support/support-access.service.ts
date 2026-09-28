import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

export interface SupportGrantDTO {
  grantId: string;
  tenantId: string;
  tenantName: string;
  grantedByUserId: string;
  grantedByEmail: string;
  reason: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
  mfaVerified: boolean;
}

export interface AuditLogRecord {
  timestamp: string;
  action: string;
  tenantId: string;
  userId: string;
  details: any;
}

export class SupportAccessService {
  private static activeGrants: SupportGrantDTO[] = [];
  private static auditLogs: AuditLogRecord[] = [];

  /**
   * Tenant Admin generates explicit, audited, time-limited support access grant token.
   * Requires MFA step-up verification (mfaVerified === true).
   */
  static async grantSupportAccess(
    tenantId: string,
    tenantName: string,
    grantedByUserId: string,
    grantedByEmail: string,
    reason: string,
    durationHours: number = 1,
    mfaVerified: boolean = true
  ): Promise<SupportGrantDTO> {
    if (!mfaVerified) {
      throw new Error('MFA_STEP_UP_REQUIRED: Break-glass support tokens require multi-factor authentication verification.');
    }

    const maxDuration = Math.min(durationHours, 1); // Capped at maximum 1 hour
    const grantId = `sp-grant-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + maxDuration * 3600 * 1000).toISOString();

    const payload = {
      grantId,
      tenantId,
      grantedByUserId,
      grantedByEmail,
      type: 'SUPPORT_BREAK_GLASS',
      mfaVerified: true,
      expiresAt
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: `${maxDuration}h` });

    const grant: SupportGrantDTO = {
      grantId,
      tenantId,
      tenantName,
      grantedByUserId,
      grantedByEmail,
      reason,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
      isActive: true,
      mfaVerified: true
    };

    this.activeGrants.unshift(grant);
    this.logAuditEvent('SUPPORT_GRANT_CREATED', tenantId, grantedByUserId, { grantId, reason, expiresAt });

    return grant;
  }

  /**
   * Validate incoming Support Access Grant Token presented by Super Admin.
   */
  static async validateSupportToken(token: string, targetTenantId?: string): Promise<SupportGrantDTO | null> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      if (decoded.type !== 'SUPPORT_BREAK_GLASS' || !decoded.mfaVerified) return null;

      if (targetTenantId && decoded.tenantId !== targetTenantId) {
        this.logAuditEvent('SUPPORT_ACCESS_SCOPE_MISMATCH', targetTenantId, decoded.grantedByUserId, {
          tokenTenant: decoded.tenantId,
          targetTenant: targetTenantId
        });
        return null;
      }

      const grant = this.activeGrants.find((g) => g.grantId === decoded.grantId && g.isActive);
      if (!grant) return null;

      if (targetTenantId && grant.tenantId !== targetTenantId) {
        return null;
      }

      if (new Date(grant.expiresAt).getTime() < Date.now()) {
        grant.isActive = false;
        return null;
      }

      this.logAuditEvent('SUPPORT_ACCESS_ACTIVATED', grant.tenantId, decoded.grantedByUserId, { grantId: grant.grantId });
      return grant;
    } catch (err) {
      return null;
    }
  }

  /**
   * Revoke support access grant immediately.
   */
  static async revokeSupportAccess(grantId: string, revokedByUserId: string = 'system'): Promise<boolean> {
    const grant = this.activeGrants.find((g) => g.grantId === grantId);
    if (!grant) return false;
    grant.isActive = false;
    this.logAuditEvent('SUPPORT_GRANT_REVOKED', grant.tenantId, revokedByUserId, { grantId });
    return true;
  }

  static getAuditLogs(tenantId?: string): AuditLogRecord[] {
    if (!tenantId) return [...this.auditLogs];
    return this.auditLogs.filter(l => l.tenantId === tenantId);
  }

  private static logAuditEvent(action: string, tenantId: string, userId: string, details: any): void {
    this.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      tenantId,
      userId,
      details
    });
  }
}
