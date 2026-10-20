/**
 * POST /api/users/verify-otp
 * Verify email verification code.
 */

import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, logger } from '../../../utils';
import { otpService } from '../services/otp.service';
import { verifyOtpSchema, type VerifyOtpDto } from '../shared/validation';

const handler = async (req: Request, res: Response) => {
  const data: VerifyOtpDto = req.body;

  logger.info('Verifying OTP', { email: data.email, purpose: data.purpose });

  const result = await otpService.verifyOtp(data.email, data.otp, data.purpose);

  ResponseFormatter.success(
    res,
    {
      verified: result.verified,
    },
    'Email verified successfully',
  );
};

const router = Router();
router.post('/verify-otp', validationMiddleware(verifyOtpSchema), handler);

export default router;
