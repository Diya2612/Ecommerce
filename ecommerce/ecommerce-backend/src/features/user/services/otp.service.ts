/**
 * OTP Service
 * Handles generation, storage, and verification of email OTPs.
 */

import { db } from '../../../database';
import { emailOtps } from '../shared/email-otp.schema';
import { eq, and, gt, lt, isNull } from 'drizzle-orm';
import { logger } from '../../../utils';
import { emailService } from '../../../utils/email/email.service';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate a random 6-digit OTP.
 */
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Service for email verification OTPs.
 */
class OtpService {
  /**
   * Generate and send OTP to email.
   */
  async generateAndSendOtp(
    email: string,
    purpose: string = 'email_verification',
  ): Promise<{ success: boolean; expiresIn: number }> {
    try {
      const otpCode = generateOtpCode();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      // Invalidate existing OTPs
      await db
        .delete(emailOtps)
        .where(and(eq(emailOtps.email, email.toLowerCase()), eq(emailOtps.purpose, purpose)));

      await db.insert(emailOtps).values({
        email: email.toLowerCase(),
        otp_code: otpCode,
        purpose,
        attempts: 0,
        max_attempts: MAX_ATTEMPTS,
        expires_at: expiresAt,
      });

      await emailService.sendOtpEmail({
        to: email,
        otp: otpCode,
        expiresIn: `${OTP_EXPIRY_MINUTES} minutes`,
      });

      logger.info(`OTP sent successfully to ${email}`);

      return {
        success: true,
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      };
    } catch (error) {
      logger.error('Failed to generate/send OTP', { email, error });
      throw error;
    }
  }

  /**
   * Verify OTP code and update user verification status.
   */
  async verifyOtp(
    email: string,
    code: string,
    purpose: string = 'email_verification',
  ): Promise<{ verified: boolean }> {
    const normalizedEmail = email.toLowerCase();
    const now = new Date();

    const [otp] = await db
      .select()
      .from(emailOtps)
      .where(
        and(
          eq(emailOtps.email, normalizedEmail),
          eq(emailOtps.purpose, purpose),
          gt(emailOtps.expires_at, now),
          isNull(emailOtps.verified_at),
        ),
      )
      .limit(1);

    if (!otp) {
      logger.warn(`No valid OTP found for ${email}`);
      throw new Error('OTP expired or not found. Please request a new code.');
    }

    if (otp.attempts >= otp.max_attempts) {
      logger.warn(`Max OTP attempts exceeded for ${email}`);
      throw new Error('Maximum attempts exceeded. Please request a new code.');
    }

    if (otp.otp_code !== code) {
      await db
        .update(emailOtps)
        .set({ attempts: otp.attempts + 1 })
        .where(eq(emailOtps.id, otp.id));

      const remainingAttempts = otp.max_attempts - otp.attempts - 1;
      logger.warn(`Invalid OTP attempt for ${email}, ${remainingAttempts} attempts remaining`);
      throw new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
    }

    await db.update(emailOtps).set({ verified_at: now }).where(eq(emailOtps.id, otp.id));

    const { users } = await import('../shared/user.schema');

    const [userByPrimaryEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (userByPrimaryEmail) {
      await db
        .update(users)
        .set({
          email_verified: true,
          email_verified_at: now,
        })
        .where(eq(users.id, userByPrimaryEmail.id));
      logger.info(`OTP verified for primary email ${email}`);
    } else {
      const [userBySecondaryEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.secondary_email, normalizedEmail))
        .limit(1);

      if (userBySecondaryEmail) {
        await db
          .update(users)
          .set({
            secondary_email_verified: true,
          })
          .where(eq(users.id, userBySecondaryEmail.id));
        logger.info(`OTP verified for secondary email ${email}`);
      } else {
        logger.warn(`No user found with email ${email}`);
      }
    }

    return { verified: true };
  }

  /**
   * Clean up expired OTP entries.
   */
  async cleanupExpiredOtps(): Promise<number> {
    await db.delete(emailOtps).where(lt(emailOtps.expires_at, new Date()));
    return 0;
  }
}

export const otpService = new OtpService();
export { OtpService };
