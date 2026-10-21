'use client';

import { ProductCardClient } from './ProductCardClient';
import { MobileCarousel } from '@/components/carousel/MobileCarousel';
import type { Product } from '@/types/home';

interface FeaturedProductsMobileProps {
    products: Product[];
}

/**
 * FeaturedProductsMobile - Client Component
 * 
 * Handles mobile carousel rendering for featured products
 * This is a client island for the mobile view only
 */
export function FeaturedProductsMobile({ products }: FeaturedProductsMobileProps) {
    // Render function for carousel - now in client component
    const renderProductCard = (product: Product) => (
        <ProductCardClient
            product={product}
            productHref={`/product/${product.id}`}
            showQuickView={true}
        />
    );

    return (
        <div className="sm:hidden">
            <MobileCarousel
                items={products}
                keyExtractor={(product) => product.id.toString()}
                renderItem={renderProductCard}
                showControls={true}
                showDots={true}
                controlsPosition="top-[160px] -translate-y-1/2"
                loop={true}
            />
        </div>
    );
}
