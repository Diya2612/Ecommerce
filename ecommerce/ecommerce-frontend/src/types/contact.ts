/**
 * Contact Page Types
 * 
 * Type definitions for contact page data structures.
 * These types support the server-side data fetching layer.
 */

/**
 * Quick contact info card displayed in the ContactBanner
 */
export interface QuickContactInfo {
    id: string;
    iconKey: 'Phone' | 'Mail' | 'MapPin' | 'Clock';
    title: string;
    value: string;
    subtitle: string;
}

/**
 * Booking service option for the BookNowSection
 */
export interface BookingService {
    id: string;
    iconKey: 'Home' | 'CheckCircle' | 'Wrench' | 'Package';
    title: string;
    description: string;
    colorFrom: string;
    colorTo: string;
    iconBg: string;
}

/**
 * Time slot for service booking
 */
export interface TimeSlot {
    id: string;
    label: string;
    startTime: string;
    endTime: string;
}

/**
 * Contact channel (phone, email, chat, whatsapp)
 */
export interface ContactChannel {
    id: string;
    iconKey: 'Phone' | 'MessageCircle' | 'Mail' | 'Headphones';
    title: string;
    primary: string;
    secondary: string;
    description: string;
    bgColorFrom: string;
    bgColorTo: string;
    iconBg: string;
    action: string;
    actionHref?: string;
}

/**
 * Regional office location
 */
export interface OfficeLocation {
    id: string;
    city: string;
    address: string;
    phone: string;
    email: string;
}

/**
 * Social media link
 */
export interface SocialLink {
    id: string;
    iconKey: 'Facebook' | 'Twitter' | 'Instagram' | 'Linkedin' | 'Youtube';
    label: string;
    href: string;
    hoverColor: string;
}

/**
 * Business hours entry
 */
export interface BusinessHours {
    id: string;
    days: string;
    hours: string;
    isEmergency?: boolean;
}

/**
 * Trust indicator for form section
 */
export interface TrustIndicator {
    id: string;
    icon: string;
    text: string;
}

/**
 * Form field configuration (for dynamic form generation if needed)
 */
export interface ContactFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'textarea';
    label: string;
    placeholder: string;
    required: boolean;
    iconKey?: 'User' | 'Mail' | 'Phone' | 'MapPin' | 'Building' | 'MessageSquare';
    colSpan?: 1 | 2;
}

/**
 * Complete contact page data bundle
 * Useful for parallel fetching all data at once
 */
export interface ContactPageData {
    quickContactInfo: QuickContactInfo[];
    bookingServices: BookingService[];
    timeSlots: TimeSlot[];
    contactChannels: ContactChannel[];
    officeLocations: OfficeLocation[];
    socialLinks: SocialLink[];
    businessHours: BusinessHours[];
    trustIndicators: TrustIndicator[];
}
