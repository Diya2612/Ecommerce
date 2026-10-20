/**
 * Cart Validation Service
 * Handles cart integrity and stock checks before checkout.
 */

import { HttpException } from '../../../utils';
import { ICartValidationResponse, IValidationIssue } from '../shared/interface';
import {
  findCartById,
  getCartItems,
  getProductDetailsForCart,
  getAvailableStock,
  updateCartItemPricing,
} from '../shared/queries';
import { calculateItemPricing } from '../utils/pricing.util';
import { cartCalculationService } from './cart-calculation.service';
import { productVariants } from '../../product/shared/product-variants.schema';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../database';

export class CartValidationService {
  /** Validate cart status, stock, and prices. */
  async validateCart(
    cartId: string,
    autoRepair: boolean = false,
  ): Promise<ICartValidationResponse> {
    const cart = await findCartById(cartId);
    if (!cart) throw new HttpException(404, 'Cart not found');

    const items = await getCartItems(cartId);
    if (items.length === 0) throw new HttpException(400, 'Cart is empty');

    const issues: IValidationIssue[] = [];
    let needsRecalculation = false;

    for (const item of items) {
      if (!item.product_id) continue;

      const product = await getProductDetailsForCart(item.product_id);

      if (!product) {
        issues.push({
          itemId: item.id,
          productId: item.product_id,
          productName: item.product_name,
          type: 'product_unavailable',
          message: `${item.product_name || 'Product'} is no longer available`,
          details: {},
        });
        continue;
      }

      if (product.status !== 'active') {
        issues.push({
          itemId: item.id,
          productId: item.product_id,
          productName: product.product_title,
          type: 'product_unavailable',
          message: `${product.product_title} is currently not available for purchase`,
          details: {},
        });
        continue;
      }

      const stockReservedForOthers = await getAvailableStock(
        item.product_id,
        item.variant_id || null,
      );
      const totalAvailableForUser = stockReservedForOthers + item.quantity;

      if (totalAvailableForUser === 0) {
        issues.push({
          itemId: item.id,
          productId: item.product_id,
          productName: product.product_title,
          type: 'out_of_stock',
          message: `${product.product_title} is out of stock`,
          details: { requestedQuantity: item.quantity, availableQuantity: 0 },
        });
      } else if (totalAvailableForUser < item.quantity) {
        issues.push({
          itemId: item.id,
          productId: item.product_id,
          productName: product.product_title,
          type: 'insufficient_stock',
          message: `Only ${totalAvailableForUser} units of ${product.product_title} available`,
          details: { requestedQuantity: item.quantity, availableQuantity: totalAvailableForUser },
        });
      }

      // P1-4: Compare against variant price when variant_id is present
      let expectedPrice = product.selling_price;
      let expectedComparePrice = product.compare_at_price;

      if (item.variant_id) {
        const [variant] = await db
          .select({
            selling_price: productVariants.selling_price,
            compare_at_price: productVariants.compare_at_price,
            is_active: productVariants.is_active,
          })
          .from(productVariants)
          .where(
            and(eq(productVariants.id, item.variant_id), eq(productVariants.is_deleted, false)),
          )
          .limit(1);

        if (!variant || !variant.is_active) {
          issues.push({
            itemId: item.id,
            productId: item.product_id,
            productName: product.product_title,
            type: 'product_unavailable',
            message: `Variant of ${product.product_title} is no longer available`,
            details: {},
          });
          continue;
        }

        expectedPrice = variant.selling_price;
        expectedComparePrice = variant.compare_at_price;
      }

      if (item.final_price !== expectedPrice) {
        issues.push({
          itemId: item.id,
          productId: item.product_id,
          productName: product.product_title,
          type: 'price_changed',
          message: `Price of ${product.product_title} has changed`,
          details: { oldPrice: item.final_price, newPrice: expectedPrice },
        });
        needsRecalculation = true;

        if (autoRepair) {
          const currentPrice = Number(expectedPrice);
          const comparePrice = expectedComparePrice ? Number(expectedComparePrice) : currentPrice;
          const {
            lineSubtotal,
            lineTotal,
            discountAmount: totalDiscountAmount,
          } = calculateItemPricing(currentPrice, comparePrice, item.quantity);

          await updateCartItemPricing(item.id, {
            final_price: expectedPrice,
            cost_price: comparePrice.toFixed(2),
            discount_amount: totalDiscountAmount,
            line_subtotal: lineSubtotal,
            line_total: lineTotal,
          });
        }
      }
    }

    if (needsRecalculation && autoRepair) {
      await cartCalculationService.recalculateCartTotals(cartId);
    }

    const criticalIssues = issues.filter((issue) => issue.type !== 'price_changed');
    const valid = criticalIssues.length === 0;

    return { valid, cartId: cart.id, issues, updatedTotals: null };
  }

  /** Batch validate stock for a set of product items. */
  async validateStockForItems(
    items: Array<{ product_id: string; variant_id?: string | null; quantity: number }>,
  ): Promise<IValidationIssue[]> {
    const issues: IValidationIssue[] = [];

    for (const item of items) {
      const availableStock = await getAvailableStock(item.product_id, item.variant_id || null);

      if (availableStock === 0) {
        issues.push({
          itemId: '',
          productId: item.product_id,
          productName: null,
          type: 'out_of_stock',
          message: 'Product is out of stock',
          details: { requestedQuantity: item.quantity, availableQuantity: 0 },
        });
      } else if (availableStock < item.quantity) {
        issues.push({
          itemId: '',
          productId: item.product_id,
          productName: null,
          type: 'insufficient_stock',
          message: `Only ${availableStock} units available`,
          details: { requestedQuantity: item.quantity, availableQuantity: availableStock },
        });
      }
    }

    return issues;
  }

  /** Quick validation check without auto-repair. */
  async isCartValid(cartId: string): Promise<boolean> {
    try {
      const result = await this.validateCart(cartId, false);
      return result.valid;
    } catch {
      return false;
    }
  }
}

export const cartValidationService = new CartValidationService();
