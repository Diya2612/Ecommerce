/**
 * Barrel export for all home page data fetchers
 * Import from this file to access all data fetching functions
 * 
 * Example:
 * import { getHeroSlides, getFeaturedProducts } from '@/lib/data/home';
 */

export { getHeroSlides } from './getHeroSlides';
export { getFeaturedProducts } from './getFeaturedProducts';
export { getBrands } from './getBrands';
export { getTestimonials } from './getTestimonials';
export { getCategories, getUsageTypes } from './getCategoriesAndUsageTypes';
export { getCurrentDeal } from './getCurrentDeal';

// Export types for convenience
export type {
    HeroSlide,
    Product,
    Brand,
    Testimonial,
    Category,
    UsageType,
    Deal,
    ComparisonProduct,
} from '@/types/home';
