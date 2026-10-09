import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { UserProfileDTO } from '@infi-timepro/shared-types';
import { TokenBlacklistService } from '../../services/token-blacklist.service.js';

export class AuthService {
  async login(
    emailOrUsername: string,
    passwordPlain: string
  ): Promise<{ token: string; refreshToken: string; user: UserProfileDTO; expiresIn: string }> {
    // In production, verify against tp_users with Argon2id
    // Demo seed authentication fallback:
    const user: UserProfileDTO = {
      id: 'usr_naresh_001',
      tenantId: 'ten_acme_001',
      email: emailOrUsername.includes('@') ? emailOrUsername : 'naresh@company.com',
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

    const token = jwt.sign(
      { ...user, tokenType: 'access', jti: crypto.randomUUID() },
      config.jwtSecret,
      { expiresIn: (config.jwtExpiresIn as any) || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, email: user.email, role: user.role, tokenType: 'refresh', jti: crypto.randomUUID() },
      config.jwtSecret,
      { expiresIn: (config.jwtRefreshExpiresIn as any) || '7d' }
    );

    return { token, refreshToken, user, expiresIn: config.jwtExpiresIn };
  }

  async refresh(
    refreshTokenStr: string
  ): Promise<{ token: string; refreshToken: string; user: UserProfileDTO; expiresIn: string }> {
    if (!refreshTokenStr) {
      const err: any = new Error('Refresh token is required');
      err.code = 'ERR_INVALID_INPUT';
      throw err;
    }

    if (TokenBlacklistService.isTokenRevoked(refreshTokenStr)) {
      const err: any = new Error('Refresh token has been revoked');
      err.code = 'ERR_TOKEN_REVOKED';
      throw err;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshTokenStr, config.jwtSecret);
    } catch (err: any) {
      const isExpired = err instanceof jwt.TokenExpiredError || err?.name === 'TokenExpiredError';
      const error: any = new Error(isExpired ? 'Refresh token expired. Please log in again.' : 'Invalid refresh token');
      error.code = isExpired ? 'ERR_TOKEN_EXPIRED' : 'ERR_TOKEN_INVALID';
      if (isExpired && err.expiredAt) {
        error.expiredAt = err.expiredAt.toISOString();
      }
      throw error;
    }

    if (decoded.tokenType !== 'refresh') {
      const err: any = new Error('Supplied token is not a valid refresh token');
      err.code = 'ERR_TOKEN_INVALID';
      throw err;
    }

    if (TokenBlacklistService.isTenantSuspended(decoded.tenantId)) {
      const err: any = new Error('Tenant access has been suspended or deleted');
      err.code = 'ERR_TENANT_SUSPENDED';
      throw err;
    }

    const user: UserProfileDTO = {
      id: decoded.userId || decoded.id || 'usr_naresh_001',
      tenantId: decoded.tenantId || 'ten_acme_001',
      email: decoded.email || 'naresh@company.com',
      username: decoded.username || 'naresh',
      firstName: decoded.firstName || 'Naresh',
      lastName: decoded.lastName || 'Andukoori',
      avatarUrl: decoded.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop',
      role: decoded.role || 'ADMIN',
      employeeId: decoded.employeeId || 'emp_naresh_001',
      departmentName: decoded.departmentName || 'Human Resources',
      locationName: decoded.locationName || 'Hyderabad Main Office',
      permissions: decoded.permissions || ['*'],
    };

    // Rotate refresh token
    TokenBlacklistService.revokeToken(refreshTokenStr);

    const token = jwt.sign(
      { ...user, tokenType: 'access', jti: crypto.randomUUID() },
      config.jwtSecret,
      { expiresIn: (config.jwtExpiresIn as any) || '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, email: user.email, role: user.role, tokenType: 'refresh', jti: crypto.randomUUID() },
      config.jwtSecret,
      { expiresIn: (config.jwtRefreshExpiresIn as any) || '7d' }
    );

    return { token, refreshToken: newRefreshToken, user, expiresIn: config.jwtExpiresIn };
  }

  async logout(token?: string, refreshToken?: string): Promise<void> {
    if (token) {
      TokenBlacklistService.revokeToken(token);
    }
    if (refreshToken) {
      TokenBlacklistService.revokeToken(refreshToken);
    }
  }
}

export const authService = new AuthService();
