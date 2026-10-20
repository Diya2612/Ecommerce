/**
 * PUT /api/users/:userId/addresses/:id
 * Update an existing user address.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { updateAddressParamsSchema, updateAddressBodySchema } from '../shared/validation';
import { updateAddress } from '../services/address.service';

const handler = async (req: RequestWithUser, res: Response) => {
  let { userId } = req.params as { userId: string };
  const { id: addressId } = req.params as { id: string };

  if (userId === 'me') {
    if (!req.userId) {
      throw new HttpException(401, 'Authentication required');
    }
    userId = req.userId;
  }

  const updatedAddress = await updateAddress(userId, addressId, req.body, {
    requestUserId: req.userId,
    ipAddress: req.ip ?? req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  ResponseFormatter.success(
    res,
    {
      id: updatedAddress.id,
      address_type: updatedAddress.address_type,
      address_name: updatedAddress.address_name,
      name: updatedAddress.recipient_name,
      phone: updatedAddress.phone_number ?? '',
      addressLine1: updatedAddress.address_line1,
      addressLine2: updatedAddress.address_line2 ?? '',
      city: updatedAddress.city,
      state: updatedAddress.state_province,
      pincode: updatedAddress.postal_code,
      country: updatedAddress.country,
      isDefaultShipping: updatedAddress.is_default_shipping,
      isDefaultBilling: updatedAddress.is_default_billing,
      deliveryInstructions: updatedAddress.delivery_instructions,
    },
    'Address updated successfully',
  );
};

const router = Router();
router.put(
  '/:userId/addresses/:id',
  requireAuth,
  validationMiddleware(updateAddressParamsSchema, 'params'),
  validationMiddleware(updateAddressBodySchema, 'body'),
  requireOwnerOrPermission('userId', 'users:update'),
  handler,
);

export default router;
