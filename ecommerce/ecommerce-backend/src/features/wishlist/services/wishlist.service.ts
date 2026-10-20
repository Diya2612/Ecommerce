import { randomBytes } from 'crypto';
import {
  baseFindWishlistByUserId,
  baseInsertWishlist,
  baseCheckProductInWishlist,
  baseInsertWishlistItem,
  baseDeleteWishlistItem,
  baseUpdateWishlistTimestamp,
  baseFindProductForWishlist,
  baseFindActiveCartByUserId,
  baseInsertCart,
  baseFindCartItem,
  baseUpdateCartItem,
  baseInsertCartItem,
  baseGetCartLineItems,
  baseUpdateCartTotals,
  baseDeleteWishlistItemRaw,
  baseUpdateWishlistItemAddedToCart,
  baseFindWishlistItemsWithProducts,
  baseGetInventoryRecords,
  baseGetReviewRecords,
} from '../shared/queries';
import {
  IWishlistResponse,
  IAddToWishlist,
  IMoveToCart,
  mapToWishlistItemResponse,
  mapToWishlistResponse,
  IWishlistItemResponse,
} from '../shared/interface';
import { HttpException } from '../../../utils';

/**
 * Get or create wishlist for a user.
 */
const getOrCreateWishlistId = async (userId: string): Promise<string> => {
  const existing = await baseFindWishlistByUserId(userId);
  if (existing) return existing.id;

  const accessToken = randomBytes(32).toString('hex');
  const newWishlist = await baseInsertWishlist({
    user_id: userId,
    access_token: accessToken,
    status: true,
  });

  if (!newWishlist) throw new HttpException(500, 'Failed to create wishlist');
  return newWishlist.id;
};

/**
 * Get or create active cart for a user.
 */
const getOrCreateCartId = async (userId: string): Promise<string> => {
  const existing = await baseFindActiveCartByUserId(userId);
  if (existing) return existing.id;

  const newCart = await baseInsertCart({
    user_id: userId,
    cart_status: 'active',
    created_by: userId,
  });

  if (!newCart) throw new HttpException(500, 'Failed to create cart');
  return newCart.id;
};

/**
 * Calculate available stock from inventory records.
 */
const calculateAvailableStock = async (productId: string): Promise<number> => {
  const records = await baseGetInventoryRecords([productId]);
  return records.reduce((sum, r) => sum + (r.available_quantity || 0), 0);
};

/**
 * Get user's wishlist with enriched product data.
 */
export const getWishlist = async (userId: string): Promise<IWishlistResponse> => {
  const wishlist = await baseFindWishlistByUserId(userId);
  if (!wishlist) return mapToWishlistResponse(null, []);

  const items = await baseFindWishlistItemsWithProducts(wishlist.id);
  if (items.length === 0) return mapToWishlistResponse(wishlist, []);

  const productIds = items.map((i) => i.product_id);
  const [inventoryRecords, reviewRecords] = await Promise.all([
    baseGetInventoryRecords(productIds),
    baseGetReviewRecords(productIds),
  ]);

  const stockMap = new Map<string, number>();
  inventoryRecords.forEach((r) => {
    if (!r.product_id) return;
    const current = stockMap.get(r.product_id) || 0;
    const available = r.available_quantity || 0;
    stockMap.set(r.product_id, current + available);
  });

  const ratingMap = new Map<string, { total: number; count: number }>();
  reviewRecords.forEach((r) => {
    const current = ratingMap.get(r.product_id) || { total: 0, count: 0 };
    ratingMap.set(r.product_id, {
      total: current.total + Number(r.rating || 0),
      count: current.count + 1,
    });
  });

  const enrichedItems: IWishlistItemResponse[] = items.map((item) =>
    mapToWishlistItemResponse(item, stockMap, ratingMap),
  );

  return mapToWishlistResponse(wishlist, enrichedItems);
};

/**
 * Add product to wishlist.
 */
export const addToWishlist = async (userId: string, data: IAddToWishlist) => {
  const { product_id, notes } = data;
  if (!product_id) throw new HttpException(400, 'Product ID is required');

  const product = await baseFindProductForWishlist(product_id);
  if (!product) throw new HttpException(404, 'Product not found');
  if (product.status !== 'active') throw new HttpException(400, 'Product is not available');

  const wishlistId = await getOrCreateWishlistId(userId);
  const exists = await baseCheckProductInWishlist(wishlistId, product_id);
  if (exists) {
    return {
      product_id,
      product_name: product.product_title,
      already_exists: true,
    };
  }

  await baseInsertWishlistItem({
    wishlist_id: wishlistId,
    product_id,
    notes: notes || null,
  });

  await baseUpdateWishlistTimestamp(wishlistId);

  return {
    product_id,
    product_name: product.product_title,
    already_exists: false,
  };
};

/**
 * Remove product from wishlist.
 */
export const removeFromWishlist = async (userId: string, productId: string) => {
  const wishlist = await baseFindWishlistByUserId(userId);
  if (!wishlist) throw new HttpException(404, 'Wishlist not found');

  const exists = await baseCheckProductInWishlist(wishlist.id, productId);
  if (!exists) throw new HttpException(404, 'Product not found in wishlist');

  await baseDeleteWishlistItem(wishlist.id, productId);
  await baseUpdateWishlistTimestamp(wishlist.id);
};

/**
 * Move wishlist item to cart.
 */
export const moveToCart = async (userId: string, productId: string, data: IMoveToCart) => {
  const { quantity, remove_from_wishlist } = data;

  const wishlist = await baseFindWishlistByUserId(userId);
  if (!wishlist) throw new HttpException(404, 'Wishlist not found');

  const wishlistItem = await baseCheckProductInWishlist(wishlist.id, productId);
  if (!wishlistItem) throw new HttpException(404, 'Product not found in wishlist');

  const product = await baseFindProductForWishlist(productId);
  if (!product) throw new HttpException(404, 'Product not found');
  if (product.status !== 'active') throw new HttpException(400, 'Product is not available');

  const availableStock = await calculateAvailableStock(productId);
  if (availableStock < quantity)
    throw new HttpException(400, `Only ${availableStock} units available`);

  const cartId = await getOrCreateCartId(userId);
  const existingCartItem = await baseFindCartItem(cartId, productId);

  const sellingPrice = Number(product.selling_price);
  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : sellingPrice;
  const discountAmount = Math.max(compareAtPrice - sellingPrice, 0);

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;
    await baseUpdateCartItem(existingCartItem.id, {
      quantity: newQuantity,
      line_subtotal: (compareAtPrice * newQuantity).toFixed(2),
      line_total: (sellingPrice * newQuantity).toFixed(2),
      discount_amount: (discountAmount * newQuantity).toFixed(2),
    });
  } else {
    await baseInsertCartItem({
      cart_id: cartId,
      product_id: productId,
      quantity,
      cost_price: compareAtPrice.toFixed(2),
      final_price: product.selling_price,
      discount_amount: (discountAmount * quantity).toFixed(2),
      line_subtotal: (compareAtPrice * quantity).toFixed(2),
      line_total: (sellingPrice * quantity).toFixed(2),
      product_name: product.product_title,
      product_image_url: product.primary_image_url,
      product_sku: product.sku,
    });
  }

  const cartItemsList = await baseGetCartLineItems(cartId);
  const subtotal = cartItemsList.reduce((sum, item) => sum + Number(item.line_subtotal), 0);
  const discountTotal = cartItemsList.reduce((sum, item) => sum + Number(item.discount_amount), 0);
  const grandTotal = cartItemsList.reduce((sum, item) => sum + Number(item.line_total), 0);

  await baseUpdateCartTotals(cartId, {
    subtotal: subtotal.toFixed(2),
    discount_total: discountTotal.toFixed(2),
    grand_total: grandTotal.toFixed(2),
  });

  if (remove_from_wishlist) {
    await baseDeleteWishlistItemRaw(wishlist.id, productId);
  } else {
    await baseUpdateWishlistItemAddedToCart(wishlist.id, productId);
  }

  return {
    product_name: product.product_title,
    quantity,
    removed_from_wishlist: !!remove_from_wishlist,
  };
};
