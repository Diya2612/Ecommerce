/**
 * Cart Data Layer - Types
 * 
 * Shared types for cart-related products (recommended, upsell, cross-sell)
 */

export interface CartProduct {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    rating?: number;
    reviews?: number;
    tags?: string[];
    label?: string;
    isNew?: boolean;
    inStock?: boolean;
}

export interface UpsellProduct extends CartProduct {
    badge: string;
    badgeColor: string;
}

export interface CrossSellProduct extends CartProduct {
    category: string;
}
