import type { DiscountFormData } from './discount.types';

// ==================== UI Component Props ====================

export interface MultiSelectProps {
  options: string[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
}

export interface DateTimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

// ==================== List Component Props ====================

export interface DiscountMetricsProps {
  metrics: {
    totalActive: number;
    totalUsed: number;
    totalSavings: number;
    averageDiscount: number;
  };
}

export interface DiscountListTableProps {
  discounts: DiscountFormData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface DiscountListHeaderProps {
  onAddNew?: () => void;
  onExport?: () => void;
}

export interface DiscountListFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

// ==================== Component Props ====================

export interface DiscountCardProps {
  discount: DiscountFormData;
  onEdit: () => void;
  onDelete: () => void;
}

// ==================== Form Section Props ====================

export interface ValueTypeSectionProps {
  valueType: string;
  value: number;
  onValueTypeChange: (type: string) => void;
  onValueChange: (value: number) => void;
}

export interface UsageLimitsSectionProps {
  usageLimit: number;
  perCustomerLimit: number;
  onUsageLimitChange: (limit: number) => void;
  onPerCustomerLimitChange: (limit: number) => void;
}

export interface RestrictionsSectionProps {
  restrictions: any;
  onRestrictionsChange: (restrictions: any) => void;
}

export interface GeneralInfoSectionProps {
  formData: DiscountFormData;
  handleInputChange: (field: keyof DiscountFormData, value: any) => void;
}

export interface ExcludeProductsSectionProps {
  excludedProducts: string[];
  onExcludedProductsChange: (products: string[]) => void;
}

export interface DiscountCodeSettingsSectionProps {
  code: string;
  autoGenerate: boolean;
  onCodeChange: (code: string) => void;
  onAutoGenerateChange: (auto: boolean) => void;
}

export interface CustomerEligibilitySectionProps {
  eligibility: any;
  onEligibilityChange: (eligibility: any) => void;
}
