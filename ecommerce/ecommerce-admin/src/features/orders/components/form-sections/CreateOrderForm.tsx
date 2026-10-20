import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Truck,
  MoreVertical,
  Copy,
  Trash2,
  ArrowLeft,
  Save,
  Plus,
  Pencil,
  Lock,
  Edit,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/forms";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useOrderForm } from "@/features/orders/hooks/useOrderForm";
import { useRazorpay } from "@/features/orders/hooks/useRazorpay";
import { useStockPolling } from "@/features/orders/hooks/useStockPolling";
import { useDeleteOrder, orderKeys, useUpdatePayment } from "@/features/orders/hooks/useOrdersApi";
import { OrderItemsList } from "../..";
import { DraftModeBanner } from "./DraftModeBanner";
// import { QuickActionsCard } from "./QuickActionsCard";
import { PaymentCard } from "./PaymentCard";
import { OrderTimelineCard } from "./OrderTimelineCard";
import type { TimelineEvent } from "./OrderTimelineCard";
import { AddProductModal } from "../..";

import { OrderDiscountModal } from "../..";
import { CustomerSelector } from "../..";
import { AddressSelector } from "../..";
import { StatusBadge } from "../..";
import { OrderStatusManagement } from "@/features/orders/components/order-detail/OrderStatusManagement";
import { MarkAsPaidModal } from "../..";
import { OrderStatusStepper } from "../../components";
import { OrderSummaryCard } from "../../components";

import { ROUTES } from "@/lib/constants";
import { notifyInfo } from "@/utils";
import {
  calculateItemsSubtotal,
} from "@/features/orders/utils/orderCalculations";
import { NotesTags } from "@/features/notes/components/NotesTags";
import { UnsavedChangesGuard } from "@/components/guards";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import { InvoiceManager } from "@/features/invoices/components/InvoiceManager";
import type {
  Address,
  OrderFormData,
  Customer,
  OrderItem,
} from "@/features/orders/types";
import { Badge } from "@/components/ui/badge";
import { useCustomer } from "@/features/customers/hooks/useCustomers";

const ENABLE_UNSAVED_CHANGES_WARNING = true;

interface CreateOrderFormProps {
  mode?: "create" | "edit";
  initialData?: Partial<OrderFormData>;
  orderId?: string;
  sourceOrderNumber?: string;
  headerActions?: React.ReactNode;
  /** Order's last modified timestamp for invoice regeneration logic */
  lastModified?: string;
  /**
   * When true the form is in view-only mode — all fields are disabled.
   * The "Edit Order" button in headerActions should trigger the parent to
   * flip this to false.
   */
  isReadOnly?: boolean;
  /** Called when the user confirms discarding their edits (Discard Changes) */
  onExitReadOnly?: () => void;
}

export function CreateOrderForm({
  mode = "create",
  initialData,
  orderId,
  sourceOrderNumber,
  headerActions,
  lastModified,
  isReadOnly = false,
  onExitReadOnly,
}: CreateOrderFormProps) {
  const navigate = useNavigate();
  const {
    formData,
    ui,
    hasChanges,
    errors,
    handleCustomerChange,
    handleAddressChange,
    handleSameAsShippingChange,
    handleAddItem,
    handleUpdateQuantity,
    handleRemoveItem,
    handleUpdateItemsStock,
    handleNotesChange,
    handleCancel,
    handleCreateOrder,
    handleApplyOrderDiscount,
    handleApplyDiscount,
    updateFields,
  } = useOrderForm({ mode, initialData, orderId });

  // Real-time stock polling for order items (10 second interval)
  const { stockMap } = useStockPolling(formData.items, formData.items.length > 0);

  // Sync live stock data into form items when polling returns new data
  useEffect(() => {
    if (stockMap.size > 0) {
      handleUpdateItemsStock(stockMap);
    }
  }, [stockMap, handleUpdateItemsStock]);

  // Query Client for invalidation
  const queryClient = useQueryClient();

  // Fetch full customer details to auto-select default address
  const { data: customerDetails } = useCustomer(formData.customer?.id || "");

  // Auto-select default shipping address when customer details load
  useEffect(() => {
    if (customerDetails?.addresses && customerDetails.addresses.length > 0 && !formData.shippingAddress) {
      // Find default shipping address or fallback to first one
      const defaultAddr = customerDetails.addresses.find((addr: any) => addr.isDefaultShipping) || customerDetails.addresses[0];

      if (defaultAddr) {
        const mappedAddress: Address = {
          id: defaultAddr.id,
          label: defaultAddr.addressType || defaultAddr.name || "Address",
          address: [defaultAddr.streetAddress1, defaultAddr.streetAddress2].filter(Boolean).join(", "),
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
        };
        handleAddressChange("shipping", mappedAddress);
      }
    }
  }, [customerDetails, formData.shippingAddress, handleAddressChange]);

  // Payment Hook
  const { initiatePayment, status: razorpayStatus } = useRazorpay({
    onSuccess: () => {
      // Invalidate order query to force refetch and update status
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      }
    }
  });

  // Manual Payment Update Hook
  const updatePaymentMutation = useUpdatePayment();

  const handleMarkAsPaidClick = () => {
    if (!orderId) {
      notifyInfo("Please save the order first.");
      return;
    }
    setShowMarkAsPaidModal(true);
  };

  const handleConfirmMarkAsPaid = (reason: string) => {
    if (!orderId) return;

    updatePaymentMutation.mutate({
      id: orderId,
      data: {
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        notes: reason || 'Marked as paid manually by admin'
      }
    }, {
      onSuccess: () => {
        console.log("handleMarkAsPaid SUCCESS - Invalidating queries for order:", orderId);
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        setShowMarkAsPaidModal(false);
      }
    });
  };

  // Delete Hook
  const deleteOrderMutation = useDeleteOrder();

  // Add debug logging to verify handlers exist
  // console.log("useOrderForm handlers:", { handleCancel, handleSaveDraft, handleNotesChange });

  // Discard-edit confirmation dialog
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleDiscardEdits = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onExitReadOnly?.();
    }
  };

  const confirmDiscardEdits = () => {
    setShowDiscardConfirm(false);
    onExitReadOnly?.();
  };

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [addProductDefaultTab, setAddProductDefaultTab] = useState<"browse" | "custom">("browse");
  const [showOrderDiscountModal, setShowOrderDiscountModal] = useState(false);
  const [showRemoveCustomerConfirm, setShowRemoveCustomerConfirm] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showDeleteBlocked, setShowDeleteBlocked] = useState(false);
  const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);
  const [deleteBlockedReason, setDeleteBlockedReason] = useState("");

  // Local UI states
  const [availableTags] = useState<string[]>([]);

  const handleTagCreated = () => { };

  const isEditMode = mode === "edit";
  const title = isEditMode
    ? formData.orderNumber || "Edit Order"
    : sourceOrderNumber
      ? "Duplicate Order"
      : "Create New Order";

  const handleDuplicateOrder = () => {
    navigate(ROUTES.ORDERS.CREATE, { state: { duplicateOrder: formData } });
  };

  // Check if order can be deleted based on business rules
  const canDeleteOrder = () => {
    // Cannot delete paid orders
    if (
      formData.paymentStatus === "paid" ||
      formData.paymentStatus === "refunded" ||
      formData.paymentStatus === "partially_refunded"
    ) {
      return {
        canDelete: false,
        reason: "Cannot delete paid orders. This order has already been paid for.",
      };
    }

    // Cannot delete delivered orders
    if (formData.orderStatus === "delivered") {
      return {
        canDelete: false,
        reason:
          "Cannot delete delivered orders. This order has already been delivered to the customer.",
      };
    }

    // Cannot delete fulfilled orders
    if (formData.fulfillmentStatus === "fulfilled") {
      return {
        canDelete: false,
        reason:
          "Cannot delete fulfilled orders. This order has already been fulfilled.",
      };
    }

    return { canDelete: true, reason: "" };
  };

  const handleDeleteOrderClick = () => {
    const { canDelete, reason } = canDeleteOrder();

    if (!canDelete) {
      setDeleteBlockedReason(reason);
      setShowDeleteBlocked(true);
    } else {
      setShowDeleteWarning(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderId) return;

    deleteOrderMutation.mutate(orderId, {
      onSuccess: () => {
        setShowDeleteWarning(false);
        navigate(ROUTES.ORDERS.LIST);
      },
    });
  };

  // Calculate pricing values
  const {
    subtotal: grossSubtotal,
    discounts: productDiscounts,
    totalAfterDiscounts: itemsNetTotal,
  } = calculateItemsSubtotal(formData.items);

  const orderDiscount = formData.pricing?.orderDiscount || 0;
  const shipping = formData.pricing?.shippingCharge || 0;
  const rounding = formData.pricing?.roundingAdjustment || 0;
  const taxes =
    (formData.pricing?.cgst || 0) +
    (formData.pricing?.sgst || 0) +
    (formData.pricing?.igst || 0);
  const total = itemsNetTotal - orderDiscount + shipping + taxes + rounding;

  // Change Handlers for Summary Card
  const handleShippingChange = (value: number) => {
    updateFields({
      pricing: { ...formData.pricing, shippingCharge: value, grandTotal: itemsNetTotal - orderDiscount + value + taxes + rounding },
    });
  };

  const handleRoundingChange = (value: number) => {
    updateFields({
      pricing: { ...formData.pricing, roundingAdjustment: value, grandTotal: itemsNetTotal - orderDiscount + shipping + taxes + value },
    });
  };

  // Handlers
  const handleAddProducts = (selectedProducts: any[]) => {
    selectedProducts.forEach((product) => {
      const item: OrderItem = {
        id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.productId,
        productName: product.name,
        productSku: product.sku,
        productImage: product.image || "",
        quantity: product.quantity || 1,
        costPrice: product.price,
        discountType: "",
        discountValue: 0,
        availableStock: product.stock,
        variantId: product.variant_id,
        variantLabel: product.variant_label,
      };
      handleAddItem(item);
    });
  };

  // Handler for adding custom/ad-hoc products
  const handleAddCustomProduct = (data: { name: string; price: number; quantity: number; sku?: string }) => {
    const item: OrderItem = {
      id: `CUSTOM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: null,
      productName: data.name,
      productSku: data.sku || '',
      productImage: '',
      quantity: data.quantity,
      costPrice: data.price,
      discountType: '',
      discountValue: 0,
      availableStock: 9999, // Unlimited for custom items
      isCustom: true,
    };
    handleAddItem(item);
  };

  const handlePayWithCard = async () => {
    if (!orderId) {
      notifyInfo("Please save the order first before accepting payment.");
      return;
    }
    await initiatePayment(orderId);
  };

  const confirmRemoveCustomer = () => {
    handleCustomerChange(null as any);
    setShowRemoveCustomerConfirm(false);
  };
  const handleCustomerSelect = (customer: Customer) => {
    handleCustomerChange(customer);
    setShowCustomerModal(false);
  };
  const handleShippingAddressSelect = (address: Address) => {
    handleAddressChange("shipping", address);
  };
  const handleBillingAddressSelect = (address: Address) => {
    handleAddressChange("billing", address);
  };

  // Header Actions - updated for direct usage in the new header layout
  const renderHeaderActions = () => (
    <>
      {/* In read-only mode: show nothing; parent headerActions show Edit Order */}
      {!isReadOnly && (!isEditMode || hasChanges) && (
        <>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-xl h-9 sm:h-[44px] px-4 sm:px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={ui.isSubmitting}
            className="rounded-xl bg-(--sidebar-bg) hover:bg-(--sidebar-hover) text-(--text-white)/90 h-9 sm:h-[44px] px-4 sm:px-6 gap-2 shadow-sm"
          >
            {isEditMode ? (
              <>
                <Save className="size-[18px]" />
                {ui.isSubmitting ? "Saving..." : "Save Changes"}
              </>
            ) : (
              <>
                <Plus className="size-[18px]" />
                {ui.isSubmitting ? "Creating..." : "Create Order"}
              </>
            )}
          </Button>
        </>
      )}

      {/* Dropdown menu - Hidden for draft orders per user request */}
      {isEditMode && !formData.isDraftOrder && !isReadOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDuplicateOrder}
              className="text-sm"
            >
              <Copy className="size-4 mr-2" />
              Duplicate Order
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteOrderClick}
              className="text-sm text-red-600 hover:text-red-700 focus:text-red-700"
            >
              <Trash2 className="size-4 mr-2" />
              Delete Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  return (
    <UnsavedChangesGuard
      hasChanges={hasChanges}
      enabled={ENABLE_UNSAVED_CHANGES_WARNING}
      title="Discard order changes?"
      description="You have unsaved changes to this order. If you leave now, all your changes will be lost."
    >
      <div className="flex-1 w-full">
        {/* Sticky Header Section - Pinned below the main header */}
        <div
          id="order-sticky-header"
          className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 border-b border-slate-200 shadow-sm -mx-1 px-7 lg:px-9 py-4 mb-6 transition-all"
        >
          <div className="space-y-4">
            {/* Breadcrumb */}
            {/* Breadcrumb - hide or simplify on extra small screens if needed, otherwise keep as is with flex-wrap */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <button
                onClick={() => navigate(ROUTES.ORDERS.LIST)}
                className="text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap"
                type="button"
              >
                Orders
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-medium truncate">
                {isEditMode ? formData.orderNumber || "Edit" : "Create"}
              </span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(ROUTES.ORDERS.LIST)}
                  className="rounded-full h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                      {title}
                    </h1>
                    {(sourceOrderNumber || isEditMode) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {sourceOrderNumber && (
                          <Badge
                            variant="outline"
                            className="font-normal text-slate-500 bg-white"
                          >
                            Duplicated from {sourceOrderNumber}
                          </Badge>
                        )}
                        {isEditMode && !formData.isDraftOrder && orderId && (
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={formData.orderStatus} type="order" />
                            <StatusBadge status={formData.paymentStatus} type="payment" />
                            <StatusBadge status={formData.fulfillmentStatus} type="fulfillment" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!isEditMode && (
                    <p className="text-sm text-slate-600">
                      Create and manage order details
                    </p>
                  )}
                  {isEditMode && formData.orderDate && (
                    <p className="text-sm mt-1 text-slate-600">
                      {new Date(formData.orderDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                      <span className="mx-1" />
                      {new Date(formData.orderDate)
                        .toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* In read-only mode always show headerActions (Edit Order btn, etc.) */}
                {isReadOnly ? headerActions : (!hasChanges && headerActions)}
                {renderHeaderActions()}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode Active Banner — shown when user has clicked Edit Order and can now interact */}
        {isEditMode && !isReadOnly && (
          <div className="bg-gradient-to-r from-[#0e042f] to-[#1a0a50] text-white px-7 lg:px-9 py-3 -mx-1 border-b border-[#0e042f]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit className="w-4 h-4" />
                <span className="font-semibold text-sm">Editing Mode Active</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                  {hasChanges ? "Unsaved Changes" : "No Changes Yet"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscardEdits}
                  className="h-8 text-xs text-white hover:bg-white/10 border border-white/20"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Discard Changes
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateOrder}
                  disabled={!hasChanges || ui.isSubmitting}
                  className="h-8 text-xs bg-white text-[#0e042f] hover:bg-white/90"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  {ui.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 lg:px-8 pb-8">
          {isEditMode && formData.orderStatus && (
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <OrderStatusStepper
                currentStatus={formData.orderStatus}
                orderDate={formData.orderDate}
              />
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. ORDER DETAILS CARD — Siscaa style: OrderItemsList is the card itself */}
              <div id="items-section">
                <OrderItemsList
                  items={formData.items}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onUpdateDiscount={handleApplyDiscount}
                  currency={formData.currency}
                  onAddProduct={() => {
                    if (isReadOnly) return;
                    setAddProductDefaultTab("browse");
                    setShowAddProductModal(true);
                  }}
                  isDraftMode={formData.isDraftOrder || isReadOnly}
                />
                {errors.items && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.items}</p>
                )}
              </div>

              {/* Pricing Summary Card */}
              <OrderSummaryCard
                currency={formData.currency}
                subtotal={grossSubtotal}
                productDiscountsTotal={productDiscounts}
                orderDiscountAmount={orderDiscount}
                orderDiscountType={formData.pricing?.orderDiscountType as "" | "percentage" | "fixed"}
                orderDiscountValue={formData.pricing?.orderDiscountValue || 0}
                tax={taxes}
                shipping={shipping}
                rounding={rounding}
                grandTotal={total}
                isLocked={formData.orderStatus !== "draft" && !isEditMode}
                onOpenDiscountModal={() => setShowOrderDiscountModal(true)}
                onRemoveDiscount={() => handleApplyOrderDiscount("percentage", 0)}
                onShippingChange={handleShippingChange}
                onRoundingChange={handleRoundingChange}
              />

              {/* 2. INVOICE CARD */}
              {orderId && (
                <InvoiceManager
                  orderId={orderId}
                  lastModified={lastModified}
                  variant="embedded"
                />
              )}

              {/* 3. ORDER TIMELINE CARD */}
              <OrderTimelineCard
                events={[
                  {
                    id: "init",
                    action: isEditMode ? "Order loaded for editing" : "Order draft initialized",
                    details: isEditMode
                      ? `Editing ${formData.orderNumber || "order"}`
                      : "New order created",
                    user: "System",
                    timestamp: new Date().toISOString(),
                    type: "system",
                  },
                ] satisfies TimelineEvent[]}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* DRAFT MODE / QUICK ACTIONS */}
              {formData.isDraftOrder ? (
                <DraftModeBanner />
              ) : (
                /* Hiding Quick Actions per request
                <QuickActionsCard
                  onAddNote={() => {}}
                  onAddTag={() => {}}
                  onSendInvoice={() => {}}
                  onAddFulfillment={() => {}}
                />
                */
                null
              )}

              {/* 1. STATUS CARD */}
              {isEditMode && orderId ? (
                <OrderStatusManagement
                  orderId={orderId}
                  orderStatus={formData.orderStatus || "pending"}
                  paymentStatus={formData.paymentStatus || "pending"}
                  fulfillmentStatus={formData.fulfillmentStatus || "unfulfilled"}
                  trackingNumber={formData.trackingNumber}
                  onStatusChange={updateFields}
                />
              ) : (
                <FormSection title="Status">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-slate-600 mb-1.5 block">Order Status</Label>
                      <Select
                        value={formData.orderStatus}
                        onValueChange={(val: any) => updateFields({ orderStatus: val })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 mb-1.5 block">Fulfillment</Label>
                      <Select
                        value={formData.fulfillmentStatus}
                        onValueChange={(val: any) => updateFields({ fulfillmentStatus: val })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select fulfillment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                          <SelectItem value="fulfilled">Fulfilled</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </FormSection>
              )}

              {/* 1.5. CUSTOMER CARD */}
              <FormSection
                icon={User}
                title={
                  <>
                    Customer<span className="text-amber-600 ml-0.5">*</span>
                  </>
                }
              >
                {!formData.customer ? (
                  <Button
                    className="w-full h-[44px] bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 rounded-xl text-sm font-medium transition-all shadow-sm gap-2"
                    onClick={() => setShowCustomerModal(true)}
                  >
                    <Plus className="size-[18px]" />
                    Select customer
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                      {formData.customer.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {formData.customer.name}
                        </p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-50 text-slate-600 border-slate-200">
                          B2B
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200">
                          Low Risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                        <span>{formData.customer.email}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{formData.customer.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomerModal(true)}
                      className="h-8 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
                    >
                      <Pencil className="size-3.5" />
                      <span>Change</span>
                    </Button>
                  </div>
                )}
                {errors.customer && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.customer}</p>
                )}

                {/* Shipping Address moved under customer */}
                {formData.customer && (
                  <>
                    <div className="border-t border-slate-100 my-4" />
                    <div id="shipping-address-section">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-slate-600">
                          Shipping Address <span className="text-red-500">*</span>
                        </Label>
                      </div>
                      <AddressSelector
                        customer={formData.customer}
                        selectedAddress={formData.shippingAddress}
                        onSelect={handleShippingAddressSelect}
                        addressType="shipping"
                      />
                      {errors.shippingAddress && (
                        <p className="text-red-400 text-xs mt-1.5">{errors.shippingAddress}</p>
                      )}
                    </div>
                  </>
                )}
              </FormSection>

              {/* 2. PAYMENT CARD */}
              <PaymentCard
                isDraftMode={!!formData.isDraftOrder}
                paymentStatus={formData.paymentStatus || "pending"}
                paymentMethod={formData.paymentMethod || (formData.pricing as any)?.paymentMethod}
                currencySymbol={
                  formData.currency === "USD" ? "$" : formData.currency === "EUR" ? "€" : "₹"
                }
                grandTotal={total}
                advancePaid={formData.pricing?.advancePaid || 0}
                balanceDue={total - (formData.pricing?.advancePaid || 0)}
                razorpayStatus={razorpayStatus}
                isMarkingPaid={updatePaymentMutation.isPending}
                hasItems={formData.items.length > 0}
                orderId={orderId}
                onPayWithCard={handlePayWithCard}
                onMarkAsPaid={handleMarkAsPaidClick}
                onEmailInvoice={() => {
                  // TODO: Implement email payment invoice functionality
                  console.log("Email payment invoice");
                }}
              />

              {/* 3. BILLING DETAILS CARD */}
              <FormSection
                icon={Truck}
                title="Billing Details"
                className={errors.billingAddress ? "border-red-300 border-2" : ""}
              >
                {/* Billing Address */}
                <div id="billing-address-section">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs text-slate-600">
                      Billing Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="billingSameAsShipping"
                        checked={formData.billingSameAsShipping}
                        onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 accent-[#0E042F] focus:ring-[#0E042F] cursor-pointer"
                      />
                      <Label htmlFor="billingSameAsShipping" className="text-xs text-slate-700 cursor-pointer">
                        Same as shipping
                      </Label>
                    </div>
                  </div>

                  {!formData.billingSameAsShipping && (
                    <div>
                      <AddressSelector
                        customer={formData.customer}
                        selectedAddress={formData.billingAddress}
                        onSelect={handleBillingAddressSelect}
                        addressType="billing"
                      />
                      {errors.billingAddress && (
                        <p className="text-red-400 text-xs mt-1.5">{errors.billingAddress}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 my-4" />

                {/* Order Source & PO */}
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-xs text-slate-600 mb-1.5 block">
                      Order Source
                      {!formData.isDraftOrder && <Lock className="w-3 h-3 text-slate-400" />}
                    </Label>
                    <Select
                      value={formData.salesChannel}
                      onValueChange={(val: any) => updateFields({ salesChannel: val })}
                      disabled={!formData.isDraftOrder}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="flipkart">Flipkart</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-xs text-slate-600 mb-1.5 block">
                      PO Number
                      {!formData.isDraftOrder && <Lock className="w-3 h-3 text-slate-400" />}
                    </Label>
                    <Input
                      placeholder="#PO-2025-001"
                      className="h-9"
                      disabled={!formData.isDraftOrder}
                      value={formData.amazonOrderRef}
                      onChange={(e) => updateFields({ amazonOrderRef: e.target.value })}
                    />
                  </div>
                </div>
              </FormSection>

              {/* 3. NOTES & TAGS */}
              <NotesTags
                tags={formData.orderTags}
                availableTags={availableTags}
                onTagsChange={(val) => handleNotesChange("orderTags", val)}
                adminComment={formData.adminComment}
                onAdminCommentChange={(val) =>
                  handleNotesChange("adminComment", val)
                }
                customerNote={formData.customerNote}
                onCustomerNoteChange={(val) =>
                  handleNotesChange("customerNote", val)
                }
                showCustomerNote={false}
                tagType="order"
                onTagCreated={handleTagCreated}
              />


            </div>
          </div>
        </div>

        {/* --- MODALS --- */}
        <MarkAsPaidModal
          isOpen={showMarkAsPaidModal}
          onClose={() => setShowMarkAsPaidModal(false)}
          onConfirm={handleConfirmMarkAsPaid}
          isLoading={updatePaymentMutation.isPending}
        />

        <MarkAsPaidModal
          isOpen={showMarkAsPaidModal}
          onClose={() => setShowMarkAsPaidModal(false)}
          onConfirm={handleConfirmMarkAsPaid}
          isLoading={updatePaymentMutation.isPending}
        />

        <AddProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onAddProducts={handleAddProducts}
          onAddCustomProduct={handleAddCustomProduct}
          defaultTab={addProductDefaultTab}
        />

        <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
          <DialogContent className="max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Select Customer</DialogTitle>
            </DialogHeader>
            <CustomerSelector
              selectedCustomer={formData.customer}
              onSelect={handleCustomerSelect}
              variant="embedded"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showTagsModal} onOpenChange={setShowTagsModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Tags</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500">Tag management coming soon</p>
          </DialogContent>
        </Dialog>

        <OrderDiscountModal
          isOpen={showOrderDiscountModal}
          onClose={() => setShowOrderDiscountModal(false)}
          currentSubtotal={itemsNetTotal}
          currentDiscountType={formData.pricing?.orderDiscountType || ""}
          currentDiscountValue={formData.pricing?.orderDiscountValue || 0}
          currentDiscountReason={formData.pricing?.orderDiscountReason}
          onApplyDiscount={handleApplyOrderDiscount}
          currencySymbol={
            formData.currency === "USD"
              ? "$"
              : formData.currency === "EUR"
                ? "€"
                : "₹"
          }
        />

        {/* Discard edit changes confirmation */}
        <ConfirmationDialog
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          onConfirm={confirmDiscardEdits}
          title="Discard all changes?"
          description="You have unsaved edits to this order. If you exit editing mode now, all your changes will be lost."
          confirmText="Discard Changes"
          cancelText="Continue Editing"
          variant="destructive"
        />

        <ConfirmationDialog
          isOpen={showRemoveCustomerConfirm}
          onClose={() => setShowRemoveCustomerConfirm(false)}
          onConfirm={confirmRemoveCustomer}
          title="Remove customer?"
          description={`Are you sure you want to remove "${formData.customer?.name || "this customer"}" from this order? This will also clear the shipping and billing addresses.`}
          confirmText="Remove"
          cancelText="Cancel"
          variant="destructive"
        />

        {/* Delete Order Warning Modal (for deletable orders) */}
        <ConfirmationDialog
          isOpen={showDeleteWarning}
          onClose={() => setShowDeleteWarning(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Order?"
          description={`Are you sure you want to delete order "${formData.orderNumber}"? This action will permanently remove the order from the system.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          isLoading={deleteOrderMutation.isPending}
        />

        {/* Delete Order Blocked Modal (for non-deletable orders) */}
        <Dialog open={showDeleteBlocked} onOpenChange={setShowDeleteBlocked}>
          <DialogContent className="max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-red-600">Cannot Delete Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-700">
                {deleteBlockedReason}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setShowDeleteBlocked(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </UnsavedChangesGuard>
  );
}
