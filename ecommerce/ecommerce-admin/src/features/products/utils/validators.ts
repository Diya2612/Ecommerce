import { z } from 'zod';
import { validateNumericString, MAX_SAFE_VALUE } from '@/utils';

/**
 * Validation utilities for product forms
 * Consolidates common validation logic used across multiple hooks
 */

export const priceValidators = {
    /**
     * Validate a price field
     * @param value - The price value to validate
     * @param fieldName - Display name for error messages
     * @returns Error message or null if valid
     */
    validatePrice(value: string, fieldName: string): string | null {
        // Use the shared Zod superRefine logic, but we need to mock the ctx
        // or just use a temporary schema for validation to reuse the logic exactly
        const schema = z.string().trim().min(1, `${fieldName} is required`)
            .superRefine((val, ctx) => validateNumericString(val, ctx, fieldName, {
                max: MAX_SAFE_VALUE,
                allowZero: false,
                maxDecimals: 2
            }));

        const result = schema.safeParse(value);
        if (!result.success) {
            return result.error.issues[0].message;
        }
        return null;
    },

    /**
     * Validate inventory quantity
     * @param value - The inventory quantity to validate
     * @returns Error message or null if valid
     */
    validateInventoryQuantity(value: string): string | null {
        const schema = z.string().trim().min(1, 'Inventory Quantity is required')
            .superRefine((val, ctx) => validateNumericString(val, ctx, 'Inventory Quantity', {
                max: MAX_SAFE_VALUE,
                allowZero: true, // Inventory can be 0
                maxDecimals: 0   // Integers only
            }));

        const result = schema.safeParse(value);
        if (!result.success) {
            return result.error.issues[0].message;
        }
        return null;
    },

    /**
     * Validate compare-at price (optional field)
     * Must be greater than selling price if both are provided
     * @param compareAt - Compare-at price value
     * @param selling - Selling price value
     * @returns Error message or null if valid
     */
    validateCompareAtPrice(compareAt: string, selling: string): string | null {
        // Optional field - skip if empty
        if (!compareAt || compareAt.trim() === '') {
            return null;
        }

        // 1. Basic numeric validation
        const schema = z.string().trim()
            .superRefine((val, ctx) => validateNumericString(val, ctx, 'Compare At Price', {
                max: MAX_SAFE_VALUE,
                allowZero: false,
                maxDecimals: 2
            }));

        const result = schema.safeParse(compareAt);
        if (!result.success) {
            return result.error.issues[0].message;
        }

        // 2. Cross-field validation (greater than selling price)
        if (selling) {
            const compareAtValue = parseFloat(compareAt);
            const sellingValue = parseFloat(selling);

            if (
                !isNaN(compareAtValue) &&
                !isNaN(sellingValue) &&
                compareAtValue < sellingValue
            ) {
                return 'Must be greater than selling price';
            }
        }

        return null;
    },
} as const;

export interface DimensionValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates product dimensions (length, width, height)
 * 
 * @param length - Product length
 * @param width - Product width
 * @param height - Product height
 * @returns Validation result with errors
 */
export const validateDimensions = (
    length: number,
    width: number,
    height: number
): DimensionValidationResult => {
    const errors: string[] = [];

    if (length <= 0) {
        errors.push('Length must be greater than 0');
    }
    if (width <= 0) {
        errors.push('Width must be greater than 0');
    }
    if (height <= 0) {
        errors.push('Height must be greater than 0');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
