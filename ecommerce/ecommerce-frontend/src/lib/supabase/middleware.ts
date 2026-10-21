import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getSupabaseAnonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        || process.env.SUPABASE_PUBLISHABLE_KEY
        || '';
}

/**
 * Updates the user session by refreshing the token if needed.
 * This should be called in the Next.js middleware to ensure
 * sessions stay fresh across requests.
 * 
 * IMPORTANT: Use getUser() instead of getSession() in middleware
 * because getSession() reads from cookies which can be spoofed.
 * getUser() verifies the JWT with Supabase servers.
 * 
 * @param request - The incoming Next.js request
 * @returns Object containing the user, session (if authenticated) and the response
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        getSupabaseAnonKey(),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Get both user and session
    // User is verified with Supabase servers (secure)
    // Session contains the access_token for API calls
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    return { user, session, supabaseResponse };
}
