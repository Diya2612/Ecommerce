import { Suspense } from 'react';
import type { Metadata } from 'next';

// ✨ Server Components - All sections are now server-rendered!
import {
  ContactBannerSection,
  BookNowSection,
  EnterDetailsSection,
  ContactUsSection
} from '@/components/contact/server';

import {
  BookNowSkeleton,
  EnterDetailsSkeleton,
  ContactUsSkeleton
} from '@/components/contact/skeletons';

/**
 * Contact Page Metadata for SEO
 */
export const metadata: Metadata = {
  title: 'Contact Us | Anant Enterprises - Water Purifier Support & Services',
  description: 'Get in touch with Anant Enterprises for water purifier installation, AMC, repairs, and support. 24/7 support: +91 90753 66955. Service available across India.',
  keywords: [
    'contact anant enterprises',
    'water purifier service',
    'RO installation service',
    'water purifier AMC',
    'water purifier repair',
    'water purifier support',
    'RO service near me',
  ],
  openGraph: {
    title: 'Contact Anant Enterprises - Water Purifier Experts',
    description: 'Professional water purifier services. Book installation, AMC, or repairs. 24/7 support available.',
    type: 'website',
    url: '/contact',
    siteName: 'Anant Enterprises',
    images: [
      {
        url: '/og/contact.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Anant Enterprises',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Anant Enterprises',
    description: 'Get in touch for water purifier services. 24/7 support available.',
    images: ['/og/contact.jpg'],
  },
  alternates: {
    canonical: '/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Contact Page
 * 
 * ✅ MIGRATION COMPLETE - All sections are now server-rendered!
 * 
 * Migration Status:
 * - ✅ ContactBanner → ContactBannerSection (Server Component)
 * - ✅ BookNowSection → BookNowSection (Server + Client Islands)
 * - ✅ EnterDetailsSection → EnterDetailsSection (Server + Client Island)
 * - ✅ ContactUsSection → ContactUsSection (Server + Client Islands)
 * 
 * Benefits Achieved:
 * - SEO: Contact info, headings, office addresses visible in page source
 * - Performance: Reduced JS bundle, faster FCP/LCP, Suspense streaming
 * - Accessibility: Proper h1, aria-labels, semantic HTML
 * - JSON-LD structured data for rich search results
 */
export default function ContactPage() {
  return (
    <>
      <ContactBannerSection />

      {/* <Suspense fallback={<BookNowSkeleton />}>
        <BookNowSection /> 
      </Suspense> */}

      {/* <Suspense fallback={<EnterDetailsSkeleton />}>
        <EnterDetailsSection /> 
      </Suspense> */}

      <Suspense fallback={<ContactUsSkeleton />}>
        <ContactUsSection /> 
      </Suspense>
    </>
  );
}
