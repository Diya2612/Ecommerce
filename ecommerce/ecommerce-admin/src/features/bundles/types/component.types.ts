import type { BundleItem, Bundle } from './bundle.types';

// ==================== Component Props Interfaces ====================

export interface BundleSidebarProps {
  bundle: Bundle;
  onSave: () => void;
}

export interface BundleRulesBuilderProps {
  rules: any[];
  onRulesChange: (rules: any[]) => void;
}

export interface BundlePricingProps {
  pricing: {
    priceType: 'Fixed Price' | 'Percentage Discount';
    price: number;
    discount?: number;
  };
  onPricingChange: (pricing: BundlePricingProps['pricing']) => void;
}

export interface BundlePreviewProps {
  bundle: Bundle;
}

export interface BundleListProps {
  bundles: Bundle[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface BundleItemsProps {
  items: BundleItem[];
  onItemsChange: (items: BundleItem[]) => void;
}

export interface BundleConditionalActivationProps {
  isConditional: boolean;
  conditions: any[];
  onConditionalChange: (isConditional: boolean) => void;
  onConditionsChange: (conditions: any[]) => void;
}

export interface BundleBasicDetailsProps {
  formData: Partial<Bundle>;
  handleInputChange: (field: string, value: string | number | string[]) => void;
}

export interface BundleAdvancedRulesProps {
  rules: any[];
  onRulesChange: (rules: any[]) => void;
}
