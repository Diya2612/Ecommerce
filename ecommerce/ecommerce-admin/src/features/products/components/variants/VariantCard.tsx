import { ChevronUp, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VariantImageUpload } from '@/features/products/components/media';
import type { ProductVariant } from '@/features/products/types';
import { CurrencyInput } from '@/components/ui/currency-input';
import { priceValidators } from '@/features/products/utils/validators';

interface VariantCardProps {
    variant: ProductVariant;
    variantNumber: number;
    isExpanded: boolean;
    onUpdate: (field: keyof ProductVariant, value: any) => void;
    onUpdateMultiple: (updates: Partial<ProductVariant>) => void;
    onRemove: () => void;
    onToggleExpand: () => void;
    onMoveUp?: () => void;
    errors?: Record<string, string>;
    isEditMode?: boolean;
}

export function VariantCard({
    variant,
    isExpanded,
    onUpdate,
    onUpdateMultiple,
    onRemove,
    onToggleExpand,
    errors = {},
}: VariantCardProps) {
    // Validate compare_at_price >= selling_price
    // priceValidators returns an error string if invalid, or null if valid
    const priceError = priceValidators.validateCompareAtPrice(
        String(variant.compareAtPrice || ''),
        String(variant.sellingPrice || '')
    );
    const hasPriceError = !!priceError;

    // Collapsed View
    if (!isExpanded) {
        return (
            <div className="border border-slate-200 rounded-xl p-3 sm:p-4 bg-white hover:border-slate-300 transition-colors">
                <div className="flex flex-row items-center gap-3 sm:gap-4">
                    {/* Image Placeholder - Smaller on mobile */}
                    <div className="size-12 sm:size-16 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {(variant.previewUrl || variant.image) ? (
                            <img
                                src={variant.previewUrl || variant.image}
                                alt="Variant"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>

                    {/* Variant Value Only */}
                    <div className="flex-1 min-w-0">
                        <Label className="text-xs sm:text-sm font-medium text-slate-500 mb-1 block truncate">
                            {variant.optionName}
                        </Label>
                        <Input
                            placeholder={`e.g., Red`}
                            value={variant.optionValue || ''}
                            onChange={(e) => onUpdate('optionValue', e.target.value)}
                            className="h-9 rounded-lg bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-slate-300"
                        />
                        {errors[`variant-${variant.id}-optionValue`] && (
                            <p className="text-red-500 text-[10px] mt-1">{errors[`variant-${variant.id}-optionValue`]}</p>
                        )}
                    </div>

                    {/* Actions - Edit and Delete only */}
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onToggleExpand}
                            className="h-8 w-8 text-slate-400 hover:text-slate-600"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onRemove}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Expanded View - Grid Layout with Collapse Arrow, No Delete Button
    return (
        <div className="border border-slate-300 rounded-xl p-4 sm:p-6 bg-white shadow-sm transition-all animate-in fade-in zoom-in duration-200">
            {/* Grid Container: Responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto] gap-x-4 gap-y-4 sm:gap-y-6 items-start">

                {/* Header for small screens to show we are editing */}
                <div className="md:hidden flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Editing Variant</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onToggleExpand}
                        className="h-8 w-8 text-slate-400 rounded-full"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                </div>

                {/* Image - centered on mobile, spans rows on desktop */}
                <div className="md:row-span-2 flex justify-center md:block mb-2 md:mb-0 md:mr-2">
                    <VariantImageUpload
                        imageUrl={variant.previewUrl || variant.image}
                        onImageChange={(file) => {
                            if (file) {
                                const blobUrl = URL.createObjectURL(file);
                                onUpdateMultiple({
                                    imageFile: file,
                                    previewUrl: blobUrl,
                                    image: ''
                                });
                            } else {
                                if (variant.previewUrl) {
                                    URL.revokeObjectURL(variant.previewUrl);
                                }
                                onUpdateMultiple({
                                    imageFile: undefined,
                                    previewUrl: undefined,
                                    image: ''
                                });
                            }
                        }}
                    />
                </div>

                {/* Row 1: Variant Value - spans 2 columns on desktop */}
                <div className="w-full md:col-span-2">
                    <Label htmlFor={`option-value-${variant.id}`} className="text-sm font-medium text-slate-700 mb-2 block">
                        Variant Value ({variant.optionName}) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`option-value-${variant.id}`}
                        placeholder={`e.g., Red`}
                        value={variant.optionValue || ''}
                        onChange={(e) => onUpdate('optionValue', e.target.value)}
                        className="rounded-xl bg-slate-50 border-0 h-10"
                    />
                    {errors[`variant-${variant.id}-optionValue`] && (
                        <p className="text-red-500 text-xs mt-1.5">{errors[`variant-${variant.id}-optionValue`]}</p>
                    )}
                </div>

                {/* Row 1: Collapse Arrow - Hidden on mobile header, shown on desktop */}
                <div className="hidden md:flex items-start justify-end pt-8">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onToggleExpand}
                        className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                    >
                        <ChevronUp className="h-5 w-5" />
                    </Button>
                </div>

                {/* Row 2: SKU */}
                <div className="w-full">
                    <Label htmlFor={`sku-${variant.id}`} className="text-sm font-medium text-slate-700 mb-2 block">
                        SKU <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`sku-${variant.id}`}
                        placeholder="VARIANT-SKU"
                        value={variant.sku}
                        onChange={(e) => onUpdate('sku', e.target.value)}
                        className="rounded-xl bg-slate-50 border-0 h-10"
                    />
                    {errors[`variant-${variant.id}-sku`] && (
                        <p className="text-red-500 text-xs mt-1.5">{errors[`variant-${variant.id}-sku`]}</p>
                    )}
                </div>

                {/* Row 2: Barcode */}
                <div className="w-full">
                    <Label htmlFor={`barcode-${variant.id}`} className="text-sm font-medium text-slate-700 mb-2 block">
                        Barcode
                    </Label>
                    <Input
                        id={`barcode-${variant.id}`}
                        placeholder="1234567890123"
                        value={variant.barcode || ''}
                        onChange={(e) => onUpdate('barcode', e.target.value)}
                        className="rounded-xl bg-slate-50 border-0 h-10"
                    />
                </div>

                {/* Row 2: Inventory */}
                <div className="w-full md:col-start-2">
                    <Label htmlFor={`inventory-${variant.id}`} className="text-sm font-medium text-slate-700 mb-2 block">
                        Inventory <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`inventory-${variant.id}`}
                        type="number"
                        value={variant.inventoryQuantity}
                        onChange={(e) => onUpdate('inventoryQuantity', e.target.value)}
                        className="rounded-xl bg-slate-50 border-0 h-10"
                        placeholder="0"
                        min={0}
                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    />
                    {errors[`variant-${variant.id}-inventoryQuantity`] && (
                        <p className="text-red-500 text-xs mt-1.5">{errors[`variant-${variant.id}-inventoryQuantity`]}</p>
                    )}
                </div>
            </div>

            {/* Row 3: Pricing Section - Full Width Below */}
            <div className="mt-8 border-t border-slate-100 pt-6">
                <h5 className="text-xs font-semibold text-slate-700 mb-4 uppercase tracking-wide">Pricing Details</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <CurrencyInput
                        id={`cost-price-${variant.id}`}
                        label="Cost Price"
                        value={variant.costPrice || ''}
                        onChange={(value) => onUpdate('costPrice', value)}
                        required
                        error={errors[`variant-${variant.id}-costPrice`]}
                    />

                    <CurrencyInput
                        id={`selling-price-${variant.id}`}
                        label="Selling Price"
                        value={variant.sellingPrice}
                        onChange={(value) => onUpdate('sellingPrice', value)}
                        required
                        error={errors[`variant-${variant.id}-sellingPrice`]}
                    />

                    <div>
                        <CurrencyInput
                            id={`compare-price-${variant.id}`}
                            label="Compare At Price"
                            value={variant.compareAtPrice || ''}
                            onChange={(value) => onUpdate('compareAtPrice', value)}
                            error={priceError || undefined}
                        />
                        {hasPriceError && (
                            <div className="flex items-center gap-1 mt-1.5">
                                <AlertCircle className="w-3 h-3 text-red-600" />
                                <span className="text-xs text-red-600">{priceError}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
