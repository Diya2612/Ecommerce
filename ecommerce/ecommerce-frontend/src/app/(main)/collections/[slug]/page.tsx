import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProductBundles, getComparisonProducts } from '@/lib/data/product';
import {
    ReviewsSection,
    RelatedProductsSection,
    MoreFromBrandSection,
    MoreFromCategorySection,
    ProductCTASection,
} from '@/components/product/server';
import { ProductHeroClient } from '@/components/product/client';
import { CompareProducts } from '@/components/shared/CompareProducts';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo';
import Link from 'next/link';
import * as motion from 'motion/react-client';

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const product = await getProductBySlug(slug);

        const description = product.subtitle
            ? `${product.subtitle} - ${product.name} from Ecommerce Store.`
            : `Buy ${product.name} - Premium custom products and merchandise.`;

        return {
            title: `${product.name} | Ecommerce Store`,
            description,
            openGraph: {
                title: product.name,
                description,
                images: [{ url: product.image }],
            },
        };
    } catch (error) {
        return {
            title: 'Product Not Found | Ecommerce Store',
            description: 'The requested product could not be found.'
        };
    }
}

/**
 * Skeleton components
 */
function HeroSkeleton() {
    return (
        <div className="pt-32 pb-16 bg-white animate-pulse">
            <div className="container mx-auto px-4 md:px-6">
                <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="aspect-square bg-gray-100 rounded-card" />
                    <div className="space-y-6">
                        <div className="h-12 bg-gray-200 rounded w-3/4" />
                        <div className="h-32 bg-gray-50 rounded-card" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionSkeleton() {
    return (
        <div className="py-24 animate-pulse">
            <div className="container mx-auto px-4 md:px-6">
                <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-[350px] bg-gray-100 rounded-xl" />)}
                </div>
            </div>
        </div>
    );
}

export default async function ProductSlugPage({ params }: ProductPageProps) {
    const { slug } = await params;

    let product;
    try {
        product = await getProductBySlug(slug);
    } catch (error) {
        notFound();
    }

    // TODO: Re-enable bundles when backend API is ready
    // const bundles = await getProductBundles(String(product.id), product.price);
    const bundles: any[] = [];

    // Fetch comparison products
    const comparisonProducts = await getComparisonProducts();

    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/collections' },
        { name: product.name },
    ];

    return (
        <>
            <ProductSchema
                product={{
                    id: product.id,
                    name: product.name,
                    description: product.subtitle,
                    image: product.image,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    rating: product.rating,
                    reviewCount: product.reviews,
                    category: product.category,
                    brandName: product.brand || 'Anant Enterprises',
                    inStock: product.inStock,
                }}
            />
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Hero Section */}
            <motion.section
                className="pt-32 pb-16 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="container mx-auto px-4 md:px-6">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-8 text-[14px] font-medium text-gray-600">
                        <Link href="/" className="hover:text-[#00C4CC] transition-colors">Home</Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/collections" className="hover:text-[#00C4CC] transition-colors">Products</Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-[#0B1F51]">{product.name}</span>
                    </nav>

                    <ProductHeroClient product={product} bundles={bundles} />
                </div>
            </motion.section>

            {/* Reviews Section */}
            {/* <Suspense fallback={<SectionSkeleton />}>
                <ReviewsSection productId={String(product.id)} />
            </Suspense> */}

            {/* Compare Products */}
            {/* TEMPORARILY HIDDEN - Compare Models Section */}
            {/* <CompareProducts products={comparisonProducts} /> */}

            {/* Related Products */}
            {/* <Suspense fallback={<SectionSkeleton />}>
                <RelatedProductsSection productId={String(product.id)} />
            </Suspense> */}

            {/* More from Category */}
            {/* <Suspense fallback={<SectionSkeleton />}>
                <MoreFromCategorySection
                    categoryId={product.categoryId || 'residential'}
                    productId={String(product.id)}
                />
            </Suspense> */}

            {/* More from Brand */}
            {/* <Suspense fallback={<SectionSkeleton />}>
                <MoreFromBrandSection
                    brandId={product.brandId || 'anant'}
                    productId={String(product.id)}
                />
            </Suspense> */}

            <ProductCTASection />
        </>
    );
}
