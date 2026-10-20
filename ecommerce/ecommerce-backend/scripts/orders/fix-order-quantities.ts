/**
 * Fix incorrect total_quantity in existing orders
 * Recalculates total_quantity from actual order items
 */

import { db } from '../../src/database';
import { orders, orderItems } from '../../src/features/orders/shared';
import { eq, sql } from 'drizzle-orm';

async function fixOrderQuantities() {
  console.log('🔧 Fixing order total_quantity values...\n');

  // Get all orders
  const allOrders = await db.select().from(orders);

  console.log(`Found ${allOrders.length} orders to check\n`);

  let fixedCount = 0;
  let alreadyCorrect = 0;

  for (const order of allOrders) {
    // Get order items
    const items = await db.select().from(orderItems).where(eq(orderItems.order_id, order.id));

    // Calculate correct total quantity (sum of all item quantities)
    const correctTotalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    if (correctTotalQuantity !== order.total_quantity) {
      console.log(`📦 Order ${order.order_number}:`);
      console.log(`   Current total_quantity: ${order.total_quantity}`);
      console.log(`   Correct total_quantity: ${correctTotalQuantity}`);
      console.log(
        `   Items: ${items.length} (quantities: ${items.map((i) => i.quantity).join(', ')})`,
      );

      // Update the order
      await db
        .update(orders)
        .set({
          total_quantity: correctTotalQuantity,
          updated_at: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log(`   ✅ Fixed!\n`);
      fixedCount++;
    } else {
      alreadyCorrect++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${fixedCount} orders`);
  console.log(`   ✓  Already correct: ${alreadyCorrect} orders`);
  console.log(`   Total: ${allOrders.length} orders`);

  process.exit(0);
}

fixOrderQuantities().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
