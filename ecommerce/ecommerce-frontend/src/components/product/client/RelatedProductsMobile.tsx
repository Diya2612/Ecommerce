'use client';

import { ProductCardClient } from '@/components/home/client/ProductCardClient';
import { MobileCarousel } from '@/components/carousel/MobileCarousel';
import type { Product } from '@/types/home';

interface RelatedProductsMobileProps {
    products: Product[];
}

/**
 * RelatedProductsMobile - Client Component
 * 
 * Wrapper for mobile carousel to avoid passing functions from Server to Client
 */
export function RelatedProductsMobile({ products }: RelatedProductsMobileProps) {
    return (
        <MobileCarousel
            items={products}
            keyExtractor={(p) => p.id.toString()}
            renderItem={(product) => (
                <ProductCardClient
                    product={product}
                    productHref={`/product/${product.id}`}
                    showQuickView={false}
                    imageHeight="h-[280px]"
                />
            )}
            showControls={true}
            showDots={true}
            loop={true}
        />
    );
}
