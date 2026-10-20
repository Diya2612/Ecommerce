/**
 * Inventory Feature Module
 * Entry point for stock tracking, reservations, and history.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class InventoryRoute implements Route {
  public path = '/inventory';
  public router = Router();

  /**
   * Initializes inventory routes with dynamic imports.
   * Prevents circular dependencies with middlewares.
   */
  public async init() {
    const [
      { default: adjustInventory },
      { default: backfillInventory },
      { default: getAllInventory },
      { default: getAvailableStock },
      { default: getInventoryById },
      { default: getInventoryHistoryByProduct },
      { default: getInventoryHistory },
      { default: updateInventory },
      { default: releaseStuckStock },
    ] = await Promise.all([
      import('./apis/adjust-inventory'),
      import('./apis/backfill-inventory'),
      import('./apis/get-all-inventory'),
      import('./apis/get-available-stock'),
      import('./apis/get-inventory-by-id'),
      import('./apis/get-inventory-history-by-product'),
      import('./apis/get-inventory-history'),
      import('./apis/update-inventory'),
      import('./apis/release-stuck-stock'),
    ]);

    this.router.use(this.path, adjustInventory);
    this.router.use(this.path, backfillInventory);
    this.router.use(this.path, getAllInventory);
    this.router.use(this.path, getAvailableStock);
    this.router.use(this.path, getInventoryById);
    this.router.use(this.path, getInventoryHistoryByProduct);
    this.router.use(this.path, getInventoryHistory);
    this.router.use(this.path, updateInventory);
    this.router.use(this.path, releaseStuckStock);
  }
}

export default InventoryRoute;
export * from './shared/interface';
export * from './services';
