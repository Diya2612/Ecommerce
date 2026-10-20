export interface GiftCard {
  id: string;
  code: string;
  title: string;
  description: string;
  value: number;
  balance: number;
  status: "active" | "inactive" | "expired" | "redeemed";
  recipient_email: string | null;
  recipient_name: string | null;
  sender_name?: string;
  sender_email?: string;
  message?: string;
  expires_at: string | null;
  created_at: string;
  redemption_count: number;
  currency?: string;
}

export interface GiftCardFormData {
  code: string;
  title: string;
  category: string;
  type: "fixed" | "variable";
  value: string;
  price: string;
  currency: string;
  taxApplicable: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
  minOrderValue: string;
  multipleCards: boolean;
  usageType: "one-time" | "multiple";
  status: "active" | "inactive" | "expired" | "redeemed";
  senderName: string;
  receiverName: string;
  message: string;
  emailTemplate: string;
  deliveryMethod: "email" | "pdf" | "both";
  receiverEmail: string;
  scheduleDelivery: boolean;
  securityPin: string;
}

export interface GiftCardQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GiftCardStats {
  totalCards: number;
  activeCards: number;
  redeemedCards: number;
  expiredCards: number;
  totalValue: number;
  redeemedValue: number;
  averageValue: number;
}

export interface GiftCardApiResponse {
  data: GiftCard[];
  total: number;
  page: number;
  limit: number;
  stats?: GiftCardStats;
}