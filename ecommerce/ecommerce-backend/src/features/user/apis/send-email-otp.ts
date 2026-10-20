/**
 * POST /api/users/send-otp
 * Send verification code to email.
 */

import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, logger } from '../../../utils';
import { otpService } from '../services/otp.service';
import { sendOtpSchema, type SendOtpDto } from '../shared/validation';

const handler = async (req: Request, res: Response) => {
  const data: SendOtpDto = req.body;

  logger.info('Sending OTP', { email: data.email, purpose: data.purpose });

  const result = await otpService.generateAndSendOtp(data.email, data.purpose);

  ResponseFormatter.success(
    res,
    {
      success: result.success,
      expiresIn: result.expiresIn,
      message: 'Verification code sent to your email',
    },
    'OTP sent successfully',
  );
};

const router = Router();
router.post('/send-otp', validationMiddleware(sendOtpSchema), handler);

export default router;
