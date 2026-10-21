import { Skeleton } from "@/components/ui/skeleton";

export function LoginFormSkeleton() {
    return (
        <div className="space-y-6">
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-28" />
            </div>

            {/* Sign In Button */}
            <Skeleton className="h-12 w-full rounded-xl" />

            {/* Create Account Link */}
            <div className="flex justify-center pt-2">
                <Skeleton className="h-5 w-48" />
            </div>
        </div>
    );
}
