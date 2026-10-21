import { cache } from 'react';
import type { SocialLink } from '@/types/contact';

/**
 * Get social media links
 * 
 * Currently returns static data. In production, this could:
 * - Fetch from CMS/configuration
 * - Include follower counts
 * - Filter by active platforms
 * 
 * @returns Promise<SocialLink[]> Array of social media links
 */
export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
    // Static data - matches original ContactUsSection.tsx
    const socialLinks: SocialLink[] = [
        {
            id: 'facebook',
            iconKey: 'Facebook',
            label: 'Facebook',
            href: 'https://facebook.com/anantenterprises',
            hoverColor: 'hover:bg-[#1877F2]'
        },
        {
            id: 'twitter',
            iconKey: 'Twitter',
            label: 'Twitter',
            href: 'https://twitter.com/anantenterprises',
            hoverColor: 'hover:bg-[#1DA1F2]'
        },
        {
            id: 'instagram',
            iconKey: 'Instagram',
            label: 'Instagram',
            href: 'https://instagram.com/anantenterprises',
            hoverColor: 'hover:bg-[#E4405F]'
        },
        {
            id: 'linkedin',
            iconKey: 'Linkedin',
            label: 'LinkedIn',
            href: 'https://linkedin.com/company/anantenterprises',
            hoverColor: 'hover:bg-[#0A66C2]'
        },
        {
            id: 'youtube',
            iconKey: 'Youtube',
            label: 'YouTube',
            href: 'https://youtube.com/anantenterprises',
            hoverColor: 'hover:bg-[#FF0000]'
        }
    ];

    return socialLinks;
});
