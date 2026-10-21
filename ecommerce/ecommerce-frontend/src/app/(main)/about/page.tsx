import { Metadata } from 'next';
import { Suspense } from 'react';
import {
  AboutBanner,
  OurStorySection,
  OurMissionSection,
  OurValuesSection,
  OurTeamSection,
  AboutTestimonialsSection,
  AboutCTASection,
  AboutFeaturedProductsSection,
} from '@/components/about/server';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'About Us | Anant Enterprises - Pioneering Pure Water Solutions Since 1998',
  description: 'Learn about Anant Enterprises - India\'s trusted water purification brand since 1998. 50K+ happy customers, 500+ service centers, 25+ years of excellence in water technology. Meet our team and discover our mission.',
  keywords: [
    'water purifier company',
    'RO purifier manufacturer',
    'about Anant Enterprises',
    'water technology India',
    'water purification solutions',
    'clean drinking water',
    'water filtration experts',
  ],
  authors: [{ name: 'Anant Enterprises' }],
  creator: 'Anant Enterprises',
  publisher: 'Anant Enterprises',

  // OpenGraph tags for social sharing
  openGraph: {
    title: 'About Anant Enterprises - Pioneering Pure Water Solutions',
    description: 'India\'s trusted water purification brand since 1998. 50K+ happy customers, 500+ service centers, 25+ years of excellence.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Anant Enterprises',
    url: '/about',
    images: [
      {
        url: '/og/about-page.jpg',
        width: 1200,
        height: 630,
        alt: 'Anant Enterprises - Pure Water Solutions',
        type: 'image/jpeg',
      },
    ],
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    title: 'About Anant Enterprises',
    description: 'Pioneering Pure Water Solutions Since 1998. 50K+ happy customers across India.',
    images: ['/og/about-page.jpg'],
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

  // Canonical URL
  alternates: {
    canonical: '/about',
  },

  // Verification (uncomment and add your IDs when ready)
  // verification: {
  //   google: 'your-google-verification-id',
  // },
};

// ============================================================================
// JSON-LD Structured Data
// ============================================================================

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Anant Enterprises',
  description: 'India\'s trusted water purification brand since 1998. Providing innovative water purification solutions to households and businesses.',
  url: 'https://anantenterprises.com',
  logo: 'https://anantenterprises.com/logo.png',
  foundingDate: '1998',
  founder: {
    '@type': 'Person',
    name: 'Rajesh Kumar',
    jobTitle: 'Founder & CEO',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Head Office',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '-',
    addressCountry: 'IN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91 90753 66955',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    {
      '@type': 'ContactPoint',
      telephone: '+91 90753 66955',
      contactType: 'sales',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  ],
  sameAs: [
    'https://www.facebook.com/anantenterprises',
    'https://www.twitter.com/anantenterprises',
    'https://www.linkedin.com/company/anantenterprises',
    'https://www.instagram.com/anantenterprises',
  ],
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    minValue: 100,
    maxValue: 500,
  },
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  award: [
    'Best Water Tech Innovation Award 2021',
  ],
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Anant Enterprises',
  description: 'Learn about our mission, vision, team, and journey in revolutionizing water purification in India.',
  url: 'https://anantenterprises.com/about',
  mainEntity: organizationSchema,
};

// ============================================================================
// Loading Skeletons for Suspense
// ============================================================================

function SectionSkeleton({ variant }: { variant: 'story' | 'cards' | 'products' | 'team' | 'testimonials' }) {
  const baseClasses = "animate-pulse bg-gray-200 rounded-lg";

  switch (variant) {
    case 'story':
      return (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-4">
                <div className={`${baseClasses} h-8 w-32`} />
                <div className={`${baseClasses} h-12 w-3/4`} />
                <div className={`${baseClasses} h-24 w-full`} />
                <div className="space-y-4 mt-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`${baseClasses} h-20 w-full`} />
                  ))}
                </div>
              </div>
              <div className={`${baseClasses} h-[600px] rounded-[32px]`} />
            </div>
          </div>
        </section>
      );

    case 'cards':
      return (
        <section className="py-24 bg-[#F9FBFD]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className={`${baseClasses} h-12 w-64 mx-auto mb-4`} />
              <div className={`${baseClasses} h-6 w-96 mx-auto`} />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${baseClasses} h-64 rounded-[28px]`} />
              ))}
            </div>
          </div>
        </section>
      );

    case 'products':
      return (
        <section className="py-24 bg-[#F9FBFD]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between mb-12">
              <div className="space-y-2">
                <div className={`${baseClasses} h-12 w-80`} />
                <div className={`${baseClasses} h-6 w-64`} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${baseClasses} h-[400px] rounded-card`} />
              ))}
            </div>
          </div>
        </section>
      );

    case 'team':
      return (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className={`${baseClasses} h-12 w-64 mx-auto mb-4`} />
              <div className={`${baseClasses} h-6 w-96 mx-auto`} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <div className={`${baseClasses} aspect-3/4 rounded-[24px]`} />
                  <div className={`${baseClasses} h-6 w-32 mx-auto`} />
                  <div className={`${baseClasses} h-4 w-24 mx-auto`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'testimonials':
      return (
        <section className="py-24 bg-[#F9FBFD]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className={`${baseClasses} h-12 w-64 mx-auto mb-4`} />
              <div className={`${baseClasses} h-6 w-96 mx-auto`} />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`${baseClasses} h-64 rounded-card`} />
              ))}
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}

// ============================================================================
// Page Component
// ============================================================================

/**
 * About Page - Server Component
 * 
 * Fully migrated with:
 * - SEO Metadata (title, description, OpenGraph, Twitter)
 * - JSON-LD Structured Data (Organization, AboutPage schemas)
 * - Suspense boundaries with skeleton loaders for streaming
 * - All components server-rendered with client islands for interactivity
 */
export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      {/* Banner - No Suspense needed (lightweight) */}
      <AboutBanner />

      {/* Our Story - Suspense for async data fetching */}
      <Suspense fallback={<SectionSkeleton variant="story" />}>
        <OurStorySection />
      </Suspense>

      {/* Mission Section - Suspense for async data fetching */}
      <Suspense fallback={<SectionSkeleton variant="cards" />}>
        <OurMissionSection />
      </Suspense>

      {/* Values Section - Suspense for async data fetching */}
      <Suspense fallback={<SectionSkeleton variant="cards" />}>
        <OurValuesSection />
      </Suspense>

      {/* Featured Products - Suspense for async data fetching */}
      <Suspense fallback={<SectionSkeleton variant="products" />}>
        <AboutFeaturedProductsSection />
      </Suspense>

      {/* Team Section - Suspense for async data fetching */}
      <Suspense fallback={<SectionSkeleton variant="team" />}>
        <OurTeamSection />
      </Suspense>

      {/* Testimonials Section - Suspense for async data fetching */}
      <Suspense fallback={<SectionSkeleton variant="testimonials" />}>
        <AboutTestimonialsSection />
      </Suspense>

      {/* CTA Section - No heavy async, but wrap for consistency */}
      <Suspense fallback={<SectionSkeleton variant="cards" />}>
        <AboutCTASection />
      </Suspense>
    </>
  );
}
