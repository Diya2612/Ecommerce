import { Phone, Plus, Trash2 } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomerPhone } from '../../types/customer.types';
import { phoneTypeOptions } from '../../constants/options';

interface PhoneNumbersSectionProps {
  phones: CustomerPhone[];
  handleAddPhone: () => void;
  handleRemovePhone: (id: string) => void;
  handlePhoneChange: (id: string, field: keyof CustomerPhone, value: any) => void;
  handleSetPrimaryPhone: (id: string) => void;
}

export function PhoneNumbersSection({
  phones,
  handleAddPhone,
  handleRemovePhone,
  handlePhoneChange,
  handleSetPrimaryPhone
}: PhoneNumbersSectionProps) {
  const addAction = (
    <Button onClick={handleAddPhone} size="sm" variant="outline" className="rounded-xl">
      <Plus className="size-4 mr-2" />
      Add Phone
    </Button>
  );

  return (
    <FormSection icon={Phone} title="Phone Numbers" actions={addAction}>

      <div className="space-y-3">
        {phones.map((phoneItem) => (
          <div key={phoneItem.id} className="p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-sm text-slate-500 font-medium select-none">+91</span>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneItem.phone}
                  onChange={(e) => handlePhoneChange(phoneItem.id, 'phone', e.target.value)}
                  className="rounded-xl flex-1 pl-12"
                  maxLength={10}
                />
              </div>

              <Select
                value={phoneItem.type}
                onValueChange={(value: any) => handlePhoneChange(phoneItem.id, 'type', value)}
              >
                <SelectTrigger className="rounded-xl w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {phoneTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {phones.length > 1 && (
                <button
                  onClick={() => handleRemovePhone(phoneItem.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="size-4 text-red-600" />
                </button>
              )}
            </div>

            {phoneItem.isPrimary ? (
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
                Primary
              </span>
            ) : (
              <button
                onClick={() => handleSetPrimaryPhone(phoneItem.id)}
                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Set as Primary
              </button>
            )}
          </div>
        ))}
      </div>
    </FormSection>
  );
}
