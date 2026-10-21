import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Protected routes that require authentication
 */
const protectedRoutes = ['/checkout', '/profile', '/payment', '/orders'];

/**
 * Auth routes that should redirect to dashboard if user is logged in
 */
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return false;

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Sync user to backend database
 */
async function syncUserToBackend(accessToken: string, userName?: string): Promise<boolean> {
    try {
        const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/auth/sync-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name: userName,
            }),
        });
        return response.ok;
    } catch (error) {
        console.warn('User sync in proxy failed:', error);
        return false;
    }
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip proxy if Supabase is not configured (development mode)
    if (!isSupabaseConfigured()) {
        return NextResponse.next();
    }

    // Update session and get user + session
    const { user, session, supabaseResponse } = await updateSession(request);

    // Check if accessing protected route
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Check if accessing auth route
    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Sync user to backend on first protected route access after login
    // Uses a cookie flag to avoid syncing on every request
    if (isProtectedRoute && user && session?.access_token) {
        const syncCookie = request.cookies.get('user_synced');

        if (!syncCookie) {
            const synced = await syncUserToBackend(
                session.access_token,
                user.user_metadata?.name
            );

            if (synced) {
                // Set cookie to prevent syncing again this session
                supabaseResponse.cookies.set('user_synced', 'true', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24, // 24 hours
                    path: '/',
                });
            }
        }
    }

    // Redirect authenticated users from auth routes to profile
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/profile', request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
