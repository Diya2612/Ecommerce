'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const supabase = getSupabaseBrowserClient();

            if (!supabase) {
                setError('Authentication service is not configured');
                return;
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#0B1F51] dark:text-white mb-2">
                        Check your email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        We&apos;ve sent password reset instructions to{' '}
                        <span className="font-semibold">{email}</span>.
                    </p>
                </div>
                <Link href="/login">
                    <Button variant="outline" className="w-full h-12 rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0B1F51] dark:text-white mb-2">
                    Forgot your password?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    No worries! Enter your email and we&apos;ll send you reset instructions.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#31CDD4] focus:border-transparent"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                    </>
                ) : (
                    'Send Reset Link'
                )}
            </Button>

            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#31CDD4] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
            </Link>
        </form>
    );
}
