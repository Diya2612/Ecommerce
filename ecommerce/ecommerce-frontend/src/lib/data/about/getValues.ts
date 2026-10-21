import { cache } from 'react';
import { Shield, Users, Zap, Heart, Leaf, TrendingUp } from 'lucide-react';
import type { ValueItem, ValueItemSerializable, ValueIconName } from '@/types/about';

/**
 * Fetches core values for the About page OurValues section
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getValues = cache(async (): Promise<ValueItem[]> => {
    try {
        return [
            {
                icon: Shield,
                title: "Quality First",
                description: "We never compromise on quality. Every product undergoes rigorous testing to ensure it meets the highest standards.",
                color: "text-[#0B1F51]",
                bg: "bg-[#0B1F51]/10"
            },
            {
                icon: Users,
                title: "Customer Centric",
                description: "Our customers are at the heart of everything we do. Their satisfaction drives our innovation and service excellence.",
                color: "text-[#00C4CC]",
                bg: "bg-[#00C4CC]/10"
            },
            {
                icon: Zap,
                title: "Innovation",
                description: "We continuously invest in R&D to bring cutting-edge technology and solutions to address evolving water challenges.",
                color: "text-[#F5B012]",
                bg: "bg-[#F5B012]/10"
            },
            {
                icon: Heart,
                title: "Integrity",
                description: "Honesty and transparency guide our business practices. We build trust through consistent, ethical actions.",
                color: "text-[#EF4444]",
                bg: "bg-[#EF4444]/10"
            },
            {
                icon: Leaf,
                title: "Sustainability",
                description: "We're committed to eco-friendly practices, from energy-efficient products to responsible manufacturing processes.",
                color: "text-[#22C55E]",
                bg: "bg-[#22C55E]/10"
            },
            {
                icon: TrendingUp,
                title: "Continuous Growth",
                description: "We believe in perpetual improvement - of our products, our services, and ourselves as a team.",
                color: "text-[#8B5CF6]",
                bg: "bg-[#8B5CF6]/10"
            }
        ];
    } catch (error) {
        console.error('Error fetching values:', error);
        return [];
    }
});

/**
 * Returns serializable values (for passing to client components)
 * Uses icon names instead of icon components
 */
export const getValuesSerializable = cache(async (): Promise<ValueItemSerializable[]> => {
    try {
        return [
            {
                iconName: "Shield" as ValueIconName,
                title: "Quality First",
                description: "We never compromise on quality. Every product undergoes rigorous testing to ensure it meets the highest standards.",
                color: "text-[#0B1F51]",
                bg: "bg-[#0B1F51]/10"
            },
            {
                iconName: "Users" as ValueIconName,
                title: "Customer Centric",
                description: "Our customers are at the heart of everything we do. Their satisfaction drives our innovation and service excellence.",
                color: "text-[#00C4CC]",
                bg: "bg-[#00C4CC]/10"
            },
            {
                iconName: "Zap" as ValueIconName,
                title: "Innovation",
                description: "We continuously invest in R&D to bring cutting-edge technology and solutions to address evolving water challenges.",
                color: "text-[#F5B012]",
                bg: "bg-[#F5B012]/10"
            },
            {
                iconName: "Heart" as ValueIconName,
                title: "Integrity",
                description: "Honesty and transparency guide our business practices. We build trust through consistent, ethical actions.",
                color: "text-[#EF4444]",
                bg: "bg-[#EF4444]/10"
            },
            {
                iconName: "Leaf" as ValueIconName,
                title: "Sustainability",
                description: "We're committed to eco-friendly practices, from energy-efficient products to responsible manufacturing processes.",
                color: "text-[#22C55E]",
                bg: "bg-[#22C55E]/10"
            },
            {
                iconName: "TrendingUp" as ValueIconName,
                title: "Continuous Growth",
                description: "We believe in perpetual improvement - of our products, our services, and ourselves as a team.",
                color: "text-[#8B5CF6]",
                bg: "bg-[#8B5CF6]/10"
            }
        ];
    } catch (error) {
        console.error('Error fetching values:', error);
        return [];
    }
});
