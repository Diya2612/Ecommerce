'use client';

import { useSearchParams } from 'next/navigation';
import { ResendConfirmation } from '@/components/auth/ResendConfirmation';

const errorMessages: Record<string, { title: string; description: string }> = {
    otp_expired: {
        title: 'Link Expired',
        description: 'Your confirmation link has expired. Please request a new one.',
    },
    access_denied: {
        title: 'Access Denied',
        description: 'The confirmation link is invalid or has already been used.',
    },
    default: {
        title: 'Something Went Wrong',
        description: 'An error occurred during authentication. Please try again.',
    },
};

export function AuthErrorClient() {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get('error_code') || 'default';
    const email = searchParams.get('email') || '';

    const error = errorMessages[errorCode] || errorMessages.default;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1F51] dark:text-white mb-3">
                    {error.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {error.description}
                </p>
            </div>

            {/* Show resend option for expired OTP */}
            {(errorCode === 'otp_expired' || errorCode === 'access_denied') && email && (
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Request a new confirmation email for:
                    </p>
                    <p className="font-semibold text-[#0B1F51] dark:text-white mb-4">
                        {email}
                    </p>
                    <ResendConfirmation email={email} />
                </div>
            )}
        </div>
    );
}
