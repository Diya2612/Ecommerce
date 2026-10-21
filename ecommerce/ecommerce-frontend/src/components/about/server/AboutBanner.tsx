import { Award, Users, MapPin, TrendingUp } from 'lucide-react';
import { PageBanner } from '@/components/layout/PageBanner';

/**
 * AboutBanner - Server Component
 * 
 * Uses the PageBanner server component with About-specific content.
 * No client-side dependencies - fully SSR compatible.
 */
export function AboutBanner() {
    return (
        <PageBanner
            badge="ABOUT ANANT ENTERPRISES"
            title="Pioneering Pure Water Solutions Since 1998"
            description="Transforming lives through innovative water purification technology. We are committed to providing safe, pure, and healthy drinking water to every household and business across the nation."
            stats={[
                { icon: Users, value: "50K+", label: "Happy Customers" },
                { icon: MapPin, value: "500+", label: "Service Centers" },
                { icon: Award, value: "25+", label: "Years of Excellence" },
                { icon: TrendingUp, value: "98%", label: "Satisfaction Rate" }
            ]}
            align="center"
            height="lg"
            showDecorativeBlurs={true}
            showWaveSeparator={true}
        />
    );
}
