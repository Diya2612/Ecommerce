import { cache } from 'react';
import type { Deal } from '@/types/home';
import { HOME_PAGE_CACHE } from '@/lib/cache/strategies';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fetches current deal for the home page
 * Server-side only - called in Server Components
 */
export const getCurrentDeal = cache(async (): Promise<Deal> => {
    try {
        // Mock data to match archived DealOfTheDay.tsx exactly
        return {
            id: 1,
            title: "Premium AMC Protection",
            description: "Experience zero downtime with our comprehensive maintenance plans. Genuine spares, priority support, and complete peace of mind.",
            features: [
                "Comprehensive Filter Replacement",
                "3 Free Preventive Maintenance Visits",
                "24/7 Priority Breakdown Support"
            ],
            image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
            price: 5100,
            originalPrice: 8500,
            discount: 40,
            expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
            ctaText: "Chat with a Water Expert",
            ctaLink: "/services",
            tags: ["Zero Downtime", "Genuine Parts", "Priority Support"], // Using format for value stack
            terms: "Instant activation • No hidden charges • Tax inclusive" // Using for micro trust line
        };
    } catch (error) {
        console.error('Error fetching current deal:', error);
        return {
            id: 1,
            title: "Premium AMC Protection",
            description: "Comprehensive maintenance for your water purifier",
            features: ["Filter Replacement", "Priority Support"],
            image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
            price: 5100,
            originalPrice: 8500,
            discount: 40,
            expiresAt: new Date(Date.now() + 86400000),
            ctaText: "Chat with a Water Expert",
            ctaLink: "/services"
        };
    }
});
