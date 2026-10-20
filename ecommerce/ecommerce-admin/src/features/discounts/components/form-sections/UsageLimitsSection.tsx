import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { TIMEZONES } from '../../data/discount.constants';
import { DateTimePicker } from '@/components/forms/inputs/datetime-picker';

interface UsageLimitsSectionProps {
  formData: DiscountFormData;
  updateField: <K extends keyof DiscountFormData>(field: K, value: DiscountFormData[K]) => void;
}

export const UsageLimitsSection = ({ formData, updateField }: UsageLimitsSectionProps) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">Usage Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Total Usage Limit</Label>
            <Input
              type="number"
              placeholder="∞"
              className="h-12"
              value={formData.usageLimit}
              onChange={(e) => updateField('usageLimit', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Usage Per Day</Label>
            <Input
              type="number"
              placeholder="∞"
              value={formData.usagePerDay}
              onChange={(e) => updateField('usagePerDay', e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Limit per Customer</Label>
            <Input type="number" placeholder="1" className="h-12" />
          </div>
          <div className="space-y-2">
            <Label>Usage Per Order</Label>
            <Input
              type="number"
              placeholder="1"
              value={formData.usagePerOrder}
              onChange={(e) => updateField('usagePerOrder', e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-dashed pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base">Limit To New Customers Only</Label>
              <div className="text-xs text-muted-foreground">
                Only customers with no previous orders
              </div>
            </div>
            <Switch checked={formData.limitNewCustomers} onCheckedChange={(v) => updateField('limitNewCustomers', v)} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base">Limit To Returning Customers</Label>
              <div className="text-xs text-muted-foreground">
                Only customers with at least one previous order
              </div>
            </div>
            <Switch checked={formData.limitReturningCustomers} onCheckedChange={(v) => updateField('limitReturningCustomers', v)} />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-dashed pt-4">
          <Label>Active Dates</Label>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DateTimePicker
                value={formData.startDate ? new Date(formData.startDate) : undefined}
                onChange={(d: Date | undefined) => updateField('startDate', d)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <DateTimePicker
                value={formData.endDate ? new Date(formData.endDate) : undefined}
                onChange={(d: Date | undefined) => updateField('endDate', d)}
              />
            </div>
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(v: any) => updateField('timezone', v)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
