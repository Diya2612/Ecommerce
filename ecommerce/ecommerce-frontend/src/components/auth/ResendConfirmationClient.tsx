'use client';

import { useSearchParams } from 'next/navigation';
import { ResendConfirmation } from '@/components/auth/ResendConfirmation';

export function ResendConfirmationClient() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    return (
        <div className="space-y-4">
            {email && (
                <div className="p-4 bg-[#31CDD4]/10 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Confirmation sent to:
                    </p>
                    <p className="font-semibold text-[#0B1F51] dark:text-white">
                        {email}
                    </p>
                </div>
            )}

            {email && <ResendConfirmation email={email} />}
        </div>
    );
}
