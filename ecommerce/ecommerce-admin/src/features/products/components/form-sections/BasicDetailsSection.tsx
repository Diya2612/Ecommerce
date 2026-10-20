import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Package } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';

export function BasicDetailsSection() {
  const { register, control, formState: { errors } } = useFormContext<ProductSchemaData>();

  return (
    <FormSection icon={Package} title="Basic Product Details">
      <div>
        <Label htmlFor="productTitle" className="text-sm font-medium text-slate-700 mb-2 block">
          Product Title <span className="text-amber-600">*</span>
        </Label>
        <Input
          id="productTitle"
          {...register('productTitle')}
          className="rounded-xl"
          placeholder="Enter product name..."
        />
        {errors?.productTitle && (
          <p className="text-red-400 text-xs mt-1.5">{errors.productTitle.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="secondaryTitle" className="text-sm font-medium text-slate-700 mb-2 block">
          Secondary Title
        </Label>
        <Input
          id="secondaryTitle"
          {...register('secondaryTitle')}
          className="rounded-xl"
          placeholder="Alternative or subtitle..."
        />
        {errors?.secondaryTitle && (
          <p className="text-red-400 text-xs mt-1.5">{errors.secondaryTitle.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="shortDescription" className="text-sm font-medium text-slate-700 mb-2 block">
          Short Description
        </Label>
        <Textarea
          id="shortDescription"
          {...register('shortDescription')}
          rows={3}
          className="rounded-xl resize-none"
          placeholder="Brief product description (shown in listings)..."
        />
        {errors?.shortDescription && (
          <p className="text-red-400 text-xs mt-1.5">{errors.shortDescription.message}</p>
        )}
      </div>

      <div id="fullDescription">
        <Label htmlFor="fullDescription" className="text-sm font-medium text-slate-700 mb-2 block">
          Full Description <span className="text-amber-600">*</span>
        </Label>
        <Controller
          control={control}
          name="fullDescription"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Complete product description with features, benefits, and specifications..."
            />
          )}
        />
        {errors?.fullDescription && (
          <p className="text-red-400 text-xs mt-1.5">{errors.fullDescription.message}</p>
        )}
      </div>
    </FormSection>
  );
}
