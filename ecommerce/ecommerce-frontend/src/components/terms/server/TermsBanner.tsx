import { PageBanner } from '@/components/layout/PageBanner';

/**
 * TermsBanner - Server Component
 * 
 * Uses the PageBanner server component with Terms-specific content.
 * No client-side dependencies - fully SSR compatible.
 */
export function TermsBanner() {
    return (
        <PageBanner
            title="Terms & Conditions"
            description="Please read these terms carefully before using our services."
            height="xl"
            showWaveSeparator={true}
        />
    );
}
