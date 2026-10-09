import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UserProfileDTO } from '@infi-timepro/shared-types';
import { TokenBlacklistService } from '../services/token-blacklist.service.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfileDTO;
}

export function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const isDevelopment = config.nodeEnv === 'development' || config.nodeEnv === 'test';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDevelopment) {
      req.user = {
        id: 'usr_naresh_001',
        tenantId: 'ten_acme_001',
        email: 'naresh@company.com',
        username: 'naresh',
        firstName: 'Naresh',
        lastName: 'Andukoori',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop',
        role: 'ADMIN',
        employeeId: 'emp_naresh_001',
        departmentName: 'Human Resources',
        locationName: 'Hyderabad Main Office',
        permissions: ['*'],
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      error: { code: 'ERR_UNAUTHORIZED', message: 'Missing or invalid bearer token' },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'req_unknown',
    });
  }

  const token = authHeader.split(' ')[1];

  if (TokenBlacklistService.isTokenRevoked(token)) {
    return res.status(401).json({
      success: false,
      error: { code: 'ERR_TOKEN_REVOKED', message: 'Token has been revoked or session terminated' },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'req_unknown',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as UserProfileDTO & { tokenType?: string };

    if (decoded.tokenType === 'refresh') {
      return res.status(401).json({
        success: false,
        error: { code: 'ERR_TOKEN_INVALID', message: 'Refresh token cannot be used to authenticate API requests' },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'req_unknown',
      });
    }

    if (TokenBlacklistService.isTenantSuspended(decoded.tenantId)) {
      return res.status(403).json({
        success: false,
        error: { code: 'ERR_TENANT_SUSPENDED', message: 'Tenant access has been suspended or deleted' },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'req_unknown',
      });
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (isDevelopment && token.startsWith('demo-jwt-token')) {
      req.user = {
        id: 'usr_naresh_001',
        tenantId: 'ten_acme_001',
        email: 'naresh@company.com',
        username: 'naresh',
        firstName: 'Naresh',
        lastName: 'Andukoori',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop',
        role: 'ADMIN',
        employeeId: 'emp_naresh_001',
        departmentName: 'Human Resources',
        locationName: 'Hyderabad Main Office',
        permissions: ['*'],
      };
      return next();
    }

    const isExpired = err instanceof jwt.TokenExpiredError || err?.name === 'TokenExpiredError';
    const errorCode = isExpired ? 'ERR_TOKEN_EXPIRED' : 'ERR_TOKEN_INVALID';
    const errorMessage = isExpired ? 'Access token expired or invalid' : 'Invalid or malformed authentication token';

    return res.status(401).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        ...(isExpired && err.expiredAt ? { expiredAt: err.expiredAt.toISOString() } : {}),
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'req_unknown',
    });
  }
}
