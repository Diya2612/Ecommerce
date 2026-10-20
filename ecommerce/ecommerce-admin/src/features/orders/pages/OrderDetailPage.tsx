import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Edit, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ROUTES } from "@/lib/constants";

import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import { CreateOrderForm } from "@/features/orders/components";
import {
  CreateShipmentModal,
  CollectPaymentModal,
  ProcessRefundModal,
  EditOrderConfirmModal,
} from "@/features/orders/components/dialogs";
import { DetailPageSkeleton } from "@/components/ui/loading-skeletons";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { order, isLoading, isError } = useOrderDetail();

  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  /**
   * isReadOnlyView — true  = view-only (default when opening the page)
   *                  false = edit mode (user confirmed via EditOrderConfirmModal)
   *
   * The CreateOrderForm is re-mounted whenever we flip this flag (via `key`)
   * so all unsaved local state is cleanly discarded when exiting edit mode.
   */
  const [isReadOnlyView, setIsReadOnlyView] = useState(true);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

  const handleEditOrderClick = () => {
    setShowEditConfirmModal(true);
  };

  const handleConfirmEdit = () => {
    setShowEditConfirmModal(false);
    setIsReadOnlyView(false);
  };

  /** Called by CreateOrderForm's "Discard Changes" button */
  const handleExitReadOnly = () => {
    setIsReadOnlyView(true);
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="size-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-2xl font-medium text-slate-900 mb-2">
            {isError ? "Error Loading Order" : "Order Not Found"}
          </h2>
          <p className="text-slate-500 mb-6">
            {isError
              ? "There was an error loading the order details. Please try again."
              : "The order you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate(ROUTES.ORDERS.LIST)}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  // Map Order to OrderFormData
  const initialFormData: Partial<
    import("@/features/orders/types").OrderFormData
  > = {
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    orderStatus: order.orderStatus,
    salesChannel: order.salesChannel,
    currency: order.currency,
    amazonOrderRef: order.amazonOrderRef || "",
    // If it's a draft, isDraftOrder is true. The API response usually implies this by status.
    isDraftOrder: order.orderStatus === "draft",
    isInternational: order.pricing?.taxType === "none", // Heuristic or from DB if available

    customer: order.customer,
    shippingAddress: order.shippingAddress || null,
    billingAddress: order.billingAddress || null,
    // Assuming if billing is null or matches shipping logic, but effectively default to false or infer
    billingSameAsShipping:
      !order.billingAddress ||
      JSON.stringify(order.shippingAddress) ===
        JSON.stringify(order.billingAddress),

    items: order.items,

    pricing: order.pricing || {
      // Fallback if pricing object is missing in Order type (legacy compatibility)
      subtotal: order.grandTotal ?? 0, // Approximate/Wrong, but safe fallback
      productDiscountsTotal: 0,
      orderDiscount: order.discountAmount ?? 0,
      orderDiscountType: "fixed",
      orderDiscountValue: order.discountAmount ?? 0,
      taxType: "cgst_sgst",
      cgst: 0,
      cgstRate: 0,
      sgst: 0,
      sgstRate: 0,
      igst: 0,
      igstRate: 0,
      shippingCharge: order.deliveryPrice ?? 0,
      codCharge: 0,
      giftCardCode: "",
      giftCardAmount: 0,
      paymentMethod: "prepaid", // default
      grandTotal: order.grandTotal ?? 0,
      advancePaid: 0,
      balanceDue: order.grandTotal ?? 0,
    },

    fulfillmentStatus: order.fulfillmentStatus,
    deliveryPartners: order.deliveryPartners,
    trackingNumber: order.trackingNumber || "",

    paymentStatus: order.paymentStatus,
    paymentMethod: (order.pricing as any)?.paymentMethod || "prepaid", // Cast if needed or mapped

    customerNote: order.customerNote || "",
    adminComment: order.adminComment || "",
    orderTags: order.orderTags || [],

    createdBy: order.createdBy,
    createdOn: order.createdOn,
    lastModified: order.lastModified,
    modifiedBy: order.modifiedBy,
  };

  const actionButtons = (
    <div className="flex items-center gap-2">
      {/* Edit Order — only shown in read-only mode */}
      {isReadOnlyView && (
        <>
          <Button
            variant="outline"
            className="text-[#0e042f] border-[#0e042f]/20 hover:bg-[#0e042f]/5 rounded-xl h-9 px-4 sm:px-4 hidden sm:flex"
            onClick={handleEditOrderClick}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Order
          </Button>
          <Button
            variant="outline"
            className="text-[#0e042f] border-[#0e042f]/20 hover:bg-[#0e042f]/5 rounded-xl h-9 w-9 px-0 sm:hidden"
            onClick={handleEditOrderClick}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </>
      )}

      <Button
        className="bg-[#0e042f] hover:bg-[#0e042f]/90 text-white rounded-xl h-9 px-4 sm:px-4 hidden sm:flex"
        onClick={() => setShowShipmentModal(true)}
      >
        <Truck className="w-4 h-4 mr-2" />
        Create Shipment
      </Button>
      <Button
        className="bg-[#0e042f] hover:bg-[#0e042f]/90 text-white rounded-xl h-9 w-9 px-0 sm:hidden"
        onClick={() => setShowShipmentModal(true)}
      >
        <Truck className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        className="rounded-xl h-9 px-4 sm:px-4 hidden md:flex"
        onClick={() => setShowPaymentModal(true)}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Collect Payment
      </Button>

      <Button
        variant="outline"
        className="rounded-xl h-9 px-4 sm:px-4 hidden lg:flex"
        onClick={() => setShowRefundModal(true)}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Process Refund
      </Button>

      <Button
        variant="outline"
        className="rounded-xl h-9 px-4 sm:px-4 hidden md:flex"
        onClick={() => setShowCancelConfirm(true)}
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/*
       * key={isReadOnlyView ? "view" : "edit"} re-mounts the form when switching
       * modes, cleanly resetting all unsaved state inside CreateOrderForm /
       * useOrderForm without any manual state-diffing.
       */}
      <CreateOrderForm
        key={isReadOnlyView ? "view" : "edit"}
        mode="edit"
        initialData={initialFormData}
        orderId={order.orderId}
        lastModified={order.lastModified}
        headerActions={actionButtons}
        isReadOnly={isReadOnlyView}
        onExitReadOnly={handleExitReadOnly}
      />

      <CreateShipmentModal
        isOpen={showShipmentModal}
        onClose={() => setShowShipmentModal(false)}
        orderNumber={order.orderNumber}
        items={order.items || []}
        shippingAddress={order.shippingAddress || null}
        onShipmentCreate={(data) => console.log('Create Shipment', data)}
      />

      <CollectPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderNumber={order.orderNumber}
        balanceDue={(order.pricing as any)?.balanceDue || order.grandTotal || 0}
        onPaymentRecord={(data) => console.log('Record Payment', data)}
      />

      <ProcessRefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        orderNumber={order.orderNumber}
        items={order.items || []}
        shippingCharge={(order.pricing as any)?.shippingCharge || order.deliveryPrice || 0}
        totalPaid={((order.pricing as any)?.grandTotal || order.grandTotal || 0) - ((order.pricing as any)?.balanceDue || 0)}
        onRefundProcess={(data) => console.log('Process Refund', data)}
      />

      {/* Confirm before entering edit mode */}
      <EditOrderConfirmModal
        isOpen={showEditConfirmModal}
        onClose={() => setShowEditConfirmModal(false)}
        orderNumber={order.orderNumber}
        onConfirm={handleConfirmEdit}
      />

      <ConfirmationDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => navigate(ROUTES.ORDERS.LIST)}
        title="Discard order changes?"
        description="You have unsaved changes to this order. If you leave now, all your changes will be lost."
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        variant="destructive"
      />
    </div>
  );
}

export default OrderDetailPage;
