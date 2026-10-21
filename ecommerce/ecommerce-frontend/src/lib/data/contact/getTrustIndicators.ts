import { cache } from 'react';
import type { TrustIndicator } from '@/types/contact';

/**
 * Get trust indicators for the form section
 * 
 * Currently returns static data. In production, this could:
 * - Fetch from CMS
 * - Include dynamic stats (e.g., "10,000+ happy customers")
 * 
 * @returns Promise<TrustIndicator[]> Array of trust indicators
 */
export const getTrustIndicators = cache(async (): Promise<TrustIndicator[]> => {
    // Static data - matches original EnterDetailsSection.tsx
    const trustIndicators: TrustIndicator[] = [
        {
            id: 'secure',
            icon: '🔒',
            text: 'Secure & Private'
        },
        {
            id: 'quick',
            icon: '⚡',
            text: 'Quick Response'
        },
        {
            id: 'verified',
            icon: '✓',
            text: 'Verified Experts'
        }
    ];

    return trustIndicators;
});
