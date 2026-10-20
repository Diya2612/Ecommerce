/**
 * Inventory Worker
 *
 * Processes inventory-related events:
 * - INVENTORY_RESERVED: Update stock levels
 * - INVENTORY_RELEASED: Restore stock levels
 * - INVENTORY_ADJUSTED: Manual adjustments
 * - LOW_STOCK_ALERT: Notify admins
 * - OUT_OF_STOCK_ALERT: Notify admins, disable product
 */

import { Job } from 'bullmq';
import { BaseWorker } from './base.worker';
import { QueueName } from '../../shared/config';
import { QueueEventType } from '../../shared/types';
import type {
  InventoryReservedData,
  InventoryReleasedData,
  InventoryAdjustedData,
  StockAlertData,
} from '../../shared/types';
import { logger } from '../../../../utils';
import { eventPublisher } from '../event-publisher.service';

/**
 * Inventory Worker Class
 */
class InventoryWorker extends BaseWorker {
  constructor() {
    super(QueueName.INVENTORY);
  }

  protected async processJob(job: Job): Promise<void> {
    const { type, data } = job.data;

    switch (type) {
      case QueueEventType.INVENTORY_RESERVED:
        await this.handleInventoryReserved(data as InventoryReservedData);
        break;
      case QueueEventType.INVENTORY_RELEASED:
        await this.handleInventoryReleased(data as InventoryReleasedData);
        break;
      case QueueEventType.INVENTORY_ADJUSTED:
        await this.handleInventoryAdjusted(data as InventoryAdjustedData);
        break;
      case QueueEventType.LOW_STOCK_ALERT:
        await this.handleLowStockAlert(data as StockAlertData);
        break;
      case QueueEventType.OUT_OF_STOCK_ALERT:
        await this.handleOutOfStockAlert(data as StockAlertData);
        break;
      default:
        logger.warn('Unknown inventory event type', { type });
    }
  }

  private async handleInventoryReserved(data: InventoryReservedData): Promise<void> {
    logger.info('Processing INVENTORY_RESERVED', { orderId: data.orderId });

    try {
      // TODO: Update inventory in database
      // For now, just log and audit


      logger.info('INVENTORY_RESERVED processed', { orderId: data.orderId });
    } catch (error) {
      logger.error('Failed to process INVENTORY_RESERVED', { error });
      throw error;
    }
  }

  private async handleInventoryReleased(data: InventoryReleasedData): Promise<void> {
    logger.info('Processing INVENTORY_RELEASED', { orderId: data.orderId });

    try {
      // TODO: Update inventory in database


      logger.info('INVENTORY_RELEASED processed', { orderId: data.orderId });
    } catch (error) {
      logger.error('Failed to process INVENTORY_RELEASED', { error });
      throw error;
    }
  }

  private async handleInventoryAdjusted(data: InventoryAdjustedData): Promise<void> {
    logger.info('Processing INVENTORY_ADJUSTED', { productId: data.productId });

    try {

      logger.info('INVENTORY_ADJUSTED processed', { productId: data.productId });
    } catch (error) {
      logger.error('Failed to process INVENTORY_ADJUSTED', { error });
      throw error;
    }
  }

  private async handleLowStockAlert(data: StockAlertData): Promise<void> {
    logger.info('Processing LOW_STOCK_ALERT', { productId: data.productId });

    try {
      // Send admin notification
      await eventPublisher.publishEmailNotification({
        to: 'admin@example.com', // TODO: Get from config
        subject: `Low Stock Alert: ${data.productName}`,
        template: 'low_stock_alert',
        templateData: {
          productName: data.productName,
          currentStock: data.currentStock,
          threshold: data.threshold,
        },
      });

      logger.info('LOW_STOCK_ALERT processed', { productId: data.productId });
    } catch (error) {
      logger.error('Failed to process LOW_STOCK_ALERT', { error });
      throw error;
    }
  }

  private async handleOutOfStockAlert(data: StockAlertData): Promise<void> {
    logger.info('Processing OUT_OF_STOCK_ALERT', { productId: data.productId });

    try {
      // Send urgent admin notification
      await eventPublisher.publishEmailNotification({
        to: 'admin@example.com',
        subject: `⚠️ OUT OF STOCK: ${data.productName}`,
        template: 'out_of_stock_alert',
        templateData: {
          productName: data.productName,
          productId: data.productId,
        },
        priority: 1,
      });

      logger.info('OUT_OF_STOCK_ALERT processed', { productId: data.productId });
    } catch (error) {
      logger.error('Failed to process OUT_OF_STOCK_ALERT', { error });
      throw error;
    }
  }
}

export const inventoryWorker = new InventoryWorker();
export { InventoryWorker };
