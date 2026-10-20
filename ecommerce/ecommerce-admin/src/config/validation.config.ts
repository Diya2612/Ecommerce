/**
 * Global Validation Configuration
 * 
 * Centralized configuration for validation rules across the application
 */

/**
 * Image Validation Rules
 */
export const IMAGE_VALIDATION = {
    // Default image validation rules
    DEFAULT_MIN_DIMENSION: 200,
    DEFAULT_MAX_DIMENSION: 2000,
    DEFAULT_MAX_FILE_SIZE_MB: 10,
    ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,

    // Specific use cases
    PRODUCT_IMAGE: {
        minDimension: 200,
        maxDimension: 2000,
        maxFileSizeMB: 10,
        requireSquare: true,
    },

    BLOG_IMAGE: {
        minDimension: 800,
        maxDimension: 2000,
        maxFileSizeMB: 5,
        requireSquare: false, // Allow different aspect ratios
    },

    AVATAR: {
        minDimension: 100,
        maxDimension: 1000,
        maxFileSizeMB: 2,
        requireSquare: true,
    },

    BANNER: {
        minDimension: 1200,
        maxDimension: 4000,
        maxFileSizeMB: 5,
        requireSquare: false,
    },

    COLLECTION_BANNER: {
        minDimension: 1200,
        maxDimension: 4000,
        maxFileSizeMB: 5,
        requireSquare: false,
    },
} as const;

/**
 * Currency Configuration
 */
export const CURRENCY_CONFIG = {
    DEFAULT_CURRENCY: 'INR',
    SYMBOL: '₹',
    LOCALE: 'en-IN',
    MAX_DECIMAL_PLACES: 2,
    MIN_VALUE: 0,
} as const;

/**
 * Number Input Configuration
 */
export const NUMBER_INPUT_CONFIG = {
    MIN_QUANTITY: 0,
    MAX_QUANTITY: 999999,
    MIN_WEIGHT: 0,
    MAX_WEIGHT: 100000, // 100kg in grams
    MIN_DIMENSION: 0,
    MAX_DIMENSION: 10000, // 10 meters in cm
} as const;

/**
 * Validation Messages
 */
export const VALIDATION_MESSAGES = {
    // Image validation messages
    IMAGE_NOT_SQUARE: (width: number, height: number) =>
        `Image must be square (1:1 ratio). Current: ${width}x${height}`,

    IMAGE_TOO_SMALL: (width: number, height: number, min: number = IMAGE_VALIDATION.DEFAULT_MIN_DIMENSION) =>
        `Image too small. Minimum: ${min}x${min}px. Current: ${width}x${height}`,

    IMAGE_TOO_LARGE: (width: number, height: number, max: number = IMAGE_VALIDATION.DEFAULT_MAX_DIMENSION) =>
        `Image too large. Maximum: ${max}x${max}px. Current: ${width}x${height}`,

    IMAGE_LOAD_FAILED: 'Failed to load image for validation',

    FILE_SIZE_TOO_LARGE: (sizeMB: number, maxMB: number) =>
        `File size (${sizeMB.toFixed(1)}MB) exceeds maximum (${maxMB}MB)`,

    INVALID_FILE_TYPE: 'Please select a valid image file (JPEG, PNG, WebP, GIF)',

    INVALID_IMAGE_FORMAT: (allowed: readonly string[]) =>
        `Invalid format. Allowed: ${allowed.map(f => f.replace('image/', '').toUpperCase()).join(', ')}`,

    // Currency validation messages
    PRICE_COMPARISON_ERROR: 'Compare at price must be greater than or equal to selling price',

    INVALID_CURRENCY: 'Please enter a valid price',

    NEGATIVE_PRICE: 'Price cannot be negative',

    TOO_MANY_DECIMALS: (max: number) =>
        `Price can have at most ${max} decimal places`,

    // Number validation messages
    MUST_BE_POSITIVE: 'Value must be positive',

    MUST_BE_INTEGER: 'Value must be a whole number',

    OUT_OF_RANGE: (min: number, max: number) =>
        `Value must be between ${min} and ${max}`,

    // Dimension validation messages
    INVALID_DIMENSIONS: 'All dimensions must be greater than 0',

    DIMENSION_TOO_LARGE: (value: number, max: number) =>
        `Dimension (${value}) exceeds maximum (${max})`,
} as const;

/**
 * File Upload Limits
 */
export const FILE_UPLOAD_LIMITS = {
    MAX_FILES: 10,
    MAX_TOTAL_SIZE_MB: 50,
    ALLOWED_IMAGE_TYPES: IMAGE_VALIDATION.ALLOWED_FORMATS,
} as const;
