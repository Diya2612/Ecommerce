export function BookNowSkeleton() {
    return (
        <div className="py-24 bg-white container mx-auto px-4">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-100 rounded-lg mx-auto mb-16 animate-pulse" />

            {/* Service Grid Skeleton */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 bg-gray-100 rounded-card animate-pulse" />
                ))}
            </div>

            {/* Date Picker Skeleton */}
            <div className="h-96 bg-gray-50 rounded-[28px] animate-pulse" />
        </div>
    );
}

export function EnterDetailsSkeleton() {
    return (
        <div className="py-24 bg-[#F9FBFD] container mx-auto px-4">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-100 rounded-lg mx-auto mb-16 animate-pulse" />

            {/* Form Skeleton */}
            <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-[28px] animate-pulse" />
        </div>
    );
}

export function ContactUsSkeleton() {
    return (
        <div className="py-24 bg-white container mx-auto px-4">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-100 rounded-lg mx-auto mb-16 animate-pulse" />

            {/* Channels Grid Skeleton */}
            <div className="grid md:grid-cols-4 gap-6 mb-20">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 bg-gray-100 rounded-card animate-pulse" />
                ))}
            </div>

            {/* Offices Skeleton */}
            <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-8 animate-pulse" />
            <div className="grid md:grid-cols-2 gap-6 mb-20">
                {[1, 2].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-card animate-pulse" />
                ))}
            </div>

            {/* Bottom Card Skeleton */}
            <div className="h-96 bg-[#0B1F51]/10 rounded-[28px] animate-pulse" />
        </div>
    );
}
