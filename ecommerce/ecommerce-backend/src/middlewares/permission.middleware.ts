/**
 * @module PermissionMiddleware
 * @description Dynamic authorization guards for the RBAC system. Enables granular access control
 * by evaluating required scopes against the user's cached permission set.
 */

import { NextFunction, Response, Request } from 'express';
import { HttpException } from '../utils';
import { logger } from '../utils';
import { rbacCacheService } from '../features/rbac/services/rbac-cache.service';
import '../interfaces/request.interface';

/**
 * @description Restricts access to users possessing ALL specified permissions.
 * Used for high-security endpoints requiring composite privileges.
 */
export const requirePermission = (requiredPermissions: string | string[]) => {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next(new HttpException(401, 'Authentication required'));
      }

      const hasAllPermissions = await rbacCacheService.hasAllPermissions(req.userId, permissions);

      if (!hasAllPermissions) {
        logger.warn('Permission denied', {
          userId: req.userId,
          requiredPermissions: permissions,
          url: req.originalUrl,
          method: req.method,
        });
        return next(new HttpException(403, 'Insufficient permissions'));
      }

      logger.debug('Permission granted', {
        userId: req.userId,
        permissions: permissions,
      });

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      next(new HttpException(403, 'Authorization failed'));
    }
  };
};

/**
 * @description Grants access to users possessing at least ONE of the specified permissions.
 * Useful for endpoints accessible to multiple distinct roles/scopes.
 */
export const requireAnyPermission = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next(new HttpException(401, 'Authentication required'));
      }

      const hasAnyPermission = await rbacCacheService.hasAnyPermission(
        req.userId,
        requiredPermissions,
      );

      if (!hasAnyPermission) {
        logger.warn('Permission denied (any)', {
          userId: req.userId,
          requiredPermissions,
          url: req.originalUrl,
          method: req.method,
        });
        return next(new HttpException(403, 'Insufficient permissions'));
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      next(new HttpException(403, 'Authorization failed'));
    }
  };
};

/**
 * @description Core ownership logic: grants access if the request context indicates
 * the user owns the resource, circumventing the need for global administrative permissions.
 */
export const checkOwnershipOrPermission = async (
  req: Request,
  resourceOwnerId: string,
  permission: string,
): Promise<boolean> => {
  if (!req.userId) {
    return false;
  }

  if (req.userId === resourceOwnerId) {
    return true;
  }

  return rbacCacheService.hasPermission(req.userId, permission);
};

/**
 * @description Route guard that couples resource ownership validation with fallback permission checks.
 * Ensures users can manage their own data without needing broader scopes.
 */
export const requireOwnerOrPermission = (ownerIdParam: string, permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next(new HttpException(401, 'Authentication required'));
      }

      const resourceOwnerId = req.params[ownerIdParam];

      if (!resourceOwnerId) {
        return next(new HttpException(400, 'Invalid resource ID'));
      }

      if (resourceOwnerId === 'me' || req.userId === resourceOwnerId) {
        return next();
      }

      const hasPermission = await rbacCacheService.hasPermission(req.userId, permission);

      if (!hasPermission) {
        logger.warn('Ownership/Permission denied', {
          userId: req.userId,
          resourceOwnerId,
          permission,
          url: req.originalUrl,
        });
        return next(new HttpException(403, 'Access denied'));
      }

      next();
    } catch (error) {
      logger.error('Ownership/Permission check error:', error);
      next(new HttpException(403, 'Authorization failed'));
    }
  };
};

/**
 * @description Lightweight utility for inline permission assertion within business logic components.
 */
export const userHasPermission = async (req: Request, permission: string): Promise<boolean> => {
  if (!req.userId) {
    return false;
  }
  return rbacCacheService.hasPermission(req.userId, permission);
};

/**
 * @description Retrieves full permission context for diagnostic and audit interfaces.
 */
export const getUserPermissions = async (req: Request): Promise<string[]> => {
  if (!req.userId) {
    return [];
  }
  return rbacCacheService.getUserPermissions(req.userId);
};
