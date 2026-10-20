/**
 * Order Services Barrel Export
 * Centralized export for all order-related services
 */

// Core order service
export { orderService } from './order.service';
export type {
  OrderItemInput,
  OrderPricingInput,
  OrderPricing,
  ValidationResult,
} from './order.service';

// Specialized services
export { orderCalculationService } from './order-calculation.service';
export type {
  OrderPricingInput as CalcOrderPricingInput,
  OrderPricing as CalcOrderPricing,
  OrderItemInput as CalcOrderItemInput,
  GSTCalculation,
} from './order-calculation.service';

export { orderValidationService } from './order-validation.service';
export type {
  ValidationResult as ValidResult,
  OrderItemForValidation,
  OrderDataForValidation,
  OrderItemForMapping,
} from './order-validation.service';

export { orderNotificationService } from './order-notification.service';
export type {
  OrderNotificationData,
  StatusChangeNotificationData,
} from './order-notification.service';

export { orderStatusService } from './order-status.service';
export type {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  StatusTransitionResult,
} from './order-status.service';

export { orderConversionService } from './order-conversion.service';
export type { CartToOrderData, ConvertedCartData } from './order-conversion.service';
