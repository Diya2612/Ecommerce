"use client";

import { CartDrawerClient } from './client/CartDrawerClient';
import type { CartProduct, UpsellProduct } from '@/lib/data/cart/types';

// ============================================================================
// Props Interface
// ============================================================================

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendedProducts: CartProduct[];
  upsellProducts: UpsellProduct[];
}

// ============================================================================
// CartDrawer Component (Data Wrapper)
// ============================================================================

/**
 * CartDrawer - Data Wrapper Component
 * 
 * This component acts as a bridge between the data layer and the UI.
 * It receives data from the server (via LayoutOverlays) and passes it to the client.
 */
export function CartDrawer({
  isOpen,
  onClose,
  recommendedProducts = [],
  upsellProducts = []
}: CartDrawerProps) {
  return (
    <CartDrawerClient
      isOpen={isOpen}
      onClose={onClose}
      recommendedProducts={recommendedProducts}
      upsellProducts={upsellProducts}
    />
  );
}
