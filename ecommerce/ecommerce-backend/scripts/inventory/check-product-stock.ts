/**
 * Quick script to check stock details for a specific product
 *
 * Usage:
 *   npm run ts-node scripts/inventory/check-product-stock.ts "Championship Pro"
 *   npm run ts-node scripts/inventory/check-product-stock.ts <product-id>
 */

import { db } from '../../src/database';
import { sql } from 'drizzle-orm';

async function checkProductStock(searchTerm: string) {
  console.log(`🔍 Searching for product: "${searchTerm}"\n`);

  // Search by name or ID
  const products = await db.execute(sql`
    SELECT 
      p.id,
      p.product_title,
      p.sku,
      p.status,
      COALESCE(SUM(i.available_quantity), 0) as total_available,
      COALESCE(SUM(i.committed_quantity), 0) as total_committed,
      COALESCE(SUM(i.available_quantity - i.committed_quantity), 0) as actual_available
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE p.product_title ILIKE ${`%${searchTerm}%`}
       OR p.id = ${searchTerm}
       OR p.sku ILIKE ${`%${searchTerm}%`}
    GROUP BY p.id, p.product_title, p.sku, p.status
  `);

  if (products.rows.length === 0) {
    console.log('❌ No products found matching that search.\n');
    return;
  }

  for (const product of products.rows as any[]) {
    console.log(`📦 ${product.product_title}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   SKU: ${product.sku || 'N/A'}`);
    console.log(`   Status: ${product.status}`);
    console.log(`   ────────────────────────────────────`);
    console.log(`   Total Available Quantity: ${product.total_available}`);
    console.log(`   Committed (Reserved):     ${product.total_committed}`);
    console.log(`   Actual Available to Sell: ${product.actual_available}`);
    console.log('');

    // Check cart reservations
    const cartRes = await db.execute(sql`
      SELECT 
        ci.id,
        ci.quantity,
        ci.reservation_id,
        ci.reservation_expires_at,
        c.user_id,
        c.session_id
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.product_id = ${product.id}
        AND ci.reservation_id IS NOT NULL
      ORDER BY ci.reservation_expires_at DESC
    `);

    if (cartRes.rows.length > 0) {
      console.log(`   🛒 Active Cart Reservations (${cartRes.rows.length}):`);
      for (const cart of cartRes.rows as any[]) {
        const expired = new Date(cart.reservation_expires_at) < new Date();
        console.log(`      • ${cart.quantity} units - ${expired ? '❌ EXPIRED' : '✅ Active'}`);
        console.log(`        Expires: ${cart.reservation_expires_at}`);
        console.log(`        User/Session: ${cart.user_id || cart.session_id}`);
      }
      console.log('');
    }

    // Check order reservations
    const orderRes = await db.execute(sql`
      SELECT 
        o.id,
        o.order_number,
        o.order_status,
        oi.quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ${product.id}
        AND o.order_status IN ('pending', 'confirmed', 'processing')
      ORDER BY o.created_at DESC
    `);

    if (orderRes.rows.length > 0) {
      console.log(`   📋 Pending Orders (${orderRes.rows.length}):`);
      for (const order of orderRes.rows as any[]) {
        console.log(`      • Order #${order.order_number} (${order.order_status})`);
        console.log(`        Quantity: ${order.quantity}`);
      }
      console.log('');
    }
  }
}

const searchTerm = process.argv[2];
if (!searchTerm) {
  console.log('Usage: npm run ts-node scripts/inventory/check-product-stock.ts "Product Name"');
  process.exit(1);
}

checkProductStock(searchTerm)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
