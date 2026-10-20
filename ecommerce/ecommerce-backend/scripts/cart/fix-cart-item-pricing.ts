/**
 * Fix line_subtotal values in all cart items
 * Updates line_subtotal to use final_price instead of cost_price
 */

import { db } from '../../src/database';
import { cartItems } from '../../src/features/cart/shared';
import { eq } from 'drizzle-orm';

async function fixCartItemPricing() {
  console.log('🔧 Fixing cart item pricing...\n');

  // Get all cart items (including deleted ones in case they're referenced)
  const allItems = await db.select().from(cartItems);

  console.log(`Found ${allItems.length} cart items\n`);

  let fixedCount = 0;
  let alreadyCorrect = 0;

  for (const item of allItems) {
    const finalPrice = parseFloat(item.final_price);
    const quantity = item.quantity;

    const correctLineSubtotal = (finalPrice * quantity).toFixed(2);
    const correctLineTotal = (finalPrice * quantity).toFixed(2);

    const needsUpdate =
      item.line_subtotal !== correctLineSubtotal || item.line_total !== correctLineTotal;

    if (needsUpdate) {
      console.log(`📦 ${item.product_name || 'Unknown'}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Final Price: ₹${item.final_price}`);
      console.log(`   Quantity: ${quantity}`);
      console.log(`   Old line_subtotal: ₹${item.line_subtotal}`);
      console.log(`   New line_subtotal: ₹${correctLineSubtotal}`);
      console.log(`   Old line_total: ₹${item.line_total}`);
      console.log(`   New line_total: ₹${correctLineTotal}`);

      await db
        .update(cartItems)
        .set({
          line_subtotal: correctLineSubtotal,
          line_total: correctLineTotal,
          updated_at: new Date(),
        })
        .where(eq(cartItems.id, item.id));

      console.log(`   ✅ Fixed\n`);
      fixedCount++;
    } else {
      alreadyCorrect++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${fixedCount} items`);
  console.log(`   ✓  Already correct: ${alreadyCorrect} items`);
  console.log(`   Total: ${allItems.length} items\n`);

  process.exit(0);
}

fixCartItemPricing().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
