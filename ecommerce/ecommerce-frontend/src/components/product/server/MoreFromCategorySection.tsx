import * as motion from 'motion/react-client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategoryProducts } from '@/lib/data/product';
import { ProductCardClient } from '@/components/home/client/ProductCardClient';
import { Button } from '@/components/ui/button';
import type { MoreFromCategorySectionProps } from '@/types/product';

/**
 * MoreFromCategorySection - Server Component
 * 
 * Matches original MoreFromCategory UI exactly
 * Fetches products on server, uses ProductCardClient for interaction
 */
export async function MoreFromCategorySection({ categoryId, productId }: MoreFromCategorySectionProps) {
    const products = await getCategoryProducts(categoryId, productId, 6);

    // Don't render if no products
    if (products.length === 0) return null;

    return (
        <motion.section
            className="py-24 bg-[#F9FBFD]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="container mx-auto px-4 md:px-6">
                {/* Header - Matching original layout */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-[36px] md:text-[48px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em] leading-[120%]">
                            More from Residential Purifiers
                        </h2>
                        <p className="text-[18px] text-gray-600 leading-[150%]">
                            Explore other premium options in this category
                        </p>
                    </motion.div>
                    <Link href={`/collections?category=${categoryId}`}>
                        <Button
                            variant="link"
                            className="text-[#00C4CC] text-[18px] font-semibold p-0 h-auto hover:no-underline hover:opacity-80 flex items-center gap-2"
                        >
                            View All in Category
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>

                {/* Desktop Grid - 3 columns like original */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <ProductCardClient
                            key={product.id}
                            product={product}
                            productHref={`/collections/${product.id}`}
                            showQuickView={true}
                            imageHeight="h-[280px]"
                        />
                    ))}
                </div>

                {/* Mobile Grid - 1 column with scroll hint */}
                <div className="sm:hidden">
                    <div className="grid grid-cols-1 gap-6">
                        {products.slice(0, 3).map((product) => (
                            <ProductCardClient
                                key={product.id}
                                product={product}
                                productHref={`/collections/${product.id}`}
                                showQuickView={false}
                                imageHeight="h-[280px]"
                            />
                        ))}
                    </div>
                    {products.length > 3 && (
                        <div className="mt-6 text-center">
                            <Link href={`/collections?category=${categoryId}`}>
                                <Button
                                    variant="outline"
                                    className="border-2 border-[#0B1F51] text-[#0B1F51] hover:bg-[#0B1F51] hover:text-white rounded-input px-8 h-12"
                                >
                                    View All Products
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.section>
    );
}
