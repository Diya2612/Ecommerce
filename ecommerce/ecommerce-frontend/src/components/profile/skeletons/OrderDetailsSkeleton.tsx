import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function OrderDetailsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-7 w-32" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="flex gap-2 pl-12 sm:pl-0">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            {/* Main Layout Skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline Skeleton */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                        <Skeleton className="h-6 w-40 mb-6" />
                        <div className="pl-1 space-y-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                        {i !== 4 && <div className="w-0.5 flex-1 min-h-[40px] bg-gray-100 dark:bg-slate-700 mt-2" />}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <Skeleton className="h-5 w-32 mb-2" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Items Skeleton */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {[1, 2].map((i) => (
                                <div key={i} className="p-5 flex gap-5">
                                    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                                    <div className="flex-1 min-w-0 py-1">
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-24 mb-4" />
                                        <div className="flex gap-4">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <div className="shrink-0 py-1">
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="space-y-6">
                    {/* Summary Skeleton */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                        <Skeleton className="h-6 w-32 mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-28" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Skeleton */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                        <Skeleton className="h-6 w-24 mb-6" />
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Address Skeleton */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                        <Skeleton className="h-6 w-36 mb-6" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-40 mt-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
