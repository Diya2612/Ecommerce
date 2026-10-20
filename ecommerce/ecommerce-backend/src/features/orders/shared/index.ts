/**
 * Orders Shared Index
 */

export * from './orders.schema';
export * from './order-items.schema';
export * from './orders.relations';
export * from './interface';
export * from './queries';

export * from './validation';
export * from './utils';

// Services - Export all specialized services (avoid re-exporting duplicate types)
export {
  orderService,
  orderCalculationService,
  orderValidationService,
  orderNotificationService,
  orderStatusService,
  orderConversionService,
} from '../services';

// Export type aliases from services
export type {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '../services/order-status.service';
