import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link as LinkIcon } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';

export function AssociationsSection() {
  const { control } = useFormContext<ProductSchemaData>();

  return (
    <FormSection icon={LinkIcon} title="Associations">
      <div className="space-y-4">
        {/* Featured Product */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div>
            <Label htmlFor="featured" className="text-sm font-medium text-slate-900">
              Featured Product
            </Label>
            <p className="text-xs text-slate-500 mt-1">
              Mark as featured product
            </p>
          </div>
          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <Switch
                id="featured"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
    </FormSection>
  );
}
