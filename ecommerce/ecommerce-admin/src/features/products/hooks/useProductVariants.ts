import { useState } from 'react';
import type { ProductVariant } from '@/features/products/types';
import { priceValidators } from '../utils/validators';

/**
 * Hook for managing product variants
 * Handles adding, removing, updating, and validating variants
 * 
 * Note: UI state (accordion expansion) should be managed at the component level
 * 
 * @param initialVariants - Initial product variants
 * @returns Variant state and handlers
 * 
 * @example
 * ```tsx
 * const { variants, addVariant, removeVariant, updateVariant } = useProductVariants(initialData?.productVariants);
 * ```
 */
export function useProductVariants(initialVariants: ProductVariant[] = []) {
    const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);

    /**
     * Add a new empty variant
     * Returns the new variant ID for UI expansion if needed
     */
    const addVariant = (): string => {
        const newVariant: ProductVariant = {
            id: `variant-${Date.now()}`,
            optionName: '',
            optionValue: '',
            sku: '',
            barcode: '',
            costPrice: '',
            sellingPrice: '',
            compareAtPrice: '',
            inventoryQuantity: '0',
            enabled: true,
        };
        setVariants(prev => [...prev, newVariant]);
        return newVariant.id;
    };

    /**
     * Remove a variant by ID
     */
    const removeVariant = (id: string) => {
        setVariants(prev => prev.filter(variant => variant.id !== id));
    };

    /**
     * Update a specific field of a variant
     */
    const updateVariant = <K extends keyof ProductVariant>(
        id: string,
        field: K,
        value: ProductVariant[K]
    ) => {
        setVariants(prev => prev.map(variant =>
            variant.id === id ? { ...variant, [field]: value } : variant
        ));
    };

    /**
     * Update multiple fields of a variant at once
     */
    const updateVariantFields = (id: string, updates: Partial<ProductVariant>) => {
        setVariants(prev => prev.map(variant =>
            variant.id === id ? { ...variant, ...updates } : variant
        ));
    };

    /**
     * Validate variants
     * Returns error object keyed by variant-{id}-{field}
     */
    const validateVariants = (): Record<string, string> => {
        const errors: Record<string, string> = {};

        variants.forEach((variant) => {
            // Option name/value validation
            if (!variant.optionName?.trim()) {
                errors[`variant-${variant.id}-optionName`] = 'Variant Name is required';
            }
            if (!variant.optionValue?.trim()) {
                errors[`variant-${variant.id}-optionValue`] = 'Variant Value is required';
            }
            if (!variant.sku?.trim()) {
                errors[`variant-${variant.id}-sku`] = 'Variant SKU is required';
            }

            // Use shared price validators
            const sellingError = priceValidators.validatePrice(
                variant.sellingPrice || '',
                'Variant Selling Price'
            );
            if (sellingError) {
                errors[`variant-${variant.id}-sellingPrice`] = sellingError;
            }

            const costError = priceValidators.validatePrice(
                variant.costPrice || '',
                'Variant Cost Price'
            );
            if (costError) {
                errors[`variant-${variant.id}-costPrice`] = costError;
            }

            const inventoryError = priceValidators.validateInventoryQuantity(
                variant.inventoryQuantity || ''
            );
            if (inventoryError) {
                errors[`variant-${variant.id}-inventoryQuantity`] = inventoryError;
            }
        });

        return errors;
    };

    return {
        // State
        variants,

        // Setters
        setVariants,

        // Operations
        addVariant,
        removeVariant,
        updateVariant,
        updateVariantFields,
        validateVariants,
    };
}
