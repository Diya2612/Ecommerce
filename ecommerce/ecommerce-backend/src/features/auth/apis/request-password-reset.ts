/**
 * POST /api/auth/password-reset/request
 * Request password reset link via email.
 */

import { Router, Request, Response } from 'express';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { handleRequestPasswordReset } from '../services/auth.service';
import { requestPasswordResetSchema } from '../shared/validation';
import { RequestPasswordResetDto } from '../shared/interface';

const handler = async (req: Request, res: Response) => {
  const { email }: RequestPasswordResetDto = req.body;
  const result = await handleRequestPasswordReset(email);
  ResponseFormatter.success(res, result, result.message);
};

const router = Router();
router.post('/password-reset/request', validationMiddleware(requestPasswordResetSchema), handler);

export default router;
