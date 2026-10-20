import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiscountFormData } from '../../types/discount.types';
import { PAYMENT_METHODS, SALES_CHANNELS } from '../../data/discount.constants';
import { DiscountMultiSelect as MultiSelect } from '../ui/DiscountMultiSelect';

interface RestrictionsSectionProps {
  formData: DiscountFormData;
  updateField: <K extends keyof DiscountFormData>(field: K, value: DiscountFormData[K]) => void;
}

export const RestrictionsSection = ({ formData, updateField }: RestrictionsSectionProps) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Restrictions & Exclusions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium text-sm">Combinable</div>
            <div className="text-xs text-muted-foreground">Can use with other discounts</div>
          </div>
          <Switch />
        </div>
        <div className="space-y-2">
          <Label>Device Restriction</Label>
          <Select defaultValue="all">
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile App Only</SelectItem>
              <SelectItem value="web">Website Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 pt-2 border-t border-dashed pt-2">
          <div className="space-y-1">
            <Label>Exclude Payment Methods</Label>
            <p className="text-xs text-muted-foreground">
              Orders using these payment methods will not be eligible.
            </p>
          </div>
          <MultiSelect
            options={PAYMENT_METHODS}
            selected={formData.excludePaymentMethods}
            onChange={(val) => updateField('excludePaymentMethods', val)}
            placeholder="Select payment methods to exclude..."
          />
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label>Exclude by Sales Channel</Label>
            <p className="text-xs text-muted-foreground">
              This discount will not be available on selected channels.
            </p>
          </div>
          <MultiSelect
            options={SALES_CHANNELS}
            selected={formData.excludeSalesChannels}
            onChange={(val) => updateField('excludeSalesChannels', val)}
            placeholder="Select sales channels to exclude..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
