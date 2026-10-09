import { Router, Request, Response } from 'express';
import { authService } from './auth.service.js';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'ERR_INVALID_INPUT', message: 'Email and password are required' },
      });
    }

    const result = await authService.login(email, password);
    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ERR_AUTH_FAILED', message: err.message },
    });
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'ERR_INVALID_INPUT', message: 'Refresh token is required in body or x-refresh-token header' },
      });
    }

    const result = await authService.refresh(String(refreshToken));
    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  } catch (err: any) {
    const statusCode = err.code === 'ERR_TENANT_SUSPENDED' ? 403 : 401;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERR_TOKEN_EXPIRED',
        message: err.message || 'Token refresh failed',
        ...(err.expiredAt ? { expiredAt: err.expiredAt } : {}),
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
    });
  }
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const refreshToken = req.body?.refreshToken;

    await authService.logout(token, refreshToken);
    return res.json({
      success: true,
      message: 'Logged out successfully. Tokens invalidated.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ERR_LOGOUT_FAILED', message: err.message },
    });
  }
});
