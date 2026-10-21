import { cache } from 'react';
import type { BookingService } from '@/types/contact';

/**
 * Get available booking services for the BookNowSection
 * 
 * Currently returns static data. In production, this could:
 * - Fetch from service catalog API
 * - Include availability status
 * - Filter by user location
 * 
 * @returns Promise<BookingService[]> Array of booking services
 */
export const getBookingServices = cache(async (): Promise<BookingService[]> => {
    // Static data - matches original BookNowSection.tsx
    const services: BookingService[] = [
        {
            id: 'installation',
            iconKey: 'Home',
            title: 'Installation',
            description: 'Professional setup at your doorstep',
            colorFrom: 'from-[#0B1F51]/10',
            colorTo: 'to-[#0B1F51]/5',
            iconBg: 'bg-[#0B1F51]'
        },
        {
            id: 'amc',
            iconKey: 'CheckCircle',
            title: 'AMC Service',
            description: 'Annual maintenance contract',
            colorFrom: 'from-[#00C4CC]/10',
            colorTo: 'to-[#00C4CC]/5',
            iconBg: 'bg-[#00C4CC]'
        },
        {
            id: 'repair',
            iconKey: 'Wrench',
            title: 'Repair',
            description: 'Quick fix for any issues',
            colorFrom: 'from-[#F5B012]/10',
            colorTo: 'to-[#F5B012]/5',
            iconBg: 'bg-[#F5B012]'
        },
        {
            id: 'filter',
            iconKey: 'Package',
            title: 'Filter Replacement',
            description: 'Genuine parts & accessories',
            colorFrom: 'from-[#8B5CF6]/10',
            colorTo: 'to-[#8B5CF6]/5',
            iconBg: 'bg-[#8B5CF6]'
        }
    ];

    return services;
});
