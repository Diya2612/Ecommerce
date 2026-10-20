import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ROUTES } from "@/lib/constants";

import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import { useConfirmDraft } from "@/features/orders/hooks/useOrdersApi";
import { CreateOrderForm } from "@/features/orders/components";
import { DetailPageSkeleton } from "@/components/ui/loading-skeletons";

export function DraftOrderDetailPage() {
  const navigate = useNavigate();
  const { order, isLoading, isError } = useOrderDetail();
  const confirmDraft = useConfirmDraft();

  // Handle confirm draft action
  const handleConfirmDraft = () => {
    if (!order?.orderId) return;
    confirmDraft.mutate(
      { id: order.orderId, sendEmail: true },
      {
        onSuccess: () => {
          // Navigate to regular orders list after confirmation
          navigate(ROUTES.ORDERS.LIST);
        },
      },
    );
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
            {isError ? "Error Loading Draft Order" : "Draft Order Not Found"}
          </h2>
          <p className="text-slate-500 mb-6">
            {isError
              ? "There was an error loading the draft order details. Please try again."
              : "The draft order you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate(ROUTES.ORDERS.DRAFT)}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Draft Orders
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
    // Draft orders always have isDraftOrder = true
    isDraftOrder: true,
    isInternational: order.pricing?.taxType === "none",

    customer: order.customer,
    shippingAddress: order.shippingAddress || null,
    billingAddress: order.billingAddress || null,
    billingSameAsShipping:
      !order.billingAddress ||
      JSON.stringify(order.shippingAddress) ===
        JSON.stringify(order.billingAddress),

    items: order.items,

    pricing: order.pricing || {
      subtotal: order.grandTotal ?? 0,
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
      paymentMethod: "prepaid",
      grandTotal: order.grandTotal ?? 0,
      advancePaid: 0,
      balanceDue: order.grandTotal ?? 0,
    },

    fulfillmentStatus: order.fulfillmentStatus,
    deliveryPartners: order.deliveryPartners,
    trackingNumber: order.trackingNumber || "",

    paymentStatus: order.paymentStatus,
    paymentMethod: (order.pricing as any)?.paymentMethod || "prepaid",

    customerNote: order.customerNote || "",
    adminComment: order.adminComment || "",
    orderTags: order.orderTags || [],

    createdBy: order.createdBy,
    createdOn: order.createdOn,
    lastModified: order.lastModified,
    modifiedBy: order.modifiedBy,
  };

  return (
    <CreateOrderForm
      mode="edit"
      initialData={initialFormData}
      orderId={order.orderId}
      lastModified={order.lastModified}
      headerActions={
        <Button
          onClick={handleConfirmDraft}
          disabled={confirmDraft.isPending}
          className="rounded-xl bg-(--sidebar-bg) hover:bg-(--sidebar-hover) text-(--text-white)/90 h-[44px] px-6 gap-2 shadow-sm"
        >
          <CheckCircle className="size-[18px]" />
          {confirmDraft.isPending ? "Confirming..." : "Confirm Draft Order"}
        </Button>
      }
    />
  );
}

export default DraftOrderDetailPage;
