import { Wishlist } from './wishlist.schema';
import { WishlistItem } from './wishlist-items.schema';

export type IWishlist = Wishlist;
export type IWishlistItem = WishlistItem;

export type IAddToWishlist = Partial<Pick<IWishlistItem, 'product_id' | 'notes'>>;

export interface IMoveToCart {
  quantity: number;
  remove_from_wishlist: boolean;
}

export interface IWishlistItemResponse extends Omit<IWishlistItem, 'wishlist_id' | 'order_id'> {
  product_name: string;
  product_image: string | null;
  slug: string;
  selling_price: string;
  compare_at_price: string | null;
  sku: string;
  inStock: boolean;
  availableStock: number;
  rating: number;
  reviews: number;
}

export interface IWishlistResponse extends Omit<
  IWishlist,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'access_token'
> {
  id: string | null;
  access_token: string | null;
  items: IWishlistItemResponse[];
  itemCount: number;
}

/**
 * Map database record to public response
 */
export const mapToWishlistItemResponse = (
  item: any,
  stockMap: Map<string, number>,
  ratingMap: Map<string, { total: number; count: number }>,
): IWishlistItemResponse => {
  const availableStock = stockMap.get(item.product_id) || 0;
  const ratingData = ratingMap.get(item.product_id) || { total: 0, count: 0 };
  const avgRating = ratingData.count > 0 ? ratingData.total / ratingData.count : 0;

  return {
    product_id: item.product_id,
    product_name: item.product_name,
    product_image: item.product_image,
    slug: item.slug,
    selling_price: item.selling_price,
    compare_at_price: item.compare_at_price,
    sku: item.sku,
    inStock: availableStock > 0 && item.product_status === 'active',
    availableStock,
    notes: item.notes,
    added_at: item.added_at,
    added_to_cart_at: item.added_to_cart_at,
    purchased_at: item.purchased_at,
    rating: avgRating,
    reviews: ratingData.count,
  };
};

/**
 * Map wishlist container to public response
 */
export const mapToWishlistResponse = (
  wishlist: IWishlist | null,
  items: IWishlistItemResponse[],
): IWishlistResponse => {
  if (!wishlist) {
    return {
      id: null,
      access_token: null,
      items: [],
      itemCount: 0,
    };
  }

  return {
    id: wishlist.id,
    access_token: wishlist.access_token,
    items,
    itemCount: items.length,
  };
};
