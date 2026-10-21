/**
 * Technology Page Data Layer
 * 
 * This module exports all server-side data fetching functions for the Technology page.
 * Each fetcher uses React's cache() for request deduplication and is designed
 * to be called from Server Components only.
 * 
 * Usage:
 * ```tsx
 * import { getTechnologies } from '@/lib/data/technology';
 * 
 * export async function TechnologyContent() {
 *   const technologies = await getTechnologies();
 *   // ...
 * }
 * ```
 */

export { getTechnologies } from './getTechnologies';
