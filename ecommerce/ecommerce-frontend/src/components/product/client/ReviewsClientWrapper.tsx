'use client';

import dynamic from 'next/dynamic';
import type { ReviewsClientProps } from '@/types/product';

// Loading skeleton
function ReviewsSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-10 bg-gray-200 rounded w-36" />
            </div>
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-16 mb-4" />
                                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Lazy load ReviewsClient (ssr: false only works in client components)
const ReviewsClient = dynamic(
    () => import('./ReviewsClient').then(mod => mod.ReviewsClient),
    {
        ssr: false,
        loading: () => <ReviewsSkeleton />,
    }
);

/**
 * ReviewsClientWrapper - Client Component
 * 
 * Wraps ReviewsClient with dynamic import for lazy loading
 * This allows ssr: false which isn't permitted in Server Components
 */
export function ReviewsClientWrapper(props: ReviewsClientProps) {
    return <ReviewsClient {...props} />;
}
