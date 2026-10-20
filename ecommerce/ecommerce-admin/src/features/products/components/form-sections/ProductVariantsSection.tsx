import { useState, useEffect } from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VariantList } from '@/features/products/components/variants';
import type { ProductVariant } from '@/features/products/types';
import { generateVariantSKU } from '@/features/products/utils/skuGenerator';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFormContext, useFieldArray } from 'react-hook-form';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';

const COMMON_ATTRIBUTES = [
    { label: 'Color', value: 'Color' },
    { label: 'Size', value: 'Size' },
];

interface ProductVariantsSectionProps {
    isEditMode?: boolean;
    expandedVariantId?: string | null;
    onToggleExpand?: (id: string | null) => void;
}

export function ProductVariantsSection({
    isEditMode = false,
    expandedVariantId = null,
    onToggleExpand = () => { }
}: ProductVariantsSectionProps) {
    const { control, watch } = useFormContext<ProductSchemaData>();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "productVariants",
        keyName: "key"
    });

    const sku = watch('sku');
    const hasVariants = fields && fields.length > 0;

    // We need to watch the fields to get current values for logic that depends on them,
    // because 'fields' from useFieldArray is a snapshot for rendering, not live values for logic?
    // Actually fields updates on render. But for things like "all variants optionName", we can inspect fields.
    // However, for correct "current value" logic, RHF recommends watching.
    // But for this simple logic, fields might be enough or we watch 'productVariants'.
    // watching array might be perf heavy.
    // The existing logic used formData.productVariants.

    const [deleteVariantIndex, setDeleteVariantIndex] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Local state for attribute name, initialized from first variant
    const [selectedAttribute, setSelectedAttribute] = useState<string>(() => {
        if (fields && fields.length > 0) {
            return fields[0].optionName || 'Color';
        }
        return 'Color';
    });

    // ... useEffect sync logic ...
    // Since we switched to RHF, maybe we simplify?
    // Logic: "Sync selectedAttribute when variants load or update variants if they lack a name"
    // We can keep it but use fields.

    useEffect(() => {
        if (fields && fields.length > 0) {
            const firstVariantName = fields[0].optionName;

            if (firstVariantName && firstVariantName !== selectedAttribute) {
                setSelectedAttribute(firstVariantName);
            }
            else if (!firstVariantName && selectedAttribute) {
                const needsUpdate = fields.some(v => !v.optionName);
                if (needsUpdate) {
                    fields.forEach((v, index) => {
                        if (!v.optionName) {
                            update(index, { ...v, optionName: selectedAttribute });
                        }
                    });
                }
            }
        }
    }, [fields, selectedAttribute, update]);

    const handleGlobalNameChange = (newName: string) => {
        setSelectedAttribute(newName);

        if (fields && fields.length > 0) {
            fields.forEach((v, index) => {
                update(index, { ...v, optionName: newName });
            });
        }
    };

    const handleAddVariant = () => {
        const nextIndex = fields.length;
        const variantSku = generateVariantSKU(sku, nextIndex);

        const newVariant: any = { // Cast to any or ProductVariantSchemaData
            id: `variant-${Date.now()}`,
            optionName: selectedAttribute,
            optionValue: '',
            sku: variantSku,
            barcode: '',
            costPrice: '',
            sellingPrice: '',
            compareAtPrice: '',
            inventoryQuantity: '0',
            enabled: true
        };

        append(newVariant);
    };

    const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        update(index, { ...fields[index], [field]: value });
    };

    const handleUpdateVariantMultiple = (index: number, updates: Partial<ProductVariant>) => {
        update(index, { ...fields[index], ...updates });
    };

    const handleRemoveVariant = (index: number) => {
        setDeleteVariantIndex(index);
        setShowDeleteDialog(true);
    };

    const confirmDeleteVariant = () => {
        if (deleteVariantIndex === null) return;
        remove(deleteVariantIndex);
        setShowDeleteDialog(false);
        setDeleteVariantIndex(null);
    };

    if (!hasVariants) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="size-5 text-icon-muted" />
                    <h2 className="font-semibold text-slate-900">Product Variants</h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Attribute:</span>
                        <Select value={selectedAttribute} onValueChange={handleGlobalNameChange}>
                            <SelectTrigger className="w-[120px] sm:w-[140px] h-9 rounded-xl border-slate-200">
                                <SelectValue placeholder="Select attribute" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMON_ATTRIBUTES.map((attr) => (
                                    <SelectItem key={attr.value} value={attr.value}>
                                        {attr.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="button" variant="outline" onClick={handleAddVariant} className="rounded-xl h-9 flex-1 sm:flex-none">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Variant
                    </Button>
                </div>
            </div>

            {/* Variant List */}
            <VariantList
                variants={fields as unknown as ProductVariant[]} // Cast RHF fields to ProductVariant
                onUpdateVariant={handleUpdateVariant}
                onUpdateVariantMultiple={handleUpdateVariantMultiple}
                onRemoveVariant={handleRemoveVariant}
                errors={useFormContext<ProductSchemaData>().formState.errors as any}
                isEditMode={isEditMode}
                expandedVariantId={expandedVariantId}
                onToggleExpand={onToggleExpand}
            />

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDeleteVariant}
                title="Delete Variant"
                description="Are you sure you want to delete this variant? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}
