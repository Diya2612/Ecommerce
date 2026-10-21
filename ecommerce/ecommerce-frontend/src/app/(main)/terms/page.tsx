import { Metadata } from 'next';
import { Suspense } from 'react';
import {
  TermsBanner,
  TermsTableOfContents,
  TermsContent,
} from '@/components/terms/server';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Terms & Conditions | Anant Enterprises',
  description: 'Read our Terms of Service covering user agreements, AMC services, payments, refunds, and liability for Anant Enterprises water purification products and services.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'Anant Enterprises terms',
    'water purifier terms',
    'AMC terms',
    'service agreement',
  ],

  // OpenGraph tags for social sharing
  openGraph: {
    title: 'Terms & Conditions | Anant Enterprises',
    description: 'Terms of Service for Anant Enterprises water purification products and services.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Anant Enterprises',
    url: '/terms',
  },

  // Twitter Card tags
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions | Anant Enterprises',
    description: 'Terms of Service for Anant Enterprises water purification products and services.',
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
  },

  // Canonical URL
  alternates: {
    canonical: '/terms',
  },
};

// ============================================================================
// JSON-LD Structured Data
// ============================================================================

const termsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms & Conditions',
  description: 'Terms of Service for Anant Enterprises water purification products and services.',
  url: 'https://anantenterprises.com/terms',
  publisher: {
    '@type': 'Organization',
    name: 'Anant Enterprises',
    url: 'https://anantenterprises.com',
  },
  mainContentOfPage: {
    '@type': 'WebPageElement',
    cssSelector: 'main',
  },
};

// ============================================================================
// Loading Skeletons for Suspense
// ============================================================================

function TOCSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-20 mb-6" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-5 bg-gray-200 rounded w-36" />
      ))}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-12">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="h-7 bg-gray-200 rounded w-48" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

/**
 * Terms Page - Server Component
 * 
 * Fully migrated with:
 * - SEO Metadata (title, description, OpenGraph, Twitter)
 * - JSON-LD Structured Data
 * - Suspense boundaries with skeleton loaders for streaming
 * - Motion SSR for smooth entry animations
 * - Separate data layer with React cache()
 */
export default function TermsPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />

      {/* Banner - Lightweight, no suspense needed */}
      <TermsBanner />

      {/* Two-Column Layout */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
          {/* Sidebar - Table of Contents */}
          <Suspense fallback={<TOCSkeleton />}>
            <TermsTableOfContents />
          </Suspense>

          {/* Main Content */}
          <main>
            <Suspense fallback={<ContentSkeleton />}>
              <TermsContent />
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
}
