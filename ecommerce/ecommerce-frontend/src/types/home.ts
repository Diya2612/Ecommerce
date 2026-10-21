/**
 * Home Page Types & Interfaces
 * Server-side migration type definitions
 */

import type { ReactNode } from 'react';

// ============================================================================
// Hero Section
// ============================================================================

export interface HeroSlide {
    id: number | string;
    image: string;
    alt: string;
    title?: string;
    description?: string;
    ctaText: string;
    link: string;
    priority?: boolean;
}

export interface HeroSectionProps {
    slides: HeroSlide[];
    autoplayDelay?: number;
}

// ============================================================================
// Products
// ============================================================================

export interface ProductSpecs {
    technology?: string;
    storage?: string;
    stages?: string;
    mineral?: boolean;
    display?: boolean;
    power?: string;
    warranty?: string;
    dimensions?: string;
    certification?: string;
    [key: string]: string | boolean | undefined;
}

export interface Product {
    id: number | string;
    slug?: string;
    name: string;
    description?: string;
    image: string;
    images?: string[];
    price: number;
    originalPrice?: number | null;  // Allow null from backend APIs
    discount?: number;
    rating?: number;
    reviews?: number;
    tags?: string[];
    category?: string;
    inStock?: boolean;
    total_stock?: number;
    isNew?: boolean;
    isFeatured?: boolean;
    specs?: ProductSpecs;

    // Phase 1: Inventory fields
    inventory?: {
        available_quantity: number;
        reserved_quantity: number;
        status: 'in_stock' | 'low_stock' | 'out_of_stock';
        incoming_quantity?: number;
        incoming_eta?: string;
        condition?: 'sellable' | 'damaged' | 'quarantined' | 'expired';
    };
}

export interface ComparisonProduct extends Product {
    bestValue?: boolean;
    highlight?: string;
    specs: ProductSpecs; // Required for comparison
}

// ============================================================================
// Categories
// ============================================================================

export interface Category {
    id: number | string;
    title: string;
    description: string;
    icon?: ReactNode;
    iconName?: string;
    gradient: string;
    shadow: string;
    link?: string;
}

export interface UsageType {
    id: number | string;
    title: string;
    description: string;
    image: string;
    link: string;
    className?: string;
}

export interface CategoriesSectionProps {
    categories: Category[];
    usageTypes: UsageType[];
}

// ============================================================================
// Testimonials
// ============================================================================

export interface Testimonial {
    id: number | string;
    name: string;
    location: string;
    text: string;
    rating: number;
    outcome?: string;
    image: string;
    verified?: boolean;
    date?: Date;
}

export interface TestimonialsSectionProps {
    testimonials: Testimonial[];
    averageRating?: number;
    totalReviews?: number;
}

// ============================================================================
// Brands
// ============================================================================

export interface Brand {
    id: number | string;
    name: string;
    logo: string;
    category?: string;
    link?: string;
    description?: string;
}

export interface BrandsSectionProps {
    brands: Brand[];
}

// ============================================================================
// Deals
// ============================================================================

export interface Deal {
    id: number | string;
    title: string;
    description: string;
    features: string[];
    image: string;
    price: number;
    originalPrice: number;
    discount: number;
    expiresAt: Date;
    ctaText?: string;
    ctaLink?: string;
    tags?: string[];
    terms?: string;
}

export interface DealSectionProps {
    deal: Deal;
}

// ============================================================================
// Comparison
// ============================================================================

export interface ComparisonAttribute {
    key: string;
    label: string;
    type?: 'string' | 'boolean' | 'number';
}

export interface ComparisonSectionProps {
    products: ComparisonProduct[];
    attributes: ComparisonAttribute[];
}

// ============================================================================
// Data Fetcher Types
// ============================================================================

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
    details?: unknown;
}

// ============================================================================
// Cache Types
// ============================================================================

export type CacheStrategy = {
    revalidate?: number;
    tags?: string[];
    cache?: 'force-cache' | 'no-store';
};

export interface CacheConfig {
    heroSlides: CacheStrategy;
    categories: CacheStrategy;
    brands: CacheStrategy;
    featuredProducts: CacheStrategy;
    testimonials: CacheStrategy;
    deals: CacheStrategy;
    comparisonProducts: CacheStrategy;
}
