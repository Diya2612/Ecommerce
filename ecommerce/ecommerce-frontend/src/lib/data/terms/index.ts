/**
 * Terms Page Data Layer
 * 
 * This module exports all server-side data fetching functions for the Terms page.
 * Each fetcher uses React's cache() for request deduplication and is designed
 * to be called from Server Components only.
 * 
 * Usage:
 * ```tsx
 * import { getTermsSections, getTableOfContents, getTermsContactInfo } from '@/lib/data/terms';
 * 
 * export async function TermsContent() {
 *   const sections = await getTermsSections();
 *   // ...
 * }
 * ```
 */

// Terms Sections
export { getTermsSections } from './getTermsSections';

// Table of Contents
export { getTableOfContents } from './getTableOfContents';

// Contact Information
export { getTermsContactInfo } from './getTermsContactInfo';
