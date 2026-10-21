'use client';

import { useRef } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCardClient } from '@/components/home/client/ProductCardClient';
import type { Product } from '@/types/home';

interface ProductCarouselClientProps {
    products: Product[];
    showControls?: boolean;
}

/**
 * ProductCarouselClient - Shared Client Component
 * 
 * Reusable carousel for product grids
 * Uses react-slick for smooth sliding
 * Reuses ProductCardClient for interactive cards
 */
export function ProductCarouselClient({ products, showControls = true }: ProductCarouselClientProps) {
    const sliderRef = useRef<Slider>(null);

    const settings = {
        dots: false,
        infinite: products.length > 4,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 4 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, centerMode: true, centerPadding: '20px' } },
        ],
    };

    if (products.length === 0) return null;

    return (
        <div className="relative group">
            {/* Navigation Arrows */}
            {showControls && products.length > 4 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => sliderRef.current?.slickPrev()}
                    >
                        <ChevronLeft className="w-6 h-6 text-[#0B1F51]" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => sliderRef.current?.slickNext()}
                    >
                        <ChevronRight className="w-6 h-6 text-[#0B1F51]" />
                    </Button>
                </>
            )}

            <Slider ref={sliderRef} {...settings}>
                {products.map((product) => (
                    <div key={product.id} className="px-3">
                        <ProductCardClient
                            product={product}
                            productHref={`/product/${product.id}`}
                            showQuickView={false}
                            imageHeight="h-[280px]"
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
}
