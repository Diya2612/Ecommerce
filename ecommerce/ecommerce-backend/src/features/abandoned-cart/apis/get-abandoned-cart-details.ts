/**
 * GET /api/admin/abandoned-carts/:cartId
 * Admin: Get full abandoned cart details
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter } from '../../../utils';
import { getAbandonedCartDetails } from '../shared/queries';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { cartIdParamSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { cartId } = req.params as { cartId: string };

  // Get cart with details using centralized query
  const details = await getAbandonedCartDetails(cartId);

  if (!details) {
    throw new HttpException(404, 'Cart not found');
  }

  const { cart, items, addresses } = details;

  // Calculate recovery status
  let recoveryStatus: 'not-contacted' | 'email-sent' | 'recovered' = 'not-contacted';
  if (cart.cart_status === 'converted') {
    recoveryStatus = 'recovered';
  } else if (cart.recovery_email_sent) {
    recoveryStatus = 'email-sent';
  }

  // Format response
  const response = {
    cart_id: cart.id,
    customer: {
      user_id: cart.user_id,
      name: cart.customer_name || 'Guest',
      email:
        cart.customer_email ||
        (cart.session_id ? `Guest (${cart.session_id.substring(0, 8)}...)` : 'Unknown'),
      phone: cart.customer_phone,
      addresses: addresses.map((addr) => ({
        id: addr.id,
        address_label: addr.address_label,
        recipient_name: addr.recipient_name,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city: addr.city,
        state_province: addr.state_province,
        postal_code: addr.postal_code,
        country: addr.country,
        is_default_shipping: addr.is_default_shipping,
        is_default_billing: addr.is_default_billing,
      })),
    },
    pricing: {
      currency: cart.currency,
      subtotal: cart.subtotal,
      discount_total: cart.discount_total,
      // giftcard_total removed
      shipping_total: cart.shipping_total,
      tax_total: cart.tax_total,
      grand_total: cart.grand_total,
    },
    items: items.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      // bundle_id removed
      product_name: item.product_name,
      product_image_url: item.product_image_url,
      product_sku: item.product_sku || '',
      quantity: item.quantity,
      cost_price: item.cost_price,
      final_price: item.final_price,
      discount_amount: item.discount_amount,
      line_subtotal: item.line_subtotal,
      line_total: item.line_total,
      // customization removed
    })),
    applied_codes: {
      discount_codes: cart.applied_discount_codes,
      giftcard_codes: cart.applied_giftcard_codes,
    },
    status: {
      cart_status: cart.cart_status,
      recovery_status: recoveryStatus,
    },
    timeline: {
      created_at: cart.created_at,
      last_activity_at: cart.last_activity_at,
      abandoned_at: cart.abandoned_at,
      recovery_email_sent_at: cart.recovery_email_sent_at,
    },
    // channel removed
  };

  return ResponseFormatter.success(res, response, 'Abandoned cart details retrieved successfully');
};

const router = Router();
router.get(
  '/admin/abandoned-carts/:cartId',
  requireAuth,
  requirePermission('orders:read'),
  validationMiddleware(cartIdParamSchema, 'params'),
  handler,
);

export default router;
