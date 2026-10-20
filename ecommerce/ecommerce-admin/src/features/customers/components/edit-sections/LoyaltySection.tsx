import { Award, Calendar } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CustomerFormData } from '../../types/customer.types';

interface LoyaltySectionProps {
  formData: CustomerFormData;
  setFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  isEditing: boolean;
}

export function LoyaltySection({ formData, setFormData, isEditing }: LoyaltySectionProps) {
  return (
    <FormSection icon={Award} title="Loyalty Program">

      <div className="space-y-4">
        {/* Loyalty Program Enrolled & Tier */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Loyalty Program Enrolled
            </Label>
            <div className="flex-1 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-medium text-slate-900 block">
                  {formData.loyaltyEnrolled ? 'Active Member' : 'Not Enrolled'}
                </span>
                {formData.loyaltyEnrolled && (
                  <span className="text-xs text-slate-600">Enrolled</span>
                )}
              </div>
              <Switch
                checked={formData.loyaltyEnrolled || false}
                onCheckedChange={(value) => setFormData(prev => ({ ...prev, loyaltyEnrolled: value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Loyalty Points
            </Label>
            <div className="flex-1 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 flex flex-col justify-center">
              <p className="text-3xl font-bold text-amber-600">
                {formData.loyaltyPoints || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">Auto-calculated</p>
            </div>
          </div>
        </div>

        {/* Loyalty Points & Enrollment Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Loyalty Tier
            </Label>
            <Select
              value={formData.loyaltyTier || 'Bronze'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, loyaltyTier: value }))}
              disabled={!isEditing}
            >
              <SelectTrigger className="rounded-xl bg-slate-50">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Gold">
                  <span className="flex items-center gap-2">
                    <span className="text-yellow-600">★</span>
                    Gold
                  </span>
                </SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Enrollment Date
            </Label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    type="button"
                    disabled={!isEditing || !formData.loyaltyEnrolled}
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl bg-slate-50 border-slate-200",
                      !formData.loyaltyEnrollmentDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                    {formData.loyaltyEnrollmentDate ? (
                      format(new Date(formData.loyaltyEnrollmentDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.loyaltyEnrollmentDate ? new Date(formData.loyaltyEnrollmentDate) : undefined}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, loyaltyEnrollmentDate: date.toISOString() }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
