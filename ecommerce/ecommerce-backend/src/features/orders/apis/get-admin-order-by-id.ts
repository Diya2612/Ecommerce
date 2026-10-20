/**
 * GET /api/admin/orders/:id
 * Admin: Get full order details by ID (no ownership check)
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { db } from '../../../database';
import { userAddresses } from '../../address/shared/addresses.schema';
import { inventory } from '../../inventory/shared/inventory.schema';
import { users } from '../../user/shared/user.schema';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { findOrderById, findOrderByNumber, getOrderItems } from '../shared/queries';
import { orderIdParamSchema } from '../shared/validation';
import { eq, sql } from 'drizzle-orm';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id: orderNumberOrId } = req.params as { id: string };

  logger.info(`GET /api/admin/orders/${orderNumberOrId}`);

  // Get order - check if input is UUID to determine query method
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    orderNumberOrId,
  );

  const order = isUuid
    ? await findOrderById(orderNumberOrId)
    : await findOrderByNumber(orderNumberOrId);

  if (!order) {
    throw new HttpException(404, 'Order not found');
  }

  // Get user details if order has a user_id
  let customerEmail = '';
  let customerName = 'Guest';
  if (order.user_id) {
    const [user] = await db
      .select({
        email: users.email,
        first_name: users.first_name,
      })
      .from(users)
      .where(eq(users.id, order.user_id))
      .limit(1);
    if (user) {
      customerEmail = user.email || '';
      customerName = user.first_name || 'Guest';
    }
  }

  // Get order items
  const items = await getOrderItems(order.id);

  // Helper to map address

  const mapAddress = (addr: any) => {
    if (!addr) return null;
    return {
      id: addr.id,
      label: addr.label || 'Address',
      name: addr.recipient_name,
      phone: addr.phone_number,
      address: addr.address_line1 + (addr.address_line2 ? ', ' + addr.address_line2 : ''),
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state_province,
      pincode: addr.postal_code,
      country: addr.country,
    };
  };

  // Get shipping address
  let shippingAddress = null;
  if (order.shipping_address_id) {
    const [addr] = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.id, order.shipping_address_id))
      .limit(1);
    shippingAddress = mapAddress(addr);
  }

  // Get billing address
  let billingAddress = null;
  if (order.billing_address_id && order.billing_address_id !== order.shipping_address_id) {
    const [addr] = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.id, order.billing_address_id))
      .limit(1);
    billingAddress = mapAddress(addr);
  } else {
    billingAddress = shippingAddress;
  }

  return ResponseFormatter.success(
    res,
    {
      id: order.id,
      order_number: order.order_number,
      user_id: order.user_id,
      created_at: order.created_at,
      updated_at: order.updated_at,

      // Status
      order_status: order.order_status,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,

      // Amounts
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      discount_type: order.discount_type, // Added missing field
      discount_value: order.discount_value, // Added missing field
      discount_reason: order.discount_reason, // Added missing field
      shipping_amount: order.shipping_amount,
      delivery_price: order.delivery_price,
      tax_amount: order.tax_amount,
      cgst: order.cgst,
      sgst: order.sgst,
      igst: order.igst,
      total_amount: order.total_amount,
      currency: order.currency,

      // Details
      total_quantity: order.total_quantity,
      payment_method: order.payment_method,
      // channel removed
      order_tracking: order.order_tracking,
      customer_note: order.customer_note,
      is_draft: order.is_draft,

      // Customer
      customer: {
        id: order.user_id,
        name: customerName,
        email: customerEmail,
        phone: '',
      },

      // Addresses
      shipping_address: shippingAddress,
      billing_address: billingAddress,

      // Items - enrich with current stock information
      items: await Promise.all(
        items.map(async (item) => {
          // Get current stock from inventory
          let availableStock = 0;
          if (item.product_id) {
            const [stockResult] = await db
              .select({
                total_available: sql<number>`COALESCE(SUM(${inventory.available_quantity}), 0)::int`,
                total_reserved: sql<number>`COALESCE(SUM(${inventory.committed_quantity}), 0)::int`,
              })
              .from(inventory)
              .where(eq(inventory.product_id, item.product_id));
            const totalAvailable = stockResult?.total_available || 0;
            const totalReserved = stockResult?.total_reserved || 0;
            availableStock = Math.max(0, totalAvailable - totalReserved);
          }
          return {
            id: item.id,
            product_id: item.product_id,
            productId: item.product_id,
            product_name: item.product_name,
            productName: item.product_name,
            sku: item.sku,
            productSku: item.sku,
            product_image: item.product_image || '',
            productImage: item.product_image || '',
            quantity: item.quantity,
            cost_price: item.cost_price,
            costPrice: parseFloat(item.cost_price || '0'),
            line_total: item.line_total,
            lineTotal: parseFloat(item.line_total || '0'),
            available_stock: availableStock,
            availableStock: availableStock,
            discount_type: item.discount_type,
            discount_value: Number(item.discount_value),
            discount_reason: item.discount_reason, // Added missing field
            discountType: item.discount_type,
            discountValue: Number(item.discount_value),
            discountReason: item.discount_reason, // Added missing field
          };
        }),
      ),
    },
    'Order details retrieved successfully',
  );
};

const router = Router();
router.get(
  '/admin/orders/:id',
  requireAuth,
  requirePermission('orders:read'),
  validationMiddleware(orderIdParamSchema, 'params'),
  handler,
);

export default router;
