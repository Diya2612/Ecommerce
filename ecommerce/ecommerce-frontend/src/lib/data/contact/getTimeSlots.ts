import { cache } from 'react';
import type { TimeSlot } from '@/types/contact';

/**
 * Get available time slots for service booking
 * 
 * Currently returns static data. In production, this could:
 * - Fetch real-time availability from scheduling API
 * - Filter by selected date
 * - Account for technician availability
 * 
 * @returns Promise<TimeSlot[]> Array of available time slots
 */
export const getTimeSlots = cache(async (): Promise<TimeSlot[]> => {
    // Static data - matches original BookNowSection.tsx
    const timeSlots: TimeSlot[] = [
        {
            id: 'slot-1',
            label: '9:00 AM - 11:00 AM',
            startTime: '09:00',
            endTime: '11:00'
        },
        {
            id: 'slot-2',
            label: '11:00 AM - 1:00 PM',
            startTime: '11:00',
            endTime: '13:00'
        },
        {
            id: 'slot-3',
            label: '2:00 PM - 4:00 PM',
            startTime: '14:00',
            endTime: '16:00'
        },
        {
            id: 'slot-4',
            label: '4:00 PM - 6:00 PM',
            startTime: '16:00',
            endTime: '18:00'
        }
    ];

    return timeSlots;
});
