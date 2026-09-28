import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth-guard.js';
import { SupportAccessService } from '../modules/support/support-access.service.js';

/**
 * Super Admin Privacy Guard Middleware with Audited Break-Glass Support Access
 * Restricts SUPER_ADMIN role from viewing or mutating tenant operational data by default.
 * Super Admin is strictly scoped to platform tenant management, billing, and gateway configs.
 * Exceptional support access requires an active, time-limited Support Access Grant Token issued by Tenant Admin.
 */
export async function superAdminPrivacyGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    const supportToken = req.headers['x-support-grant-token'] as string;

    if (supportToken) {
      const grant = await SupportAccessService.validateSupportToken(supportToken);
      if (grant) {
        console.warn(
          `⚠️ AUDIT ALARM: Super Admin ${req.user.email} activated Break-Glass Support Access for Tenant ${grant.tenantId} (Grant ID: ${grant.grantId}, Reason: ${grant.reason})`
        );
        (req as any).supportGrant = grant;
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'ERR_SUPER_ADMIN_PRIVACY_BOUNDARY',
        message:
          'Super Admin Privacy Boundary Safeguard: Access to tenant operational data (attendance, employees, shifts, policies) is restricted by default. To request support access, Tenant Admin must issue a time-limited Support Grant Token presented via X-Support-Grant-Token header.'
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || `req_${Date.now()}`
    });
  }
  next();
}
