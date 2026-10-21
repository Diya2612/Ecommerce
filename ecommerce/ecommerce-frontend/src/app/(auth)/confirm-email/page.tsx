import { Suspense } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ResendConfirmationClient } from '@/components/auth/ResendConfirmationClient';

export const metadata = {
    title: 'Confirm Your Email | Anant Enterprises',
    description: 'Please check your email to confirm your account',
};

export default function ConfirmEmailPage() {
    return (
        <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#31CDD4]/20 to-cyan-100 dark:from-[#31CDD4]/10 dark:to-cyan-900/20 flex items-center justify-center">
                    <Mail className="w-10 h-10 text-[#31CDD4]" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1F51] dark:text-white mb-3">
                Check your email
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
                We&apos;ve sent a confirmation link to your email address.
                <br />
                Click the link to verify your account.
            </p>

            {/* Email display and resend - Client Component */}
            <Suspense fallback={<div className="h-20" />}>
                <ResendConfirmationClient />
            </Suspense>

            {/* Tips */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Didn&apos;t receive the email?
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Wait a few minutes and try resending</li>
                </ul>
            </div>

            {/* Back to login */}
            <Link href="/login" className="block mt-6">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Button>
            </Link>
        </div>
    );
}
