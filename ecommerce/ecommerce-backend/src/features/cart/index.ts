/**
 * Cart Feature
 * Central exports and route initialization for shopping cart operations.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class CartRoute implements Route {
  public path = '/cart';
  public router = Router();

  public async init() {
    // Dynamic imports to avoid circular dependency
    const { default: addToCartRouter } = await import('./apis/add-to-cart');
    const { default: getCartRouter } = await import('./apis/get-cart');
    const { default: updateCartItemRouter } = await import('./apis/update-cart-item');
    const { default: removeCartItemRouter } = await import('./apis/remove-cart-item');
    const { default: clearCartRouter } = await import('./apis/clear-cart');
    const { default: validateCartRouter } = await import('./apis/validate-cart');
    const { default: mergeCartRouter } = await import('./apis/merge-cart');
    const { default: applyDiscountRouter } = await import('./apis/apply-discount');
    const { default: removeDiscountRouter } = await import('./apis/remove-discount');
    const { default: saveForLaterRouter } = await import('./apis/save-for-later');
    const { default: moveToCartRouter } = await import('./apis/move-to-cart');
    const { default: switchVariantRouter } = await import('./apis/switch-variant');

    // Register routes - specific routes MUST come before parameterized routes
    this.router.use(this.path, mergeCartRouter);
    this.router.use(this.path, validateCartRouter);
    this.router.use(this.path, applyDiscountRouter);
    this.router.use(this.path, removeDiscountRouter);
    this.router.use(this.path, saveForLaterRouter);
    this.router.use(this.path, moveToCartRouter);
    this.router.use(this.path, switchVariantRouter);
    this.router.use(this.path, addToCartRouter);
    this.router.use(this.path, updateCartItemRouter);
    this.router.use(this.path, removeCartItemRouter);
    this.router.use(this.path, getCartRouter);
    this.router.use(this.path, clearCartRouter);
  }
}

export default CartRoute;

// Shared resources
export * from './shared';
