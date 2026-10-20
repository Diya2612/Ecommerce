/**
 * PATCH /api/users/:userId/addresses/:id/default
 * Set an address as the default for shipping, billing, or both.
 *
 * Query params:
 * - type: 'shipping' | 'billing' | 'both' (default: 'both')
 */

import { Router, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { setDefaultAddressParamsSchema, setDefaultAddressQuerySchema } from '../shared/validation';
import { db } from '../../../database';
import { userAddresses } from '../shared/addresses.schema';

const handler = async (req: RequestWithUser, res: Response) => {
  let userId = req.params.userId as string;
  const addressId = req.params.id as string;

  if (userId === 'me') {
    if (!req.userId) {
      throw new HttpException(401, 'Authentication required');
    }
    userId = req.userId;
  }

  const { type } = setDefaultAddressQuerySchema.parse(req.query);

  const [existingAddress] = await db
    .select()
    .from(userAddresses)
    .where(
      and(
        eq(userAddresses.id, addressId),
        eq(userAddresses.user_id, userId),
        eq(userAddresses.is_deleted, false),
      ),
    );

  if (!existingAddress) {
    throw new HttpException(404, 'Address not found');
  }

  const setShipping = type === 'shipping' || type === 'both';
  const setBilling = type === 'billing' || type === 'both';

  if (setShipping) {
    await db
      .update(userAddresses)
      .set({ is_default_shipping: false })
      .where(
        and(
          eq(userAddresses.user_id, userId),
          eq(userAddresses.is_deleted, false),
          eq(userAddresses.is_default_shipping, true),
        ),
      );
  }

  if (setBilling) {
    await db
      .update(userAddresses)
      .set({ is_default_billing: false })
      .where(
        and(
          eq(userAddresses.user_id, userId),
          eq(userAddresses.is_deleted, false),
          eq(userAddresses.is_default_billing, true),
        ),
      );
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date(),
  };
  if (setShipping) updateData.is_default_shipping = true;
  if (setBilling) updateData.is_default_billing = true;

  await db.update(userAddresses).set(updateData).where(eq(userAddresses.id, addressId));

  ResponseFormatter.success(
    res,
    {
      id: addressId,
      isDefaultShipping: setShipping,
      isDefaultBilling: setBilling,
    },
    'Address set as default successfully',
  );
};

const router = Router();
router.patch(
  '/:userId/addresses/:id/default',
  requireAuth,
  validationMiddleware(setDefaultAddressParamsSchema, 'params'),
  requireOwnerOrPermission('userId', 'users:update'),
  handler,
);

export default router;
