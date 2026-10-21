import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Home, Share2, ArrowRight } from "lucide-react";

export function SuccessPageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Success Header Skeleton */}
            <div className="bg-gradient-to-r from-[#0B1F51] to-[#00C4CC] pt-28 md:pt-32">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="flex flex-col items-center">
                        {/* Animated Checkmark Placeholder */}
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 relative">
                            <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse" />
                        </div>

                        {/* Title & Description Skeleton */}
                        <Skeleton className="h-10 w-64 bg-white/20 mb-3" />
                        <Skeleton className="h-6 w-80 bg-white/20 max-w-md mx-auto" />

                        {/* Order Number Badge Skeleton */}
                        <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5">
                            <Skeleton className="h-4 w-16 bg-white/20" />
                            <Skeleton className="h-6 w-24 bg-white/20" />
                            <div className="w-4 h-4 bg-white/20 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* Left Column - Timeline & Actions */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Timeline Skeleton */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                            <Skeleton className="h-7 w-40 mb-6" />

                            <div className="pl-2 space-y-0">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                            {i !== 4 && (
                                                <div className="w-0.5 h-10 bg-gray-100 dark:bg-slate-800 my-1" />
                                            )}
                                        </div>
                                        <div className="pb-8">
                                            <Skeleton className="h-5 w-32 mb-2" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What's Next Skeleton */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-blue-100 dark:border-slate-700">
                            <Skeleton className="h-6 w-48 mb-6" />
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-60" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons Skeleton */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Skeleton className="h-12 flex-1 rounded-xl" />
                            <Skeleton className="h-12 flex-1 rounded-xl" />
                            <Skeleton className="h-12 w-12 rounded-xl" />
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden sticky top-24">
                            {/* Header */}
                            <div className="bg-gray-50 dark:bg-slate-800 px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                                <Skeleton className="h-6 w-36" />
                            </div>

                            <div className="p-6">
                                <div className="space-y-4 mb-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-4">
                                            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed border-gray-200 dark:border-slate-700 my-4" />

                                {/* Price Breakdown */}
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex justify-between">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 dark:border-slate-700 mt-4 pt-4">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-7 w-28" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Continue Shopping Card Skeleton */}
                        <div className="mt-6 bg-gradient-to-br from-[#0B1F51] to-[#00C4CC] rounded-2xl p-6">
                            <Skeleton className="h-6 w-40 bg-white/20 mb-2" />
                            <Skeleton className="h-4 w-56 bg-white/20 mb-4" />
                            <Skeleton className="h-10 w-full bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
