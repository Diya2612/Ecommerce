import * as z from 'zod';

// Customer schema
const customerSchema = z.object({
  id: z.string().min(1, 'Customer ID is required'),
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  gstin: z.string().optional(),
  type: z.enum(['B2B', 'B2C']),
});

// Address schema
const addressSchema = z.object({
  id: z.string().min(1, 'Address ID is required'),
  label: z.string().min(1, 'Address label is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

// Order item schema
const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productSku: z.string().min(1, 'Product SKU is required'),
  productImage: z.string(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  costPrice: z.number().nonnegative('Price cannot be negative'),
  discountType: z.enum(['', 'percentage', 'fixed']),
  discountValue: z.number().nonnegative('Discount value cannot be negative'),
  availableStock: z.number().int().nonnegative('Stock cannot be negative'),
}).refine(
  (data) => data.quantity <= data.availableStock,
  {
    message: 'Quantity cannot exceed available stock',
    path: ['quantity'],
  }
).refine(
  (data) => {
    if (data.discountType === 'percentage') {
      return data.discountValue <= 100;
    }
    return true;
  },
  {
    message: 'Discount percentage cannot exceed 100%',
    path: ['discountValue'],
  }
);

// Order pricing schema
const pricingSchema = z.object({
  subtotal: z.number().nonnegative(),
  productDiscountsTotal: z.number().nonnegative(),
  orderDiscount: z.number().nonnegative(),
  orderDiscountType: z.enum(['', 'percentage', 'fixed']),
  orderDiscountValue: z.number().nonnegative(),

  taxType: z.enum(['cgst_sgst', 'igst', 'none']),
  cgst: z.number().nonnegative(),
  cgstRate: z.number().nonnegative().max(50),
  sgst: z.number().nonnegative(),
  sgstRate: z.number().nonnegative().max(50),
  igst: z.number().nonnegative(),
  igstRate: z.number().nonnegative().max(50),

  shippingCharge: z.number().nonnegative(),
  codCharge: z.number().nonnegative(),
  giftCardCode: z.string(),
  giftCardAmount: z.number().nonnegative(),

  grandTotal: z.number().nonnegative(),
  advancePaid: z.number().nonnegative(),
  balanceDue: z.number(),
}).refine(
  (data) => {
    if (data.orderDiscountType === 'percentage') {
      return data.orderDiscountValue <= 100;
    }
    return true;
  },
  {
    message: 'Order discount percentage cannot exceed 100%',
    path: ['orderDiscountValue'],
  }
).refine(
  (data) => data.advancePaid <= data.grandTotal,
  {
    message: 'Advance paid cannot exceed grand total',
    path: ['advancePaid'],
  }
);

// Main order validation schema
export const orderValidationSchema = z.object({
  // Order Basics
  orderNumber: z.string().min(1, 'Order number is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  orderStatus: z.enum(['draft', 'confirmed', 'paid']),
  salesChannel: z.enum(['website', 'amazon', 'flipkart', 'retail', 'whatsapp']),
  currency: z.enum(['INR', 'USD', 'EUR']),
  amazonOrderRef: z.string(),
  isDraftOrder: z.boolean(),
  isInternational: z.boolean(),

  // Customer & Addresses
  customer: customerSchema.nullable().refine((val) => val !== null, {
    message: 'Please select a customer for this order',
  }),
  shippingAddress: addressSchema.nullable().refine((val) => val !== null, {
    message: 'Please select a shipping address for this order',
  }),
  billingAddress: addressSchema.nullable().refine((val) => val !== null, {
    message: 'Please select a billing address for this order',
  }),
  billingSameAsShipping: z.boolean(),

  // Order Items
  items: z.array(orderItemSchema).min(1, 'Please add at least one product to the order'),

  // Pricing
  pricing: pricingSchema,

  // Fulfillment
  fulfillmentStatus: z.enum(['Fulfilled', 'Pending', 'Partial', 'Cancelled']),
  deliveryPartners: z.array(z.string()),
  trackingNumber: z.string(),

  // Payment
  paymentStatus: z.enum(['Paid', 'Pending', 'Overdue', 'Partially Paid']),
  paymentMethod: z.enum(['cod', 'prepaid', 'partial', 'credit']),

  // Notes & Tags
  customerNote: z.string(),
  adminComment: z.string(),
  orderTags: z.array(z.string()),

  // System Fields
  createdBy: z.string(),
  createdOn: z.string(),
  lastModified: z.string(),
  modifiedBy: z.string(),
}).refine(
  (data) => {
    // If COD payment method, ensure COD charge is present
    if (data.paymentMethod === 'cod' && data.pricing.codCharge === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'COD charge should be added for COD payment method',
    path: ['pricing', 'codCharge'],
  }
).refine(
  (data) => {
    // If gift card code is present, amount should be > 0
    if (data.pricing.giftCardCode && data.pricing.giftCardAmount === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Gift card amount is required when gift card code is provided',
    path: ['pricing', 'giftCardAmount'],
  }
).refine(
  (data) => {
    // Validate tax type based on international flag
    if (data.isInternational && data.pricing.taxType !== 'none') {
      return false;
    }
    if (!data.isInternational && data.pricing.taxType === 'none') {
      return false;
    }
    return true;
  },
  {
    message: 'Tax type must be "none" for international orders and applicable for domestic orders',
    path: ['pricing', 'taxType'],
  }
);

// Minimal order schema for quick validations (e.g., draft save)
export const minimalOrderSchema = z.object({
  orderNumber: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  salesChannel: z.enum(['website', 'amazon', 'flipkart', 'retail', 'whatsapp']),
  currency: z.enum(['INR', 'USD', 'EUR']),
  items: z.array(orderItemSchema).min(1, 'Please add at least one product to the order'),
});

export type OrderValidationSchema = z.infer<typeof orderValidationSchema>;
export type MinimalOrderSchema = z.infer<typeof minimalOrderSchema>;
