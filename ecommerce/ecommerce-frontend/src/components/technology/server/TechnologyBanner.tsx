import { PageBanner } from '@/components/layout/PageBanner';

/**
 * TechnologyBanner - Server Component
 * 
 * Uses the PageBanner server component with Technology-specific content.
 * No client-side dependencies - fully SSR compatible.
 */
export function TechnologyBanner() {
    return (
        <PageBanner
            title="Our Technology"
            description="Advanced purification systems designed for purity, health, and wellness."
            backButton={{ label: "Back to Home", href: "/" }}
            height="xl"
            showWaveSeparator={true}
        />
    );
}
