import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseAnonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        || process.env.SUPABASE_PUBLISHABLE_KEY
        || '';
}

/**
 * Creates a Supabase client for server-side usage.
 * Use this in Server Components, Route Handlers, and Server Actions.
 * 
 * IMPORTANT: This function is async because Next.js 15+ requires
 * awaiting the cookies() function.
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * import { createServerSupabaseClient } from '@/lib/supabase/server';
 * 
 * export default async function Page() {
 *   const supabase = await createServerSupabaseClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 * }
 * ```
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        getSupabaseAnonKey(),
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing sessions.
                    }
                },
            },
        }
    );
}

/**
 * Get the current authenticated user from server-side.
 * Returns null if not authenticated.
 * 
 * @example
 * ```tsx
 * const user = await getUser();
 * if (!user) redirect('/login');
 * ```
 */
export async function getUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

/**
 * Get the current session from server-side.
 * Returns null if no valid session exists.
 * 
 * @example
 * ```tsx
 * const session = await getSession();
 * const accessToken = session?.access_token;
 * ```
 */
export async function getSession() {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        return null;
    }

    return session;
}
