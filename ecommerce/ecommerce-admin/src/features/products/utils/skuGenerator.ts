/**
 * Utility functions for generating product SKUs
 */

/**
 * Generate a random alphanumeric SKU
 * Format: P-{TIMESTAMP}-{RANDOM}
 * Example: P-171562-8392
 */
export function generateProductSKU(): string {
    const prefix = 'P';
    // Use last 6 digits of timestamp for some time-based uniqueness without being too long
    const timestamp = Date.now().toString().slice(-6);
    // 4-digit random number
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    return `${prefix}-${timestamp}-${randomNum}`;
}

/**
 * Generate a variant SKU based on product SKU and variant info
 * Format: {PRODUCT_SKU}-V{VARIANT_NUMBER} or auto-generated if no product SKU
 */
export function generateVariantSKU(
    productSKU?: string,
    variantIndex?: number
): string {
    // If we have product SKU, append variant suffix
    if (productSKU && productSKU.trim()) {
        const variantSuffix = variantIndex !== undefined
            ? `V${variantIndex + 1}`
            : `V${Math.floor(100 + Math.random() * 900)}`; // Fallback to random 3 digit if no index

        return `${productSKU}-${variantSuffix}`;
    }

    // Otherwise generate standalone variant SKU
    const prefix = 'VR';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${timestamp}-${randomNum}`;
}

/**
 * Check if a SKU is valid (not empty and following basic pattern)
 */
export function isValidSKU(sku: string): boolean {
    if (!sku || !sku.trim()) return false;

    // Basic check: at least 3 chars long, allows alphanumeric and hyphens
    const cleanSku = sku.trim();
    return cleanSku.length >= 3 && /^[A-Z0-9-]+$/i.test(cleanSku);
}
