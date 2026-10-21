'use client';

import { motion } from 'motion/react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import type { SocialLink } from '@/types/contact';

/**
 * Icon mapping for social links
 */
const iconMap = {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
} as const;

interface SocialLinksClientProps {
    socialLinks: SocialLink[];
}

/**
 * SocialLinksClient - Client Component
 * 
 * Social media links with hover/tap animations.
 * Requires client-side for whileHover/whileTap interactions.
 * 
 * MAINTAINS EXACT SAME UI as original ContactUsSection.tsx
 */
export function SocialLinksClient({ socialLinks }: SocialLinksClientProps) {
    return (
        <div className="flex gap-3">
            {socialLinks.map((social) => {
                const Icon = iconMap[social.iconKey];
                return (
                    <motion.a
                        key={social.id}
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 bg-white/10 backdrop-blur-xs border border-white/20 rounded-input flex items-center justify-center text-white hover:text-white transition-all duration-300 ${social.hoverColor}`}
                        aria-label={`Follow us on ${social.label}`}
                    >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                    </motion.a>
                );
            })}
        </div>
    );
}
