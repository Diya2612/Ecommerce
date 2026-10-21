import * as motion from 'motion/react-client';
import { getRelatedProducts } from '@/lib/data/product';
import { ProductCardClient } from '@/components/home/client/ProductCardClient';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { RelatedProductsMobile } from '../client/RelatedProductsMobile';
import type { RelatedProductsSectionProps } from '@/types/product';

/**
 * RelatedProductsSection - Server Component
 * 
 * Fetches related products on the server and renders them
 * Uses ProductCardClient for interactive elements (cart/wishlist)
 */
export async function RelatedProductsSection({ productId }: RelatedProductsSectionProps) {
    const products = await getRelatedProducts(productId);

    // Don't render if no related products
    if (products.length === 0) return null;

    return (
        <motion.section
            className="py-24 bg-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="container mx-auto px-4 md:px-6">
                {/* Server-rendered header */}
                <SectionHeader
                    title="You May Also Like"
                    description="Similar products that might interest you"
                    align="center"
                    spacing="normal"
                />

                {/* Desktop Grid - 4 columns */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCardClient
                            key={product.id}
                            product={product}
                            productHref={`/product/${product.id}`}
                            showQuickView={false}
                            imageHeight="h-[280px]"
                        />
                    ))}
                </div>

                {/* Mobile Carousel - Client Component wrapper */}
                <div className="sm:hidden">
                    <RelatedProductsMobile products={products} />
                </div>
            </div>
        </motion.section>
    );
}
