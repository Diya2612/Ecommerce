# Inventory API Integration - Phased Implementation Plan

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Target**: Frontend Integration with Inventory Management System

This document provides a step-by-step phased approach to integrate the inventory management APIs (Phases 1-3) with the existing frontend cart-to-order flow.

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Integration Phases Overview](#integration-phases-overview)
3. [Phase A: Stock Visibility](#phase-a-stock-visibility)
4. [Phase B: Cart + Phase 2 Integration](#phase-b-cart--phase-2-integration)
5. [Phase C: Multi-Location Phase 3](#phase-c-multi-location-phase-3)
6. [Phase D: Admin Inventory Management](#phase-d-admin-inventory-management)
7. [Testing Strategy](#testing-strategy)
8. [Rollout Plan](#rollout-plan)

---

## Current State Assessment

### ✅ What's Already Working

**Frontend**:
- Complete cart-to-order flow
- Guest session management
- Optimistic updates for cart
- Razorpay + COD payment
- Order creation and history

**Backend**:
- Phase 1: Order-level stock reservations ✅
- Phase 2: Cart-level reservations (30-min timeout) ✅
- Phase 3: Multi-location inventory ✅
- Stock validation on order creation ✅
- Automatic cleanup of expired reservations ✅

### 🔄 What Needs Integration

**Missing Connections**:
1. Frontend doesn't show real-time stock availability
2. Cart doesn't display reservation timers (Phase 2)
3. No multi-location stock visibility (Phase 3)
4. No admin inventory management UI
5. Stock errors aren't user-friendly

---

## Integration Phases Overview

```
Phase A: Stock Visibility (2-3 days)
├─ Show stock badges on products
├─ Display stock in cart
└─ Handle stock errors gracefully

Phase B: Cart + Phase 2 Integration (3-4 days)
├─ Reservation timer in cart
├─ Expired reservation handling
├─ Stock revalidation before checkout
└─ Better error messages

Phase C: Multi-Location (Phase 3) (4-5 days)
├─ Stock availability widget
├─ Location-based stock display
├─ "Available at" information
└─ Fulfillment location info in orders

Phase D: Admin Inventory Management (5-7 days)
├─ Inventory dashboard
├─ Stock adjustments
├─ Transfer management
└─ Low stock alerts
```

**Total Estimated Time**: 14-19 days (1 developer, full-time)

---

## Phase A: Stock Visibility

**Goal**: Display inventory availability to customers across the site.

**Duration**: 2-3 days  
**Priority**: 🔴 HIGH - Critical for preventing out-of-stock checkouts

### A1: Create Stock Utilities

**File**: `src/lib/inventory/stock-utils.ts`

```typescript
/**
 * Stock availability utilities
 */

export interface StockInfo {
  available: number;
  reserved: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  maxOrderQuantity: number;
}

export function getStockStatus(available: number): StockInfo['status'] {
  if (available === 0) return 'out_of_stock';
  if (available <= 10) return 'low_stock';
  return 'in_stock';
}

export function getStockBadgeColor(status: StockInfo['status']) {
  return {
    in_stock: 'bg-green-100 text-green-800 border-green-200',
    low_stock: 'bg-orange-100 text-orange-800 border-orange-200',
    out_of_stock: 'bg-red-100 text-red-800 border-red-200',
  }[status];
}

export function getStockMessage(available: number): string {
  if (available === 0) return 'Out of Stock';
  if (available <= 5) return `Only ${available} left!`;
  if (available <= 10) return `${available} in stock`;
  return 'In Stock';
}
```

### A2: Update Product Type

**File**: `src/types/product.ts`

```typescript
export interface Product {
  // ... existing fields
  
  // Add Phase 1 inventory fields
  inventory?: {
    available_quantity: number;
    reserved_quantity: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    incoming_quantity?: number;
    incoming_eta?: string;
  };
}
```

### A3: Update Product Queries

**File**: `src/queries/products/queries.ts`

```typescript
/**
 * Get product by slug with inventory
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await api<{ product: Product }>(`/products/slug/${slug}`);
  
  // Backend already includes inventory data
  return response.product;
}

/**
 * Get products list with inventory
 */
export async function getProducts(params: ProductFilters): Promise<ProductsResponse> {
  const response = await api<ProductsResponse>('/products', {
    params,
  });
  
  // Products include inventory.available_quantity
  return response;
}
```

**Backend Changes Required**: ✅ None - Products API already includes inventory

### A4: Stock Badge Component

**File**: `src/components/product/StockBadge.tsx`

```tsx
'use client';

import { getStockStatus, getStockBadgeColor, getStockMessage } from '@/lib/inventory/stock-utils';

interface StockBadgeProps {
  available: number;
  reserved?: number;
  size?: 'sm' | 'md' | 'lg';
  showQuantity?: boolean;
}

export function StockBadge({ 
  available, 
  reserved = 0,
  size = 'md', 
  showQuantity = true 
}: StockBadgeProps) {
  const actualAvailable = available - reserved;
  const status = getStockStatus(actualAvailable);
  const colorClasses = getStockBadgeColor(status);
  const message = getStockMessage(actualAvailable);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  if (status === 'out_of_stock') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border ${colorClasses} ${sizeClasses[size]} font-medium`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        Out of Stock
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${colorClasses} ${sizeClasses[size]} font-medium`}>
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      {showQuantity ? message : 'In Stock'}
    </span>
  );
}
```

### A5: Update Product Card

**File**: `src/components/product/ProductCard.tsx`

```tsx
import { StockBadge } from './StockBadge';

export function ProductCard({ product }: { product: Product }) {
  const available = product.inventory?.available_quantity || 0;
  const status = product.inventory?.status || 'out_of_stock';

  return (
    <div className="product-card">
      <Image src={product.image} alt={product.name} />
      
      <div className="p-4">
        <h3>{product.name}</h3>
        <p className="price">₹{product.price}</p>
        
        {/* Add Stock Badge */}
        <StockBadge available={available} size="sm" />
        
        <AddToCartButton 
          productId={product.id}
          disabled={status === 'out_of_stock'}
          maxQuantity={available}
        />
      </div>
    </div>
  );
}
```

### A6: Update Product Detail Page

**File**: `src/app/(main)/products/[slug]/page.tsx`

```tsx
export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug);
  
  const available = product.inventory?.available_quantity || 0;
  const incoming = product.inventory?.incoming_quantity || 0;
  const eta = product.inventory?.incoming_eta;

  return (
    <div className="product-detail">
      {/* Existing content */}
      
      {/* Stock Information Section */}
      <div className="stock-info border rounded-lg p-4 mb-6">
        <StockBadge available={available} size="lg" />
        
        {incoming > 0 && eta && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <TruckIcon className="w-4 h-4" />
              {incoming} units arriving {formatDate(eta)}
            </span>
          </div>
        )}
        
        {available > 0 && available <= 10 && (
          <p className="mt-2 text-sm text-orange-600 font-medium">
            ⚠️ Low stock - order soon!
          </p>
        )}
      </div>
      
      {/* Add to Cart with stock validation */}
      <AddToCartSection 
        product={product}
        maxQuantity={available}
      />
    </div>
  );
}
```

### A7: Update Cart with Stock Info

**File**: `src/components/cart/client/CartItemsList.tsx`

```tsx
export function CartItemsList() {
  const { cartItems } = useCart();

  return (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <div key={item.id} className="cart-item">
          <Image src={item.image} alt={item.name} />
          
          <div className="flex-1">
            <h3>{item.name}</h3>
            
            {/* Stock Status */}
            {item.availableStock !== undefined && (
              <div className="mt-1">
                {item.availableStock < item.quantity ? (
                  <span className="text-xs text-red-600 font-medium">
                    ⚠️ Only {item.availableStock} available
                  </span>
                ) : (
                  <span className="text-xs text-green-600">
                    ✓ In stock
                  </span>
                )}
              </div>
            )}
          </div>
          
          <CartItemControls 
            itemId={item.id}
            quantity={item.quantity}
            maxQuantity={item.availableStock || 999}
          />
        </div>
      ))}
    </div>
  );
}
```

### A8: Enhanced Add to Cart Error Handling

**File**: `src/hooks/useCart.ts`

```typescript
const addToCart = async ({
  productId,
  quantity = 1,
  productDetails
}) => {
  try {
    await addMutation.mutateAsync({ 
      productId, 
      quantity, 
      productDetails 
    });
    
    toast.success('Added to cart');
    
  } catch (error: any) {
    // Enhanced error handling for stock issues
    if (error.status === 400) {
      if (error.message?.includes('Insufficient stock')) {
        // Extract available quantity if possible
        const match = error.message.match(/(\d+)/);
        const available = match ? match[1] : '0';
        
        toast.error(`Only ${available} units available`, {
          action: {
            label: 'Update',
            onClick: () => {
              // Add max available instead
              addMutation.mutateAsync({
                productId,
                quantity: parseInt(available, 10),
                productDetails
              });
            }
          }
        });
        
        return;
      }
    }
    
    toast.error('Failed to add to cart');
  }
};
```

### A9: Testing Checklist

- [ ] Product cards show correct stock badges
- [ ] Out of stock products disable "Add to Cart"
- [ ] Product detail page shows stock information
- [ ] Cart items display stock status
- [ ] Quantity selector respects max stock
- [ ] Error messages are user-friendly
- [ ] Low stock warnings appear when needed
- [ ] Incoming stock displays correctly

### A10: Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `src/lib/inventory/stock-utils.ts` | New | Stock utility functions |
| `src/types/product.ts` | Modified | Add inventory fields |
| `src/components/product/StockBadge.tsx` | New | Reusable stock badge |
| `src/components/product/ProductCard.tsx` | Modified | Add stock badge |
| `src/app/(main)/products/[slug]/page.tsx` | Modified | Stock info section |
| `src/components/cart/client/CartItemsList.tsx` | Modified | Stock status in cart |
| `src/hooks/useCart.ts` | Modified | Better error handling |

**Estimated Lines**: ~300 lines

---

## Phase B: Cart + Phase 2 Integration

**Goal**: Integrate 30-minute cart reservations with timer and expiration handling.

**Duration**: 3-4 days  
**Priority**: 🟡 MEDIUM - Improves UX, prevents overselling

### B1: Update Cart Types

**File**: `src/types/cart.ts`

```typescript
export interface CartItem {
  // ... existing fields
  
  // Phase 2 fields
  reservation_id?: string;
  reservation_expires_at?: string;  // ISO timestamp
}

export interface CartResponse {
  // ... existing fields
  
  items: CartItemResponse[];
}

export interface CartItemResponse {
  // ... existing fields
  
  // Phase 2 fields
  reservation_id?: string | null;
  reservation_expires_at?: string | null;
}
```

### B2: Reservation Timer Hook

**File**: `src/hooks/cart/useReservationTimer.ts`

```typescript
import { useState, useEffect } from 'react';

export function useReservationTimer(expiresAt?: string | null) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(0);
      setIsExpired(false);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        return 0;
      }

      setTimeLeft(Math.floor(diff / 1000));  // seconds
      setIsExpired(false);
      return diff;
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return {
    timeLeft,       // Total seconds
    minutes,
    seconds,
    isExpired,
    formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
  };
}
```

### B3: Reservation Timer Component

**File**: `src/components/cart/ReservationTimer.tsx`

```tsx
'use client';

import { useReservationTimer } from '@/hooks/cart/useReservationTimer';
import { Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReservationTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export function ReservationTimer({ expiresAt, onExpired }: ReservationTimerProps) {
  const { minutes, seconds, isExpired, timeLeft } = useReservationTimer(expiresAt);

  // Call onExpired callback when timer hits 0
  useEffect(() => {
    if (isExpired && onExpired) {
      onExpired();
    }
  }, [isExpired, onExpired]);

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-red-600 text-sm font-medium"
      >
        <AlertTriangle className="w-4 h-4" />
        Reservation expired
      </motion.div>
    );
  }

  const isLowTime = timeLeft < 300;  // Less than 5 minutes

  return (
    <div className={`flex items-center gap-2 text-sm ${isLowTime ? 'text-orange-600' : 'text-gray-600'}`}>
      <Clock className="w-4 h-4" />
      <span className="font-mono font-medium">
        Reserved: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
      {isLowTime && (
        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
          Hurry!
        </span>
      )}
    </div>
  );
}
```

### B4: Update Cart Items List

**File**: `src/components/cart/client/CartItemsList.tsx`

```tsx
import { ReservationTimer } from '../ReservationTimer';
import { useQueryClient } from '@tanstack/react-query';

export function CartItemsList() {
  const { cartItems } = useCart();
  const queryClient = useQueryClient();

  const handleReservationExpired = useCallback(() => {
    // Refetch cart to get updated state (backend clears expired)
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    
    toast.warning('Item reservation expired. Stock released.');
  }, [queryClient]);

  return (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <div key={item.id} className="cart-item">
          <Image src={item.image} alt={item.name} />
          
          <div className="flex-1">
            <h3>{item.name}</h3>
            
            {/* Reservation Timer */}
            {item.reservation_expires_at && (
              <div className="mt-2">
                <ReservationTimer
                  expiresAt={item.reservation_expires_at}
                  onExpired={handleReservationExpired}
                />
              </div>
            )}
            
            {/* Stock Status */}
            {item.availableStock !== undefined && (
              <div className="mt-1 text-xs text-green-600">
                ✓ In stock
              </div>
            )}
          </div>
          
          {/* ... controls */}
        </div>
      ))}
    </div>
  );
}
```

### B5: Cart Page Banner

**File**: `src/components/cart/ReservationBanner.tsx`

```tsx
'use client';

import { useReservationTimer } from '@/hooks/cart/useReservationTimer';
import { Clock, Sparkles } from 'lucide-react';

interface ReservationBannerProps {
  earliestExpiration: string;  // Earliest expiring item
  itemCount: number;
}

export function ReservationBanner({ earliestExpiration, itemCount }: ReservationBannerProps) {
  const { minutes, formatted, isExpired } = useReservationTimer(earliestExpiration);

  if (isExpired) return null;

  const isUrgent = minutes < 5;

  return (
    <div className={`rounded-lg p-4 mb-6 ${isUrgent ? 'bg-orange-50 border-orange-200 border-2' : 'bg-blue-50 border-blue-200 border'}`}>
      <div className="flex items-center gap-3">
        {isUrgent ? (
          <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
        ) : (
          <Sparkles className="w-5 h-5 text-blue-600" />
        )}
        
        <div className="flex-1">
          <p className={`font-semibold ${isUrgent ? 'text-orange-900' : 'text-blue-900'}`}>
            {isUrgent ? '⏰ Hurry! Your items are reserved for:' : '✨ Your items are reserved for:'}
          </p>
          <p className={`text-2xl font-mono font-bold ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
            {formatted}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">{itemCount} items</p>
          <p className="text-xs text-gray-500">Auto-reserved stock</p>
        </div>
      </div>
      
      {isUrgent && (
        <p className="mt-3 text-sm text-orange-800">
          Complete checkout soon or your reservation will expire and items may go out of stock.
        </p>
      )}
    </div>
  );
}
```

**Usage**:

```tsx
// In cart page
const earliestExpiration = cartItems
  .map(item => item.reservation_expires_at)
  .filter(Boolean)
  .sort()[0];  // Get earliest

{earliestExpiration && (
  <ReservationBanner 
    earliestExpiration={earliestExpiration}
    itemCount={cartItems.length}
  />
)}
```

### B6: Pre-Checkout Stock Validation

**File**: `src/components/checkout/client/CheckoutGuard.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRawCartQuery } from '@/hooks/useCart';
import { toast } from 'sonner';

export function CheckoutGuard() {
  const router = useRouter();
  const { data: cart, isLoading } = useRawCartQuery();
  const { isPaymentProcessing } = useCheckout();

  useEffect(() => {
    if (isPaymentProcessing || isLoading) return;

    // Check if cart is empty
    if (!cart?.items?.length) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }

    // Check for expired reservations
    const hasExpiredReservations = cart.items.some(item => {
      if (!item.reservation_expires_at) return false;
      return new Date(item.reservation_expires_at) < new Date();
    });

    if (hasExpiredReservations) {
      toast.warning('Some items reservation expired. Please review your cart.');
      router.push('/cart');
      return;
    }

    // Check stock availability
    const hasStockIssues = cart.items.some(item => {
      return item.availableStock < item.quantity;
    });

    if (hasStockIssues) {
      toast.error('Some items are out of stock. Please update your cart.');
      router.push('/cart');
      return;
    }

  }, [cart, isLoading, isPaymentProcessing, router]);

  return null;
}
```

### B7: Testing Checklist

- [ ] Reservation timer shows on cart items
- [ ] Timer counts down correctly
- [ ] Timer turns orange/red near expiration
- [ ] Expired reservations trigger refetch
- [ ] Banner shows earliest expiration
- [ ] Pre-checkout validation works
- [ ] Expired items prevent checkout
- [ ] Stock warnings appear correctly

### B8: Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `src/types/cart.ts` | Modified | Add reservation fields |
| `src/hooks/cart/useReservationTimer.ts` | New | Timer hook |
| `src/components/cart/ReservationTimer.tsx` | New | Timer component |
| `src/components/cart/ReservationBanner.tsx` | New | Cart banner |
| `src/components/cart/client/CartItemsList.tsx` | Modified | Add timer |
| `src/components/checkout/client/CheckoutGuard.tsx` | Modified | Validation |

**Estimated Lines**: ~400 lines

---

## Phase C: Multi-Location (Phase 3)

**Goal**: Display stock across multiple warehouse locations.

**Duration**: 4-5 days  
**Priority**: 🟢 LOW - Nice-to-have for transparency

### C1: Create Multi-Location Hook

**File**: `src/hooks/inventory/useProductLocations.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

interface LocationStock {
  location_id: string;
  location_name: string;
  location_code: string;
  available_quantity: number;
  reserved_quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_active: boolean;
}

interface ProductLocationsResponse {
  product_id: string;
  total_available: number;
  total_reserved: number;
  location_count: number;
  locations: LocationStock[];
}

export function useProductLocations(productId: string) {
  return useQuery({
    queryKey: ['product-locations', productId],
    queryFn: async () => {
      return api<ProductLocationsResponse>(
        `/inventory/products/${productId}/locations`,
        { auth: false }  // Public endpoint
      );
    },
    enabled: !!productId,
    staleTime: 1000 * 30,  // 30 seconds
  });
}
```

### C2: Stock Availability Widget

**File**: `src/components/product/StockAvailabilityWidget.tsx`

```tsx
'use client';

import { useProductLocations } from '@/hooks/inventory/useProductLocations';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StockAvailabilityWidgetProps {
  productId: string;
}

export function StockAvailabilityWidget({ productId }: StockAvailabilityWidgetProps) {
  const { data, isLoading } = useProductLocations(productId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
    );
  }

  if (!data) return null;

  const { total_available, locations, location_count } = data;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">
            {total_available > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
          <p className="text-sm text-gray-600">
            {location_count} warehouse{location_count !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View locations
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t space-y-2">
              {locations.map((loc) => (
                <div
                  key={loc.location_id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{loc.location_name}</span>
                  </div>
                  
                  <span
                    className={`font-medium ${
                      loc.available_quantity > 0
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {loc.available_quantity > 0
                      ? `${loc.available_quantity} available`
                      : 'Out of stock'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### C3: Update Product Detail Page

**File**: `src/app/(main)/products/[slug]/page.tsx`

```tsx
import { StockAvailabilityWidget } from '@/components/product/StockAvailabilityWidget';

export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug);

  return (
    <div className="product-detail">
      {/* ... existing content */}
      
      {/* Stock Availability Widget (Client Component) */}
      <div className="mb-6">
        <StockAvailabilityWidget productId={product.id} />
      </div>
      
      {/* ... rest of page */}
    </div>
  );
}
```

### C4: Order Fulfillment Location

**File**: `src/types/order.ts`

```typescript
export interface Order {
  // ... existing fields
  
  // Phase 3 fields (if backend includes)
  fulfillment_location?: {
    name: string;
    code: string;
    city: string;
    state: string;
  };
}
```

### C5: Testing Checklist

- [ ] Multi-location widget displays correctly
- [ ] Locations expand/collapse works
- [ ] Total stock is accurate
- [ ] Out of stock locations shown
- [ ] Loading state displays
- [ ] Data refreshes appropriately

### C6: Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `src/hooks/inventory/useProductLocations.ts` | New | Multi-location API hook |
| `src/components/product/StockAvailabilityWidget.tsx` | New | Location widget |
| `src/app/(main)/products/[slug]/page.tsx` | Modified | Add widget |
| `src/types/order.ts` | Modified | Add fulfillment_location |

**Estimated Lines**: ~250 lines

---

## Phase D: Admin Inventory Management

**Goal**: Build admin dashboard for inventory operations.

**Duration**: 5-7 days  
**Priority**: 🟡 MEDIUM - Required for operations staff

### D1: Admin Route Structure

```
src/app/(admin)/
├── layout.tsx         # Admin layout with sidebar
└── inventory/
    ├── page.tsx       # Inventory list
    ├── [id]/
    │   └── page.tsx   # Inventory detail/edit
    ├── adjustments/
    │   └── page.tsx   # Adjustment history
    └── transfers/
        ├── page.tsx   # Transfer list
        └── [id]/
            └── page.tsx  # Transfer detail
```

### D2: Inventory List Query Hook

**File**: `src/hooks/admin/useInventory.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

interface InventoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  condition?: 'sellable' | 'damaged' | 'quarantined' | 'expired';
}

export function useInventoryList(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ['admin-inventory', filters],
    queryFn: async () => {
      return api('/inventory', {
        params: filters,
        auth: true,
      });
    },
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      inventoryId,
      quantity_change,
      reason,
      reference_type,
    }: {
      inventoryId: string;
      quantity_change: number;
      reason: string;
      reference_type?: string;
    }) => {
      return api(`/inventory/${inventoryId}/adjust`, {
        method: 'POST',
        body: { quantity_change, reason, reference_type },
        auth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success('Inventory adjusted successfully');
    },
  });
}
```

### D3: Admin Inventory Dashboard

**File**: `src/app/(admin)/inventory/page.tsx`

```tsx
'use client';

import { useInventoryList } from '@/hooks/admin/useInventory';
import { useState } from 'react';
import { StockBadge } from '@/components/product/Stock Badge';
import { Button } from '@/components/ui/button';

export default function InventoryDashboardPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: undefined,
  });

  const { data, isLoading } = useInventoryList(filters);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button>Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-right p-4">Available</th>
              <th className="text-right p-4">Reserved</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.inventory.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <span className="font-medium">{item.product_name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{item.sku}</td>
                <td className="p-4 text-right font-semibold">
                  {item.available_quantity}
                </td>
                <td className="p-4 text-right text-gray-600">
                  {item.reserved_quantity}
                </td>
                <td className="p-4 text-center">
                  <StockBadge
                    available={item.available_quantity}
                    reserved={item.reserved_quantity}
                    size="sm"
                    showQuantity={false}
                  />
                </td>
                <td className="p-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/inventory/${item.id}`)}
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* ... */}
    </div>
  );
}
```

### D4: Testing Checklist

- [ ] Inventory list displays correctly
- [ ] Filters work (status, search)
- [ ] Pagination functional
- [ ] Adjust modal works
- [ ] Transfer creation works
- [ ] Low stock alerts show
- [ ] Export functionality works

### D5: Files Created Summary

| File | Type | Purpose |
|------|------|---------|
| `src/app/(admin)/inventory/page.tsx` | New | Inventory dashboard |
| `src/hooks/admin/useInventory.ts` | New | Admin inventory hooks |
| `src/components/admin/AdjustInventoryModal.tsx` | New | Adjustment form |
| `src/components/admin/CreateTransferModal.tsx` | New | Transfer form |

**Estimated Lines**: ~800 lines

---

## Testing Strategy

### Unit Testing

**Test Files to Create**:

```
src/lib/inventory/__tests__/stock-utils.test.ts
src/hooks/cart/__tests__/useReservationTimer.test.ts
src/hooks/inventory/__tests__/useProductLocations.test.ts
```

**Example**:

```typescript
// stock-utils.test.ts
describe('getStockStatus', () => {
  it('returns out_of_stock for 0 available', () => {
    expect(getStockStatus(0)).toBe('out_of_stock');
  });

  it('returns low_stock for 1-10 available', () => {
    expect(getStockStatus(5)).toBe('low_stock');
  });

  it('returns in_stock for >10 available', () => {
    expect(getStockStatus(20)).toBe('in_stock');
  });
});
```

### Integration Testing

**Critical Flows to Test**:

1. **Add to Cart with Stock Validation**:
   - Add product with sufficient stock → Success
   - Add product with insufficient stock → Error message
   - Add max available when over limit → Success with adjusted qty

2. **Reservation Timer**:
   - Item added to cart → Timer starts at 30 minutes
   - Timer counts down correctly
   - Expiration triggers refetch
   - Expired item prevents checkout

3. **Multi-Location Display**:
   - Widget shows all locations
   - Total stock is sum of all locations
   - Out of stock locations display correctly

4. **Admin Adjustments**:
   - Adjust +50 → Inventory increases
   - Adjust -20 → Inventory decreases
   - Cannot reduce below reserved quantity

### E2E Testing (Playwright)

**File**: `tests/e2e/inventory.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Inventory Integration', () => {
  test('should show stock badge on product card', async ({ page }) => {
    await page.goto('/products');
    
    const stockBadge = page.locator('[data-testid="stock-badge"]').first();
    await expect(stockBadge).toBeVisible();
    await expect(stockBadge).toContainText(/In Stock|Low Stock|Out of Stock/);
  });

  test('should prevent adding out of stock product', async ({ page }) => {
    await page.goto('/products/out-of-stock-product');
    
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButton).toBeDisabled();
  });

  test('should display reservation timer in cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/products/test-product');
    await page.click('button:has-text("Add to Cart")');
    
    // Go to cart
    await page.goto('/cart');
    
    // Check timer exists
    const timer = page.locator('[data-testid="reservation-timer"]');
    await expect(timer).toBeVisible();
    await expect(timer).toContainText(/\d+:\d{2}/);  // Format: MM:SS
  });

  test('should show multi-location availability', async ({ page }) => {
    await page.goto('/products/test-product');
    
    const widget = page.locator('[data-testid="stock-availability-widget"]');
    await expect(widget).toBeVisible();
    
    await page.click('button:has-text("View locations")');
    
    const locations = page.locator('[data-testid="location-item"]');
    await expect(locations).toHaveCount.toBeGreaterThan(0);
  });
});
```

---

## Rollout Plan

### Pre-Deployment Checklist

- [ ] All phases tested individually
- [ ] E2E tests passing
- [ ] No TypeScript errors
- [ ] All linters passing
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Deployment Strategy

**Phase-by-Phase Rollout** (Recommended):

```
Week 1: Phase A (Stock Visibility)
├─ Day 1-2: Development
├─ Day 3: Testing
└─ Day 4-5: Deploy to production, monitor

Week 2: Phase B (Cart Reservations)
├─ Day 1-3: Development
├─ Day 4: Testing
└─ Day 5: Deploy to production, monitor

Week 3: Phase C + D (Multi-Location + Admin)
├─ Day 1-5: Development
└─ Day 6-7: Testing

Week 4: Final Deployment
├─ Day 1-3: Production deployment
└─ Day 4-5: Monitoring & bug fixes
```

### Feature Flags

**Recommended**:

```typescript
// src/lib/featureFlags.ts
export const FEATURE_FLAGS = {
  SHOW_STOCK_BADGES: process.env.NEXT_PUBLIC_SHOW_STOCK === 'true',
  SHOW_RESERVATION_TIMER: process.env.NEXT_PUBLIC_SHOW_TIMER === 'true',
  SHOW_MULTI_LOCATION: process.env.NEXT_PUBLIC_MULTI_LOCATION === 'true',
  ADMIN_INVENTORY: process.env.NEXT_PUBLIC_ADMIN_INV === 'true',
};
```

**Usage**:

```tsx
{FEATURE_FLAGS.SHOW_STOCK_BADGES && (
  <StockBadge available={available} />
)}
```

### Monitoring

**Metrics to Track**:

1. **Stock-Related Cart Abandonment**:
   - Carts abandoned due to stock errors
   - Target: <2% of total carts

2. **Reservation Expiration Rate**:
   - % of cart items with expired reservations
   - Target: <5% of cart items

3. **Multi-Location API Performance**:
   - Response time for `/products/:id/locations`
   - Target: <200ms p95

4. **Admin Inventory Operations**:
   - Adjustment frequency
   - Transfer completion rate

---

## Summary

### Total Implementation Effort

| Phase | Days | Priority | Dependencies |
|-------|------|----------|--------------|
| Phase A: Stock Visibility | 2-3 | 🔴 HIGH | None |
| Phase B: Cart Reservations | 3-4 | 🟡 MEDIUM | Phase A |
| Phase C: Multi-Location | 4-5 | 🟢 LOW | Phase A |
| Phase D: Admin Dashboard | 5-7 | 🟡 MEDIUM | Phase A |
| **Total** | **14-19** | - | - |

### Key Benefits

✅ **Phase A**: Prevents out-of-stock checkouts, improves UX  
✅ **Phase B**: Reduces overselling, builds trust with reservation timers  
✅ **Phase C**: Increases transparency, shows warehouse capabilities  
✅ **Phase D**: Empowers operations team, reduces manual work

### Success Metrics

- **Stock Visibility**: 95%+ products show accurate stock
- **Reservation System**: <2% expiration rate
- **Multi-Location**: >50% users expand location details
- **Admin Efficiency**: 50% reduction in manual stock checks

---

**Ready to Start**: Begin with Phase A and roll out incrementally!

**Questions?** Review the API Reference and Frontend Flow docs for detailed technical specifications.
