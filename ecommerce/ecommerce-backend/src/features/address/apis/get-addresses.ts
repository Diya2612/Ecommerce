/**
 * GET /api/users/:userId/addresses
 * Retrieve all active addresses for a user.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import { HttpException, ResponseFormatter } from '../../../utils';
import { getAddressesParamsSchema } from '../shared/validation';
import { getAddresses } from '../services/address.service';
import { AddressResponse } from '../shared/interface';

const handler = async (req: RequestWithUser, res: Response) => {
  let { userId } = req.params as { userId: string };

  if (userId === 'me') {
    if (!req.userId) {
      throw new HttpException(401, 'Authentication required');
    }
    userId = req.userId;
  }

  const addresses = await getAddresses(userId);

  const addressesResponse: AddressResponse[] = addresses.map((addr) => ({
    id: addr.id,
    address_type: addr.address_type,
    address_name: addr.address_name,
    name: addr.recipient_name,
    phone: addr.phone_number || '',
    addressLine: [addr.address_line1, addr.address_line2].filter(Boolean).join(', '),
    addressLine1: addr.address_line1 || '',
    addressLine2: addr.address_line2 || '',
    city: addr.city,
    state: addr.state_province,
    pincode: addr.postal_code,
    isDefaultShipping: addr.is_default_shipping,
    isDefaultBilling: addr.is_default_billing,
    deliveryInstructions: addr.delivery_instructions || undefined,
  }));

  ResponseFormatter.success(res, addressesResponse, 'Addresses retrieved successfully');
};

const router = Router();
router.get(
  '/:userId/addresses',
  requireAuth,
  validationMiddleware(getAddressesParamsSchema, 'params'),
  requireOwnerOrPermission('userId', 'users:read'),
  handler,
);

export default router;
