export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "cancelled";
  total: number;
  deliveryDate?: string;
  trackingNumber?: string;
  items: OrderItem[];
}

export interface Address {
  id: string; // UUID from backend
  type: "Home" | "Office" | "Other";
  name: string;
  phone: string;
  addressLine: string; // legacy full string
  addressLine1: string; // structured line 1
  addressLine2?: string; // structured line 2
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string; // Backend returns UUID string
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews?: number;
  image: string;
  inStock: boolean;
  total_stock?: number;
  url?: string;
}

export interface AMCPlan {
  id: string;
  planName: string;
  productName: string;
  status: "active" | "upcoming" | "expired";
  startDate: string;
  endDate: string;
  servicesRemaining: number;
  totalServices: number;
  nextServiceDate?: string;
  lastServiceDate?: string;
  price: number;
}

export interface UserProfile {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string | null;
  display_name?: string | null;
  email: string;
  phone: string;
  dob?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  avatar?: string;
  profile_image_url?: string;
  /** True if user has a password set (email/password auth). False for OAuth or no password. */
  hasPassword?: boolean;
}

export type TabType = "orders" | "addresses" | "wishlist" | "amc" | "account";
