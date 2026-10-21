import { Skeleton } from "@/components/ui/skeleton";

export function RegisterFormSkeleton() {
    return (
        <div className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2 py-1">
                <Skeleton className="h-4 w-4 rounded mt-1" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-4 w-40 sm:hidden" />
                </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-12 w-full rounded-xl" />

            {/* Footer Link */}
            <div className="flex justify-center pt-2">
                <Skeleton className="h-5 w-48" />
            </div>
        </div>
    );
}
