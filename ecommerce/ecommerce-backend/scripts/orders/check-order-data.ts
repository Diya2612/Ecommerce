/**
 * Diagnostic script to check order data structure
 * Verifies order items have product names and images
 */

import { db } from '../../src/database';
import { orders, orderItems } from '../../src/features/orders/shared';
import { eq, desc } from 'drizzle-orm';

async function checkOrderData() {
  console.log('🔍 Checking order data...\n');

  // Get latest 5 orders
  const recentOrders = await db.select().from(orders).orderBy(desc(orders.created_at)).limit(5);

  console.log(`Found ${recentOrders.length} recent orders\n`);

  for (const order of recentOrders) {
    console.log(`\n📦 Order: ${order.order_number}`);
    console.log(`   Status: ${order.order_status}`);
    console.log(`   Total Quantity: ${order.total_quantity}`);
    console.log(`   Total Amount: ${order.total_amount}`);

    // Get order items
    const items = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id));

    console.log(`   Items in DB: ${items.length}`);

    if (items.length !== order.total_quantity) {
      console.log(
        `   ⚠️  MISMATCH: DB has ${items.length} items but order.total_quantity is ${order.total_quantity}`,
      );
    }

    // Check each item
    let actualQuantitySum = 0;
    for (const item of items) {
      actualQuantitySum += item.quantity;
      console.log(`     - ${item.product_name || '❌ NO NAME'}`);
      console.log(`       Quantity: ${item.quantity}`);
      console.log(`       Image: ${item.product_image || '❌ NO IMAGE'}`);
      console.log(`       Price: ${item.cost_price}`);
    }

    if (actualQuantitySum !== order.total_quantity) {
      console.log(
        `   ⚠️  QUANTITY MISMATCH: Sum of item quantities (${actualQuantitySum}) != order.total_quantity (${order.total_quantity})`,
      );
    }
  }

  console.log('\n✅ Check complete');
  process.exit(0);
}

checkOrderData().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
