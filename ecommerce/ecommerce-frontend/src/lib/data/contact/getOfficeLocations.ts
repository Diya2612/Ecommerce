import { cache } from 'react';
import type { OfficeLocation } from '@/types/contact';

/**
 * Get regional office locations
 * 
 * Currently returns static data. In production, this could:
 * - Fetch from locations API
 * - Filter/sort by user location (nearest first)
 * - Include operating hours per location
 * - Include map coordinates for integration
 * 
 * @returns Promise<OfficeLocation[]> Array of office locations
 */
export const getOfficeLocations = cache(async (): Promise<OfficeLocation[]> => {
    // Static data - matches original ContactUsSection.tsx
    const offices: OfficeLocation[] = [
        {
            id: 'mumbai',
            city: 'Mumbai',
            address: 'Head Office, Mumbai',
            phone: '+91 90753 66955',
            email: 'yogeshwar.ptl@gmail.com'
        },
        // {
        //     id: 'delhi',
        //     city: 'Delhi',
        //     address: '456 Pure Street, Connaught Place, New Delhi - 110001',
        //     phone: '+91 XXXXX XXXXX',
        //     email: 'delhi@anant.com'
        // },
        // {
        //     id: 'bangalore',
        //     city: 'Bangalore',
        //     address: '789 Tech Avenue, Koramangala, Bangalore - 560034',
        //     phone: '+91 XXXXX XXXXX',
        //     email: 'bangalore@anant.com'
        // },
        // {
        //     id: 'chennai',
        //     city: 'Chennai',
        //     address: '321 Marine Drive, T Nagar, Chennai - 600017',
        //     phone: '+91 XXXXX XXXXX',
        //     email: 'chennai@anant.com'
        // }
    ];

    return offices;
});
