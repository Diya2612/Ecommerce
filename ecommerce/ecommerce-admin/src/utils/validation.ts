import { z } from 'zod';

/**
 * Global Validation Utilities
 * 
 * Reusable validation functions for forms, inputs, and media
 */

/**
 * Image Validation
 */

/** Maximum safe value for numeric fields (1 billion) */
export const MAX_SAFE_VALUE = 1000000000;

export interface NumericOptions {
    min?: number;
    max?: number;
    allowZero?: boolean;
    maxDecimals?: number;
}

/**
 * Common validation logic for numeric strings used in Zod schemas
 */
export const validateNumericString = (val: string, ctx: z.RefinementCtx, label: string, options: NumericOptions) => {
    const {
        max = MAX_SAFE_VALUE,
        allowZero = false,
        maxDecimals = 2,
    } = options;

    if (val === '') return;

    // Check decimal format
    const decimalPattern = maxDecimals === 0
        ? /^\d+$/
        : new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`);

    if (!decimalPattern.test(val)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} can have maximum ${maxDecimals} decimal places`,
        });
        return;
    }

    const num = parseFloat(val);

    // Check valid number
    if (isNaN(num)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} must be a valid number`,
        });
        return;
    }

    // Check min value
    if (allowZero) {
        if (num < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${label} must be 0 or greater`,
            });
        }
    } else {
        if (num <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${label} must be greater than 0`,
            });
        }
    }

    // Check max value
    if (num > max) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} is too big (max ${max})`,
        });
    }
};

/**
 * Image Validation
 */

export interface ImageValidationOptions {
    requireSquare?: boolean;
    minDimension?: number;
    maxDimension?: number;
    maxFileSizeMB?: number;
}

export interface ImageDimensions {
    width: number;
    height: number;
}

/**
 * Validates image dimensions against specified criteria
 * 
 * @param file - The image file to validate
 * @param options - Validation options (square, min/max dimensions)
 * @returns Promise resolving to error message or null if valid
 */
export const validateImageDimensions = (
    file: File,
    options: ImageValidationOptions = {}
): Promise<string | null> => {
    const {
        requireSquare = false,
        minDimension,
        maxDimension,
    } = options;

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            const { width, height } = img;

            // Check if square (1:1 ratio)
            if (requireSquare && width !== height) {
                resolve(`Image must be square (1:1 ratio). Current: ${width}x${height}`);
                return;
            }

            // Check minimum dimensions
            if (minDimension && (width < minDimension || height < minDimension)) {
                resolve(`Image too small. Minimum: ${minDimension}x${minDimension}px. Current: ${width}x${height}`);
                return;
            }

            // Check maximum dimensions
            if (maxDimension && (width > maxDimension || height > maxDimension)) {
                resolve(`Image too large. Maximum: ${maxDimension}x${maxDimension}px. Current: ${width}x${height}`);
                return;
            }

            resolve(null); // Valid
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('Failed to load image for validation');
        };

        img.src = url;
    });
};

/**
 * Gets image dimensions from a file
 * 
 * @param file - The image file
 * @returns Promise resolving to image dimensions
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
};
