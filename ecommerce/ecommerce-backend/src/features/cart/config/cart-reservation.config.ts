/**
 * Cart reservation system configuration.
 */

export const CART_RESERVATION_CONFIG = {
  // Timeout in minutes for cart reservations
  RESERVATION_TIMEOUT: parseInt(process.env.CART_RESERVATION_TIMEOUT || '30', 10),

  // Checkout extension in minutes
  CHECKOUT_EXTENSION: parseInt(process.env.CART_CHECKOUT_EXTENSION || '60', 10),

  // Cleanup interval in minutes
  CLEANUP_INTERVAL: parseInt(process.env.CART_CLEANUP_INTERVAL || '5', 10),

  // Feature flag
  ENABLED: process.env.ENABLE_CART_RESERVATIONS !== 'false',

  // Maximum distinct line items allowed in a single cart
  MAX_CART_ITEMS: parseInt(process.env.MAX_CART_ITEMS || '50', 10),

  // Default maximum quantity per product (used when product.max_order_quantity is not set)
  MAX_QUANTITY_PER_PRODUCT: parseInt(process.env.MAX_QUANTITY_PER_PRODUCT || '10', 10),
};
