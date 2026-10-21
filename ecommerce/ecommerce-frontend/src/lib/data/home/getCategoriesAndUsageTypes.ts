import { cache } from 'react';
import type { Category, UsageType } from '@/types/home';
import { HOME_PAGE_CACHE } from '@/lib/cache/strategies';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fetches categories (purification types) for the home page
 * Server-side only - called in Server Components
 */
export const getCategories = cache(async (): Promise<Category[]> => {
    try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch(
        //   `${process.env.API_BASE_URL}/categories`,
        //   {
        //     next: {
        //       ...HOME_PAGE_CACHE.categories,
        //       tags: [CACHE_TAGS.CATEGORIES],
        //     },
        //   }
        // );

        // if (!response.ok) {
        //   throw new Error('Failed to fetch categories');
        // }

        // return response.json();

        // Using exact same data as current Categories component
        return [
            {
                id: 1,
                title: "RO Purification",
                description: "Removes heavy metals & salts",
                iconName: "Droplets",
                gradient: "from-blue-500 to-blue-600",
                shadow: "shadow-blue-200"
            },
            {
                id: 2,
                title: "UV Protection",
                description: "Kills 99.9% bacteria",
                iconName: "ShieldCheck",
                gradient: "from-purple-500 to-purple-600",
                shadow: "shadow-purple-200"
            },
            {
                id: 3,
                title: "UF Filtration",
                description: "Crystal clear clarity",
                iconName: "Filter",
                gradient: "from-teal-400 to-teal-500",
                shadow: "shadow-teal-200"
            },
            {
                id: 4,
                title: "Alkaline",
                description: "pH Balanced Water",
                iconName: "FlaskConical",
                gradient: "from-indigo-400 to-indigo-500",
                shadow: "shadow-indigo-200"
            },
            {
                id: 5,
                title: "Copper Tech",
                description: "Infused with goodness",
                iconName: "Zap",
                gradient: "from-orange-400 to-orange-500",
                shadow: "shadow-orange-200"
            },
            {
                id: 6,
                title: "Hot & Cold",
                description: "Instant temperature",
                iconName: "ThermometerSun",
                gradient: "from-red-400 to-red-500",
                shadow: "shadow-red-200"
            }
        ];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
});

/**
 * Fetches usage types (domestic, industrial, office) for the home page
 * Server-side only - called in Server Components
 */
export const getUsageTypes = cache(async (): Promise<UsageType[]> => {
    try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch(
        //   `${process.env.API_BASE_URL}/usage-types`,
        //   {
        //     next: {
        //       ...HOME_PAGE_CACHE.categories,
        //       tags: [CACHE_TAGS.CATEGORIES],
        //     },
        //   }
        // );

        // if (!response.ok) {
        //   throw new Error('Failed to fetch usage types');
        // }

        // return response.json();

        // Using exact same data as current Categories component
        return [
            {
                id: 1,
                title: "Domestic",
                description: "Perfect for modern kitchens & families",
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
                link: "/collections"
            },
            {
                id: 2,
                title: "Industrial",
                description: "High-capacity plants for factories",
                image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
                link: "/collections"
            },
            {
                id: 3,
                title: "Office & Corporate",
                description: "Water dispensers for workplaces",
                image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
                link: "/collections"
            }
        ];
    } catch (error) {
        console.error('Error fetching usage types:', error);
        return [];
    }
});
