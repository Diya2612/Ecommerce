import {
  makeGetRequestWithParams,
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  OrderFormData,
  OrdersQueryParams,
} from "../types";
import type {
  OrdersListResponse,
  OrderDetailsResponse,
  DraftOrdersResponse,
  OrderMetricsResponse,
  UpdateFulfillmentRequest,
  UpdatePaymentRequest,
  UpdateTrackingRequest,
  ConfirmDraftRequest,
  UpdateOrderStatusRequest,
} from "./ordersApi.types";
import type {
  AbandonedCartsListResponse,
  AbandonedCartDetailsResponse,
  AbandonedCartsMetricsResponse,
  AbandonedCartsQueryParams,
  SendRecoveryEmailRequest,
} from "./abandonedCartsApi.types";
import { logger } from '@/lib/utils/logger';

// Product Selection interfaces
export interface ProductVariantSelection {
  id: string; // variant_id or product_id
  product_id: string;
  product_title: string;
  variant_option?: string; // e.g., "Size: Medium"
  sku: string;
  selling_price: string;
  cost_price?: string;
  primary_image_url: string | null;
  category_tier_1: string | null;
  inventory_quantity: number;
  is_variant: boolean;
  variant_id?: string;
}

export interface ProductSelectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSelectionResponse {
  products: ProductVariantSelection[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Mapper interfaces and functions
interface CreateOrderRequest {
  user_id?: string;
  shipping_address_id?: string;
  billing_address_id?: string;
  shipping_state: string;
  billing_state: string;
  channel?: "web" | "app" | "pos" | "marketplace" | "other";
  is_draft?: boolean;
  is_international?: boolean;
  amz_order_id?: string;
  currency?: string;
  payment_method?: string;
  advance_paid_amount?: number;
  customer_note?: string;
  admin_comment?: string;
  tags?: string[];
  discount_code?: string;
  discount_type?: 'percent' | 'amount' | 'none';
  discount_value?: number;
  discount_reason?: string;
  giftcard_code?: string;
  shipping_amount?: number;
  delivery_price?: number;
  items: CreateOrderItemRequest[];
}

interface CreateOrderItemRequest {
  product_id?: string;
  is_custom?: boolean;
  quantity: number;
  unit_price: number;
  cost_price?: number;
  product_name: string;
  sku: string;
  product_image?: string;
  discount_percentage?: number;
  discount_amount?: number;
  discount_reason?: string;
  tax_percentage?: number;
  line_total: number;
  variant_id?: string;
}

// Mapper functions
function mapSalesChannel(channel: string): CreateOrderRequest["channel"] {
  switch (channel) {
    case "website":
      return "web";
    case "amazon":
      return "marketplace";
    case "flipkart":
      return "marketplace";
    case "retail":
      return "pos";
    case "whatsapp":
      return "other";
    default:
      return "web";
  }
}

function mapOrderItems(items: import("../types").OrderItem[]): CreateOrderItemRequest[] {
  return items.map((item) => ({
    product_id: item.productId || undefined,
    is_custom: item.isCustom || !item.productId,
    quantity: item.quantity,
    unit_price: item.costPrice,
    cost_price: item.costPrice,
    product_name: item.productName,
    sku: item.productSku || '',
    product_image: item.productImage || undefined,
    discount_percentage: item.discountType === 'percentage' ? item.discountValue : undefined,
    discount_amount: item.discountType === 'fixed' ? item.discountValue : undefined,
    discount_reason: item.discountReason || undefined,
    line_total: item.costPrice * item.quantity,
    variant_id: item.variantId,
  }));
}

function getStateCode(address: any): string {
  if (address?.state && address.state.length === 2) {
    return address.state.toUpperCase();
  }
  
  const stateMap: Record<string, string> = {
    'maharashtra': 'MH',
    'delhi': 'DL',
    'karnataka': 'KA',
    'tamil nadu': 'TN',
    'gujarat': 'GJ',
    'rajasthan': 'RJ',
    'west bengal': 'WB',
    'madhya pradesh': 'MP',
    'uttar pradesh': 'UP',
    'bihar': 'BR',
    'andhra pradesh': 'AP',
    'telangana': 'TG',
    'kerala': 'KL',
    'punjab': 'PB',
    'haryana': 'HR',
  };
  
  const stateLower = (address?.state || '').toLowerCase().trim();
  return stateMap[stateLower] || 'MH';
}

function mapFormToCreateRequest(
  form: import("../types").OrderFormData,
): CreateOrderRequest {
  return {
    user_id: form.customer?.id || undefined,
    shipping_address_id: form.shippingAddress?.id || undefined,
    billing_address_id: form.billingAddress?.id || undefined,
    shipping_state: getStateCode(form.shippingAddress),
    billing_state: getStateCode(form.billingAddress || form.shippingAddress),
    channel: mapSalesChannel(form.salesChannel),
    is_draft: form.isDraftOrder,
    is_international: form.isInternational,
    amz_order_id: form.amazonOrderRef || undefined,
    currency: form.currency,
    payment_method: form.paymentMethod || 'cod',
    advance_paid_amount: form.pricing.advancePaid || 0,
    customer_note: form.customerNote || undefined,
    admin_comment: form.adminComment || undefined,
    tags: form.orderTags.length > 0 ? form.orderTags : undefined,
    discount_type: form.pricing.orderDiscountType === 'percentage' ? 'percent' 
      : form.pricing.orderDiscountType === 'fixed' ? 'amount' 
      : 'none',
    discount_value: form.pricing.orderDiscountValue || 0,
    discount_reason: form.pricing.orderDiscountReason || undefined,
    shipping_amount: form.pricing.shippingCharge || 0,
    delivery_price: form.pricing.shippingCharge || 0,
    items: mapOrderItems(form.items),
  };
}

// Simplified mapper functions (types need to be aligned)
function mapApiToOrder(apiOrder: any): any {
  // Simplified mapping to avoid type conflicts
  return {
    orderId: apiOrder.id,
    orderNumber: apiOrder.order_number,
    orderDate: apiOrder.created_at,
    orderStatus: apiOrder.order_status,
    customer: apiOrder.customer || {
      id: apiOrder.user_id || '',
      name: apiOrder.customer_name || 'Guest',
      email: apiOrder.customer_email || '',
      phone: '',
      type: 'B2C',
    },
    items: apiOrder.items || [],
    itemsCount: apiOrder.total_quantity || 0,
    grandTotal: parseFloat(apiOrder.total_amount || '0'),
    currency: 'INR',
    pricing: {
      subtotal: parseFloat(apiOrder.subtotal || apiOrder.total_amount || '0'),
      productDiscountsTotal: 0,
      orderDiscount: parseFloat(apiOrder.discount_amount || '0'),
      orderDiscountType: '',
      orderDiscountValue: 0,
      taxType: 'cgst_sgst',
      cgst: 0,
      cgstRate: 0,
      sgst: 0,
      sgstRate: 0,
      igst: 0,
      igstRate: 0,
      shippingCharge: 0,
      codCharge: 0,
      giftCardCode: '',
      giftCardAmount: 0,
      paymentMethod: 'prepaid',
      grandTotal: parseFloat(apiOrder.total_amount || '0'),
      advancePaid: 0,
      balanceDue: 0,
    },
    fulfillmentStatus: 'unfulfilled',
    deliveryPartners: [],
    trackingNumber: '',
    paymentStatus: 'pending',
    salesChannel: 'website',
    amazonOrderRef: '',
    shippingAddress: apiOrder.shipping_address,
    billingAddress: apiOrder.billing_address,
    customerNote: apiOrder.customer_note || '',
    adminComment: apiOrder.admin_comment || '',
    orderTags: [],
    createdBy: apiOrder.created_by || apiOrder.created_at,
    createdOn: apiOrder.created_at,
    lastModified: apiOrder.updated_at || apiOrder.created_at,
    modifiedBy: apiOrder.updated_by || apiOrder.created_at,
  };
}

function mapApiToAbandonedOrder(apiCart: any): any {
  return {
    id: apiCart.cart_id,
    cartId: `CART-${apiCart.cart_id?.slice(0, 8).toUpperCase()}`,
    customerName: apiCart.customer_info?.name || "Guest",
    email: apiCart.customer_info?.email || "",
    phone: apiCart.customer_info?.phone || "",
    products: (apiCart.items || []).map((item: any) => ({
      id: item.id,
      name: item.product_name,
      quantity: item.quantity,
      price: parseFloat(item.final_price) || 0,
    })),
    cartValue: parseFloat(apiCart.cart_value) || 0,
    abandonedAt: apiCart.abandoned_at,
    lastActivity: apiCart.last_activity,
    recoveryStatus: apiCart.recovery_status,
    emailSentAt: apiCart.recovery_email_sent_at,
    channel: apiCart.channel || "web",
  };
}

export const orderService = {
  /**
   * Get all orders with optional filtering and pagination
   */
  async getOrders(params?: OrdersQueryParams): Promise<OrdersListResponse> {
    const response = await makeGetRequestWithParams<OrdersListResponse>(
      API_ROUTES.ORDERS.BASE,
      params || {},
    );
    return response.data;
  },

  /**
   * Get a single order by ID
   */
  async getOrderById(id: string): Promise<OrderDetailsResponse> {
    const response = await makeGetRequest<OrderDetailsResponse>(
      API_ROUTES.ORDERS.BY_ID(id),
    );
    return response.data;
  },

  /**
   * Create a new order
   */
  async createOrder(data: OrderFormData): Promise<{ data: any }> {
    // Map frontend form data to backend API format
    const mappedData = mapFormToCreateRequest(data);
    const response = await makePostRequest<{ data: any }>(
      API_ROUTES.ORDERS.CREATE,
      mappedData,
    );
    return response.data;
  },

  /**
   * Update an existing order
   */
  async updateOrder(
    id: string,
    data: Partial<OrderFormData>,
  ): Promise<{ data: any }> {
    // Map frontend form data to backend API format
    const mappedData = mapFormToCreateRequest(data as OrderFormData);
    const response = await makePutRequest<{ data: any }>(
      API_ROUTES.ORDERS.BY_ID(id),
      mappedData,
    );
    return response.data;
  },

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<void> {
    await makeDeleteRequest<void>(API_ROUTES.ORDERS.BY_ID(id));
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusRequest,
  ): Promise<{ data: OrderFormData }> {
    const response = await makePutRequest<{ data: OrderFormData }>(
      API_ROUTES.ORDERS.STATUS(id),
      data,
    );
    return response.data;
  },

  /**
   * Update fulfillment status
   */
  async updateFulfillmentStatus(id: string, data: UpdateFulfillmentRequest) {
    const response = await makePutRequest(
      API_ROUTES.ORDERS.FULFILLMENT(id),
      data,
    );
    return response.data;
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, data: UpdatePaymentRequest) {
    const response = await makePutRequest(API_ROUTES.ORDERS.PAYMENT(id), data);
    return response.data;
  },

  /**
   * Update tracking information
   */
  async updateTracking(id: string, data: UpdateTrackingRequest) {
    const response = await makePutRequest(API_ROUTES.ORDERS.TRACKING(id), data);
    return response.data;
  },

  /**
   * Get draft orders
   */
  async getDraftOrders(
    params?: OrdersQueryParams,
  ): Promise<DraftOrdersResponse> {
    const response = await makeGetRequestWithParams<DraftOrdersResponse>(
      API_ROUTES.ORDERS.DRAFTS,
      params || {},
    );
    return response.data;
  },

  /**
   * Confirm draft order
   */
  async confirmDraftOrder(id: string, data?: ConfirmDraftRequest) {
    const response = await makePostRequest(
      API_ROUTES.ORDERS.CONFIRM_DRAFT(id),
      data || { send_confirmation_email: true },
    );
    return response.data;
  },

  /**
   * Get order metrics/statistics
   */
  async getOrderMetrics(): Promise<OrderMetricsResponse> {
    const response = await makeGetRequest<OrderMetricsResponse>(
      API_ROUTES.ORDERS.METRICS,
    );
    return response.data;
  },

  /**
   * Create a payment order (Razorpay)
   */
  async createPaymentOrder(data: { orderId: string, paymentMethod: string }): Promise<any> {
    const response = await makePostRequest<any>(
      API_ROUTES.ORDERS.CREATE_PAYMENT_ORDER,
      data
    );
    return response.data.data;  // Unwrap inner data from { success, data, message } wrapper
  },

  /**
   * Verify payment signature
   */
  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<any> {
    const response = await makePostRequest<any>(
      API_ROUTES.ORDERS.VERIFY_PAYMENT,
      data
    );
    return response.data;
  },

  // ============================================
  // Phase 3 - Enhanced Order APIs
  // ============================================

  /**
   * Duplicate an existing order as a draft
   */
  async duplicateOrder(id: string): Promise<{ order: any }> {
    const response = await makePostRequest<{ order: any }>(
      API_ROUTES.ORDERS.DUPLICATE(id),
      {},
    );
    return response.data;
  },

  /**
   * Bulk delete orders
   */
  async bulkDeleteOrders(order_ids: string[]): Promise<{
    success: boolean;
    data: {
      deleted_count: number;
      order_ids: string[];
    };
    message: string;
  }> {
    const response = await makeDeleteRequest<{
      success: boolean;
      data: {
        deleted_count: number;
        order_ids: string[];
      };
      message: string;
    }>(API_ROUTES.ORDERS.BULK_DELETE, { order_ids });
    return response.data;
  },

  /**
   * Search products for order creation
   */
  async searchProducts(params: {
    query?: string;
    limit?: number;
    check_stock?: boolean;
  }): Promise<{
    products: Array<{
      id: string;
      name: string;
      sku: string;
      price: string;
      stock_quantity: number;
      image_url?: string;
    }>;
  }> {
    const response = await makeGetRequestWithParams<{
      products: Array<{
        id: string;
        name: string;
        sku: string;
        price: string;
        stock_quantity: number;
        image_url?: string;
      }>;
    }>(API_ROUTES.ORDERS.SEARCH_PRODUCTS, params);
    return response.data;
  },

  /**
   * Get all order tags
   */
  async getOrderTags(): Promise<{
    tags: Array<{ id: string; name: string; color?: string }>;
  }> {
    const response = await makeGetRequest<{
      tags: Array<{ id: string; name: string; color?: string }>;
    }>(API_ROUTES.ORDERS.TAGS);
    return response.data;
  },

  /**
   * Create a new order tag
   */
  async createOrderTag(data: {
    name: string;
    color?: string;
  }): Promise<{ tag: { id: string; name: string; color?: string } }> {
    const response = await makePostRequest<{
      tag: { id: string; name: string; color?: string };
    }>(API_ROUTES.ORDERS.CREATE_TAG, data);
    return response.data;
  },

  /**
   * Get stock levels for multiple products (for real-time validation)
   * Returns effective_stock = available_quantity - reserved_quantity
   */
  async getStockBatch(productIds: string[]): Promise<{
    stock: Array<{
      product_id: string;
      available_quantity: number;
      reserved_quantity: number;
      effective_stock: number;
    }>;
  }> {
    if (productIds.length === 0) {
      return { stock: [] };
    }
    const response = await makeGetRequestWithParams<{
      stock: Array<{
        product_id: string;
        available_quantity: number;
        reserved_quantity: number;
        effective_stock: number;
      }>;
    }>(API_ROUTES.ORDERS.STOCK_BATCH, { product_ids: productIds.join(',') });
    return response.data;
  },

  // Abandoned Carts functionality
  /**
   * Get all abandoned carts with optional filtering and pagination
   */
  async getAbandonedCarts(
    params?: AbandonedCartsQueryParams,
  ): Promise<AbandonedCartsListResponse> {
    const response = await makeGetRequestWithParams<AbandonedCartsListResponse>(
      API_ROUTES.ABANDONED_CARTS.BASE,
      params || {},
    );
    return response.data;
  },

  /**
   * Get a single abandoned cart by ID
   */
  async getAbandonedCartById(
    id: string,
  ): Promise<AbandonedCartDetailsResponse> {
    const response = await makeGetRequest<AbandonedCartDetailsResponse>(
      API_ROUTES.ABANDONED_CARTS.BY_ID(id),
    );
    return response.data;
  },

  /**
   * Send recovery email to a single cart or multiple carts
   */
  async sendRecoveryEmail(
    data: SendRecoveryEmailRequest,
  ): Promise<{ success: boolean; message: string }> {
    const response = await makePostRequest<{
      success: boolean;
      message: string;
    }>(API_ROUTES.ABANDONED_CARTS.SEND_EMAILS, data);
    return response.data;
  },

  /**
   * Get email templates for abandoned cart recovery
   */
  async getEmailTemplates(): Promise<{
    templates: Array<{
      id: string;
      name: string;
      subject: string;
      category: string;
    }>;
  }> {
    const response = await makeGetRequest<{
      templates: Array<{
        id: string;
        name: string;
        subject: string;
        category: string;
      }>;
    }>(API_ROUTES.ABANDONED_CARTS.EMAIL_TEMPLATES);
    return response.data;
  },

  /**
   * Get abandoned carts metrics
   */
  async getAbandonedCartsMetrics(): Promise<AbandonedCartsMetricsResponse> {
    const response = await makeGetRequest<AbandonedCartsMetricsResponse>(
      API_ROUTES.ABANDONED_CARTS.METRICS,
    );
    return response.data;
  },

  // Product Selection functionality
  /**
   * Fetch products with variants expanded as individual rows for order creation
   */
  async getProductsForSelection(
    params: ProductSelectionQueryParams
  ): Promise<ProductSelectionResponse> {
    try {
      logger.debug('[OrderService] Fetching products for selection with params', params);

      // Fetch products from the main products API
      const response = await makeGetRequestWithParams<{
        data: {
          products: any[];
          total: number;
          totalPages: number;
          currentPage: number;
        };
      }>(API_ROUTES.PRODUCTS.BASE, params);

      const { products, total: _total, currentPage } = response.data.data;

      // Transform products - expand variants into separate items
      const expandedProducts: ProductVariantSelection[] = [];

      for (const product of products) {
        // Fetch detailed product data to get variants
        const detailResponse = await makeGetRequestWithParams<{ data: any }>(
          API_ROUTES.PRODUCTS.BY_ID(product.id),
          {}
        );

        const productDetail = detailResponse.data.data;
        const hasVariants = productDetail.has_variants && productDetail.variants?.length > 0;

        if (hasVariants) {
          // Add each variant as a separate row
          for (const variant of productDetail.variants) {
            expandedProducts.push({
              id: variant.id, // Use variant ID for selection
              product_id: product.id,
              product_title: product.product_title,
              variant_option: `${variant.option_name}: ${variant.option_value}`,
              sku: variant.sku,
              selling_price: variant.selling_price,
              cost_price: variant.cost_price,
              primary_image_url: variant.image_url || product.primary_image_url,
              category_tier_1: product.category_tier_1,
              inventory_quantity: variant.inventory_quantity || 0,
              is_variant: true,
              variant_id: variant.id,
            });
          }
        } else {
          // Add product as single item
          expandedProducts.push({
            id: product.id,
            product_id: product.id,
            product_title: product.product_title,
            sku: product.sku,
            selling_price: product.selling_price,
            cost_price: product.cost_price,
            primary_image_url: product.primary_image_url,
            category_tier_1: product.category_tier_1,
            inventory_quantity: product.inventory_quantity || 0,
            is_variant: false,
          });
        }
      }

      // Calculate total based on expanded products
      // Note: This is an approximation since we're expanding on the current page only
      const totalPages = Math.ceil(expandedProducts.length / (params.limit || 10));

      return {
        products: expandedProducts,
        total: expandedProducts.length,
        totalPages,
        currentPage,
      };
    } catch (error) {
      logger.error('[OrderService] Error fetching products for selection', error);
      throw error;
    }
  },
};

// Export mapper functions for external use
export { mapApiToOrder, mapApiToAbandonedOrder };
