import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiscountFormData } from '../../types/discount.types';
import { CUSTOMERS, SEGMENTS, COUNTRIES } from '../../data/discount.constants';
import { DiscountMultiSelect as MultiSelect } from '../ui/DiscountMultiSelect';

interface CustomerEligibilitySectionProps {
  formData: DiscountFormData;
  updateField: <K extends keyof DiscountFormData>(field: K, value: DiscountFormData[K]) => void;
}

export const CustomerEligibilitySection = ({ formData, updateField }: CustomerEligibilitySectionProps) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Customer Eligibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Target Audience</Label>
          <Select value={formData.targetAudience} onValueChange={(v: any) => updateField('targetAudience', v)}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="segments">Specific Customer Segments</SelectItem>
              <SelectItem value="specific">Specific Customers</SelectItem>
            </SelectContent>
          </Select>
          {formData.targetAudience === "specific" && (
            <div className="pt-2">
              <MultiSelect
                options={CUSTOMERS}
                selected={formData.selectedCustomers}
                onChange={(val) => updateField('selectedCustomers', val)}
                placeholder="Select customers"
              />
            </div>
          )}
          {formData.targetAudience === "segments" && (
            <div className="pt-2">
              <MultiSelect
                options={SEGMENTS}
                selected={formData.selectedSegments}
                onChange={(val) => updateField('selectedSegments', val)}
                placeholder="Select segments"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Geographic Restrictions</Label>
          <Select value={formData.geoRestriction} onValueChange={(v: any) => updateField('geoRestriction', v)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select countries/regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Restrictions</SelectItem>
              <SelectItem value="specific-regions">Specific Countries / Regions</SelectItem>
            </SelectContent>
          </Select>
          {formData.geoRestriction === "specific-regions" && (
            <div className="pt-2">
              <MultiSelect
                options={COUNTRIES}
                selected={formData.selectedCountries}
                onChange={(val) => updateField('selectedCountries', val)}
                placeholder="Select countries"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
