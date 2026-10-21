import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

function getSupabaseAnonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        || process.env.SUPABASE_PUBLISHABLE_KEY
        || '';
}

/**
 * Check if Supabase is properly configured with valid URL
 */
export function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = getSupabaseAnonKey();

    // Check if env vars exist and URL is valid
    if (!url || !key) return false;

    // Validate URL format
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Creates a Supabase client for browser/client-side usage.
 * Use this in Client Components ('use client').
 * 
 * Returns null if Supabase is not configured.
 */
export function createClient(): SupabaseClient | null {
    if (!isSupabaseConfigured()) {
        return null;
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        getSupabaseAnonKey()
    );
}

/**
 * Singleton pattern for client-side Supabase client.
 * Reuses the same instance to avoid creating multiple clients.
 * Returns null if Supabase is not configured.
 */
let browserClient: SupabaseClient | null = null;
let clientChecked = false;
let cachedSession: Session | null = null;
let sessionInitialized = false;

export function getSupabaseBrowserClient(): SupabaseClient | null {
    if (!clientChecked) {
        browserClient = createClient();
        clientChecked = true;

        // Set up auth state listener to keep session in sync
        if (browserClient && typeof window !== 'undefined') {
            browserClient.auth.onAuthStateChange((event, session) => {
                cachedSession = session;
                sessionInitialized = true;
            });

            // Also try to get initial session
            browserClient.auth.getSession().then(({ data: { session } }) => {
                if (!sessionInitialized) {
                    cachedSession = session;
                    sessionInitialized = true;
                }
            }).catch(() => {
                sessionInitialized = true;
            });
        }
    }
    return browserClient;
}

/**
 * Get cached session synchronously if available.
 * Returns null if session hasn't been initialized yet.
 */
export function getCachedSession(): Session | null {
    return cachedSession;
}

/**
 * Check if session has been initialized.
 */
export function isSessionReady(): boolean {
    return sessionInitialized;
}

/**
 * Wait for session to be ready (with timeout).
 */
export async function waitForSession(timeoutMs = 3000): Promise<Session | null> {
    if (sessionInitialized) {
        return cachedSession;
    }

    // Ensure client is initialized
    getSupabaseBrowserClient();

    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (sessionInitialized) {
                clearInterval(checkInterval);
                clearTimeout(timeout);
                resolve(cachedSession);
            }
        }, 50);

        const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            resolve(cachedSession);
        }, timeoutMs);
    });
}
