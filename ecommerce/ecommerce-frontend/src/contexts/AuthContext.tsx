'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { syncUser } from '@/queries';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
    /** Current authenticated user or null */
    user: User | null;
    /** Current session with tokens */
    session: Session | null;
    /** Loading state during auth operations */
    isLoading: boolean;
    /** Whether the auth state has been initialized */
    isInitialized: boolean;
    /** Sign in with email and password */
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    /** Sign up with email, password, and optional metadata */
    signUp: (email: string, password: string, metadata?: { name?: string; first_name?: string; last_name?: string }) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean; emailAlreadyExists?: boolean }>;
    /** Sign in with Google OAuth */
    signInWithGoogle: (redirectTo?: string) => Promise<{ error: Error | null }>;
    /** Send OTP to phone number */
    signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
    /** Verify phone OTP to complete login */
    verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
    /** Sign out the current user */
    signOut: () => Promise<void>;
    /** Manually refresh the session */
    refreshSession: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface AuthProviderProps {
    children: React.ReactNode;
    /** Initial session from server-side (optional, for hydration) */
    initialSession?: Session | null;
}

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
    const [session, setSession] = useState<Session | null>(initialSession);
    const [isLoading, setIsLoading] = useState(!initialSession);
    const [isInitialized, setIsInitialized] = useState(!!initialSession);
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    // Initialize auth state on mount
    useEffect(() => {
        // Skip if Supabase is not configured
        if (!supabase) {
            setIsLoading(false);
            setIsInitialized(true);
            return;
        }

        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        if (!initialSession) {
            initializeAuth();
        }

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, currentSession: Session | null) => {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setIsLoading(false);

                // Handle specific events
                switch (event) {
                    case 'SIGNED_OUT':
                        router.push('/');
                        router.refresh();
                        break;
                    case 'SIGNED_IN':
                        // Sync user to backend database on any sign in
                        // This catches OAuth and phone login as well
                        try {
                            await syncUser(currentSession?.user?.user_metadata?.name);
                        } catch (syncError) {
                            console.warn('User sync on auth change failed:', syncError);
                        }
                        // Cart merge is handled in CartContext to avoid race conditions
                        router.refresh();
                        break;
                    case 'TOKEN_REFRESHED':
                        router.refresh();
                        break;
                    case 'PASSWORD_RECOVERY':
                        // Handle password recovery if needed
                        break;
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router, initialSession]);

    // Automatic token refresh before expiry
    useEffect(() => {
        if (!supabase || !session) return;

        // Refresh token 5 minutes before expiry to prevent interruptions
        const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0; // Convert to milliseconds
        const refreshTime = expiresAt - REFRESH_BUFFER_MS;
        const timeUntilRefresh = refreshTime - Date.now();

        // Only set timer if refresh time is in the future
        if (timeUntilRefresh > 0) {
            const timer = setTimeout(async () => {
                try {
                    const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
                    if (!error && newSession) {
                        setSession(newSession);
                        setUser(newSession.user);
                    } else {
                        console.error('Token refresh failed:', error);
                    }
                } catch (error) {
                    console.error('Error refreshing token:', error);
                }
            }, timeUntilRefresh);

            return () => clearTimeout(timer);
        }
    }, [session, supabase]);

    // Sign in with email and password
    const signIn = useCallback(async (email: string, password: string) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Sync user to backend database
            try {
                await syncUser();
            } catch (syncError) {
                console.warn('User sync failed (will retry on next request):', syncError);
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // Sign up with email and password
    const signUp = useCallback(async (
        email: string,
        password: string,
        metadata?: { name?: string; first_name?: string; last_name?: string }
    ) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) throw error;

            // Detect if email already exists (obfuscated response from Supabase)
            // When email confirmation is enabled and email already exists:
            // - data.user exists
            // - data.session is null
            // - BUT user.identities is empty (this is the key indicator)
            const emailAlreadyExists = !!(
                data.user &&
                !data.session &&
                data.user.identities &&
                data.user.identities.length === 0
            );

            if (emailAlreadyExists) {
                // Email is already registered (verified account exists)
                return {
                    error: new Error('This email is already registered. Please log in or reset your password.'),
                    emailAlreadyExists: true
                };
            }

            // Check if email confirmation is required
            // Session is null when email confirmation is pending
            // User exists but no session = needs confirmation
            const needsEmailConfirmation = !!(data.user && !data.session);

            // Sync user to backend database (if session exists = no email confirmation needed)
            if (data.session) {
                try {
                    await syncUser(metadata?.name, undefined, metadata?.first_name, metadata?.last_name);
                } catch (syncError) {
                    console.warn('User sync failed (will retry on next request):', syncError);
                }
            }

            return { error: null, needsEmailConfirmation, emailAlreadyExists: false };
        } catch (error) {
            // Check for specific Supabase error codes
            const err = error as any;
            if (err.code === 'user_already_exists' || err.message?.includes('already registered')) {
                return {
                    error: new Error('This email is already registered. Please log in or reset your password.'),
                    emailAlreadyExists: true
                };
            }
            return { error: error as Error };
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // Sign in with Google OAuth
    const signInWithGoogle = useCallback(async (redirectTo?: string) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }

        try {
            // Build callback URL with redirect parameter
            const callbackUrl = new URL('/auth/callback', window.location.origin);
            if (redirectTo) {
                callbackUrl.searchParams.set('next', redirectTo);
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: callbackUrl.toString(),
                },
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }, [supabase]);

    // Sign in with Phone (send OTP)
    const signInWithPhone = useCallback(async (phone: string) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }, [supabase]);

    // Verify phone OTP
    const verifyPhoneOtp = useCallback(async (phone: string, token: string) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms',
            });

            if (error) throw error;

            // Sync user after successful phone verification
            if (data.session) {
                try {
                    await syncUser(undefined, phone);
                } catch (syncError) {
                    console.warn('User sync on phone verify failed:', syncError);
                }
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }, [supabase]);

    // Sign out
    const signOut = useCallback(async () => {
        if (!supabase) return;

        setIsLoading(true);
        try {
            await supabase.auth.signOut();
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // Refresh session manually
    const refreshSession = useCallback(async () => {
        if (!supabase) return;

        const { data: { session: newSession } } = await supabase.auth.refreshSession();
        setSession(newSession);
        setUser(newSession?.user ?? null);
    }, [supabase]);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        session,
        isLoading,
        isInitialized,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithPhone,
        verifyPhoneOtp,
        signOut,
        refreshSession,
    }), [user, session, isLoading, isInitialized, signIn, signUp, signInWithGoogle, signInWithPhone, verifyPhoneOtp, signOut, refreshSession]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
