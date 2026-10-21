import { Metadata } from 'next';
import { Suspense } from 'react';
import {
  TechnologyBanner,
  TechnologyContent,
} from '@/components/technology/server';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Our Technology | Anant Enterprises - Advanced Water Purification',
  description: 'Explore our advanced water purification technologies including RO, UV, Alkaline, Copper, Hot & Cold, and UF filtration systems. Pure water through innovation.',
  keywords: [
    'water purification technology',
    'RO purification',
    'UV water purifier',
    'alkaline water',
    'copper water purifier',
    'UF filtration',
    'water technology India',
  ],

  // OpenGraph tags for social sharing
  openGraph: {
    title: 'Our Technology | Anant Enterprises',
    description: 'Advanced water purification systems designed for purity, health, and wellness. RO, UV, Alkaline, Copper & more.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Anant Enterprises',
    url: '/technology',
    images: [
      {
        url: '/og/technology-page.jpg',
        width: 1200,
        height: 630,
        alt: 'Anant Enterprises Water Purification Technology',
        type: 'image/jpeg',
      },
    ],
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    title: 'Our Technology | Anant Enterprises',
    description: 'Advanced water purification systems: RO, UV, Alkaline, Copper & more.',
    images: ['/og/technology-page.jpg'],
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },

  // Canonical URL
  alternates: {
    canonical: '/technology',
  },
};

// ============================================================================
// JSON-LD Structured Data
// ============================================================================

const technologySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Our Technology',
  description: 'Advanced water purification technologies including RO, UV, Alkaline, Copper, and UF filtration systems.',
  url: 'https://anantenterprises.com/technology',
  publisher: {
    '@type': 'Organization',
    name: 'Anant Enterprises',
    url: 'https://anantenterprises.com',
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'RO Purification',
        description: 'Reverse Osmosis technology removes dissolved impurities, heavy metals, and salts.',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'UV Protection',
        description: 'Ultraviolet purification deactivates bacteria and viruses.',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Alkaline Boost',
        description: 'Maintains pH level between 7.5 and 8.5 for health benefits.',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Copper Tech',
        description: 'Infuses water with copper ions for antimicrobial properties.',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Hot & Cold',
        description: 'Instant hot and cold water dispense convenience.',
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'UF Filtration',
        description: 'Ultra Filtration with zero water wastage.',
      },
    ],
  },
};

// ============================================================================
// Loading Skeleton for Suspense
// ============================================================================

function ContentSkeleton() {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white rounded-3xl p-8 lg:p-12 border border-gray-100"
            >
              <div className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16`}>
                {/* Image skeleton */}
                <div className="w-full lg:w-1/2 h-[300px] lg:h-[400px] bg-gray-200 rounded-2xl" />

                {/* Content skeleton */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-48" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                      <div className="h-4 bg-gray-200 rounded w-4/6" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-56" />
                      <div className="h-5 bg-gray-200 rounded w-48" />
                      <div className="h-5 bg-gray-200 rounded w-52" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Page Component
// ============================================================================

/**
 * Technology Page - Server Component
 * 
 * Fully migrated with:
 * - SEO Metadata (title, description, OpenGraph, Twitter)
 * - JSON-LD Structured Data (ItemList for technologies)
 * - Suspense boundaries with skeleton loaders for streaming
 * - Motion SSR for smooth entry animations
 * - Separate data layer with React cache()
 */
export default function TechnologyPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(technologySchema) }}
      />

      {/* Banner - Lightweight, no suspense needed */}
      <TechnologyBanner />

      {/* Content with Suspense */}
      <Suspense fallback={<ContentSkeleton />}>
        <TechnologyContent />
      </Suspense>
    </>
  );
}
