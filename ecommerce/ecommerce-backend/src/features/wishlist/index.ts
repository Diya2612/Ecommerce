/**
 * Wishlist Feature
 * Central exports and routing for wishlist management.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class WishlistRoute implements Route {
  public path = '/wishlist';
  public router = Router();

  public async init() {
    const { default: getWishlistRouter } = await import('./apis/get-wishlist');
    const { default: addToWishlistRouter } = await import('./apis/add-to-wishlist');
    const { default: removeFromWishlistRouter } = await import('./apis/remove-from-wishlist');
    const { default: moveToCartRouter } = await import('./apis/move-to-cart');

    this.router.use(this.path, getWishlistRouter);
    this.router.use(this.path, addToWishlistRouter);
    this.router.use(this.path, removeFromWishlistRouter);
    this.router.use(this.path, moveToCartRouter);
  }
}

export default WishlistRoute;

// Shared Exports
export { wishlists } from './shared/wishlist.schema';
export { wishlistItems } from './shared/wishlist-items.schema';
export type { IWishlist, IWishlistItem } from './shared/interface';
