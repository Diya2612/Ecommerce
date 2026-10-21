/**
 * Supabase Client Exports
 * 
 * This module provides Supabase clients for different contexts:
 * 
 * - `client.ts` - For Client Components (browser-side)
 * - `server.ts` - For Server Components, Route Handlers, Server Actions
 * - `middleware.ts` - For Next.js middleware (session refresh)
 * 
 * @example
 * ```tsx
 * // Client Component
 * import { createClient } from '@/lib/supabase/client';
 * 
 * // Server Component
 * import { createServerSupabaseClient, getUser } from '@/lib/supabase/server';
 * 
 * // Middleware
 * import { updateSession } from '@/lib/supabase/middleware';
 * ```
 */

export { createClient, getSupabaseBrowserClient } from './client';
export { createServerSupabaseClient, getUser, getSession } from './server';
export { updateSession } from './middleware';
