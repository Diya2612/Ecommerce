import { cache } from 'react';
import type { Technology } from '@/types/technology';

/**
 * Fetches technology items for the Technology page
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getTechnologies = cache(async (): Promise<Technology[]> => {
    try {
        // Simulating API call - replace with actual fetch when backend is ready
        // const response = await fetch(`${process.env.API_URL}/technologies`, {
        //     next: { revalidate: 86400 } // Cache for 24 hours
        // });

        return [
            {
                id: 'ro',
                title: 'RO Purification',
                description: 'Reverse Osmosis technology removes dissolved impurities, heavy metals, and salts, ensuring water is pure and sweet. Ideal for water with high TDS levels.',
                benefits: [
                    'Removes heavy metals like Lead, Mercury',
                    'Reduces TDS (Total Dissolved Solids)',
                    'Eliminates bacteria and viruses',
                ],
                image: 'https://images.unsplash.com/photo-1546552356-3fae876a61ca?q=80&w=1000&auto=format&fit=crop',
            },
            {
                id: 'uv',
                title: 'UV Protection',
                description: 'Ultraviolet (UV-C) purification works by deactivating the DNA of biological contaminants like bacteria and viruses, making water 100% safe to drink.',
                benefits: [
                    'Kills 99.9% of bacteria & viruses',
                    'Chemical-free purification',
                    'Retains natural taste of water',
                ],
                image: 'https://images.unsplash.com/photo-1625125589786-9c88905e9d45?q=80&w=1000&auto=format&fit=crop',
            },
            {
                id: 'alkaline',
                title: 'Alkaline Boost',
                description: 'Our Alkaline technology maintains the pH level of water between 7.5 and 8.5. Alkaline water helps neutralize acid in the bloodstream and boosts metabolism.',
                benefits: [
                    'Balances body pH levels',
                    'Improves hydration',
                    'Contains antioxidant properties',
                ],
                image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop',
            },
            {
                id: 'copper',
                title: 'Copper Tech',
                description: 'Inspired by traditional wisdom, this technology infuses water with copper ions. Copper has antimicrobial, antioxidant, and anti-inflammatory properties.',
                benefits: [
                    'Boosts immunity',
                    'Aids in digestion',
                    'Supports heart health',
                ],
                image: 'https://images.unsplash.com/photo-1606809802910-2671dfc54666?q=80&w=1000&auto=format&fit=crop',
            },
            {
                id: 'temp',
                title: 'Hot & Cold',
                description: 'Experience the convenience of instant hot and cold water dispense. Perfect for making quick beverages or getting a refreshing chilled drink anytime.',
                benefits: [
                    'Instant hot water for tea/coffee',
                    'Chilled water on demand',
                    'Child lock safety for hot water',
                ],
                image: 'https://images.unsplash.com/photo-1544003484-3cd181d17917?q=80&w=1000&auto=format&fit=crop',
            },
            {
                id: 'uf',
                title: 'UF Filtration',
                description: 'Ultra Filtration uses a hollow fiber membrane to separate physical impurities. It works without electricity and does not waste any water.',
                benefits: [
                    'Removes physical impurities',
                    'Zero water wastage',
                    'Works without electricity',
                ],
                image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1000&auto=format&fit=crop',
            },
        ];
    } catch (error) {
        console.error('Error fetching technologies:', error);
        return [];
    }
});
