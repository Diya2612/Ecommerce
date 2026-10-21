/**
 * Format price in Indian Rupee format
 */
export function formatPrice(price: number): string {
    return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Format rating to one decimal place
 */
export function formatRating(rating: number): string {
    return rating.toFixed(1);
}

/**
 * Format review count with K suffix for large numbers
 */
export function formatReviewCount(count: number): string {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    return count === 1 ? singular : (plural || `${singular}s`);
}
