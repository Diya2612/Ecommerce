import { cache } from 'react';
import type { ContactChannel } from '@/types/contact';

/**
 * Get contact channels (phone, email, chat, etc.)
 * 
 * Currently returns static data. In production, this could:
 * - Fetch from CMS for easy updates
 * - Include real-time availability status for chat
 * - Personalize based on user location
 * 
 * @returns Promise<ContactChannel[]> Array of contact channels
 */
export const getContactChannels = cache(async (): Promise<ContactChannel[]> => {
    // Static data - matches original ContactUsSection.tsx
    const channels: ContactChannel[] = [
        {
            id: 'phone',
            iconKey: 'Phone',
            title: 'Call Us',
            primary: '+91 90753 66955',
            secondary: 'Available 9 AM - 9 PM',
            description: 'Speak directly with our support team',
            bgColorFrom: 'from-[#0B1F51]/10',
            bgColorTo: 'to-[#0B1F51]/5',
            iconBg: 'bg-[#0B1F51]',
            action: 'Call Now',
            actionHref: 'tel:9075366955'
        },
        // {
        //     id: 'chat',
        //     iconKey: 'MessageCircle',
        //     title: 'Live Chat',
        //     primary: 'Available Now',
        //     secondary: 'Average response: 2 min',
        //     description: 'Get instant help from our chat team',
        //     bgColorFrom: 'from-[#00C4CC]/10',
        //     bgColorTo: 'to-[#00C4CC]/5',
        //     iconBg: 'bg-[#00C4CC]',
        //     action: 'Start Chat',
        //     actionHref: '#chat'
        // },
        {
            id: 'email',
            iconKey: 'Mail',
            title: 'Email Support',
            primary: 'yogeshwar.ptl@gmail.com',
            secondary: 'Response within 24 hours',
            description: 'Send us detailed queries anytime',
            bgColorFrom: 'from-[#F5B012]/10',
            bgColorTo: 'to-[#F5B012]/5',
            iconBg: 'bg-[#F5B012]',
            action: 'Send Email',
            actionHref: 'mailto:yogeshwar.ptl@gmail.com'
        },
        {
            id: 'whatsapp',
            iconKey: 'Headphones',
            title: 'WhatsApp',
            primary: '+91 90753 66955',
            secondary: 'Quick assistance',
            description: 'Chat with us on WhatsApp',
            bgColorFrom: 'from-[#22C55E]/10',
            bgColorTo: 'to-[#22C55E]/5',
            iconBg: 'bg-[#22C55E]',
            action: 'Message Us',
            actionHref: 'https://wa.me/919075366955'
        }
    ];

    return channels;
});
