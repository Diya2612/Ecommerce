/**
 * Customer Database Queries
 * Data access logic for customer profiles and reporting.
 */

import {
  eq,
  and,
  count,
  desc,
  asc,
  or,
  arrayOverlaps,
  notInArray,
  sql,
  isNotNull,
  isNull,
  gte,
  lte,
  ne,
  inArray,
} from 'drizzle-orm';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { customerProfiles, CustomerProfile } from './customer-profiles.schema';
import { userAddresses } from '../../address/shared/addresses.schema';
import { userRoles } from '../../rbac/shared/user-roles.schema';
import { roles } from '../../rbac/shared/roles.schema';
import { orders } from '../../orders/shared/orders.schema';
import { buildSearchConditions } from '../../../utils';

type DbOrTx = any;

/** Creates a fresh customer profile record. */
export const insertCustomerProfile = async (
  tx: DbOrTx,
  userId: string,
  segments: string[],
  notes?: string,
) => {
  return tx.insert(customerProfiles).values({
    user_id: userId,
    segments,
    notes,
  });
};

/** Finds a profile by the associated user ID. */
export const findCustomerProfileByUserId = async (
  tx: DbOrTx,
  userId: string,
): Promise<CustomerProfile | undefined> => {
  return tx.query.customerProfiles.findFirst({
    where: eq(customerProfiles.user_id, userId),
  });
};

/** Updates an existing profile or creates one if it doesn't exist. */
export const upsertCustomerProfile = async (
  tx: DbOrTx,
  userId: string,
  updates: Partial<CustomerProfile>,
) => {
  const existing = await tx.query.customerProfiles.findFirst({
    where: eq(customerProfiles.user_id, userId),
  });

  if (existing) {
    if (Object.keys(updates).length > 0) {
      await tx
        .update(customerProfiles)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(customerProfiles.user_id, userId));
    }
  } else {
    await tx.insert(customerProfiles).values({
      user_id: userId,
      ...updates,
    });
  }
};

/** Retrieves a core user record. */
export const findUserById = async (tx: DbOrTx, userId: string) => {
  return tx.query.users.findFirst({
    where: eq(users.id, userId),
  });
};

/** Retrieves only the tags for a specific user. */
export const getUserTagsList = async (tx: DbOrTx, userId: string) => {
  return tx.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { tags: true },
  });
};

/** Performs a join between user and customer profiles. */
export const findCustomerWithProfile = async (dbOrTx: DbOrTx, userId: string) => {
  const result = await dbOrTx
    .select({
      user: users,
      customerProfile: customerProfiles,
    })
    .from(users)
    .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
    .where(eq(users.id, userId));

  return result.length ? result[0] : null;
};

/** Lists all active (non-deleted) addresses for a user. */
export const findActiveUserAddresses = async (dbOrTx: DbOrTx, userId: string) => {
  return dbOrTx
    .select()
    .from(userAddresses)
    .where(and(eq(userAddresses.user_id, userId), eq(userAddresses.is_deleted, false)));
};

/**
 * Advanced reporting query with filtering, search, and pagination.
 * Excludes administrators from customer lists.
 */
export const queryCustomersList = async (page: number, limit: number, filters: any) => {
  const {
    type = 'all',
    status,
    gender,
    tags,
    ordersStatus,
    search,
    sort,
    fromDate,
    toDate,
  } = filters;

  const offset = (page - 1) * limit;
  const conditions = [eq(users.is_deleted, false)];

  if (type === 'individual') {
    conditions.push(isNotNull(customerProfiles.id));
  } else if (type === 'none') {
    conditions.push(isNull(customerProfiles.id));
  }

  if (search?.trim()) {
    const searchConditions = buildSearchConditions(search, {
      fuzzyColumns: [users.first_name, users.last_name, users.display_name],
      exactColumns: [users.email, users.phone_number],
    });
    if (searchConditions) conditions.push(searchConditions as any);
  }

  const adminUserIdsSubquery = db
    .select({ userId: userRoles.user_id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.role_id, roles.id))
    .where(inArray(roles.name, ['admin', 'superadmin']));

  conditions.push(notInArray(users.id, adminUserIdsSubquery));

  if (status) {
    const statuses = status.split(',').map((s: string) => s.trim().toLowerCase());
    const statusConditions = [];
    if (statuses.includes('active'))
      statusConditions.push(eq(customerProfiles.account_status, 'active'));
    if (statuses.includes('inactive'))
      statusConditions.push(eq(customerProfiles.account_status, 'inactive'));
    if (statusConditions.length > 0) conditions.push(or(...statusConditions) as any);
  }

  if (gender) {
    const genders = gender.split(',').map((g: string) => g.trim().toLowerCase());
    if (genders.length > 0)
      conditions.push(
        inArray(users.gender, genders as ('male' | 'female' | 'other' | 'prefer_not_to_say')[]),
      );
  }

  if (tags) {
    const tagList = tags.split(',').map((t: string) => t.trim());
    if (tagList.length > 0) conditions.push(arrayOverlaps(users.tags, tagList));
  }

  if (ordersStatus) {
    const statuses = ordersStatus.split(',').map((s: string) => s.trim());
    const statusConditions = [];
    const userOrdersSubquery = db
      .select({ userId: orders.user_id })
      .from(orders)
      .where(
        and(eq(orders.is_deleted, false), eq(orders.is_draft, false), isNotNull(orders.user_id)),
      )
      .groupBy(orders.user_id);

    if (statuses.includes('has-orders'))
      statusConditions.push(inArray(users.id, userOrdersSubquery));
    if (statuses.includes('no-orders'))
      statusConditions.push(notInArray(users.id, userOrdersSubquery));
    if (statuses.includes('high-value')) {
      const highValueSubquery = db
        .select({ userId: orders.user_id })
        .from(orders)
        .where(
          and(eq(orders.is_deleted, false), eq(orders.is_draft, false), isNotNull(orders.user_id)),
        )
        .groupBy(orders.user_id)
        .having(sql`count(*) > 10`);
      statusConditions.push(inArray(users.id, highValueSubquery));
    }
    if (statusConditions.length > 0) conditions.push(or(...statusConditions) as any);
  }

  if (fromDate) conditions.push(gte(users.created_at, new Date(fromDate)));
  if (toDate) {
    const endDay = new Date(toDate);
    endDay.setHours(23, 59, 59, 999);
    conditions.push(lte(users.created_at, endDay));
  }

  const [countResult] = await db
    .select({ total: count() })
    .from(users)
    .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
    .where(and(...conditions));
  const total = countResult?.total ?? 0;

  const orderCountSq = db
    .select({
      userId: orders.user_id,
      totalOrders: count().as('total_orders'),
    })
    .from(orders)
    .where(
      and(
        eq(orders.is_deleted, false),
        eq(orders.is_draft, false),
        ne(orders.order_status, 'cancelled'),
      ),
    )
    .groupBy(orders.user_id)
    .as('order_metrics');

  const citySq = db
    .select({
      userId: userAddresses.user_id,
      city: userAddresses.city,
    })
    .from(userAddresses)
    .where(eq(userAddresses.is_default_billing, true))
    .as('city_metrics');

  const allUsers = await db
    .select({
      user: users,
      customerProfile: customerProfiles,
      totalOrders: orderCountSq.totalOrders,
    })
    .from(users)
    .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
    .leftJoin(orderCountSq, eq(users.id, orderCountSq.userId))
    .leftJoin(citySq, eq(users.id, citySq.userId))
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(
      (() => {
        switch (sort) {
          case 'oldest':
            return asc(users.created_at);
          case 'newest':
            return desc(users.created_at);
          case 'name_asc':
            return asc(users.first_name);
          case 'name_desc':
            return desc(users.first_name);
          case 'orders_desc':
            return desc(orderCountSq.totalOrders);
          case 'customerId_asc':
            return asc(users.display_id);
          case 'customerId_desc':
            return desc(users.display_id);
          case 'displayName_asc':
            return asc(users.display_name);
          case 'displayName_desc':
            return desc(users.display_name);
          case 'email_asc':
            return asc(users.email);
          case 'email_desc':
            return desc(users.email);
          case 'phone_asc':
            return asc(users.phone_number);
          case 'phone_desc':
            return desc(users.phone_number);
          case 'created_at_asc':
            return asc(users.created_at);
          case 'created_at_desc':
            return desc(users.created_at);
          case 'gender_asc':
            return asc(users.gender);
          case 'gender_desc':
            return desc(users.gender);
          case 'dob_asc':
          case 'dateOfBirth_asc':
            return asc(users.date_of_birth);
          case 'dob_desc':
          case 'dateOfBirth_desc':
            return desc(users.date_of_birth);
          case 'tags_asc':
            return asc(users.tags);
          case 'tags_desc':
            return desc(users.tags);
          case 'status_asc':
            return asc(customerProfiles.account_status);
          case 'status_desc':
            return desc(customerProfiles.account_status);
          case 'total_orders_asc':
            return asc(orderCountSq.totalOrders);
          case 'total_orders_desc':
            return desc(orderCountSq.totalOrders);
          case 'lastLogin_asc':
            return asc(users.updated_at);
          case 'lastLogin_desc':
            return desc(users.updated_at);
          case 'city_asc':
            return asc(citySq.city);
          case 'city_desc':
            return desc(citySq.city);
          default:
            return desc(users.created_at);
        }
      })(),
    );

  const userIds = allUsers.map((u) => u.user.id);
  const addressesMap: Record<string, any[]> = {};

  if (userIds.length > 0) {
    const addressesList = await db
      .select()
      .from(userAddresses)
      .where(inArray(userAddresses.user_id, userIds));
    addressesList.forEach((addr) => {
      if (!addressesMap[addr.user_id]) addressesMap[addr.user_id] = [];
      addressesMap[addr.user_id].push(addr);
    });
  }

  const orderCountsMap: Record<string, number> = {};
  if (userIds.length > 0) {
    const orderCounts = await db
      .select({ userId: orders.user_id, count: count() })
      .from(orders)
      .where(
        and(
          inArray(orders.user_id, userIds),
          eq(orders.is_deleted, false),
          eq(orders.is_draft, false),
          ne(orders.order_status, 'cancelled'),
        ),
      )
      .groupBy(orders.user_id);
    orderCounts.forEach((row) => {
      if (row.userId) orderCountsMap[row.userId] = Number(row.count);
    });
  }

  return { total, allUsers, addressesMap, orderCountsMap };
};

// ===================================
// CUSTOMER ACTIVITY QUERIES
// ===================================

export const queryCustomerActivity = async (
  userId: string,
  limit: number,
  offset: number,
  category: string,
) => {
  const activityQuery = sql`
        WITH customer_activities AS (
            -- Account Created
            SELECT 
                u.id::text as id,
                'account_created' as activity_type,
                'Account Created' as title,
                CONCAT('Registered with email ', u.email) as description,
                NULL::text as amount,
                u.created_at as activity_timestamp,
                'account' as category
            FROM users u
            WHERE u.id = ${userId}
            
            UNION ALL
            
            -- Email Verified
            SELECT 
                CONCAT(u.id::text, '-email') as id,
                'email_verified' as activity_type,
                'Email Verified' as title,
                CONCAT('Email ', u.email, ' verified successfully') as description,
                NULL::text as amount,
                u.email_verified_at as activity_timestamp,
                'account' as category
            FROM users u
            WHERE u.id = ${userId} AND u.email_verified = true AND u.email_verified_at IS NOT NULL
            
            UNION ALL
            
            -- Phone Verified
            SELECT 
                CONCAT(u.id::text, '-phone') as id,
                'phone_verified' as activity_type,
                'Phone Verified' as title,
                CONCAT('Phone ', u.phone_number, ' verified successfully') as description,
                NULL::text as amount,
                u.phone_verified_at as activity_timestamp,
                'account' as category
            FROM users u
            WHERE u.id = ${userId} AND u.phone_verified = true AND u.phone_verified_at IS NOT NULL
            
            UNION ALL
            
            -- Order Created
            SELECT 
                o.id::text as id,
                'order_created' as activity_type,
                'Order Placed' as title,
                CONCAT('Order #', o.order_number, ' placed') as description,
                CONCAT('₹', o.total_amount) as amount,
                o.created_at as activity_timestamp,
                'order' as category
            FROM orders o
            WHERE o.user_id = ${userId} AND o.is_deleted = false
            
            UNION ALL
            
            -- Order Paid
            SELECT 
                CONCAT(o.id::text, '-paid') as id,
                'order_paid' as activity_type,
                'Payment Completed' as title,
                CONCAT('Payment completed for order #', o.order_number) as description,
                CONCAT('₹', o.total_amount) as amount,
                o.paid_at as activity_timestamp,
                'payment' as category
            FROM orders o
            WHERE o.user_id = ${userId} AND o.paid_at IS NOT NULL AND o.is_deleted = false
            
            UNION ALL
            
            -- Order Fulfilled
            SELECT 
                CONCAT(o.id::text, '-fulfilled') as id,
                'order_fulfilled' as activity_type,
                'Order Fulfilled' as title,
                CONCAT('Order #', o.order_number, ' items fulfilled') as description,
                NULL::text as amount,
                o.fulfillment_date as activity_timestamp,
                'order' as category
            FROM orders o
            WHERE o.user_id = ${userId} AND o.fulfillment_date IS NOT NULL AND o.is_deleted = false
            
            UNION ALL
            
            -- Order Delivered
            SELECT 
                CONCAT(o.id::text, '-delivered') as id,
                'order_delivered' as activity_type,
                'Order Delivered' as title,
                CONCAT('Order #', o.order_number, ' was delivered') as description,
                CONCAT('₹', o.total_amount) as amount,
                o.delivery_date as activity_timestamp,
                'order' as category
            FROM orders o
            WHERE o.user_id = ${userId} AND o.delivery_date IS NOT NULL AND o.is_deleted = false
            
            UNION ALL
            
            -- Order Returned
            SELECT 
                CONCAT(o.id::text, '-returned') as id,
                'order_returned' as activity_type,
                'Order Returned' as title,
                CONCAT('Order #', o.order_number, ' was returned') as description,
                CONCAT('₹', o.return_amount) as amount,
                o.return_date as activity_timestamp,
                'order' as category
            FROM orders o
            WHERE o.user_id = ${userId} AND o.return_date IS NOT NULL AND o.is_deleted = false
            
            UNION ALL
            
            -- Payment Transactions - Captured
            SELECT 
                pt.id::text as id,
                'payment_captured' as activity_type,
                'Payment Successful' as title,
                CONCAT('Transaction via ', COALESCE(pt.payment_method, 'Online')) as description,
                CONCAT('₹', pt.amount) as amount,
                COALESCE(pt.verified_at, pt.created_at) as activity_timestamp,
                'payment' as category
            FROM payment_transactions pt
            JOIN orders o ON pt.order_id = o.id
            WHERE o.user_id = ${userId} AND pt.status = 'captured'
            
            UNION ALL
            
            -- Payment Transactions - Failed
            SELECT 
                pt.id::text as id,
                'payment_failed' as activity_type,
                'Payment Failed' as title,
                CONCAT('Failed: ', COALESCE(pt.error_description, 'Unknown error')) as description,
                CONCAT('₹', pt.amount) as amount,
                pt.created_at as activity_timestamp,
                'payment' as category
            FROM payment_transactions pt
            JOIN orders o ON pt.order_id = o.id
            WHERE o.user_id = ${userId} AND pt.status = 'failed'
            
            UNION ALL
            
            -- Payment Transactions - Refunded
            SELECT 
                CONCAT(pt.id::text, '-refund') as id,
                'payment_refunded' as activity_type,
                'Payment Refunded' as title,
                CONCAT('Refund processed for ₹', pt.refund_amount) as description,
                CONCAT('₹', pt.refund_amount) as amount,
                pt.refunded_at as activity_timestamp,
                'payment' as category
            FROM payment_transactions pt
            JOIN orders o ON pt.order_id = o.id
            WHERE o.user_id = ${userId} AND pt.refunded_at IS NOT NULL
            
            UNION ALL
            
            -- Cart Abandoned
            SELECT 
                c.id::text as id,
                'cart_abandoned' as activity_type,
                'Cart Abandoned' as title,
                CONCAT('Cart with ₹', c.grand_total, ' worth of items was abandoned') as description,
                CONCAT('₹', c.grand_total) as amount,
                c.abandoned_at as activity_timestamp,
                'cart' as category
            FROM carts c
            WHERE c.user_id = ${userId} AND c.abandoned_at IS NOT NULL AND c.is_deleted = false
            
            UNION ALL
            
            -- Wishlist Items Purchased
            SELECT 
                CONCAT(w.id::text, '-', wi.product_id::text) as id,
                'wishlist_purchased' as activity_type,
                'Wishlist Item Purchased' as title,
                'Purchased item from wishlist' as description,
                NULL::text as amount,
                wi.purchased_at as activity_timestamp,
                'wishlist' as category
            FROM wishlist_items wi
            JOIN wishlists w ON wi.wishlist_id = w.id
            WHERE w.user_id = ${userId} AND wi.purchased_at IS NOT NULL
            
            UNION ALL
            
            -- Reviews Submitted
            SELECT 
                r.id::text as id,
                'review_submitted' as activity_type,
                'Review Submitted' as title,
                CONCAT('Rated a product ', r.rating, ' stars') as description,
                NULL::text as amount,
                r.created_at as activity_timestamp,
                'account' as category
            FROM reviews r
            WHERE r.user_id = ${userId} AND r.is_deleted = false
            
            UNION ALL
            
            -- Address Added
            SELECT 
                ua.id::text as id,
                'address_added' as activity_type,
                'New Address Added' as title,
                CONCAT(ua.address_type, ' address in ', ua.city, ', ', ua.state_province) as description,
                NULL::text as amount,
                ua.created_at as activity_timestamp,
                'account' as category
            FROM user_addresses ua
            WHERE ua.user_id = ${userId} AND ua.is_deleted = false
        )
        SELECT 
            id,
            activity_type,
            title,
            description,
            amount,
            activity_timestamp,
            category,
            TO_CHAR(activity_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') as formatted_time
        FROM customer_activities
        WHERE activity_timestamp IS NOT NULL
        ${category !== 'all' ? sql`AND category = ${category}` : sql``}
        ORDER BY activity_timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
    `;

  const countQuery = sql`
        WITH customer_activities AS (
            SELECT u.created_at as activity_timestamp, 'account' as category
            FROM users u WHERE u.id = ${userId}
            UNION ALL
            SELECT u.email_verified_at, 'account' FROM users u WHERE u.id = ${userId} AND u.email_verified = true AND u.email_verified_at IS NOT NULL
            UNION ALL
            SELECT u.phone_verified_at, 'account' FROM users u WHERE u.id = ${userId} AND u.phone_verified = true AND u.phone_verified_at IS NOT NULL
            UNION ALL
            SELECT o.created_at, 'order' FROM orders o WHERE o.user_id = ${userId} AND o.is_deleted = false
            UNION ALL
            SELECT o.paid_at, 'payment' FROM orders o WHERE o.user_id = ${userId} AND o.paid_at IS NOT NULL AND o.is_deleted = false
            UNION ALL
            SELECT o.fulfillment_date, 'order' FROM orders o WHERE o.user_id = ${userId} AND o.fulfillment_date IS NOT NULL AND o.is_deleted = false
            UNION ALL
            SELECT o.delivery_date, 'order' FROM orders o WHERE o.user_id = ${userId} AND o.delivery_date IS NOT NULL AND o.is_deleted = false
            UNION ALL
            SELECT o.return_date, 'order' FROM orders o WHERE o.user_id = ${userId} AND o.return_date IS NOT NULL AND o.is_deleted = false
            UNION ALL
            SELECT COALESCE(pt.verified_at, pt.created_at), 'payment' FROM payment_transactions pt JOIN orders o ON pt.order_id = o.id WHERE o.user_id = ${userId} AND pt.status = 'captured'
            UNION ALL
            SELECT pt.created_at, 'payment' FROM payment_transactions pt JOIN orders o ON pt.order_id = o.id WHERE o.user_id = ${userId} AND pt.status = 'failed'
            UNION ALL
            SELECT pt.refunded_at, 'payment' FROM payment_transactions pt JOIN orders o ON pt.order_id = o.id WHERE o.user_id = ${userId} AND pt.refunded_at IS NOT NULL
            UNION ALL
            SELECT c.abandoned_at, 'cart' FROM carts c WHERE c.user_id = ${userId} AND c.abandoned_at IS NOT NULL AND c.is_deleted = false
            UNION ALL
            SELECT wi.purchased_at, 'wishlist' FROM wishlist_items wi JOIN wishlists w ON wi.wishlist_id = w.id WHERE w.user_id = ${userId} AND wi.purchased_at IS NOT NULL
            UNION ALL
            SELECT r.created_at, 'account' FROM reviews r WHERE r.user_id = ${userId} AND r.is_deleted = false
            UNION ALL
            SELECT ua.created_at, 'account' FROM user_addresses ua WHERE ua.user_id = ${userId} AND ua.is_deleted = false
        )
        SELECT COUNT(*) as total
        FROM customer_activities
        WHERE activity_timestamp IS NOT NULL
        ${category !== 'all' ? sql`AND category = ${category}` : sql``}
    `;

  const [activitiesResult, countResult] = await Promise.all([
    db.execute(activityQuery),
    db.execute(countQuery),
  ]);

  return { activitiesResult, countResult };
};

// ===================================
// CUSTOMER METRICS QUERIES
// ===================================

export const queryCustomerMetrics = async () => {
  const { userRoles } = await import('../../rbac/shared/user-roles.schema');
  const { roles } = await import('../../rbac/shared/roles.schema');
  const { count, notInArray, eq, or, and } = await import('drizzle-orm');

  // Admin exclusion subquery - reusable for both queries
  const adminUserIdsSubquery = db
    .select({ userId: userRoles.user_id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.role_id, roles.id))
    .where(or(eq(roles.name, 'admin'), eq(roles.name, 'superadmin')));

  // 1. Total Customers (non-deleted)
  // Count all users who have a customer profile (excludes admins)
  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
    .where(and(eq(users.is_deleted, false), notInArray(users.id, adminUserIdsSubquery)));

  const total = totalResult?.count ?? 0;

  // 2. Active Customers
  // Active means: Customers with active profile status
  const [activeResult] = await db
    .select({ count: count() })
    .from(users)
    .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
    .where(
      and(
        eq(users.is_deleted, false),
        eq(customerProfiles.account_status, 'active'),
        notInArray(users.id, adminUserIdsSubquery),
      ),
    );

  const active = activeResult?.count ?? 0;

  return { total, active };
};

// ===================================
// BULK OPERATIONS
// ===================================

export const softDeleteUsersByIds = async (ids: string[], deletedBy: string) => {
  const { inArray } = await import('drizzle-orm');
  return db
    .update(users)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy,
    })
    .where(inArray(users.id, ids))
    .returning({ id: users.id });
};

// ===================================
// EXPORT QUERIES
// ===================================

export const getAdminUserIdsSubquery = () => {
  return db
    .select({ userId: userRoles.user_id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.role_id, roles.id))
    .where(inArray(roles.name, ['admin', 'superadmin']));
};

export const getExportCustomersData = async (conditions: any[]) => {
  return db
    .select({ user: users, profile: customerProfiles })
    .from(users)
    .leftJoin(customerProfiles, eq(users.id, customerProfiles.user_id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);
};

export const getDefaultShippingAddressesByUserIds = async (userIds: string[]) => {
  return db
    .select()
    .from(userAddresses)
    .where(
      and(inArray(userAddresses.user_id, userIds), eq(userAddresses.is_default_shipping, true)),
    );
};

// ===================================
// IMPORT QUERIES
// ===================================

export const findUserStatusByEmail = async (email: string) => {
  const [existing] = await db
    .select({ id: users.id, is_deleted: users.is_deleted })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return existing;
};

export const checkExistingAddress = async (tx: DbOrTx, userId: string) => {
  const [existingAddress] = await tx
    .select({ id: userAddresses.id })
    .from(userAddresses)
    .where(eq(userAddresses.user_id, userId))
    .limit(1);
  return existingAddress;
};

// ===================================
// OTP & VERIFICATION
// ===================================

export const findVerifiedEmailOtp = async (tx: DbOrTx, emailAddress: string) => {
  const { emailOtps } = await import('../../user/shared/email-otp.schema');
  const [verifiedOtp] = await tx
    .select()
    .from(emailOtps)
    .where(
      and(
        eq(emailOtps.email, emailAddress.toLowerCase()),
        eq(emailOtps.purpose, 'email_verification'),
      ),
    )
    .limit(1);
  return verifiedOtp;
};
