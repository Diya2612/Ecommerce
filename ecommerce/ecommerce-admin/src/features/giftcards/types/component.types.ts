import type { GiftCard } from './giftcard.types';

// ==================== List Component Props ====================

export interface GiftCardMetricsProps {
  metrics: {
    totalActive: number;
    totalRedeemed: number;
    totalValue: number;
    redemptionRate: number;
  };
}

export interface GiftCardListTableProps {
  giftCards: GiftCard[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface GiftCardListHeaderProps {
  onAddNew?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export interface GiftCardListFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

// ==================== Component Props ====================

export interface GiftCardComponentProps {
  giftCard: GiftCard;
  onUpdate: (giftCard: GiftCard) => void;
}

// ==================== Form Section Props ====================

export interface ValuePricingProps {
  value: number;
  pricing: any;
  onValueChange: (value: number) => void;
  onPricingChange: (pricing: any) => void;
}

export interface ValidityRulesProps {
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  onValidFromChange: (date: string) => void;
  onValidUntilChange: (date: string) => void;
  onUsageLimitChange: (limit: number) => void;
}

export interface StatusTrackingProps {
  status: string;
  issuedDate: string;
  redeemedDate?: string;
  onStatusChange: (status: string) => void;
}

export interface SecurityAttributesProps {
  code: string;
  pin?: string;
  onCodeChange: (code: string) => void;
  onPinChange: (pin: string) => void;
}

export interface RedemptionDataProps {
  redemptionHistory: any[];
  remainingBalance: number;
}

export interface PersonalisationOptionsProps {
  recipientName: string;
  recipientEmail: string;
  message: string;
  onRecipientNameChange: (name: string) => void;
  onRecipientEmailChange: (email: string) => void;
  onMessageChange: (message: string) => void;
}

export interface GiftCardInfoProps {
  title: string;
  description: string;
  category: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: string) => void;
}

export interface DeliveryOptionsProps {
  deliveryMethod: string;
  deliveryDate?: string;
  onDeliveryMethodChange: (method: string) => void;
  onDeliveryDateChange: (date: string) => void;
}
