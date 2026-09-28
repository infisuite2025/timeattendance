import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth-guard.js';

export function requirePermissions(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'ERR_UNAUTHORIZED', message: 'User not authenticated' },
      });
    }

    if (req.user.permissions.includes('*')) {
      return next();
    }

    const hasAll = requiredPermissions.every((perm) => req.user?.permissions.includes(perm));
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ERR_FORBIDDEN',
          message: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        },
      });
    }

    next();
  };
}

export interface ResourceDataScope {
  employeeId?: string;
  departmentName?: string;
}

/**
 * Enforces Same-Tenant Object/Data Scope Authorization (Employee vs Manager vs Admin).
 */
export function checkSameTenantDataScope(user: AuthenticatedRequest['user'], resource: ResourceDataScope): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.permissions?.includes('*')) return true;

  if (user.role === 'EMPLOYEE') {
    return resource.employeeId === user.employeeId;
  }

  if (user.role === 'MANAGER') {
    if (resource.employeeId === user.employeeId) return true;
    if (user.departmentName && resource.departmentName) {
      return user.departmentName === resource.departmentName;
    }
    return false;
  }

  return false;
}
