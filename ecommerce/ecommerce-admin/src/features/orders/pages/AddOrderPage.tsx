import { useLocation } from "react-router-dom";
import { CreateOrderForm } from "../components";
import type { OrderFormData } from "../types";

export default function AddOrderPage() {
  const location = useLocation();
  const duplicateData = location.state?.duplicateOrder as
    | Partial<OrderFormData>
    | undefined;

  const sourceOrderNumber = duplicateData?.orderNumber;

  const initialData = duplicateData
    ? ({
      ...duplicateData,
      orderNumber: "", // New order gets new number
      orderStatus: "draft", // Reset to draft
      isDraftOrder: true,
      paymentStatus: "pending",
      fulfillmentStatus: "unfulfilled",
      createdOn: undefined,
      lastModified: undefined,
      createdBy: undefined,
      modifiedBy: undefined,
    } as Partial<OrderFormData>)
    : undefined;

  return (
    <CreateOrderForm
      mode="create"
      initialData={initialData}
      sourceOrderNumber={sourceOrderNumber}
    />
  );
}
