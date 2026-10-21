/**
 * Order Types (Query Layer)
 */

export type {
  Order,
  OrderItem,
  OrderAddress,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  CreateOrderData,
  OrderSummaryResponse,
} from "@/types/order";

export type {
  CreatePaymentOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/types/payment";

export interface InvoiceData {
  id: string;
  order_id: string;
  invoice_number: string;
  status: string;
  version?: {
    id: string;
    invoice_id: string;
    version_number: number;
    pdf_url?: string;
    pdf_path?: string;
  };
}
