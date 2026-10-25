import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCart,
  addToCart as addToCartFn,
  updateCartItem as updateCartItemFn,
  removeCartItem as removeCartItemFn,
  clearCart as clearCartFn,
  mergeCart as mergeCartFn,
} from "@/queries";
import {
  AddToCartData,
  UpdateCartItemData,
  CartResponse,
  CartItemResponse,
  CartItem,
} from "@/types/cart";

export const CART_QUERY_KEY = ["cart"];

// --- API Hooks ---

export function useCartQuery() {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: getCart,
    staleTime: 1000 * 60, // 1 minute
    select: (data) => {
      if (!data?.items) return [];
      return data.items.map((item) => ({
        id: item.id,
        productId: item.product_id || "",
        slug: item.product_slug || undefined,
        name: item.product_name || "Unknown Product",
        image: item.product_image_url || "/placeholder.png",
        price: parseFloat(item.final_price),
        originalPrice: parseFloat(item.cost_price),
        quantity: item.quantity,
        maxStock: item.availableStock,
        bundleId: item.bundle_id || null,
        // Phase 2: Reservation fields
        reservationId: item.reservation_id || undefined,
        reservationExpiresAt: item.reservation_expires_at || undefined,
        inStock: item.inStock,
      })) as CartItem[];
    },
  });
}

export function useRawCartQuery() {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: getCart,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: AddToCartData & {
        productDetails?: { name: string; image: string; price: number };
      },
    ) => addToCartFn(data),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart =
        queryClient.getQueryData<CartResponse>(CART_QUERY_KEY);

      if (previousCart) {
        const now = new Date().toISOString();
        const tempId = `temp-${Date.now()}`;

        const optimisticItem: any = {
          id: tempId,
          product_id: newItem.productId,
          bundle_id: newItem.bundleId || null,
          quantity: newItem.quantity,
          cost_price: (newItem.productDetails?.price || 0).toString(),
          final_price: (newItem.productDetails?.price || 0).toString(),
          discount_amount: "0",
          line_subtotal: (
            (newItem.productDetails?.price || 0) * newItem.quantity
          ).toString(),
          line_total: (
            (newItem.productDetails?.price || 0) * newItem.quantity
          ).toString(),
          product_name: newItem.productDetails?.name || "Loading...",
          product_image_url:
            newItem.productDetails?.image || "/placeholder.png",
          product_sku: null,
          inStock: true,
          availableStock: 99,
          priceChanged: false,
          currentPrice: null,
        };

        queryClient.setQueryData<CartResponse>(CART_QUERY_KEY, (old) => {
          if (!old) return old;

          const existingItemIndex = old.items.findIndex(
            (item) =>
              item.product_id === newItem.productId &&
              item.bundle_id === (newItem.bundleId || null),
          );

          let newItems = [...old.items];
          let addedQuantity = newItem.quantity;

          if (existingItemIndex > -1) {
            const item = newItems[existingItemIndex];
            newItems[existingItemIndex] = {
              ...item,
              quantity: item.quantity + addedQuantity,
            };
          } else {
            newItems.push(optimisticItem);
          }

          return {
            ...old,
            items: newItems,
            itemCount: newItems.length,
            totalQuantity: old.totalQuantity + addedQuantity,
          };
        });
      }

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error("Failed to add to cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onSuccess: () => {
      // Toast is handled by components individually
      // toast.success('Added to cart', { id: 'cart-add-success' });
    },
  });
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateCartItemData;
    }) => updateCartItemFn(itemId, data),
    onMutate: async ({ itemId, data }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart =
        queryClient.getQueryData<CartResponse>(CART_QUERY_KEY);

      if (previousCart) {
        queryClient.setQueryData<CartResponse>(CART_QUERY_KEY, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === itemId ? { ...item, quantity: data.quantity } : item,
            ),
            totalQuantity: old.items.reduce(
              (acc, item) =>
                acc + (item.id === itemId ? data.quantity : item.quantity),
              0,
            ),
          };
        });
      }
      return { previousCart };
    },
    onError: async (err: any, variables, context) => {
      // Check if this is a stock insufficiency error
      if (err.status === 400 && err.message) {
        const message = err.message;
        
        if (message.includes("Insufficient stock") || message.includes("available")) {
          // Get the actual availableStock from the previous cart state
          const item = context?.previousCart?.items.find(i => i.id === variables.itemId);
          const availableQty = item?.availableStock || 0;
          
          // Auto-correct to available quantity instead of reverting
          if (availableQty > 0) {
            queryClient.setQueryData<CartResponse>(CART_QUERY_KEY, (old) => {
              if (!old) return old;
              return {
                ...old,
                items: old.items.map((item) =>
                  item.id === variables.itemId
                    ? { ...item, quantity: availableQty }
                    : item
                ),
              };
            });
            
            toast.info(`Adjusted to maximum available quantity: ${availableQty}`, {
              duration: 3000,
            });
            
            // Trigger a proper update with the correct quantity
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            }, 100);
            return;
          }
        }
      }
      
      // For other errors, revert to previous state
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error("Failed to update cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItemFn(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart =
        queryClient.getQueryData<CartResponse>(CART_QUERY_KEY);

      if (previousCart) {
        queryClient.setQueryData<CartResponse>(CART_QUERY_KEY, (old) => {
          if (!old) return old;
          const newItems = old.items.filter((item) => item.id !== itemId);
          return {
            ...old,
            items: newItems,
            itemCount: newItems.length,
            totalQuantity: newItems.reduce(
              (acc, item) => acc + item.quantity,
              0,
            ),
          };
        });
      }
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
      toast.error("Failed to remove item from cart");
    },
    onSuccess: () => {
      toast.success("Item removed from cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useClearCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCartFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart =
        queryClient.getQueryData<CartResponse>(CART_QUERY_KEY);

      if (previousCart) {
        queryClient.setQueryData<CartResponse>(CART_QUERY_KEY, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: [],
            itemCount: 0,
            totalQuantity: 0,
            subtotal: "0",
            grand_total: "0",
          };
        });
      }
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useMergeCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mergeCartFn,
    onSuccess: (data) => {
      if (data.merged) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        toast.success("Cart merged from previous session");
      }
    },
  });
}

// --- Main Hook (Facade) ---

export function useCart() {
  const {
    data: cartItems = [],
    isLoading,
    isPending,
    isFetching,
    error,
    refetch,
  } = useCartQuery();

  // Mutations
  const addMutation = useAddToCartMutation();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const clearMutation = useClearCartMutation();

  // Actions
  const addToCart = async ({
    productId,
    quantity = 1,
    bundleId,
    variantId,
    productDetails,
    preventDuplicates = false,
  }: {
    productId: string;
    quantity?: number;
    variant?: string;
    bundleId?: string;
    variantId?: string;
    productDetails?: { name: string; image: string; price: number };
    preventDuplicates?: boolean;
  }) => {
    // Check for duplicates if requested
    if (preventDuplicates) {
      const existingItem = cartItems.find(
        (item) => item.productId === productId && item.bundleId === (bundleId || null)
      );

      if (existingItem) {
        toast.info("Item is already in cart");
        return;
      }
    }

    try {
      await addMutation.mutateAsync({
        productId,
        quantity,
        bundleId,
        variantId,
        productDetails,
      });
      toast.success("Added to cart");
    } catch (error: any) {
      // Enhanced error handling for stock issues (Phase 1)
      if (error.status === 400) {
        const message = error.message || "";

        // Check for insufficient stock error
        if (
          message.includes("Insufficient stock") ||
          message.includes("Only") ||
          message.includes("available")
        ) {
          // Try to extract available quantity
          const match = message.match(/(\d+)/);
          const available = match ? parseInt(match[1], 10) : 0;

          if (available > 0) {
            // Offer to add max available
            toast.error(`Only ${available} units available`, {
              duration: 5000,
              action: {
                label: `Add ${available}`,
                onClick: async () => {
                  try {
                    await addMutation.mutateAsync({
                      productId,
                      quantity: available,
                      bundleId,
                      productDetails,
                    });
                    toast.success(`Added ${available} units to cart`);
                  } catch (retryError) {
                    toast.error("Failed to add to cart");
                  }
                },
              },
            });
          } else {
            toast.error("This product is currently out of stock");
          }
          return;
        }
      }

      // Generic error
      toast.error(error.message || "Failed to add to cart");
      throw error;
    }
  };

  const removeFromCart = async (id: string, confirmed: boolean = false) => {
    // If not confirmed, just return - caller should show confirmation dialog
    if (!confirmed) {
      return false;
    }

    try {
      await removeMutation.mutateAsync(id);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item from cart');
      return false;
    }
  };

  const updateQuantity = async (id: string, change: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    // Calculate maximum allowed quantity:
    // maxStock represents ADDITIONAL available stock (not including current cart quantity)
    // So max allowed = current quantity + available stock
    const maxAllowedQuantity = item.maxStock !== undefined 
      ? item.quantity + item.maxStock 
      : Infinity;

    // Only prevent increase if exceeding total available
    // Always allow decrease
    if (change > 0 && newQuantity > maxAllowedQuantity) {
      const totalAvailable = item.maxStock !== undefined ? item.maxStock + item.quantity : 'unlimited';
      toast.error(`Maximum ${totalAvailable} items available in total`);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        itemId: id,
        data: { quantity: newQuantity },
      });
    } catch (error: any) {
      // Error is already handled by the mutation's onError
      // which auto-corrects the quantity
      // No need for additional error handling here
    }
  };

  const clearCart = async () => {
    await clearMutation.mutateAsync();
  };

  // Derived State
  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    cartItems,
    isLoading,
    isPending,
    isFetching,
    error: error ? (error as Error).message : null,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refreshCart: async () => {
      await refetch();
    },
    // Expose mutation states for UI loaders if needed
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isClearing: clearMutation.isPending,
  };
}
