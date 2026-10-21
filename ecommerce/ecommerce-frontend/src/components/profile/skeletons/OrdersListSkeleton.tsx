import { Skeleton } from "@/components/ui/skeleton";

export function OrdersListSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden"
                >
                    {/* Header Skeleton */}
                    <div className="p-4 sm:p-5 flex flex-wrap items-center gap-4 border-b border-gray-50 dark:border-slate-700/50">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <div className="flex items-center gap-6 flex-wrap">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="ml-auto">
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-4">
                            {/* Images Stack */}
                            <div className="flex -space-x-3">
                                <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white dark:border-slate-800" />
                                <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white dark:border-slate-800" />
                            </div>

                            {/* Summary Text */}
                            <div className="flex-1 min-w-0">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>

                            {/* Action Button */}
                            <div className="shrink-0">
                                <Skeleton className="h-9 w-24 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
