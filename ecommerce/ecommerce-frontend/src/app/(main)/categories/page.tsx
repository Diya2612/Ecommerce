import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { getTierHierarchy } from '@/queries';
import { TierNode } from '@/types/tier';
import { Button } from '@/components/ui/button';
import { PageBanner } from '@/components/layout/PageBanner';

export const metadata: Metadata = {
    title: 'Browse Categories | Anant Enterprises',
    description: 'Explore our comprehensive range of residential and commercial water purification solutions, spare parts, and filters.',
};

export default async function CategoriesPage() {
    let tiers: TierNode[] = [];

    try {
        tiers = await getTierHierarchy();
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Page Banner */}
            <PageBanner
                title="Product Categories"
                description="Find the perfect solution for your water purification needs. Browse our extensive catalog of purifiers, filters, and spare parts."
                align="center"
                height="md"
                gradient="navy"
                maxWidth="xl"
            />

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
                {tiers.length === 0 ? (
                    <div className="text-center py-12 md:py-20">
                        <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-3 md:mb-4" />
                        <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100">No categories found</h3>
                        <p className="text-sm md:text-base text-gray-500 mt-2">Please check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {tiers.map((tier) => (
                            <CategoryCard key={tier.id} tier={tier} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryCard({ tier }: { tier: TierNode }) {
    // Show top 5 subcategories
    const subCategories = tier.children?.slice(0, 5) || [];
    const hasMore = (tier.children?.length || 0) > 5;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C2A54] dark:text-white mb-1 sm:mb-2">
                    <Link href={`/collections?category=${tier.code}`} className="hover:text-[#31CDD4] transition-colors">
                        {tier.name}
                    </Link>
                </h2>
                {tier.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-clamp-2">
                        {tier.description}
                    </p>
                )}
            </div>

            <div className="space-y-2 sm:space-y-3 flex-1">
                {subCategories.length > 0 ? (
                    subCategories.map((child) => (
                        <Link
                            key={child.id}
                            href={`/collections?category=${child.code}`}
                            className="flex items-center justify-between group p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium group-hover:text-[#31CDD4] transition-colors truncate pr-2">
                                {child.name}
                            </span>
                            <ChevronRightSmall className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400 group-hover:text-[#31CDD4] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                    ))
                ) : (
                    <div className="text-gray-400 text-xs sm:text-sm italic py-2">No subcategories</div>
                )}
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                    asChild
                    variant="outline"
                    className="w-full text-sm sm:text-base text-[#1C2A54] dark:text-white hover:text-[#31CDD4] border-gray-200 dark:border-gray-700 hover:border-[#31CDD4] dark:hover:border-[#31CDD4] h-9 sm:h-10"
                >
                    <Link href={`/collections?category=${tier.code}`}>
                        <span className="truncate">View All {hasMore ? `(${tier.children.length})` : ''}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 flex-shrink-0" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function ChevronRightSmall({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
