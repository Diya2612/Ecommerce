import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Auth Callback Handler
 * 
 * Handles:
 * - Email confirmation links
 * - OAuth provider callbacks
 * - Password reset links
 * - Magic links
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/profile/orders';

    // Check for error in URL (from Supabase redirect)
    const error = requestUrl.searchParams.get('error');
    const errorCode = requestUrl.searchParams.get('error_code');
    const errorDescription = requestUrl.searchParams.get('error_description');

    // Also check hash params (Supabase sometimes puts errors there)
    const hashParams = new URL(request.url.replace('#', '?')).searchParams;
    const hashError = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');

    // If there's an error, redirect to auth-error page
    if (error || errorCode || hashError || hashErrorCode) {
        const errorUrl = new URL('/auth-error', requestUrl.origin);
        errorUrl.searchParams.set('error', error || hashError || 'unknown');
        errorUrl.searchParams.set('error_code', errorCode || hashErrorCode || 'unknown');
        if (errorDescription) {
            errorUrl.searchParams.set('error_description', errorDescription);
        }
        return NextResponse.redirect(errorUrl);
    }

    // Exchange code for session
    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
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
                            // Handle cookies in edge functions
                        }
                    },
                },
            }
        );

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError && data.session) {
            // Sync user to backend database BEFORE redirecting
            // This ensures the user exists in public.users table
            try {
                const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';
                await fetch(`${API_BASE_URL}/auth/sync-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${data.session.access_token}`,
                    },
                    body: JSON.stringify({
                        name: data.user?.user_metadata?.name,
                    }),
                });
            } catch (syncError) {
                // Log but don't fail - sync can be retried on next login
                console.warn('User sync in callback failed:', syncError);
            }

            // Success - redirect to intended destination
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        }

        if (exchangeError) {
            // Exchange failed - redirect to error page
            const errorUrl = new URL('/auth-error', requestUrl.origin);
            errorUrl.searchParams.set('error', 'exchange_failed');
            errorUrl.searchParams.set('error_code', exchangeError.code || 'unknown');
            return NextResponse.redirect(errorUrl);
        }
    }

    // No code provided - redirect to login
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
