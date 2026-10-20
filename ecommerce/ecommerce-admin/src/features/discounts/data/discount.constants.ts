import { Percent, DollarSign, Package, Truck } from 'lucide-react';

export const PRODUCTS = [
  { label: "Classic White T-Shirt", value: "p1" },
  { label: "Denim Jeans - Slim Fit", value: "p2" },
  { label: "Leather Jacket", value: "p3" },
  { label: "Running Shoes", value: "p4" },
  { label: "Wireless Headphones", value: "p5" },
];

export const COLLECTIONS = [
  { label: "Summer Collection 2025", value: "c1" },
  { label: "Winter Essentials", value: "c2" },
  { label: "Accessories", value: "c3" },
  { label: "Footwear", value: "c4" },
  { label: "New Arrivals", value: "c5" },
];

export const CUSTOMERS = [
  { label: "Alice Johnson (alice@example.com)", value: "alice" },
  { label: "Bob Smith (bob@example.com)", value: "bob" },
  { label: "Charlie Brown (charlie@example.com)", value: "charlie" },
  { label: "Diana Ross (diana@example.com)", value: "diana" },
  { label: "Evan Wright (evan@example.com)", value: "evan" },
];

export const SEGMENTS = [
  { label: "VIP Customers (> $1000 spent)", value: "vip" },
  { label: "New Customers (First order)", value: "new" },
  { label: "Returning Customers", value: "returning" },
  { label: "At Risk (No order in 90 days)", value: "at-risk" },
  { label: "Wholesale", value: "wholesale" },
];

export const COUNTRIES = [
  { label: "India", value: "india" },
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "uk" },
  { label: "Canada", value: "ca" },
  { label: "Australia", value: "au" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
];

export const SHIPPING_METHODS = [
  { label: "Standard Shipping", value: "standard" },
  { label: "Express Delivery", value: "express" },
  { label: "Same Day Delivery", value: "sameday" },
  { label: "International", value: "intl" },
];

export const SHIPPING_ZONES = [
  { label: "Domestic (US)", value: "us" },
  { label: "Canada", value: "ca" },
  { label: "Europe", value: "eu" },
  { label: "Asia Pacific", value: "apac" },
];

export const PAYMENT_METHODS = [
  { label: "Cash on Delivery (COD)", value: "cod" },
  { label: "Credit Card", value: "cc" },
  { label: "PayPal", value: "paypal" },
  { label: "Bank Transfer", value: "bank" },
  { label: "Net Banking", value: "netbanking" },
  { label: "Wallets", value: "wallets" },
  { label: "UPI", value: "upi" },
];

export const SALES_CHANNELS = [
  { label: "Website", value: "web" },
  { label: "Mobile App", value: "app" },
  { label: "POS", value: "pos" },
  { label: "WhatsApp Store", value: "whatsapp" },
  { label: "Marketplace", value: "marketplace" },
];

export const TIMEZONES = [
  { label: "(GMT+00:00) UTC", value: "utc" },
  { label: "(GMT+05:30) India Standard Time", value: "ist" },
  { label: "(GMT-05:00) Eastern Time", value: "est" },
  { label: "(GMT-08:00) Pacific Time", value: "pst" },
  { label: "(GMT+01:00) Central European Time", value: "cet" },
];

export const DISCOUNT_TYPES = [
  { id: "percentage", label: "Percentage", icon: Percent, colorClass: "bg-purple-100 text-purple-700" },
  { id: "fixed", label: "Fixed Amount", icon: DollarSign, colorClass: "bg-green-100 text-green-700" },
  { id: "buy-x", label: "Buy X Get Y", icon: Package, colorClass: "bg-blue-100 text-blue-700" },
  { id: "shipping", label: "Free Ship", icon: Truck, colorClass: "bg-orange-100 text-orange-700" },
] as const;

import type { Discount } from '../types/discount.types';

export const MOCK_DISCOUNTS: Discount[] = [
  {
    id: "1",
    code: "SUMMER2025",
    title: "Summer Flash Sale",
    type: "percentage",
    value: "20%",
    status: "active",
    usage_count: 156,
    usage_limit: 500,
    starts_at: "2025-01-01T00:00:00Z",
    ends_at: "2025-03-31T23:59:59Z",
    tags: ["summer", "flash-sale"],
    admin_comment: "Summer promotion for 2025",
    created_at: "2024-12-15T10:30:00Z",
  },
  {
    id: "2",
    code: "FLAT500",
    title: "Flat ₹500 Off",
    type: "fixed",
    value: "₹500",
    status: "active",
    usage_count: 89,
    usage_limit: 200,
    starts_at: "2025-01-01T00:00:00Z",
    ends_at: null,
    tags: ["flat-discount", "fixed-amount"],
    admin_comment: "Fixed amount discount for orders above ₹2000",
    created_at: "2024-12-20T14:15:00Z",
  },
  {
    id: "3",
    code: "BUY2GET1",
    title: "Buy 2 Get 1 Free",
    type: "buy_x_get_y",
    value: "Buy 2 Get 1",
    status: "scheduled",
    usage_count: 0,
    usage_limit: 100,
    starts_at: "2025-02-01T00:00:00Z",
    ends_at: "2025-02-28T23:59:59Z",
    tags: ["buy-get", "limited-time"],
    admin_comment: "Buy 2 get 1 free offer for February",
    created_at: "2024-12-25T09:00:00Z",
  },
  {
    id: "4",
    code: "FREESHIP",
    title: "Free Shipping Weekend",
    type: "free_shipping",
    value: "Free Shipping",
    status: "expired",
    usage_count: 234,
    usage_limit: null,
    starts_at: "2024-12-01T00:00:00Z",
    ends_at: "2024-12-03T23:59:59Z",
    tags: ["free-shipping", "weekend"],
    admin_comment: "Free shipping promotion for weekend orders",
    created_at: "2024-11-25T16:45:00Z",
  },
  {
    id: "5",
    code: "NEWYEAR25",
    title: "New Year Special",
    type: "percentage",
    value: "25%",
    status: "inactive",
    usage_count: 45,
    usage_limit: 1000,
    starts_at: "2024-12-31T00:00:00Z",
    ends_at: "2025-01-07T23:59:59Z",
    tags: ["new-year", "holiday"],
    admin_comment: "New Year 2025 promotional discount",
    created_at: "2024-12-28T11:20:00Z",
  },
];
