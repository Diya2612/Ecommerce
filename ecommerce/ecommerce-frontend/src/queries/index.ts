/**
 * Queries Module Index
 *
 * Centralized exports for all query functions.
 * Import from '@/queries' for convenience.
 *
 * @example
 * ```ts
 * import { getProductBySlug, getCart, createOrder } from '@/queries';
 * ```
 */

// Products
export {
  productKeys,
  getProductById,
  getProductBySlug,
  getProducts,
  getAllProducts,
  searchProducts,
  getRelatedProducts,
  getSimilarProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductReviews,
  getProductBundles,
  getFilterOptions,
} from "./products";

export type {
  Product,
  ProductDetail,
  ProductReview,
  ReviewsResponse,
  ProductBundle,
  ProductsResponse,
  GetProductsParams,
  PaginatedProducts,
  FilterOptions,
} from "./products";

// Cart
export {
  cartKeys,
  getCartSessionId,
  clearCartSessionId,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
  applyDiscount,
  removeDiscount,
} from "./cart";

export type {
  CartResponse,
  CartItemResponse,
  AddToCartData,
  UpdateCartItemData,
  MergeCartResponse,
} from "./cart";

// Orders
export {
  orderKeys,
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  createPaymentOrder,
  verifyPayment,
  retryPayment,
  getLatestInvoice,
  downloadInvoice,
} from "./orders";

export type {
  Order,
  OrderItem,
  CreateOrderData,
  OrderSummaryResponse,
  CreatePaymentOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  InvoiceData,
} from "./orders";

// Users
export {
  userKeys,
  clearUserCache,
  getCurrentUser,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  changePassword,
} from "./users";

export type {
  UserProfile,
  UserAddress,
  UpdateProfileData,
  AddressData,
} from "./users";

// Auth
export {
  requestPasswordReset,
  resetPassword,
  syncUser,
  syncUserWithToken,
} from "./auth";

export type { AuthResponse, SyncUserResponse } from "./auth";

// Tiers
export { tierKeys, getAllTiers, getTierHierarchy, getTierById } from "./tiers";

export type { TierParams } from "./tiers";

// Notifications
export {
  notificationKeys,
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../hooks/queries/notifications/useNotifications";

// Notification Preferences
export {
  preferenceKeys,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useResetNotificationPreferences,
} from "../hooks/queries/notifications/useNotificationPreferences";

export type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
  NotificationFilters,
  NotificationPreferences,
  PreferencesResponse,
} from "../types/notification";
