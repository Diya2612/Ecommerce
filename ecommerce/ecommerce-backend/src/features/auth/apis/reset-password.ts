/**
 * POST /api/auth/password-reset/confirm
 * Reset password with token from email.
 */

import { Router, Request, Response } from 'express';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { handleResetPassword } from '../services/auth.service';
import { resetPasswordSchema } from '../shared/validation';
import { ResetPasswordDto } from '../shared/interface';

const handler = async (req: Request, res: Response) => {
  const { access_token, new_password }: ResetPasswordDto = req.body;
  const result = await handleResetPassword(access_token, new_password);
  ResponseFormatter.success(res, result, result.message);
};

const router = Router();
router.post('/password-reset/confirm', validationMiddleware(resetPasswordSchema), handler);

export default router;
