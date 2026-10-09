import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authGuard, AuthenticatedRequest } from '../src/middleware/auth-guard.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { config } from '../src/config/env.js';
import { TokenBlacklistService } from '../src/services/token-blacklist.service.js';

describe('AuthGuard & Token Expiration Lifecycle', () => {
  beforeEach(() => {
    TokenBlacklistService.reset();
  });

  const createMockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('1. Should allow request with valid JWT access token', async () => {
    const payload = {
      id: 'usr_test_001',
      tenantId: 'ten_test_001',
      email: 'test@company.com',
      role: 'ADMIN',
      tokenType: 'access',
    };
    const validToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

    const req: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${validToken}` },
    };
    const res = createMockResponse();
    const next = vi.fn();

    authGuard(req as AuthenticatedRequest, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.id).toBe('usr_test_001');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('2. Should reject expired access token with ERR_TOKEN_EXPIRED and 401 status', async () => {
    const payload = {
      id: 'usr_test_001',
      tenantId: 'ten_test_001',
      email: 'test@company.com',
      role: 'ADMIN',
      tokenType: 'access',
    };
    // Sign token expired 1 hour ago
    const expiredToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '-1h' });

    const req: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${expiredToken}` },
    };
    const res = createMockResponse();
    const next = vi.fn();

    authGuard(req as AuthenticatedRequest, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_TOKEN_EXPIRED',
          message: 'Access token expired or invalid',
        }),
      })
    );
  });

  it('3. Should reject invalid/malformed JWT with ERR_TOKEN_INVALID', async () => {
    const malformedToken = 'invalid.jwt.token-signature';

    const req: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${malformedToken}` },
    };
    const res = createMockResponse();
    const next = vi.fn();

    authGuard(req as AuthenticatedRequest, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_TOKEN_INVALID',
        }),
      })
    );
  });

  it('4. Should reject refresh tokens used directly as access tokens', async () => {
    const refreshPayload = {
      userId: 'usr_test_001',
      tenantId: 'ten_test_001',
      email: 'test@company.com',
      tokenType: 'refresh',
    };
    const refreshToken = jwt.sign(refreshPayload, config.jwtSecret, { expiresIn: '7d' });

    const req: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${refreshToken}` },
    };
    const res = createMockResponse();
    const next = vi.fn();

    authGuard(req as AuthenticatedRequest, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_TOKEN_INVALID',
          message: 'Refresh token cannot be used to authenticate API requests',
        }),
      })
    );
  });

  it('5. Should reject revoked token with ERR_TOKEN_REVOKED', async () => {
    const payload = {
      id: 'usr_test_001',
      tenantId: 'ten_test_001',
      email: 'test@company.com',
      role: 'ADMIN',
      tokenType: 'access',
    };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

    TokenBlacklistService.revokeToken(token);

    const req: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createMockResponse();
    const next = vi.fn();

    authGuard(req as AuthenticatedRequest, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_TOKEN_REVOKED',
        }),
      })
    );
  });

  it('6. Should reject access when tenant is suspended with ERR_TENANT_SUSPENDED (403)', async () => {
    const payload = {
      id: 'usr_test_001',
      tenantId: 'ten_suspended_001',
      email: 'test@suspended.com',
      role: 'ADMIN',
      tokenType: 'access',
    };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

    TokenBlacklistService.suspendTenantSessions('ten_suspended_001');

    const req: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createMockResponse();
    const next = vi.fn();

    authGuard(req as AuthenticatedRequest, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_TENANT_SUSPENDED',
        }),
      })
    );
  });

  it('7. Should issue both access token and refresh token on login and successfully refresh', async () => {
    const loginResult = await authService.login('naresh@company.com', 'Admin@123');

    expect(loginResult.token).toBeDefined();
    expect(loginResult.refreshToken).toBeDefined();
    expect(loginResult.user.id).toBe('usr_naresh_001');

    // Verify refresh token works
    const refreshResult = await authService.refresh(loginResult.refreshToken);
    expect(refreshResult.token).toBeDefined();
    expect(refreshResult.refreshToken).toBeDefined();
    expect(refreshResult.token).not.toBe(loginResult.token);

    // Old refresh token must be revoked (rotation)
    await expect(authService.refresh(loginResult.refreshToken)).rejects.toThrow();
  });
});
