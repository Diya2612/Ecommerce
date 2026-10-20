import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { DiscountFormData } from '../../types/discount.types';
import { PRODUCTS, COLLECTIONS } from '../../data/discount.constants';
import { DiscountMultiSelect as MultiSelect } from '../ui/DiscountMultiSelect';

interface ExcludeProductsSectionProps {
  formData: DiscountFormData;
  updateField: <K extends keyof DiscountFormData>(field: K, value: DiscountFormData[K]) => void;
}

export const ExcludeProductsSection = ({ formData, updateField }: ExcludeProductsSectionProps) => {
  if (formData.discountType === 'shipping') return null;

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Exclude Products
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Exclude Specific Products</Label>
          <MultiSelect
            options={PRODUCTS}
            selected={formData.excludeProducts}
            onChange={(val) => updateField('excludeProducts', val)}
            placeholder="Search products to exclude..."
          />
        </div>
        <div className="space-y-2">
          <Label>Exclude Specific Collections</Label>
          <MultiSelect
            options={COLLECTIONS}
            selected={formData.excludeCollections}
            onChange={(val) => updateField('excludeCollections', val)}
            placeholder="Search collections to exclude..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
