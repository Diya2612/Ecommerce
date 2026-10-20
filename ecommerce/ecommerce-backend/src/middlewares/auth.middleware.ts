import { NextFunction, Response, Request } from 'express';
import { HttpException } from '../utils';
import { logger } from '../utils';
import { verifySupabaseToken } from '../features/auth/services/supabase-auth.service';
import { db } from '../database';
import { users } from '../features/user/shared/user.schema';
import { customerProfiles } from '../features/customer/shared/customer-profiles.schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { redisClient } from '../utils/database/redis';

/**
 * @description Enforces strict Supabase JWT authentication. Verifies token signatures against JWKS
 * and synchronizes the stateless token payload with local user profile records for RBAC and access control.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const clientIP = req.ip || req.connection?.remoteAddress || 'Unknown';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: Missing or invalid authorization header', {
        ip: clientIP,
        userAgent,
        url: req.originalUrl,
        method: req.method,
      });
      return next(new HttpException(401, 'Authentication required. No token provided.'));
    }

    const token = authHeader.substring(7);

    if (!token || token === 'null') {
      logger.warn('Authentication failed: Null token provided', {
        ip: clientIP,
        userAgent,
        url: req.originalUrl,
        method: req.method,
      });
      return next(new HttpException(401, 'Authentication required. No token provided.'));
    }

    const authPayload = await verifySupabaseToken(token);

    if (!authPayload) {
      logger.warn('Authentication failed: Invalid Supabase token', {
        ip: clientIP,
        userAgent,
        url: req.originalUrl,
        method: req.method,
      });
      return next(new HttpException(401, 'Invalid or expired token'));
    }

    const result = await db
      .select({
        user: users,
        profile: customerProfiles,
      })
      .from(users)
      .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
      .where(eq(users.auth_id, authPayload.sub as string))
      .limit(1);

    if (!result[0] || !result[0].user) {
      logger.warn('Authentication failed: User sync not found', {
        ip: clientIP,
        userAgent,
        url: req.originalUrl,
        method: req.method,
      });
      return next(new HttpException(401, 'User not found'));
    }

    const { user, profile } = result[0];

    if (user.is_deleted) {
      logger.warn('Authentication failed: User account is deleted', {
        ip: clientIP,
        userAgent,
        url: req.originalUrl,
        method: req.method,
      });
      return next(new HttpException(401, 'User account has been deleted'));
    }

    if (profile) {
      if (profile.account_status === 'inactive') {
        logger.warn('Authentication failed: User account is inactive', {
          ip: clientIP,
          userId: user.id,
          status: profile.account_status,
        });
        return next(new HttpException(403, 'Your account is inactive. Please contact support.'));
      }
    }

    req.userId = user.id;
    req.userAgent = userAgent;
    req.clientIP = clientIP;

    logger.info('Authentication successful', {
      userId: user.id,
      ip: clientIP,
      userAgent: userAgent.substring(0, 100), // Truncate for logging
      url: req.originalUrl,
      method: req.method,
    });

    // Implement ephemeral session tracking for active user monitoring and security analytics.
    try {
      if (redisClient.isReady) {
        const sessionHash = crypto.createHash('sha256').update(token).digest('hex');
        const sessionKey = `session:${req.userId}:${sessionHash}`;

        const sessionData = {
          ip: clientIP,
          userAgent: userAgent,
          lastActive: new Date().toISOString(),
        };

        await redisClient.set(sessionKey, JSON.stringify(sessionData), { EX: 60 * 60 * 24 * 7 });
      }
    } catch (sessionError) {
      logger.error('Failed to track session in Redis:', sessionError);
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);

    if (error instanceof HttpException) {
      return next(error);
    }

    return next(new HttpException(500, 'Authentication error'));
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token || token === 'null') {
      return next();
    }

    const authPayload = await verifySupabaseToken(token);

    if (!authPayload) {
      return next(new HttpException(401, 'Invalid or expired token'));
    }

    const result = await db
      .select({
        user: users,
        profile: customerProfiles,
      })
      .from(users)
      .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
      .where(eq(users.auth_id, authPayload.sub as string))
      .limit(1);

    if (!result[0] || !result[0].user) {
      return next(new HttpException(401, 'User not found'));
    }

    const { user, profile } = result[0];

    if (user.is_deleted) {
      return next(new HttpException(401, 'User account has been deleted'));
    }

    if (profile) {
      if (profile.account_status === 'inactive') {
        return next(new HttpException(403, 'Your account is inactive/suspended.'));
      }
    }

    req.userId = user.id;
    req.userAgent = req.headers['user-agent'] || 'Unknown';
    req.clientIP = req.ip || req.connection?.remoteAddress || 'Unknown';

    next();
  } catch (error) {
    logger.warn('Optional auth error:', { error });
    return next(new HttpException(401, 'Authentication error'));
  }
};

export default requireAuth;
