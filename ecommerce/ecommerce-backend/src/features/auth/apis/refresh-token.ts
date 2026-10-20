/**
 * POST /api/auth/refresh-token
 * Refresh access token using Supabase Auth.
 */

import { Router, Request, Response } from 'express';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { authRateLimit } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { refreshTokenSchema } from '../shared/validation';
import { RefreshTokenDto } from '../shared/interface';
import { handleRefreshToken } from '../services/auth.service';

const handler = async (req: Request, res: Response) => {
  const { refreshToken }: RefreshTokenDto = req.body;
  const result = await handleRefreshToken(refreshToken);
  ResponseFormatter.success(res, result, 'Token refreshed successfully');
};

const router = Router();
router.post('/refresh-token', authRateLimit, validationMiddleware(refreshTokenSchema), handler);

export default router;
