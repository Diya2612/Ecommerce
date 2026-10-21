'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface ResendConfirmationProps {
    email: string;
}

export function ResendConfirmation({ email }: ResendConfirmationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const handleResend = async () => {
        if (cooldown > 0 || !email) return;

        setIsLoading(true);
        setError(null);

        try {
            const supabase = getSupabaseBrowserClient();
            if (!supabase) {
                throw new Error('Authentication service not configured');
            }

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;

            setIsSent(true);

            // Start 60 second cooldown
            setCooldown(60);
            const interval = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to resend email');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent && cooldown > 0) {
        return (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Email sent! You can resend in {cooldown}s</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button
                variant="outline"
                onClick={handleResend}
                disabled={isLoading || cooldown > 0}
                className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-700"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                    </>
                ) : cooldown > 0 ? (
                    <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend in {cooldown}s
                    </>
                ) : (
                    <>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend confirmation email
                    </>
                )}
            </Button>
        </div>
    );
}
