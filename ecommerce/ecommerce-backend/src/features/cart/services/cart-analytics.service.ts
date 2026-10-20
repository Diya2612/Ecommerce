/**
 * Cart Analytics Service
 * Emits structured cart events for analytics tracking.
 * Events are logged and can be consumed by external analytics pipelines.
 */

import { EventEmitter } from 'events';
import { logger } from '../../../utils';

export type CartEventType =
  | 'cart_item_added'
  | 'cart_item_removed'
  | 'cart_item_quantity_updated'
  | 'cart_item_saved_for_later'
  | 'cart_item_moved_to_cart'
  | 'cart_variant_switched'
  | 'cart_cleared'
  | 'coupon_applied'
  | 'coupon_removed'
  | 'coupon_auto_removed'
  | 'cart_checkout_started'
  | 'cart_abandoned';

export interface CartAnalyticsEvent {
  event: CartEventType;
  cart_id: string;
  user_id?: string;
  session_id?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

class CartAnalyticsService extends EventEmitter {
  /** Emit a cart analytics event. Logs it and broadcasts to any listeners. */
  track(
    event: CartEventType,
    cartId: string,
    data: Record<string, unknown> = {},
    userId?: string,
    sessionId?: string,
  ): void {
    const analyticsEvent: CartAnalyticsEvent = {
      event,
      cart_id: cartId,
      user_id: userId,
      session_id: sessionId,
      data,
      timestamp: new Date().toISOString(),
    };

    // Structured log for downstream ingestion
    logger.info('Cart analytics event', { analytics: analyticsEvent });

    // Broadcast to any registered listeners (e.g., webhook, queue push)
    this.emit('cart_event', analyticsEvent);
  }
}

export const cartAnalyticsService = new CartAnalyticsService();
