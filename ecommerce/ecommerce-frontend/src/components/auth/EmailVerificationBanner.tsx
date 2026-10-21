'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Email Verification Tag
 * 
 * Displays a compact tag showing email verification status.
 * Shows "Verified" (green) or "Not Verified" (amber) with option to resend email.
 */
export function EmailVerificationBanner() {
    const { user } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);
    const supabase = getSupabaseBrowserClient();

    // Check if email is verified
    const isEmailVerified = !!user?.email_confirmed_at;

    // Cooldown timer effect
    useEffect(() => {
        if (cooldownSeconds > 0) {
            const timer = setTimeout(() => {
                setCooldownSeconds(cooldownSeconds - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownSeconds]);

    if (!user) {
        return null;
    }

    const handleResendEmail = async () => {
        if (!supabase || !user?.email) return;

        setIsResending(true);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) throw error;

            setResendSuccess(true);
            setCooldownSeconds(60);

            setTimeout(() => {
                setResendSuccess(false);
            }, 5000);
        } catch (error: any) {
            console.error('Failed to resend:', error);
        } finally {
            setIsResending(false);
        }
    };

    if (isEmailVerified) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Verified
            </span>
        );
    }

    return (
        <div className="relative inline-flex items-center">
            <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            >
                <AlertCircle className="w-3 h-3" />
                Not Verified
            </button>

            {/* Tooltip/Dropdown for resend option */}
            {showTooltip && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[250px]">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Please verify your email to access all features.
                    </p>

                    {resendSuccess && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Email sent!</span>
                        </div>
                    )}

                    <Button
                        onClick={handleResendEmail}
                        disabled={isResending || cooldownSeconds > 0}
                        size="sm"
                        className="w-full text-sm"
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : cooldownSeconds > 0 ? (
                            `Resend in ${cooldownSeconds}s`
                        ) : (
                            <>
                                <Mail className="w-4 h-4 mr-2" />
                                Resend Verification Email
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
