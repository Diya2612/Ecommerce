import * as motion from 'motion/react-client';
import Link from 'next/link';
import { getProductById, getProductBundles } from '@/lib/data/product';
import type { ProductHeroSectionProps } from '@/types/product';
import { ProductHeroClient } from '../client';

/**
 * ProductHeroSection - Server Component
 * 
 * Fetches product data on the server and passes it to the client island.
 * Renders the breadcrumb server-side for SEO.
 */
export async function ProductHeroSection({ productId }: ProductHeroSectionProps) {
    const [product, bundles] = await Promise.all([
        getProductById(productId),
        getProductBundles(productId),
    ]);

    return (
        <motion.section
            className="pt-32 pb-16 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="container mx-auto px-4 md:px-6">
                {/* Breadcrumb - Server Rendered for SEO */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-8 text-[14px] font-medium text-gray-600">
                    <Link href="/" className="hover:text-[#00C4CC] transition-colors">
                        Home
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link
                        href={`/collection?category=${product.categoryId || 'all'}`}
                        className="hover:text-[#00C4CC] transition-colors"
                    >
                        {product.category || 'Products'}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-[#0B1F51]">{product.name}</span>
                </nav>

                {/* Client Island - All interactive elements */}
                <ProductHeroClient product={product} bundles={bundles} />
            </div>
        </motion.section>
    );
}
