import { Droplets, ShieldCheck, Sparkles } from 'lucide-react';
import { PageBanner } from '@/components/layout/PageBanner';

/**
 * CollectionBannerSection - Pure Server Component
 * 
 * Renders the collection page hero banner with:
 * - Title and description
 * - Breadcrumb navigation
 * - Feature highlights
 * - Decorative elements
 * 
 * No interactive elements - fully server rendered
 */
export function CollectionBannerSection() {
    return (
        <PageBanner
            title="Premium Water Purifiers"
            description="Discover our complete range of water purification systems, meticulously engineered for purity, performance, and premium design. Each product combines cutting-edge technology with elegant aesthetics."

            features={[
                { icon: Droplets, text: "Pure & Safe" },
                { icon: ShieldCheck, text: "Certified Quality" },
                { icon: Sparkles, text: "Premium Design" }
            ]}
            align="center"
            height="md"
            showDecorativeBlurs={true}
            showWaveSeparator={true}
            waveSeparatorType="gradient"
        />
    );
}
