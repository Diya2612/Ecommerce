import { cache } from 'react';
import type { TermsContactInfo } from '@/types/terms';

/**
 * Fetches contact information for the Terms page
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getTermsContactInfo = cache(async (): Promise<TermsContactInfo> => {
    try {
        // Simulating API call - replace with actual fetch when backend is ready
        return {
            email: 'yogeshwar.ptl@gmail.com',
            phone: '+91 90753 66955',
        };
    } catch (error) {
        console.error('Error fetching contact info:', error);
        return {
            email: 'yogeshwar.ptl@gmail.com',
            phone: '+91 90753 66955',
        };
    }
});
