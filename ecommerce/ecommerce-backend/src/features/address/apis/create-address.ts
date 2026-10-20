/**
 * POST /api/users/:userId/addresses
 * Create a new user address.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { createAddressParamsSchema, createAddressBodySchema } from '../shared/validation';
import { createAddress } from '../services/address.service';

const handler = async (req: RequestWithUser, res: Response) => {
  let userId = req.params.userId as string;

  if (userId === 'me') {
    if (!req.userId) {
      throw new HttpException(401, 'Authentication required');
    }
    userId = req.userId;
  }

  const newAddress = await createAddress(userId, req.body, {
    requestUserId: req.userId,
    ipAddress: req.ip ?? req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  ResponseFormatter.created(
    res,
    {
      id: newAddress.id,
      address_type: newAddress.address_type,
      address_name: newAddress.address_name,
      name: newAddress.recipient_name,
      phone: newAddress.phone_number,
      addressLine1: newAddress.address_line1,
      addressLine2: newAddress.address_line2,
      city: newAddress.city,
      state: newAddress.state_province,
      pincode: newAddress.postal_code,
      country: newAddress.country,
      isDefaultShipping: newAddress.is_default_shipping,
      isDefaultBilling: newAddress.is_default_billing,
      deliveryInstructions: newAddress.delivery_instructions,
    },
    'Address created successfully',
  );
};

const router = Router();
router.post(
  '/:userId/addresses',
  requireAuth,
  validationMiddleware(createAddressParamsSchema, 'params'),
  validationMiddleware(createAddressBodySchema, 'body'),
  requireOwnerOrPermission('userId', 'users:update'),
  handler,
);

export default router;
