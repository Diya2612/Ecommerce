/**
 * GET /stats
 * Aggregates site-wide metrics and inventory snapshots.
 */

import { Router, Response, Request } from 'express';
import { eq, sql, and, gte, desc } from 'drizzle-orm';
import { ResponseFormatter } from '../../../utils';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { products } from '../../product/shared/products.schema';
import { tiers } from '../../tiers/shared/tiers.schema';
import { orders } from '../../orders/shared/orders.schema';
import { requireAuth } from '../../../middlewares';

/** Unified structure for all administrative dashboard metrics. */
interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalTiers: number;
  customersThisMonth: number;
  recentProducts: Array<{
    id: string;
    title: string;
    sku: string;
    status: string;
    sellingPrice: string;
    primaryImageUrl: string | null;
    createdAt: Date;
  }>;
  recentCustomers: Array<{
    id: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
    createdAt: Date;
  }>;
  orderStats: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  };
  tiersByLevel: Array<{
    level: number;
    count: number;
  }>;
}

const handler = async (req: Request, res: Response) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCustomersResult,
    totalProductsResult,
    totalTiersResult,
    customersThisMonthResult,
    recentProductsResult,
    recentCustomersResult,
    tiersByLevelResult,
    totalOrdersResult,
    pendingOrdersResult,
    confirmedOrdersResult,
    processingOrdersResult,
    shippedOrdersResult,
    deliveredOrdersResult,
    cancelledOrdersResult,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.is_deleted, false)),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.is_deleted, false)),

    db.select({ count: sql<number>`count(*)::int` }).from(tiers),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.is_deleted, false), gte(users.created_at, firstDayOfMonth))),

    db
      .select({
        id: products.id,
        title: products.product_title,
        sku: products.sku,
        status: products.status,
        sellingPrice: products.selling_price,
        primaryImageUrl: products.primary_image_url,
        createdAt: products.created_at,
      })
      .from(products)
      .where(eq(products.is_deleted, false))
      .orderBy(desc(products.created_at))
      .limit(4),

    db
      .select({
        id: users.id,
        name: users.first_name,
        email: users.email,
        profileImageUrl: users.profile_image_url,
        createdAt: users.created_at,
      })
      .from(users)
      .where(eq(users.is_deleted, false))
      .orderBy(desc(users.created_at))
      .limit(5),

    db
      .select({
        level: tiers.level,
        count: sql<number>`count(*)::int`,
      })
      .from(tiers)
      .groupBy(tiers.level)
      .orderBy(tiers.level),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.is_deleted, false)),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.is_deleted, false), eq(orders.order_status, 'pending'))),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.is_deleted, false), eq(orders.order_status, 'confirmed'))),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.is_deleted, false), eq(orders.order_status, 'processing'))),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.is_deleted, false), eq(orders.order_status, 'shipped'))),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.is_deleted, false), eq(orders.order_status, 'delivered'))),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.is_deleted, false), eq(orders.order_status, 'cancelled'))),
  ]);

  const stats: DashboardStats = {
    totalCustomers: totalCustomersResult[0]?.count ?? 0,
    totalProducts: totalProductsResult[0]?.count ?? 0,
    totalTiers: totalTiersResult[0]?.count ?? 0,
    customersThisMonth: customersThisMonthResult[0]?.count ?? 0,
    recentProducts: recentProductsResult,
    recentCustomers: recentCustomersResult,
    orderStats: {
      totalOrders: totalOrdersResult[0]?.count ?? 0,
      pendingOrders: pendingOrdersResult[0]?.count ?? 0,
      confirmedOrders: confirmedOrdersResult[0]?.count ?? 0,
      processingOrders: processingOrdersResult[0]?.count ?? 0,
      shippedOrders: shippedOrdersResult[0]?.count ?? 0,
      deliveredOrders: deliveredOrdersResult[0]?.count ?? 0,
      cancelledOrders: cancelledOrdersResult[0]?.count ?? 0,
    },
    tiersByLevel: tiersByLevelResult,
  };

  ResponseFormatter.success(res, stats, 'Dashboard stats retrieved successfully');
};

const router = Router();
router.get('/stats', requireAuth, handler);

export default router;
