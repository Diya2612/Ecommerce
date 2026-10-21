import { cache } from 'react';
import type { BusinessHours } from '@/types/contact';

/**
 * Get business hours
 * 
 * Currently returns static data. In production, this could:
 * - Fetch from configuration API
 * - Include holiday schedule
 * - Show current open/closed status
 * 
 * @returns Promise<BusinessHours[]> Array of business hours entries
 */
export const getBusinessHours = cache(async (): Promise<BusinessHours[]> => {
    // Static data - matches original ContactUsSection.tsx
    const businessHours: BusinessHours[] = [
        {
            id: 'weekday',
            days: 'Monday - Saturday',
            hours: '9:00 AM - 6:00 PM',
            isEmergency: false
        },
        {
            id: 'sunday',
            days: 'Sunday',
            hours: '10:00 AM - 4:00 PM',
            isEmergency: false
        },
        {
            id: 'emergency',
            days: 'Emergency Support',
            hours: '24/7 Available',
            isEmergency: true
        }
    ];

    return businessHours;
});
