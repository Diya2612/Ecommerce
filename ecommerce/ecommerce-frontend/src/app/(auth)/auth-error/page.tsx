import { Suspense } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthErrorClient } from '@/components/auth/AuthErrorClient';

export const metadata = {
    title: 'Authentication Error | Anant Enterprises',
    description: 'An error occurred during authentication',
};

export default function AuthErrorPage() {
    return (
        <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
            </div>

            {/* Error content - Client side to read URL params */}
            <Suspense fallback={<div className="h-40" />}>
                <AuthErrorClient />
            </Suspense>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Button>
                </Link>
                <Link href="/register" className="flex-1">
                    <Button className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] rounded-xl">
                        Create new account
                    </Button>
                </Link>
            </div>
        </div>
    );
}
