import { Skeleton } from "@/components/ui/skeleton";
import { LoginFormSkeleton } from "./LoginFormSkeleton";

export function LoginTabsSkeleton() {
    return (
        <div>
            {/* Tab buttons */}
            <div className="flex gap-2 p-1 mb-6 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <div className="flex-1">
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
                <div className="flex-1">
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
            </div>

            {/* Tab content */}
            <LoginFormSkeleton />
        </div>
    );
}
