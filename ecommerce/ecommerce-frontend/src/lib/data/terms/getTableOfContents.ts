import { cache } from 'react';
import type { TermsTOCItem } from '@/types/terms';

/**
 * Fetches table of contents items for the Terms page sidebar
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getTableOfContents = cache(async (): Promise<TermsTOCItem[]> => {
    try {
        // Simulating API call - replace with actual fetch when backend is ready
        return [
            { id: 'agreement', number: 1, title: 'Agreement to Terms' },
            { id: 'services', number: 2, title: 'Services & AMC' },
            { id: 'accounts', number: 3, title: 'User Accounts' },
            { id: 'payments', number: 4, title: 'Payments & Refunds' },
            { id: 'liability', number: 5, title: 'Limitation of Liability' },
            { id: 'contact', number: 6, title: 'Contact' },
        ];
    } catch (error) {
        console.error('Error fetching table of contents:', error);
        return [];
    }
});
