/**
 * About Page Server Components
 * 
 * This barrel file exports all server-rendered components for the About page.
 * These components fetch data server-side and render with SSR-compatible animations.
 * 
 * Usage:
 * ```tsx
 * import { AboutBanner, OurStorySection, OurMissionSection } from '@/components/about/server';
 * ```
 */

// Phase 2: Easy Migrations (Pure Server Components)
export { AboutBanner } from './AboutBanner';
export { OurStorySection } from './OurStorySection';

// Phase 3: Server + Client Island Components
export { OurMissionSection } from './OurMissionSection';
export { OurValuesSection } from './OurValuesSection';
export { OurTeamSection } from './OurTeamSection';
export { AboutTestimonialsSection } from './AboutTestimonialsSection';
export { AboutCTASection } from './AboutCTASection';

// Phase 4: Complex Migrations
export { AboutFeaturedProductsSection } from './AboutFeaturedProductsSection';
