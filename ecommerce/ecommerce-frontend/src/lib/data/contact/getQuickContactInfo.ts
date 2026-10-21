import { cache } from 'react';
import type { QuickContactInfo } from '@/types/contact';

/**
 * Get quick contact information cards for the ContactBanner
 * 
 * Currently returns static data. In production, this could fetch from:
 * - CMS (Contentful, Sanity, etc.)
 * - Database
 * - Configuration API
 * 
 * @returns Promise<QuickContactInfo[]> Array of contact info cards
 */
export const getQuickContactInfo = cache(async (): Promise<QuickContactInfo[]> => {
    // Static data - matches original ContactBanner.tsx
    const quickInfo: QuickContactInfo[] = [
        {
            id: 'phone',
            iconKey: 'Phone',
            title: 'Call Us',
            value: '+91 90753 66955',
            subtitle: 'Mon-Sat 9-9'
        },
        {
            id: 'email',
            iconKey: 'Mail',
            title: 'Email Us',
            value: 'yogeshwar.ptl@gmail.com',
            subtitle: '24/7 Support'
        },
        {
            id: 'location',
            iconKey: 'MapPin',
            title: 'Visit Us',
            value: 'Main Office',
            subtitle: 'Pune, Maharashtra'
        },
        {
            id: 'hours',
            iconKey: 'Clock',
            title: 'Working Hours',
            value: 'Mon-Sat 9-9',
            subtitle: 'Sunday Closed'
        }
    ];

    return quickInfo;
});
