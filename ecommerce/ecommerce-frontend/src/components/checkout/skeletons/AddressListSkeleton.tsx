// ============================================================================
// AddressListSkeleton - Loading placeholder for address lists
// ============================================================================

interface AddressListSkeletonProps {
    count?: number;
}

export function AddressListSkeleton({ count = 2 }: AddressListSkeletonProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 animate-pulse"
                >
                    <div className="flex items-start gap-3">
                        {/* Icon placeholder */}
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg shrink-0" />

                        {/* Content placeholder */}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-48" />
                        </div>

                        {/* Radio placeholder */}
                        <div className="w-6 h-6 bg-gray-200 dark:bg-slate-700 rounded-full shrink-0" />
                    </div>
                </div>
            ))}
        </div>
    );
}
