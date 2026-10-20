/**
 * Invoice Queries
 * Reusable database operations for invoice management.
 */

import { db } from '../../../database';
import { invoices, invoiceVersions, invoiceLineItems } from './index';
import { orders } from '../../orders/shared/orders.schema';
import { orderItems } from '../../orders/shared/order-items.schema';
import { products } from '../../product/shared/products.schema';
import { users } from '../../user/shared/user.schema';
import { userAddresses } from '../../address/shared/addresses.schema';
import { sql, eq, and } from 'drizzle-orm';

export const invoiceQueries = {
  /** Counts invoices starting with prefix for sequencing. */
  getInvoiceCountForMonth: async (prefix: string): Promise<number> => {
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(sql`${invoices.invoice_number} LIKE ${`${prefix}%`}`);
    return countResult[0].count || 0;
  },

  /** Retrieves order with shipping and billing addresses. */
  getOrderDetailsWithAddresses: async (orderId: string) => {
    return await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        shippingAddress: true,
        billingAddress: true,
      },
    });
  },

  /** Finds order by ID. */
  getOrderById: async (orderId: string) => {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    return order;
  },

  /** Finds root invoice by order ID. */
  getInvoiceByOrderId: async (orderId: string) => {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.order_id, orderId));
    return invoice;
  },

  /** Retrieves items for an order including HSN codes from products. */
  getOrderItemsWithHsn: async (orderId: string) => {
    return await db
      .select({
        id: orderItems.id,
        order_id: orderItems.order_id,
        product_id: orderItems.product_id,
        product_name: orderItems.product_name,
        sku: orderItems.sku,
        quantity: orderItems.quantity,
        cost_price: orderItems.cost_price,
        unit_price: orderItems.cost_price,
        hsn_code: products.hsn_code,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.product_id, products.id))
      .where(eq(orderItems.order_id, orderId));
  },

  /** Finds user by ID. */
  getUserById: async (userId: string) => {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  },

  /** Finds address by ID. */
  getAddressById: async (addressId: string) => {
    const [address] = await db.select().from(userAddresses).where(eq(userAddresses.id, addressId));
    return address;
  },

  /** Finds invoice by ID. */
  getInvoiceById: async (invoiceId: string) => {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    return invoice;
  },

  /** Finds specific invoice version by ID. */
  getInvoiceVersionById: async (versionId: string) => {
    const [version] = await db
      .select()
      .from(invoiceVersions)
      .where(eq(invoiceVersions.id, versionId));
    return version;
  },

  /** Finds specific version number for an invoice. */
  getLatestInvoiceVersion: async (invoiceId: string, versionNumber: number) => {
    const [version] = await db
      .select()
      .from(invoiceVersions)
      .where(
        and(
          eq(invoiceVersions.invoice_id, invoiceId),
          eq(invoiceVersions.version_number, versionNumber),
        ),
      );
    return version;
  },

  /** Retrieves all line items for an invoice version. */
  getInvoiceLineItemsByVersionId: async (versionId: string) => {
    return await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoice_version_id, versionId));
  },

  /** Lists all versions of an invoice, newest first. */
  getAllInvoiceVersionsByInvoiceId: async (invoiceId: string) => {
    return await db
      .select()
      .from(invoiceVersions)
      .where(eq(invoiceVersions.invoice_id, invoiceId))
      .orderBy(sql`${invoiceVersions.version_number} DESC`);
  },

  /** Updates parent invoice status. */
  updateInvoiceStatus: async (
    invoiceId: string,
    status: 'draft' | 'generated' | 'sent' | 'cancelled',
  ) => {
    await db
      .update(invoices)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(invoices.id, invoiceId));
  },
};
