import { Input } from '@/components/ui/input';
import { generateVariantSKU } from '@/features/products/utils/skuGenerator';
import { Label } from '@/components/ui/label';
import { DollarSign, History } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { VariantToggle } from '@/features/products/components/variants';
import { useState } from 'react';
import { InventoryHistoryDialog } from '@/features/products/components/dialogs';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DimensionInputGroup } from '@/features/products/components/inputs';
import { preventInvalidNumberInput } from '@/utils';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import type { ProductSchemaData, ProductVariantSchemaData } from '@/features/products/validation/productSchema';

interface PricingInventorySectionProps {
  productId?: string;
}

export function PricingInventorySection({ productId }: PricingInventorySectionProps) {
  const { control, setValue, formState: { errors }, register } = useFormContext<ProductSchemaData>();

  const [
    productVariants,
    sku,
    costPrice,
    sellingPrice,
    compareAtPrice,
    weight,
    length,
    breadth,
    height
  ] = useWatch({
    control,
    name: [
      'productVariants',
      'sku',
      'costPrice',
      'sellingPrice',
      'compareAtPrice',
      'weight',
      'length',
      'breadth',
      'height'
    ]
  });

  const hasVariants = productVariants && productVariants.length > 0;
  const isEditMode = !!productId;

  const handleVariantToggle = (enabled: boolean) => {
    if (enabled) {
      // Initialize with one empty variant
      const newVariant: ProductVariantSchemaData = {
        id: `variant-${Date.now()}`,
        optionName: '',
        optionValue: '',
        sku: generateVariantSKU(sku || '', 0),
        costPrice: costPrice || '',
        sellingPrice: sellingPrice || '',
        compareAtPrice: compareAtPrice || '',
        inventoryQuantity: '0',
        enabled: true
      };
      setValue('productVariants', [newVariant], { shouldDirty: true });
    } else {
      // Clear all variants
      setValue('productVariants', [], { shouldDirty: true });
    }
  };

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <InventoryHistoryDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        productId={productId}
      />
      <FormSection icon={DollarSign} title="Pricing & Inventory">

        <div className="space-y-6">
          {/* Pricing Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                control={control}
                name="costPrice"
                render={({ field }) => (
                  <CurrencyInput
                    id="costPrice"
                    label="Cost Price"
                    value={field.value || ''}
                    onChange={field.onChange}
                    required
                    error={errors?.costPrice?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="sellingPrice"
                render={({ field }) => (
                  <CurrencyInput
                    id="sellingPrice"
                    label="Selling Price"
                    value={field.value || ''}
                    onChange={field.onChange}
                    required
                    error={errors?.sellingPrice?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="compareAtPrice"
                render={({ field }) => (
                  <CurrencyInput
                    id="compareAtPrice"
                    label="Compare At Price"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors?.compareAtPrice?.message}
                    helperText={"Original price to show comparison (strikethrough)"}
                  />
                )}
              />
            </div>
          </div>

          {/* Inventory Section - always visible (base product + variants both have inventory) */}
          <div>
            <Label htmlFor="inventoryQuantity" className="text-sm font-medium text-slate-700 mb-2 block">
              Base Inventory Quantity <span className="text-amber-600">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="inventoryQuantity"
                type="number"
                {...register('inventoryQuantity')}
                className={`rounded-xl flex-1 ${isEditMode ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
                placeholder="0"
                min={0}
                readOnly={isEditMode}
                onKeyDown={preventInvalidNumberInput}
              />
              {isEditMode && (
                <div
                  className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group"
                  title="View Adjustment History"
                  onClick={() => setIsHistoryOpen(true)}
                >
                  <History className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {hasVariants
                ? "Base product inventory. Each variant also has its own inventory below."
                : "Available stock quantity for this product"
              }
            </p>
            {errors?.inventoryQuantity && (
              <p className="text-red-400 text-xs mt-1.5">{errors.inventoryQuantity.message}</p>
            )}
          </div>

          {/* Dimensions Section */}
          <DimensionInputGroup
            weight={weight}
            length={length}
            breadth={breadth}
            height={height}
            onWeightChange={(value) => setValue('weight', value, { shouldValidate: true })}
            onLengthChange={(value) => setValue('length', value, { shouldValidate: true })}
            onBreadthChange={(value) => setValue('breadth', value, { shouldValidate: true })}
            onHeightChange={(value) => setValue('height', value, { shouldValidate: true })}
          />

          {/* Product Identification Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Product Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sku" className="text-sm font-medium text-slate-700 mb-2 block">
                  SKU <span className="text-amber-600">*</span>
                </Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  readOnly={isEditMode}
                  className={`rounded-xl ${isEditMode ? 'bg-slate-50 cursor-not-allowed border-0' : ''} ${errors?.sku ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="PROD-001"
                />
                {errors?.sku && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.sku.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="hsnNumber" className="text-sm font-medium text-slate-700 mb-2 block">
                  HSN Number <span className="text-amber-600">*</span>
                </Label>
                <Input
                  id="hsnNumber"
                  {...register('hsnNumber')}
                  className={`rounded-xl ${errors?.hsnNumber ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="12345678"
                />
                {errors?.hsnNumber && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.hsnNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="barcode" className="text-sm font-medium text-slate-700 mb-2 block">
                  Barcode
                </Label>
                <Input
                  id="barcode"
                  {...register('barcode')}
                  className="rounded-xl"
                  placeholder="1234567890123"
                />
              </div>
            </div>

            {/* Variant Toggle */}
            <div className="mt-4">
              <VariantToggle
                hasVariants={!!hasVariants}
                onToggle={handleVariantToggle}
              />
            </div>
          </div>
        </div>
      </FormSection>
    </>
  );
}
