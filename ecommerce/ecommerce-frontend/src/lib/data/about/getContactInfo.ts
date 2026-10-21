import { cache } from 'react';
import { MapPin, Clock, Headphones, Phone, MessageCircle, Mail } from 'lucide-react';
import type { QuickContactInfo, ContactMethod, QuickContactInfoSerializable, ContactMethodSerializable, ContactIconName } from '@/types/about';

/**
 * Fetches quick contact info for the About page CTA section
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getQuickContactInfo = cache(async (): Promise<QuickContactInfo[]> => {
    try {
        return [
            {
                icon: MapPin,
                title: "Visit Us",
                subtitle: "Main Office",
                description: "Corporate Office: Head Office, Mumbai, India",
                iconBg: "bg-[#00C4CC]"
            },
            {
                icon: Clock,
                title: "Working Hours",
                subtitle: "We're here when you need us",
                description: "Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM",
                iconBg: "bg-[#F5B012]"
            },
            {
                icon: Headphones,
                title: "24/7 Support",
                subtitle: "Emergency assistance available",
                description: "For urgent service requests and technical support",
                iconBg: "bg-[#22C55E]"
            }
        ];
    } catch (error) {
        console.error('Error fetching quick contact info:', error);
        return [];
    }
});

/**
 * Returns serializable quick contact info (for passing to client components)
 */
export const getQuickContactInfoSerializable = cache(async (): Promise<QuickContactInfoSerializable[]> => {
    try {
        return [
            {
                iconName: "MapPin" as ContactIconName,
                title: "Visit Us",
                subtitle: "Main Office",
                description: "Corporate Office: Head Office, Mumbai, India",
                iconBg: "bg-[#00C4CC]"
            },
            {
                iconName: "Clock" as ContactIconName,
                title: "Working Hours",
                subtitle: "We're here when you need us",
                description: "Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM",
                iconBg: "bg-[#F5B012]"
            },
            {
                iconName: "Headphones" as ContactIconName,
                title: "24/7 Support",
                subtitle: "Emergency assistance available",
                description: "For urgent service requests and technical support",
                iconBg: "bg-[#22C55E]"
            }
        ];
    } catch (error) {
        console.error('Error fetching quick contact info:', error);
        return [];
    }
});

/**
 * Fetches contact methods for the About page CTA section
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getContactMethods = cache(async (): Promise<ContactMethod[]> => {
    try {
        return [
            {
                icon: Phone,
                title: "Call Us",
                value: "+91 90753 66955",
                description: "Mon-Sat, 9 AM - 9 PM",
                bg: "from-[#0B1F51]/10 to-[#0B1F51]/5",
                iconBg: "bg-[#0B1F51]"
            },
            {
                icon: MessageCircle,
                title: "Live Chat",
                value: "Available Now",
                description: "Instant response guaranteed",
                bg: "from-[#00C4CC]/10 to-[#00C4CC]/5",
                iconBg: "bg-[#00C4CC]"
            },
            {
                icon: Mail,
                title: "Email Us",
                value: "yogeshwar.ptl@gmail.com",
                description: "Response within 24 hours",
                bg: "from-[#F5B012]/10 to-[#F5B012]/5",
                iconBg: "bg-[#F5B012]"
            }
        ];
    } catch (error) {
        console.error('Error fetching contact methods:', error);
        return [];
    }
});

/**
 * Returns serializable contact methods (for passing to client components)
 */
export const getContactMethodsSerializable = cache(async (): Promise<ContactMethodSerializable[]> => {
    try {
        return [
            {
                iconName: "Phone" as ContactIconName,
                title: "Call Us",
                value: "+91 90753 66955",
                description: "Mon-Sat, 9 AM - 9 PM",
                bg: "from-[#0B1F51]/10 to-[#0B1F51]/5",
                iconBg: "bg-[#0B1F51]"
            },
            {
                iconName: "MessageCircle" as ContactIconName,
                title: "Live Chat",
                value: "Available Now",
                description: "Instant response guaranteed",
                bg: "from-[#00C4CC]/10 to-[#00C4CC]/5",
                iconBg: "bg-[#00C4CC]"
            },
            {
                iconName: "Mail" as ContactIconName,
                title: "Email Us",
                value: "yogeshwar.ptl@gmail.com",
                description: "Response within 24 hours",
                bg: "from-[#F5B012]/10 to-[#F5B012]/5",
                iconBg: "bg-[#F5B012]"
            }
        ];
    } catch (error) {
        console.error('Error fetching contact methods:', error);
        return [];
    }
});
