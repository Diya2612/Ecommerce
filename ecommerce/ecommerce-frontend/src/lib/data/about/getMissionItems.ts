import { cache } from 'react';
import { Target, Eye, Lightbulb } from 'lucide-react';
import type { MissionItem, MissionItemSerializable, MissionIconName } from '@/types/about';

/**
 * Fetches mission, vision, and philosophy items for the About page
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getMissionItems = cache(async (): Promise<MissionItem[]> => {
    try {
        return [
            {
                icon: Target,
                title: "Our Mission",
                description: "To provide affordable, reliable, and innovative water purification solutions that ensure every individual has access to safe and healthy drinking water.",
                color: "bg-[#0B1F51]",
                gradient: "from-[#0B1F51]/10 to-[#0B1F51]/5"
            },
            {
                icon: Eye,
                title: "Our Vision",
                description: "To be the most trusted and innovative water purification brand in India, setting new standards in quality, technology, and customer service.",
                color: "bg-[#00C4CC]",
                gradient: "from-[#00C4CC]/10 to-[#00C4CC]/5"
            },
            {
                icon: Lightbulb,
                title: "Our Philosophy",
                description: "We believe that access to pure water is a fundamental right. Through continuous innovation and unwavering commitment to quality, we strive to make this right a reality for all.",
                color: "bg-[#F5B012]",
                gradient: "from-[#F5B012]/10 to-[#F5B012]/5"
            }
        ];
    } catch (error) {
        console.error('Error fetching mission items:', error);
        return [];
    }
});

/**
 * Returns serializable mission items (for passing to client components)
 * Uses icon names instead of icon components
 */
export const getMissionItemsSerializable = cache(async (): Promise<MissionItemSerializable[]> => {
    try {
        return [
            {
                iconName: "Target" as MissionIconName,
                title: "Our Mission",
                description: "To provide affordable, reliable, and innovative water purification solutions that ensure every individual has access to safe and healthy drinking water.",
                color: "bg-[#0B1F51]",
                gradient: "from-[#0B1F51]/10 to-[#0B1F51]/5"
            },
            {
                iconName: "Eye" as MissionIconName,
                title: "Our Vision",
                description: "To be the most trusted and innovative water purification brand in India, setting new standards in quality, technology, and customer service.",
                color: "bg-[#00C4CC]",
                gradient: "from-[#00C4CC]/10 to-[#00C4CC]/5"
            },
            {
                iconName: "Lightbulb" as MissionIconName,
                title: "Our Philosophy",
                description: "We believe that access to pure water is a fundamental right. Through continuous innovation and unwavering commitment to quality, we strive to make this right a reality for all.",
                color: "bg-[#F5B012]",
                gradient: "from-[#F5B012]/10 to-[#F5B012]/5"
            }
        ];
    } catch (error) {
        console.error('Error fetching mission items:', error);
        return [];
    }
});
