import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from '@/components/ui/select';
import { FormSection } from '@/components/forms';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';

export function AvailabilitySection() {
  const { control } = useFormContext<ProductSchemaData>();

  return (
    <FormSection icon={Settings} title="Availability">
      {/* Product Status */}
      <div>
        <Label htmlFor="productStatus" className="text-sm font-medium text-slate-700 mb-2 block">
          Product Status <span className="text-amber-600">*</span>
        </Label>
        <Controller
          control={control}
          name="productStatus"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="productStatus" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </FormSection>
  );
}
