import { VariantCard } from './VariantCard';
import type { ProductVariant } from '@/features/products/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface VariantListProps {
    variants: ProductVariant[];
    onUpdateVariant: (index: number, field: keyof ProductVariant, value: any) => void;
    onUpdateVariantMultiple: (index: number, updates: Partial<ProductVariant>) => void;
    onRemoveVariant: (index: number) => void;
    errors?: Record<string, string>;
    isEditMode?: boolean;
    expandedVariantId?: string | null;
    onToggleExpand?: (id: string | null) => void;
}

export function VariantList({
    variants,
    onUpdateVariant,
    onUpdateVariantMultiple,
    onRemoveVariant,
    errors = {},
    isEditMode = false,
    expandedVariantId = null,
    onToggleExpand = () => { },
}: VariantListProps) {
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination
    const totalPages = Math.ceil(variants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVariants = variants.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Auto-scroll to correct page if expandedVariantId changes
    useEffect(() => {
        if (expandedVariantId) {
            const index = variants.findIndex(v => v.id === expandedVariantId);
            if (index !== -1) {
                const targetPage = Math.floor(index / itemsPerPage) + 1;
                if (targetPage !== currentPage) {
                    setCurrentPage(targetPage);
                }
            }
        }
    }, [expandedVariantId, variants, itemsPerPage, totalPages]);

    const handleToggleExpand = (variantId: string) => {
        onToggleExpand(expandedVariantId === variantId ? null : variantId);
    };

    return (
        <div className="space-y-4">
            {variants.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                    No variants added yet. Click "Add Variant" to create one.
                </div>
            ) : (
                <>
                    {/* List of variants for current page */}
                    {currentVariants.map((variant, index) => {
                        // Calculate actual global index for callbacks
                        const globalIndex = startIndex + index;
                        return (
                            <VariantCard
                                key={variant.id || (variant as any).key}
                                variant={variant}
                                variantNumber={globalIndex + 1}
                                isExpanded={expandedVariantId === variant.id}
                                onUpdate={(field, value) => onUpdateVariant(globalIndex, field, value)}
                                onUpdateMultiple={(updates: Partial<ProductVariant>) => onUpdateVariantMultiple(globalIndex, updates)}
                                onRemove={() => onRemoveVariant(globalIndex)}
                                onToggleExpand={() => handleToggleExpand(variant.id)}
                                errors={(() => {
                                    const variantErrors = (errors as any)?.productVariants?.[globalIndex];
                                    if (!variantErrors) return {};
                                    return {
                                        [`variant-${variant.id}-optionValue`]: variantErrors.optionValue?.message,
                                        [`variant-${variant.id}-sku`]: variantErrors.sku?.message,
                                        [`variant-${variant.id}-inventoryQuantity`]: variantErrors.inventoryQuantity?.message,
                                        [`variant-${variant.id}-costPrice`]: variantErrors.costPrice?.message,
                                        [`variant-${variant.id}-sellingPrice`]: variantErrors.sellingPrice?.message,
                                    };
                                })()}
                                isEditMode={isEditMode}
                            />
                        );
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 mt-4 gap-4">
                            <div className="text-sm text-slate-500 order-2 sm:order-1">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, variants.length)} of {variants.length} variants
                            </div>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-8 px-3 rounded-lg"
                                >
                                    Previous
                                </Button>
                                <div className="text-sm font-medium text-slate-700 mx-2 min-w-[80px] text-center">
                                    {currentPage} / {totalPages}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-8 px-3 rounded-lg"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
