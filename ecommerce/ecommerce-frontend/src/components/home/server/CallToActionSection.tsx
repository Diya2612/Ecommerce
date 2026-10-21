import { CallToActionClient } from '../client/CallToActionClient';

/**
 * CallToActionSection - Server Component
 * 
 * Simple wrapper that delegates to client component for router interactions
 * Maintains EXACT same visual appearance as original CallToAction component
 * 
 * Note: This is mostly client-side due to router navigation,
 * but keeping in server structure for consistency
 */
export async function CallToActionSection() {
    return <CallToActionClient />;
}
