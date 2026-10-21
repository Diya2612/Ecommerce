/**
 * useCartSync
 *
 * Bridges local React state (for optimistic UI) with the backend cart API.
 * - On mount, loads the cart from the backend API.
 * - Provides addItem, updateItem, removeItem that optimistically update local
 *   state and then sync to the backend.
 * - Falls back gracefully if the backend is unavailable.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/components/ecommerce/EcommerceData';
import type { CartItem } from '@/components/ecommerce/EcommerceCartDrawer';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const CART_SESSION_KEY = 'cart_session_id';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(CART_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, id);
  }
  return id;
}

async function apiCartRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const sessionId = getSessionId();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Cart API ${res.status}`);
  if (res.status === 204) return {};
  const json = await res.json();
  return json?.data ?? json;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface BackendCartItem {
  id: string;
  product_id: string;
  product_name?: string;
  product_image_url?: string;
  product_slug?: string;
  final_price?: string | number;
  cost_price?: string | number;
  quantity: number;
  availableStock?: number;
  inStock?: boolean;
}

interface BackendCart {
  items?: BackendCartItem[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface CartItemWithId extends CartItem {
  /** Backend cart item id for update/delete operations */
  backendId?: string;
}

interface UseCartSyncResult {
  cartItems: CartItemWithId[];
  isLoading: boolean;
  isBackendConnected: boolean;
  addItem: (product: Product, color?: string) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearAllItems: () => void;
  cartCount: number;
}

export function useCartSync(): UseCartSyncResult {
  const [cartItems, setCartItems] = useState<CartItemWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  // Track backend item IDs by product ID
  const [backendIdMap, setBackendIdMap] = useState<Record<string, string>>({});

  // ── Load cart from backend on mount ──
  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      try {
        const cart = (await apiCartRequest('GET', '/cart')) as BackendCart;
        if (cancelled) return;

        const items = cart?.items ?? [];
        if (items.length > 0) {
          const mapped: CartItemWithId[] = items.map((item) => ({
            backendId: item.id,
            product: {
              id: item.product_id,
              name: item.product_name ?? 'Product',
              category: '',
              categoryName: '',
              tagline: '',
              price: parseFloat(String(item.final_price ?? 0)),
              originalPrice: parseFloat(String(item.cost_price ?? item.final_price ?? 0)),
              discount: 0,
              rating: 0,
              reviewsCount: 0,
              inStock: item.inStock ?? true,
              stockLeft: item.availableStock ?? 100,
              images: item.product_image_url ? [item.product_image_url] : [],
              specs: [],
            },
            quantity: item.quantity,
            selectedColor: undefined,
          }));

          const idMap: Record<string, string> = {};
          items.forEach((item) => {
            idMap[item.product_id] = item.id;
          });

          setCartItems(mapped);
          setBackendIdMap(idMap);
        }
        setIsBackendConnected(true);
      } catch {
        setIsBackendConnected(false);
      }
    }

    loadCart();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Add item ──
  const addItem = useCallback(
    async (product: Product, color?: string) => {
      // Optimistic update
      setCartItems((prev) => {
        const idx = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            (!color || item.selectedColor === color),
        );
        if (idx > -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          return next;
        }
        return [
          {
            product,
            quantity: 1,
            selectedColor: color ?? product.colors?.[0]?.name ?? 'Standard',
          },
          ...prev,
        ];
      });

      if (!isBackendConnected) return;

      try {
        const cart = (await apiCartRequest('POST', '/cart/items', {
          product_id: product.id,
          quantity: 1,
        })) as BackendCart;

        // Update backend ID map from response
        const items = cart?.items ?? [];
        const idMap: Record<string, string> = {};
        items.forEach((item: BackendCartItem) => {
          idMap[item.product_id] = item.id;
        });
        setBackendIdMap(idMap);
      } catch {
        // Silently fail — optimistic state already applied
      }
    },
    [isBackendConnected],
  );

  // ── Update quantity ──
  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeItem(productId);
      }

      // Optimistic update
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      );

      const backendId = backendIdMap[productId];
      if (!isBackendConnected || !backendId) return;

      try {
        await apiCartRequest('PUT', `/cart/items/${backendId}`, { quantity });
      } catch {
        // Silently fail
      }
    },
    [isBackendConnected, backendIdMap],
  );

  // ── Remove item ──
  const removeItem = useCallback(
    async (productId: string) => {
      setCartItems((prev) =>
        prev.filter((item) => item.product.id !== productId),
      );

      const backendId = backendIdMap[productId];
      if (!isBackendConnected || !backendId) return;

      try {
        await apiCartRequest('DELETE', `/cart/items/${backendId}`);
        setBackendIdMap((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      } catch {
        // Silently fail
      }
    },
    [isBackendConnected, backendIdMap],
  );

  // ── Clear all ──
  const clearAllItems = useCallback(() => {
    setCartItems([]);
    if (isBackendConnected) {
      apiCartRequest('DELETE', '/cart').catch(() => {});
    }
  }, [isBackendConnected]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    isBackendConnected,
    addItem,
    updateItem,
    removeItem,
    clearAllItems,
    cartCount,
  };
}
