/**
 * Contact Page Data Layer
 * 
 * Barrel export for all contact page data fetchers.
 * 
 * Usage:
 * ```tsx
 * import { getQuickContactInfo, getBookingServices } from '@/lib/data/contact';
 * ```
 */

export { getQuickContactInfo } from './getQuickContactInfo';
export { getBookingServices } from './getBookingServices';
export { getTimeSlots } from './getTimeSlots';
export { getContactChannels } from './getContactChannels';
export { getOfficeLocations } from './getOfficeLocations';
export { getSocialLinks } from './getSocialLinks';
export { getBusinessHours } from './getBusinessHours';
export { getTrustIndicators } from './getTrustIndicators';

// Re-export types for convenience
export type {
    QuickContactInfo,
    BookingService,
    TimeSlot,
    ContactChannel,
    OfficeLocation,
    SocialLink,
    BusinessHours,
    TrustIndicator,
    ContactPageData,
} from '@/types/contact';
