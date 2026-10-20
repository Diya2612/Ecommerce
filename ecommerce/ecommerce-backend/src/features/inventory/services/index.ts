/**
 * Inventory Service - Main Facade
 *
 * Re-exports all inventory operations for backward compatibility.
 * Acts as a single entry point for all inventory-related services.
 *
 * Phase 3 Refactoring: Service Split & Organization
 * - Helpers extracted to inventory-helpers.service.ts
 * - Queries extracted to inventory-queries.service.ts
 * - Core CRUD operations in inventory-core.service.ts
 * - Adjustments in inventory-adjustment.service.ts
 * - Stock operations in inventory-stock.service.ts
 * - This file now serves as a facade for backward compatibility
 */

// ============================================
// RE-EXPORT CORE OPERATIONS
// ============================================

export {
  getInventoryList,
  getInventoryById,
  createInventoryForProduct,
  updateInventory,
  requireInventoryExists,
} from './inventory-core.service';

// ============================================
// RE-EXPORT ADJUSTMENT OPERATIONS
// ============================================

export {
  adjustInventory,
  getInventoryHistory,
  getInventoryHistoryByProductId,
} from './inventory-adjustment.service';

// ============================================
// RE-EXPORT STOCK OPERATIONS
// ============================================

export { getAvailableStock, backfillInventoryForProducts } from './inventory-stock.service';

// ============================================
// RE-EXPORT HELPERS (for internal use)
// ============================================

export {
  isValidUUID,
  resolveValidUserId,
  getStatusFromQuantity,
} from './inventory-helpers.service';

// ============================================
// RE-EXPORT DOMAIN SERVICES (Order/Cart Reservations)
// ============================================

/**
 * Phase 2 Refactoring: Order and Cart operations extracted to separate services
 * Re-exported here for backward compatibility with existing APIs
 */

// Order Reservation Service
export {
  validateStockAvailability,
  reserveStockForOrder,
  fulfillOrderInventory,
  recordSaleForOrder,
  releaseReservation,
  processOrderReturn,
} from './order-reservation.service';

// Cart Reservation Service
export {
  reserveCartStock,
  releaseCartStock,
  extendCartReservation,
  cleanupExpiredCartReservations,
} from './cart-reservation.service';
