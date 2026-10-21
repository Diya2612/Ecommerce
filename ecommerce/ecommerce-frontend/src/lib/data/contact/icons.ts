/**
 * Contact Icon Map
 * 
 * Maps icon keys to Lucide React components.
 * This is used in client components to render icons
 * based on serialized icon keys from server data.
 * 
 * Usage:
 * ```tsx
 * import { contactIcons } from '@/lib/data/contact/icons';
 * 
 * const Icon = contactIcons[channel.iconKey];
 * return <Icon className="w-6 h-6" />;
 * ```
 */

import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Home,
    CheckCircle,
    Wrench,
    Package,
    MessageCircle,
    Headphones,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    User,
    Building,
    MessageSquare,
    Calendar,
    Send,
    Globe,
    type LucideIcon,
} from 'lucide-react';

/**
 * Icon map for contact-related icons
 */
export const contactIcons: Record<string, LucideIcon> = {
    // Quick contact info & general
    Phone,
    Mail,
    MapPin,
    Clock,
    Calendar,

    // Booking services
    Home,
    CheckCircle,
    Wrench,
    Package,

    // Contact channels
    MessageCircle,
    Headphones,

    // Social media
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,

    // Form fields
    User,
    Building,
    MessageSquare,
    Send,
    Globe,
};

/**
 * Get an icon component by key
 * Returns a fallback icon if key is not found
 */
export function getContactIcon(iconKey: string): LucideIcon {
    return contactIcons[iconKey] || MessageCircle;
}

/**
 * Type-safe icon keys for each category
 */
export type QuickInfoIconKey = 'Phone' | 'Mail' | 'MapPin' | 'Clock';
export type ServiceIconKey = 'Home' | 'CheckCircle' | 'Wrench' | 'Package';
export type ChannelIconKey = 'Phone' | 'MessageCircle' | 'Mail' | 'Headphones';
export type SocialIconKey = 'Facebook' | 'Twitter' | 'Instagram' | 'Linkedin' | 'Youtube';
export type FormIconKey = 'User' | 'Mail' | 'Phone' | 'MapPin' | 'Building' | 'MessageSquare';
