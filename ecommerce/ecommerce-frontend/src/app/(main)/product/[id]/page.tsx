import { Suspense } from 'react';
import { Metadata } from 'next';
import { getProductById, getComparisonProducts } from '@/lib/data/product';
import {
  ProductHeroSection,
  ReviewsSection,
  RelatedProductsSection,
  MoreFromBrandSection,
  MoreFromCategorySection,
  ProductCTASection,
} from '@/components/product/server';
import { CompareProducts } from '@/components/shared/CompareProducts';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate dynamic metadata for SEO
 * Includes OpenGraph, Twitter cards, and structured data preparation
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  // Build comprehensive meta description
  const description = product.subtitle
    ? `${product.subtitle} - ${product.name} from Anant Enterprises. Premium water purification with advanced technology.`
    : `Buy ${product.name} - Premium water purification solution with advanced technology. Free installation & warranty included.`;

  // Extract keywords from product data
  const keywords = [
    product.name,
    product.category || 'water purifier',
    product.brand || 'Anant Enterprises',
    'RO water purifier',
    'water filter',
    'water purification',
    'drinking water',
    'India',
  ].filter(Boolean).join(', ');

  return {
    title: `${product.name} | Buy Online | Anant Enterprises`,
    description,
    keywords,

    // Alternate URLs for SEO
    alternates: {
      canonical: `https://anantenterprises.com/collections/${id}`,
    },

    // OpenGraph for social sharing
    openGraph: {
      title: `${product.name} - Premium Water Purifier`,
      description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: `${product.name} - Water Purifier`,
        }
      ],
      type: 'website',
      siteName: 'Anant Enterprises',
      locale: 'en_IN',
    },

    // Twitter cards
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Anant Enterprises`,
      description,
      images: [product.image],
      creator: '@anantenterprises',
    },

    // Robots directives
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Skeleton components for Suspense fallbacks
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
            <div className="h-6 bg-gray-100 rounded w-1/2" />
            <div className="h-32 bg-gray-50 rounded-card" />
            <div className="h-16 bg-gray-100 rounded-xl" />
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
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[350px] bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="py-24 bg-[#F9FBFD] animate-pulse">
      <div className="container mx-auto px-4 md:px-6">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8" />
        <div className="grid lg:grid-cols-[350px_1fr] gap-12">
          <div className="h-[400px] bg-white rounded-card" />
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductDetailPage - Server Component
 * 
 * Uses server components for data fetching and SEO
 * Suspense boundaries for streaming
 * Includes JSON-LD structured data for rich search results
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Fetch product to get brand/category IDs for related sections
  const product = await getProductById(id);

  // Prepare breadcrumb data for structured data
  const breadcrumbItems = [
    { name: 'Home', url: 'https://anantenterprises.com/' },
    { name: product.category || 'Products', url: `https://anantenterprises.com/collections?category=${product.categoryId || 'all'}` },
    { name: product.name },
  ];

  // Fetch comparison products
  const comparisonProducts = await getComparisonProducts();

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <ProductSchema
        product={{
          id: product.id,
          name: product.name,
          description: product.subtitle,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          rating: product.rating,
          reviewCount: product.reviews || 10,
          category: product.category,
          brandName: product.brand || 'Anant Enterprises',
          inStock: true,
        }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Hero Section - Critical, loads first */}
      <Suspense fallback={<HeroSkeleton />}>
        <ProductHeroSection productId={id} />
      </Suspense>

      {/* Reviews Section - Server fetches data, client renders UI */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection productId={id} />
      </Suspense>

      {/* Compare Products */}
      <CompareProducts products={comparisonProducts} />

      {/* Related Products */}
      <Suspense fallback={<SectionSkeleton />}>
        <RelatedProductsSection productId={id} />
      </Suspense>

      {/* More from Category */}
      <Suspense fallback={<SectionSkeleton />}>
        <MoreFromCategorySection
          categoryId={product.categoryId || 'residential'}
          productId={id}
        />
      </Suspense>

      {/* More from Brand */}
      <Suspense fallback={<SectionSkeleton />}>
        <MoreFromBrandSection
          brandId={product.brandId || 'anant'}
          productId={id}
        />
      </Suspense>

      {/* CTA Section - Static, server rendered */}
      <ProductCTASection />
    </>
  );
}

