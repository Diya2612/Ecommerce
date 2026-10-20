/**
 * POST /customer
 * Creates a new B2C customer and sends a welcome notification.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, logger } from '../../../utils';
import { customerService } from '../services/customer.service';
import { createCustomerSchema, CreateCustomerDto } from '../shared/validation';
import { notificationCoreService } from '../../notifications/services/notification-core.service';

const handler = async (req: RequestWithUser, res: Response) => {
  const data: CreateCustomerDto = req.body;
  logger.info('Creating customer', { email: data.email });

  const result = await customerService.createCustomer(data);

  try {
    await notificationCoreService.createFromTemplate({
      userId: result.id,
      templateCode: 'customer_welcome',
      variables: { name: result.first_name, email: result.email },
      priority: 'normal',
      actionUrl: '/profile',
      actionText: 'Go to Profile',
    });
  } catch (error) {
    logger.error('Welcome notification failed', error);
  }

  ResponseFormatter.success(res, result, 'Customer created successfully', 201);
};

const router = Router();
router.post(
  '/customer',
  requireAuth,
  requirePermission('users:create'),
  validationMiddleware(createCustomerSchema),
  handler,
);

export default router;
