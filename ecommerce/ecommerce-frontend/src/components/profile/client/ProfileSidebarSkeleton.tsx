import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSidebarSkeleton() {
    return (
        <div className="space-y-4">
            {/* Mobile User Card Skeleton */}
            <div className="lg:hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </div>

            {/* Main Navigation Card Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800">
                    <Skeleton className="h-6 w-32" />
                </div>

                <div className="p-2 space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-40 hidden lg:block" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logout Button Skeleton */}
                <div className="p-2 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-40 hidden lg:block" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Card Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-20 mt-2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
