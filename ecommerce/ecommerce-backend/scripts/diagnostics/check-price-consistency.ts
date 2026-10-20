/**
 * Price Consistency Diagnostic Script
 *
 * Checks price consistency across cart → checkout → order flow
 * Identifies discrepancies in:
 * - Item prices (cost_price vs final_price vs unit_price)
 * - Line totals calculation
 * - Subtotal calculation
 * - Discount application
 * - Tax calculation
 * - Total calculation
 */

import { db } from '../../src/database';
import { carts, cartItems } from '../../src/features/cart/shared';
import { orders, orderItems } from '../../src/features/orders/shared';
import { eq, desc } from 'drizzle-orm';

interface PriceIssue {
  type: 'error' | 'warning' | 'info';
  location: string;
  expected: number | string;
  actual: number | string;
  message: string;
}

async function analyzePriceConsistency() {
  console.log('🔍 Analyzing Price Consistency...\n');

  const issues: PriceIssue[] = [];

  // Get a recent active cart with items
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.cart_status, 'active'))
    .orderBy(desc(carts.updated_at))
    .limit(1);

  if (!cart) {
    console.log('❌ No active carts found. Add items to cart first.\n');
    return;
  }

  console.log(`📊 Analyzing Cart: ${cart.id}\n`);

  // Get cart items
  const items = await db.select().from(cartItems).where(eq(cartItems.cart_id, cart.id));

  if (items.length === 0) {
    console.log('❌ Cart is empty.\n');
    return;
  }

  console.log(`📦 Cart Items: ${items.length}\n`);

  // ═══════════════════════════════════════════════════════════
  // PHASE 1: Cart Item Price Consistency
  // ═══════════════════════════════════════════════════════════

  console.log('━━━ PHASE 1: Cart Item Price Analysis ━━━\n');

  let cartItemSubtotal = 0;

  for (const item of items) {
    console.log(`\n📦 ${item.product_name || 'Unknown Product'}`);
    console.log(`   Product ID: ${item.product_id}`);
    console.log(`   Quantity: ${item.quantity}`);
    console.log(`   Cost Price: ₹${item.cost_price}`);
    console.log(`   Final Price: ₹${item.final_price}`);
    console.log(`   Line Subtotal: ₹${item.line_subtotal}`);
    console.log(`   Line Total: ₹${item.line_total}`);
    console.log(`   Discount Amount: ₹${item.discount_amount || '0.00'}`);

    // Check: line_subtotal = final_price * quantity
    const expectedLineSubtotal = parseFloat(item.final_price) * item.quantity;
    const actualLineSubtotal = parseFloat(item.line_subtotal);

    if (Math.abs(expectedLineSubtotal - actualLineSubtotal) > 0.01) {
      issues.push({
        type: 'error',
        location: `Cart Item ${item.product_name}`,
        expected: expectedLineSubtotal.toFixed(2),
        actual: actualLineSubtotal.toFixed(2),
        message: `line_subtotal should be final_price (${item.final_price}) × quantity (${item.quantity})`,
      });
      console.log(
        `   ⚠️  line_subtotal mismatch: Expected ${expectedLineSubtotal.toFixed(2)}, Got ${actualLineSubtotal.toFixed(2)}`,
      );
    } else {
      console.log(`   ✅ line_subtotal correct`);
    }

    // Check: line_total = line_subtotal (cart doesn't apply discounts at item level in current implementation)
    const actualLineTotal = parseFloat(item.line_total);
    if (Math.abs(actualLineSubtotal - actualLineTotal) > 0.01) {
      issues.push({
        type: 'warning',
        location: `Cart Item ${item.product_name}`,
        expected: actualLineSubtotal.toFixed(2),
        actual: actualLineTotal.toFixed(2),
        message: `line_total differs from line_subtotal (item discount: ${item.discount_amount || '0.00'})`,
      });
      console.log(`   ℹ️  line_total differs from line_subtotal (discount applied)`);
    } else {
      console.log(`   ✅ line_total matches line_subtotal`);
    }

    cartItemSubtotal += actualLineTotal;
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: Cart Totals Consistency
  // ═══════════════════════════════════════════════════════════

  console.log('\n\n━━━ PHASE 2: Cart Totals Analysis ━━━\n');

  console.log(`Cart Subtotal (DB): ₹${cart.subtotal}`);
  console.log(`Cart Subtotal (Calculated from items): ₹${cartItemSubtotal.toFixed(2)}`);

  const cartSubtotal = parseFloat(cart.subtotal);
  if (Math.abs(cartSubtotal - cartItemSubtotal) > 0.01) {
    issues.push({
      type: 'error',
      location: 'Cart Subtotal',
      expected: cartItemSubtotal.toFixed(2),
      actual: cartSubtotal.toFixed(2),
      message: 'Cart subtotal in DB does not match sum of item line_totals',
    });
    console.log(`⚠️  Cart subtotal mismatch!`);
  } else {
    console.log(`✅ Cart subtotal correct`);
  }

  const cartDiscount = parseFloat(cart.discount_total || '0.00');
  const cartGrandTotal = parseFloat(cart.grand_total);
  const expectedGrandTotal = cartSubtotal - cartDiscount;

  console.log(`\nCart Discount: ₹${cartDiscount.toFixed(2)}`);
  console.log(`Cart Grand Total (DB): ₹${cartGrandTotal.toFixed(2)}`);
  console.log(`Cart Grand Total (Calculated): ₹${expectedGrandTotal.toFixed(2)}`);

  if (Math.abs(cartGrandTotal - expectedGrandTotal) > 0.01) {
    issues.push({
      type: 'error',
      location: 'Cart Grand Total',
      expected: expectedGrandTotal.toFixed(2),
      actual: cartGrandTotal.toFixed(2),
      message: 'Cart grand_total should be subtotal − discount_total',
    });
    console.log(`⚠️  Cart grand_total mismatch!`);
  } else {
    console.log(`✅ Cart grand_total correct`);
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: Order Price Consistency
  // ═══════════════════════════════════════════════════════════

  console.log('\n\n━━━ PHASE 3: Order Price Analysis ━━━\n');

  // Find orders created from this cart
  const relatedOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.cart_id, cart.id))
    .orderBy(desc(orders.created_at))
    .limit(1);

  if (relatedOrders.length === 0) {
    console.log('ℹ️  No orders found from this cart yet. Create an order to continue analysis.\n');
  } else {
    const order = relatedOrders[0];
    console.log(`🛍️  Order: ${order.order_number}\n`);

    const orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.order_id, order.id));

    console.log(`Order Items: ${orderItemsList.length}`);
    console.log(`Order Subtotal (DB): ₹${order.subtotal}`);
    console.log(`Order Discount (DB): ₹${order.discount_amount || '0.00'}`);
    console.log(`Order Tax (DB): ₹${order.tax_amount || '0.00'}`);
    console.log(`Order Shipping (DB): ₹${order.shipping_amount || '0.00'}`);
    console.log(`Order Total (DB): ₹${order.total_amount}\n`);

    // Calculate order totals from items
    let orderItemSubtotal = 0;

    for (const item of orderItemsList) {
      console.log(`\n📦 ${item.product_name}`);
      console.log(`   Quantity: ${item.quantity}`);
      console.log(`   Cost Price: ₹${item.cost_price}`);
      console.log(`   Line Total: ₹${item.line_total}`);

      const expectedLineTotal = parseFloat(item.cost_price) * item.quantity;
      const actualLineTotal = parseFloat(item.line_total);

      if (Math.abs(expectedLineTotal - actualLineTotal) > 0.01) {
        issues.push({
          type: 'warning',
          location: `Order Item ${item.product_name}`,
          expected: expectedLineTotal.toFixed(2),
          actual: actualLineTotal.toFixed(2),
          message: `line_total should be cost_price (${item.cost_price}) × quantity (${item.quantity})`,
        });
        console.log(
          `   ⚠️  line_total mismatch: Expected ${expectedLineTotal.toFixed(2)}, Got ${actualLineTotal.toFixed(2)}`,
        );
      } else {
        console.log(`   ✅ line_total correct`);
      }

      orderItemSubtotal += actualLineTotal;
    }

    console.log(`\n\nOrder Subtotal (Calculated from items): ₹${orderItemSubtotal.toFixed(2)}`);
    console.log(`Order Subtotal (DB): ₹${order.subtotal}`);

    const orderSubtotal = parseFloat(order.subtotal);
    if (Math.abs(orderSubtotal - orderItemSubtotal) > 0.01) {
      issues.push({
        type: 'error',
        location: 'Order Subtotal',
        expected: orderItemSubtotal.toFixed(2),
        actual: orderSubtotal.toFixed(2),
        message: 'Order subtotal in DB does not match sum of item line_totals',
      });
      console.log(`⚠️  Order subtotal mismatch!`);
    } else {
      console.log(`✅ Order subtotal correct`);
    }

    // Check order total calculation
    const orderDiscount = parseFloat(order.discount_amount || '0.00');
    const orderTax = parseFloat(order.tax_amount || '0.00');
    const orderShipping = parseFloat(order.shipping_amount || '0.00');
    const orderTotal = parseFloat(order.total_amount);

    const expectedOrderTotal = orderSubtotal - orderDiscount + orderShipping + orderTax;

    console.log(`\nOrder Total Calculation:`);
    console.log(`  Subtotal:    ₹${orderSubtotal.toFixed(2)}`);
    console.log(`  − Discount:  ₹${orderDiscount.toFixed(2)}`);
    console.log(`  + Shipping:  ₹${orderShipping.toFixed(2)}`);
    console.log(`  + Tax:       ₹${orderTax.toFixed(2)}`);
    console.log(`  ─────────────────────`);
    console.log(`  Expected:    ₹${expectedOrderTotal.toFixed(2)}`);
    console.log(`  Actual (DB): ₹${orderTotal.toFixed(2)}`);

    if (Math.abs(orderTotal - expectedOrderTotal) > 0.01) {
      issues.push({
        type: 'error',
        location: 'Order Total',
        expected: expectedOrderTotal.toFixed(2),
        actual: orderTotal.toFixed(2),
        message: 'Order total_amount should be subtotal − discount + shipping + tax',
      });
      console.log(`\n⚠️  Order total_amount mismatch!`);
    } else {
      console.log(`\n✅ Order total_amount correct`);
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 4: Cart vs Order Price Comparison
    // ═══════════════════════════════════════════════════════════

    console.log('\n\n━━━ PHASE 4: Cart → Order Consistency ━━━\n');

    console.log('Comparing cart and order prices:\n');
    console.log(`Cart Subtotal:  ₹${cartSubtotal.toFixed(2)}`);
    console.log(`Order Subtotal: ₹${orderSubtotal.toFixed(2)}`);

    if (Math.abs(cartSubtotal - orderSubtotal) > 0.01) {
      issues.push({
        type: 'warning',
        location: 'Cart → Order',
        expected: cartSubtotal.toFixed(2),
        actual: orderSubtotal.toFixed(2),
        message: 'Order subtotal differs from cart subtotal (may be expected if prices changed)',
      });
      console.log(`⚠️  Subtotal changed from cart to order`);
    } else {
      console.log(`✅ Subtotal consistent from cart to order`);
    }

    console.log(`\nCart Discount:  ₹${cartDiscount.toFixed(2)}`);
    console.log(`Order Discount: ₹${orderDiscount.toFixed(2)}`);

    if (Math.abs(cartDiscount - orderDiscount) > 0.01) {
      issues.push({
        type: 'warning',
        location: 'Cart → Order',
        expected: cartDiscount.toFixed(2),
        actual: orderDiscount.toFixed(2),
        message: 'Order discount differs from cart discount',
      });
      console.log(`⚠️  Discount changed from cart to order`);
    } else {
      console.log(`✅ Discount consistent from cart to order`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 PRICE CONSISTENCY REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');
  const infos = issues.filter((i) => i.type === 'info');

  if (issues.length === 0) {
    console.log('✅ No price inconsistencies found!\n');
  } else {
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} Error(s) Found:\n`);
      errors.forEach((issue, idx) => {
        console.log(`${idx + 1}. [${issue.location}]`);
        console.log(`   ${issue.message}`);
        console.log(`   Expected: ${issue.expected}`);
        console.log(`   Actual:   ${issue.actual}\n`);
      });
    }

    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} Warning(s) Found:\n`);
      warnings.forEach((issue, idx) => {
        console.log(`${idx + 1}. [${issue.location}]`);
        console.log(`   ${issue.message}`);
        console.log(`   Expected: ${issue.expected}`);
        console.log(`   Actual:   ${issue.actual}\n`);
      });
    }

    if (infos.length > 0) {
      console.log(`ℹ️  ${infos.length} Info Note(s):\n`);
      infos.forEach((issue, idx) => {
        console.log(`${idx + 1}. [${issue.location}] ${issue.message}\n`);
      });
    }

    console.log(
      `\nTotal Issues: ${issues.length} (${errors.length} errors, ${warnings.length} warnings)`,
    );
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(errors.length > 0 ? 1 : 0);
}

analyzePriceConsistency().catch((err) => {
  console.error('❌ Error running diagnostic:', err);
  process.exit(1);
});
