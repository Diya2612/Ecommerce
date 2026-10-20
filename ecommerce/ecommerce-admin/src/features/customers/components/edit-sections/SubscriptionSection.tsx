import { Repeat } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DateTimePicker } from '@/components/forms/inputs/datetime-picker';
import { FormSection } from '@/components/forms';
import type { CustomerFormData } from '../../types/customer.types';

interface SubscriptionSectionProps {
  formData: CustomerFormData;
  setFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  isEditing: boolean;
}

export function SubscriptionSection({ formData, setFormData, isEditing }: SubscriptionSectionProps) {
  return (
    <FormSection icon={Repeat} title="Subscription">
      {/* Subscription Plan & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Subscription Plan
          </Label>
          <Select
            value={formData.subscriptionPlan || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionPlan: value }))}
            disabled={!isEditing}
          >
            <SelectTrigger className="rounded-xl bg-slate-50">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Premium B2B">Premium B2B</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Subscription Status
          </Label>
          <Select
            value={formData.subscriptionStatus || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionStatus: value as any }))}
            disabled={!isEditing}
          >
            <SelectTrigger className="rounded-xl bg-slate-50">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="active">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-green-500"></span>
                  Active
                </span>
              </SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Cycle & Auto-Renew */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Billing Cycle
          </Label>
          <Select
            value={formData.billingCycle || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, billingCycle: value as any }))}
            disabled={!isEditing}
          >
            <SelectTrigger className="rounded-xl bg-slate-50">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Auto-Renew
          </Label>
          <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <span className="text-sm text-slate-700">
              {formData.autoRenew ? 'Enabled' : 'Disabled'}
            </span>
            <Switch
              checked={formData.autoRenew || false}
              onCheckedChange={(value) => setFormData(prev => ({ ...prev, autoRenew: value }))}
              disabled={!isEditing}
              className="scale-75 origin-right"
            />
          </div>
        </div>
      </div>

      {/* Start Date & End Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Subscription Start Date
          </Label>
          <Label className="text-sm text-muted-foreground mb-1.5 block">Start Date</Label>
          <DateTimePicker
            value={formData.subscriptionStartDate ? new Date(formData.subscriptionStartDate) : undefined}
            onChange={(date) => setFormData(prev => ({ ...prev, subscriptionStartDate: date ? date.toISOString().split('T')[0] : '' }))}
            placeholder="Select start date"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Subscription End
          </Label>
          <Label className="text-sm text-muted-foreground mb-1.5 block">End Date</Label>
          <DateTimePicker
            value={formData.subscriptionEndDate ? new Date(formData.subscriptionEndDate) : undefined}
            onChange={(date) => setFormData(prev => ({ ...prev, subscriptionEndDate: date ? date.toISOString().split('T')[0] : '' }))}
            placeholder="Select end date"
          />
        </div>
      </div>
    </FormSection>
  );
}
