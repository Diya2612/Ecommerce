import { Skeleton } from "@/components/ui/skeleton";

export function GoogleAuthButtonSkeleton() {
    return (
        <div className="w-full">
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    );
}
