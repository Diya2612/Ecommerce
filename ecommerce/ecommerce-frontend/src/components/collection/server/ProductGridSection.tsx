import { ProductGridClient } from '../client/ProductGridClient';
import type { CollectionFilters } from '@/types/collection';

interface ProductGridSectionProps {
    filters: CollectionFilters;
}

/**
 * ProductGridSection - Server Component
 * 
 * Wrapper for the product grid.
 * Data is now provided via HydrationBoundary from page.tsx.
 * The "Showing X of Y results" header is moved to Client component since it depends on hydrated data.
 */
export async function ProductGridSection({ filters }: ProductGridSectionProps) {
    return (
        <ProductGridClient />
    );
}
