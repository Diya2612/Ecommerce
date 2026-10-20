/**
 * Recalculate all active carts with the new pricing logic
 * Run this after fixing the pricing utility
 */

import { db } from '../../src/database';
import { carts } from '../../src/features/cart/shared';
import { eq } from 'drizzle-orm';
import { CartCalculationService } from '../../src/features/cart/services/cart-calculation.service';

async function recalculateAllCarts() {
  console.log('🔄 Recalculating all active carts with new pricing logic...\n');

  const activeCarts = await db.select().from(carts).where(eq(carts.cart_status, 'active'));

  console.log(`Found ${activeCarts.length} active carts\n`);

  const service = new CartCalculationService();
  let successCount = 0;
  let errorCount = 0;

  for (const cart of activeCarts) {
    try {
      console.log(`Recalculating cart ${cart.id}...`);
      await service.recalculateCartTotals(cart.id);
      console.log(`✅ Success\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   Total: ${activeCarts.length}\n`);

  process.exit(errorCount > 0 ? 1 : 0);
}

recalculateAllCarts().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
