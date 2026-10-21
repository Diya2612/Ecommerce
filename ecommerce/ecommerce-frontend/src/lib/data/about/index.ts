/**
 * About Page Data Layer
 * 
 * This module exports all server-side data fetching functions for the About page.
 * Each fetcher uses React's cache() for request deduplication and is designed
 * to be called from Server Components only.
 * 
 * For data that needs to be passed to Client Components, use the *Serializable
 * versions which return icon names (strings) instead of icon components.
 * 
 * Usage:
 * ```tsx
 * // For server-only rendering (with icon components)
 * import { getMissionItems, getValues } from '@/lib/data/about';
 * 
 * // For passing to client components (with icon names)
 * import { getMissionItemsSerializable, getValuesSerializable } from '@/lib/data/about';
 * ```
 */

// Our Story Section
export { getMilestones } from './getMilestones';

// Our Mission Section
export { getMissionItems, getMissionItemsSerializable } from './getMissionItems';

// Our Values Section
export { getValues, getValuesSerializable } from './getValues';

// Our Team Section
export { getTeamMembers } from './getTeamMembers';

// Testimonials Section
export { getAboutTestimonials } from './getTestimonials';

// Featured Products Section
export { getAboutFeaturedProducts } from './getFeaturedProducts';

// CTA Section
export {
    getQuickContactInfo,
    getQuickContactInfoSerializable,
    getContactMethods,
    getContactMethodsSerializable
} from './getContactInfo';
