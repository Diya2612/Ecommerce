import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError } from "@/utils/toast";
import type {
  OrderFormData,
  Customer,
  Address,
  OrderItem,
  OrderPricing,
} from "@/features/orders/types";
import {
  calculateOrderPricing,
  detectTaxType,
} from "@/features/orders/utils/orderCalculations";
import { emptyOrderFormData } from "@/features/orders/types";
import { useCreateOrder, useUpdateOrder } from "./useOrdersApi";

export interface UseOrderFormOptions {
  mode?: "create" | "edit";
  initialData?: Partial<OrderFormData>;
  orderId?: string;
}

const getDefaultFormData = (): OrderFormData => ({
  ...emptyOrderFormData,
});

export const useOrderForm = (options: UseOrderFormOptions = {}) => {
  const { mode = "create", initialData, orderId } = options;
  const navigate = useNavigate();

  // API Mutations
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  // 1. Primary form data state
  const [formData, setFormData] = useState<OrderFormData>({
    ...getDefaultFormData(),
    ...initialData,
  });

  // Store initial data for change detection
  const initialDataRef = useRef<OrderFormData>({
    ...getDefaultFormData(),
    ...initialData,
  });

  // 2. UI state
  const [ui] = useState({
    isLoading: false,
    isSubmitting:
      createOrderMutation.isPending || updateOrderMutation.isPending,
    isSaving: false,
  });

  // 3. Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 4. Track if form has changes
  const hasChanges = useMemo(() => {
    // Don't show unsaved changes if we're in the process of saving or already saved
    if (isSaved || isSaving) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialDataRef.current);
  }, [formData, isSaved, isSaving]);

  // 5. Sync external status changes (e.g. background payments) from initialData
  useEffect(() => {
    if (!initialData) return;

    // DEBUG LOG
    // console.log("useOrderForm: initialData changed", { 
    //   incomingStatus: initialData.paymentStatus, 
    //   currentStatus: formData.paymentStatus 
    // });

    setFormData((prev) => {
      const updates: Partial<OrderFormData> = {};
      let hasUpdates = false;

      // Check for external updates to status fields
      if (initialData.paymentStatus && initialData.paymentStatus !== prev.paymentStatus) {
        console.log("useOrderForm: Syncing payment status", initialData.paymentStatus);
        updates.paymentStatus = initialData.paymentStatus;
        hasUpdates = true;
      }
      if (initialData.orderStatus && initialData.orderStatus !== prev.orderStatus) {
        updates.orderStatus = initialData.orderStatus;
        hasUpdates = true;
      }
      if (initialData.fulfillmentStatus && initialData.fulfillmentStatus !== prev.fulfillmentStatus) {
        updates.fulfillmentStatus = initialData.fulfillmentStatus;
        hasUpdates = true;
      }

      if (hasUpdates) {
        // Also update initialDataRef so these external changes don't count as user "unsaved changes"
        initialDataRef.current = { ...initialDataRef.current, ...updates };
        return { ...prev, ...updates };
      }

      return prev;
    });
  }, [initialData?.paymentStatus, initialData?.orderStatus, initialData?.fulfillmentStatus]);

  // === CORE OPERATIONS ===

  const updateField = <K extends keyof OrderFormData>(
    field: K,
    value: OrderFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const updateFields = (updates: Partial<OrderFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(
      initialData
        ? { ...getDefaultFormData(), ...initialData }
        : getDefaultFormData(),
    );
    setErrors({});
  };

  // === CALCULATIONS ===

  const calculatePricing = (
    items: OrderItem[],
    currentPricing: OrderPricing,
    context?: { isInternational: boolean; shippingAddress: Address | null; billingAddress: Address | null }
  ): OrderPricing => {
    // Determine strict tax type from addresses
    let detectedTaxType = currentPricing.taxType;
    if (context) {
      detectedTaxType = detectTaxType(context.shippingAddress, context.billingAddress, context.isInternational);
    }

    // "Loose" fallback: If detected is 'none' but it's not international, default to 'cgst_sgst' to show estimated tax
    // REMOVED: Fallback logic disabled to respect "none" (No Tax) setting
    const effectiveTaxType = detectedTaxType;

    return calculateOrderPricing(
      items,
      currentPricing.orderDiscountType,
      currentPricing.orderDiscountValue,
      effectiveTaxType,
      currentPricing.cgstRate ?? 9,
      currentPricing.sgstRate ?? 9,
      currentPricing.igstRate ?? 18,
      currentPricing.shippingCharge,
      currentPricing.codCharge,
      currentPricing.giftCardAmount,
      currentPricing.advancePaid
    );
  };

  // === HANDLERS ===

  // Customer Handlers
  const customerHandlers = {
    setCustomer: (customer: Customer) => {
      setFormData((prev) => ({
        ...prev,
        customer,
        // Reset addresses when customer changes
        shippingAddress: null,
        billingAddress: null,
      }));
    },

    setAddress: (type: "shipping" | "billing", address: Address) => {
      setFormData((prev) => {
        const updates: Partial<OrderFormData> = {
          [type === "shipping" ? "shippingAddress" : "billingAddress"]: address,
        };

        // If shipping changed and billing is same as shipping, update billing too
        if (type === "shipping" && prev.billingSameAsShipping) {
          updates.billingAddress = address;
        }

        const nextShipping = updates.shippingAddress || prev.shippingAddress;
        const nextBilling = updates.billingAddress || prev.billingAddress;

        // Recalculate pricing with new addresses to update Tax Type
        const newPricing = calculatePricing(
          prev.items,
          prev.pricing,
          {
            isInternational: prev.isInternational,
            shippingAddress: nextShipping || null,
            billingAddress: nextBilling || null
          }
        );

        return { ...prev, ...updates, pricing: newPricing };
      });
    },

    setSameAsShipping: (checked: boolean) => {
      setFormData((prev) => {
        const nextBilling = checked ? prev.shippingAddress : prev.billingAddress;

        const newPricing = calculatePricing(
          prev.items,
          prev.pricing,
          {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: nextBilling
          }
        );

        return {
          ...prev,
          billingSameAsShipping: checked,
          billingAddress: nextBilling,
          pricing: newPricing
        };
      });
    },
  };

  // Item Handlers
  const itemHandlers = {
    addItem: (newItem: OrderItem) => {
      setFormData((prev) => {
        const existingIndex = prev.items.findIndex(
          (p) => p.productId === newItem.productId && p.variantId === newItem.variantId
        );
        const updatedItems = [...prev.items];

        if (existingIndex >= 0) {
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
          };
        } else {
          updatedItems.push(newItem);
        }

        return {
          ...prev,
          items: updatedItems,
          pricing: calculatePricing(updatedItems, prev.pricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },

    updateQuantity: (itemId: string, quantity: number) => {
      setFormData((prev) => {
        const updatedItems = prev.items.map((item) => {
          if (item.id !== itemId) return item;

          // Enforce stock limit - quantity cannot exceed availableStock
          const maxAllowed = item.availableStock > 0 ? item.availableStock : 1;
          const validQuantity = Math.min(Math.max(1, quantity), maxAllowed);

          return { ...item, quantity: validQuantity };
        });

        return {
          ...prev,
          items: updatedItems,
          pricing: calculatePricing(updatedItems, prev.pricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },

    removeItem: (itemId: string) => {
      setFormData((prev) => {
        const updatedItems = prev.items.filter((item) => item.id !== itemId);

        // Reset order discount if no items remain
        const updatedPricing =
          updatedItems.length === 0
            ? {
              ...prev.pricing,
              orderDiscountType: "" as const,
              orderDiscountValue: 0,
            }
            : prev.pricing;

        return {
          ...prev,
          items: updatedItems,
          pricing: calculatePricing(updatedItems, updatedPricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },


    applyDiscount: (
      itemIds: string[],
      discountType: "percentage" | "fixed",
      discountValue: number,
      discountReason?: string,
    ) => {
      setFormData((prev) => {
        const updatedItems = prev.items.map((item) => {
          if (itemIds.includes(item.id)) {
            return {
              ...item,
              discountType,
              discountValue,
              discountReason: discountReason || undefined,
            };
          }
          return item;
        });

        return {
          ...prev,
          items: updatedItems,
          pricing: calculatePricing(updatedItems, prev.pricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },

    /**
     * Update availableStock for items based on live polling data
     * Also clamps quantities that exceed the new stock limits
     */
    updateItemsStock: (stockMap: Map<string, number>) => {
      setFormData((prev) => {
        let hasChanges = false;
        const updatedItems = prev.items.map((item) => {
          if (!item.productId) return item; // Skip items without productId
          const liveStock = stockMap.get(item.productId);
          if (liveStock !== undefined && liveStock !== item.availableStock) {
            hasChanges = true;
            // Clamp quantity if it now exceeds available stock
            const newQuantity = Math.min(item.quantity, Math.max(1, liveStock));
            return {
              ...item,
              availableStock: liveStock,
              quantity: newQuantity,
            };
          }
          return item;
        });

        if (!hasChanges) return prev;

        return {
          ...prev,
          items: updatedItems,
          pricing: calculatePricing(updatedItems, prev.pricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },
  };

  // Pricing Handlers
  const pricingHandlers = {
    update: (
      field: keyof OrderPricing,
      value: OrderPricing[keyof OrderPricing],
    ) => {
      setFormData((prev) => {
        const newPricing = { ...prev.pricing, [field]: value };
        return {
          ...prev,
          pricing: calculatePricing(prev.items, newPricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },

    applyOrderDiscount: (
      discountType: "" | "percentage" | "fixed",
      discountValue: number,
      discountReason?: string
    ) => {
      setFormData((prev) => {
        const newPricing = {
          ...prev.pricing,
          orderDiscountType: discountType,
          orderDiscountValue: discountValue,
          orderDiscountReason: discountReason || undefined
        };
        return {
          ...prev,
          pricing: calculatePricing(prev.items, newPricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },

    applyShipping: (shippingCharge: number) => {
      setFormData((prev) => {
        const newPricing = {
          ...prev.pricing,
          shippingCharge: shippingCharge
        };
        return {
          ...prev,
          pricing: calculatePricing(prev.items, newPricing, {
            isInternational: prev.isInternational,
            shippingAddress: prev.shippingAddress,
            billingAddress: prev.billingAddress,
          }),
        };
      });
    },
  };

  // Submission Handlers
  const handleSaveDraft = useCallback(() => {
    const draftData: OrderFormData = { ...formData, isDraftOrder: true };
    createOrderMutation.mutate(draftData, {
      onSuccess: () => {
        setIsSaved(true);
        // Defer navigation to allow isSaved state update to propagate
        setTimeout(() => {
          navigate("/orders/draft");
        }, 0);
      },
    });
  }, [formData, createOrderMutation, navigate]);

  // Helper function to scroll to first error
  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (!firstErrorKey) return;

    // Map error keys to DOM element IDs
    const fieldIdMap: Record<string, string> = {
      'salesChannel': 'sales-channel-field',
      'customer': 'customer-section',
      'items': 'items-section',
      'shippingAddress': 'shipping-address-section',
      'billingAddress': 'billing-address-section',
      'pricing.orderDiscountValue': 'order-discount-field',
      'pricing.codCharge': 'cod-charge-field',
      'pricing.advancePaid': 'advance-paid-field',
    };

    const targetId = fieldIdMap[firstErrorKey] || firstErrorKey;
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus if it's a focusable element
      if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
        setTimeout(() => element.focus(), 300);
      }
    }
  };

  const handleCreateOrder = useCallback(() => {
    // Comprehensive validation using Zod schema
    const newErrors: Record<string, string> = {};

    // Priority 1: Critical validations
    if (!formData.salesChannel) {
      newErrors.salesChannel = "Please select a sales channel";
    }
    if (!formData.customer) {
      newErrors.customer = "Please select a customer";
    }
    if (formData.items.length === 0) {
      newErrors.items = "Please add at least one product";
    }

    // Priority 1: Address validations (CRITICAL)
    if (!formData.shippingAddress) {
      newErrors.shippingAddress = "Please select a shipping address";
    }
    if (!formData.billingSameAsShipping && !formData.billingAddress) {
      newErrors.billingAddress = "Please select a billing address";
    }

    // Priority 1: Item stock validation (CRITICAL)
    formData.items.forEach((item, index) => {
      if (item.quantity > item.availableStock) {
        newErrors[`items.${index}.quantity`] =
          `Quantity (${item.quantity}) exceeds available stock (${item.availableStock}) for ${item.productName}`;
        // Also set a general items error for toast
        if (!newErrors.items) {
          newErrors.items = "Some items have insufficient stock";
        }
      }
      if (item.quantity <= 0) {
        newErrors[`items.${index}.quantity`] = "Quantity must be at least 1";
      }
    });

    // Priority 2: Discount validations
    formData.items.forEach((item, index) => {
      if (item.discountType === "percentage" && item.discountValue > 100) {
        newErrors[`items.${index}.discountValue`] =
          `Discount percentage cannot exceed 100% for ${item.productName}`;
      }
    });

    if (
      formData.pricing.orderDiscountType === "percentage" &&
      formData.pricing.orderDiscountValue > 100
    ) {
      newErrors["pricing.orderDiscountValue"] =
        "Order discount percentage cannot exceed 100%";
    }

    // Priority 2: COD charge validation
    if (formData.paymentMethod === "cod" && formData.pricing.codCharge === 0) {
      newErrors["pricing.codCharge"] =
        "COD charge is required for Cash on Delivery orders";
    }

    // Priority 2: Tax type for international orders
    if (formData.isInternational && formData.pricing.taxType !== "none") {
      newErrors["pricing.taxType"] =
        "International orders must have tax type set to 'None'";
    }

    // Priority 3: Payment validations
    if (formData.pricing.advancePaid > formData.pricing.grandTotal) {
      newErrors["pricing.advancePaid"] =
        "Advance paid cannot exceed grand total";
    }

    // Priority 3: Gift card validation
    if (
      formData.pricing.giftCardCode &&
      formData.pricing.giftCardAmount === 0
    ) {
      newErrors["pricing.giftCardAmount"] =
        "Gift card amount is required when gift card code is provided";
    }

    // Priority 3: Customer field validations (if customer exists)
    // Relaxed validation: We trust the selected customer profile is sufficient
    // if (formData.customer) { .. } checks removed to allow customers with missing details

    // Priority 3: Address field validations (if addresses exist)
    if (formData.shippingAddress) {
      if (
        formData.shippingAddress.pincode &&
        !/^\d{6}$/.test(formData.shippingAddress.pincode)
      ) {
        newErrors["shippingAddress.pincode"] =
          "Pincode must be exactly 6 digits";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Count error types for better messaging
      const criticalErrors = Object.keys(newErrors).filter(
        (k) =>
          k.includes("shippingAddress") ||
          k.includes("billingAddress") ||
          k.includes("customer") ||
          k === "items" ||
          k === "salesChannel",
      ).length;

      const stockErrors = Object.keys(newErrors).filter((k) =>
        k.includes("quantity"),
      ).length;

      if (stockErrors > 0) {
        notifyError(`${stockErrors} item(s) have insufficient stock`);
      } else if (criticalErrors > 0) {
        // Build a friendly list of missing fields
        const missingFields: string[] = [];
        const errorKeys = Object.keys(newErrors);

        if (errorKeys.some(k => k.includes("customer"))) missingFields.push("Customer Details");
        if (errorKeys.some(k => k.includes("salesChannel"))) missingFields.push("Sales Channel");
        if (errorKeys.some(k => k.includes("items"))) missingFields.push("Items");
        if (errorKeys.some(k => k.includes("shippingAddress"))) missingFields.push("Shipping Address");
        if (errorKeys.some(k => k.includes("billingAddress"))) missingFields.push("Billing Address");

        if (missingFields.length === 0) {
          // Fallback for unknown critical errors
          missingFields.push(...errorKeys);
        }

        notifyError(`Missing required fields: ${Array.from(new Set(missingFields)).join(", ")}`);

        // Scroll to first error field
        scrollToFirstError(newErrors);
      } else {
        // Show specific error messages for non-critical errors
        const errorMessages = Object.values(newErrors).join(". ");
        notifyError(`Validation Error: ${errorMessages}`);
        scrollToFirstError(newErrors);
      }
      return;
    }

    // Set saving state to disable unsaved changes guard immediately
    setIsSaving(true);

    if (mode === "edit" && orderId) {
      // Update existing order
      updateOrderMutation.mutate(
        { id: orderId, data: formData },
        {
          onSuccess: () => {
            // Reset states - the mutation already shows success toast
            setIsSaved(true);
            setIsSaving(false);
            // Update the initial ref to sync with saved data
            initialDataRef.current = formData;
            // Navigate to orders list
            navigate("/orders");
          },
          onError: () => {
            // Reset saving state on error so user can try again
            setIsSaving(false);
          },
        },
      );
    } else {
      // Create new order
      createOrderMutation.mutate(formData, {
        onSuccess: () => {
          // Reset states - the mutation already shows success toast
          setIsSaved(true);
          setIsSaving(false);
          // Update the initial ref to prevent unsaved changes warning
          initialDataRef.current = formData;
          // Navigate to orders list after creating new order
          navigate("/orders");
        },
        onError: () => {
          // Reset saving state on error so user can try again
          setIsSaving(false);
        },
      });
    }
  }, [
    formData,
    mode,
    orderId,
    createOrderMutation,
    updateOrderMutation,
    navigate,
  ]);

  return {
    formData,
    ui,
    errors,
    mode,
    hasChanges,

    // Core Ops
    updateField,
    updateFields,
    resetForm,

    // Grouped Handlers
    handlers: {
      customer: customerHandlers,
      items: itemHandlers,
      pricing: pricingHandlers,
    },

    // Action Handlers
    saveDraft: handleSaveDraft,
    createOrder: handleCreateOrder,

    // Legacy support (Adapters for CreateOrderForm.tsx refactor)
    handleBasicInfoChange: updateField,
    handleCustomerChange: customerHandlers.setCustomer,
    handleAddressChange: customerHandlers.setAddress,
    handleSameAsShippingChange: customerHandlers.setSameAsShipping,
    handleAddItem: itemHandlers.addItem,
    handleUpdateQuantity: itemHandlers.updateQuantity,
    handleRemoveItem: itemHandlers.removeItem,
    handleUpdateItemsStock: itemHandlers.updateItemsStock,
    handlePricingChange: pricingHandlers.update,
    handleApplyOrderDiscount: pricingHandlers.applyOrderDiscount,
    handleApplyShipping: pricingHandlers.applyShipping,
    handleApplyDiscount: itemHandlers.applyDiscount,
    handleNotesChange: updateField, // This might need type adjustment
    handleSaveDraft: handleSaveDraft, // duplicate
    handleCreateOrder: handleCreateOrder, // duplicate
    handleCancel: () => navigate(-1),
  };
};
