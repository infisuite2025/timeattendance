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
