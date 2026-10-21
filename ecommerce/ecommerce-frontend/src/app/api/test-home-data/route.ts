import { NextResponse } from 'next/server';
import {
    getHeroSlides,
    getFeaturedProducts,
    getBrands,
    getTestimonials,
} from '@/lib/data/home';

/**
 * Test API route to verify data fetchers
 * Access at: http://localhost:3000/api/test-home-data
 * 
 * This route tests all home page data fetchers and returns the results
 */
export async function GET() {
    try {
        // Fetch all data in parallel
        const [hero, products, brands, testimonials] = await Promise.all([
            getHeroSlides(),
            getFeaturedProducts(),
            getBrands(),
            getTestimonials(),
        ]);

        return NextResponse.json({
            success: true,
            message: 'All data fetchers working correctly',
            data: {
                hero: {
                    count: hero.length,
                    items: hero,
                },
                products: {
                    count: products.length,
                    items: products,
                },
                brands: {
                    count: brands.length,
                    items: brands,
                },
                testimonials: {
                    count: testimonials.length,
                    items: testimonials,
                },
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error in test-home-data route:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
