import * as motion from "motion/react-client";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getQuickContactInfo } from "@/lib/data/contact";
import type { QuickContactInfo } from "@/types/contact";

/**
 * Icon mapping for quick contact info
 * Maps icon keys to Lucide components
 */
const iconMap = {
  Phone,
  Mail,
  MapPin,
  Clock,
} as const;

/**
 * Get icon component from key
 */
function getIcon(iconKey: QuickContactInfo["iconKey"]) {
  return iconMap[iconKey];
}

/**
 * LocalBusiness structured data for SEO
 */
function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Anant Enterprises",
    description:
      "Premium Water Purifiers & RO Systems - Installation, AMC, Repairs, and Support",
    telephone: "+91 90753 66955",
    email: "yogeshwar.ptl@gmail.com",
    url: "https://anantenterprises.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "Maharashtra",
      addressLocality: "Mumbai",
      streetAddress: "Head Office",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "19.0760",
      longitude: "72.8777",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    priceRange: "₹₹",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Water Purifier Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Water Purifier Installation",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Annual Maintenance Contract (AMC)",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Repair Services",
          },
        },
      ],
    },
  };
}

/**
 * ContactBannerSection - Server Component
 *
 * Server-rendered contact banner with:
 * - SSR-compatible motion animations (motion/react-client)
 * - Proper semantic HTML structure with h1
 * - JSON-LD structured data for SEO
 * - Contact info visible in page source for search engines
 *
 * MAINTAINS EXACT SAME UI as original ContactBanner.tsx
 */
export async function ContactBannerSection() {
  const quickInfo = await getQuickContactInfo();

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData()),
        }}
      />

      <section className="relative pt-32 pb-24 bg-linear-to-br from-[#0B1F51] via-[#0d2564] to-[#0B1F51] overflow-hidden">
        {/* Decorative Elements - EXACT same as original */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Visually hidden h1 for accessibility - every page needs one */}
            <h1 className="sr-only">
              Contact Anant Enterprises - Water Purifier Support & Services
            </h1>

            {/* Badge - SSR animated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block bg-[#00C4CC]/20 backdrop-blur-xs text-[#00C4CC] px-6 py-2 rounded-full text-[14px] font-bold tracking-wide mb-6 border border-[#00C4CC]/30"
            >
              GET IN TOUCH
            </motion.div>

            {/* Main Heading - visible styled h1 equivalent (using span for semantics since we have sr-only h1) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[48px] md:text-[64px] font-semibold text-white mb-6 tracking-[-0.01em] leading-[120%]"
              role="heading"
              aria-level={2}
            >
              We're Here to Help
            </motion.p>

            {/* Description - SSR animated */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[18px] text-white/90 leading-[150%] mb-12 max-w-3xl mx-auto"
            >
              Have questions about our products or services? Our expert team is
              ready to assist you. Reach out through any channel that works best
              for you.
            </motion.p>

            {/* Quick Contact Info Grid - SSR animated */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16"
            >
              {quickInfo.map((info, index) => {
                const Icon = getIcon(info.iconKey);
                return (
                  <motion.div
                    key={info.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-card p-6 hover:bg-white/15 transition-all duration-300 min-w-0 overflow-hidden"
                  >
                    <div className="w-12 h-12 bg-[#00C4CC] rounded-input flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="text-[14px] text-white/80 font-medium mb-2">
                      {info.title}
                    </div>
                    {/* Semantic links for phone and email */}
                    {info.iconKey === "Phone" ? (
                      <a
                        href={`tel:${info.value.replace(/[^0-9+]/g, "")}`}
                        className="text-[18px] font-bold text-white mb-1 block hover:text-[#00C4CC] transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : info.iconKey === "Mail" ? (
                      <a
                        href={`mailto:${info.value}`}
                        className="text-[18px] font-bold text-white mb-1 block hover:text-[#00C4CC] transition-colors truncate max-w-full"
                        title={info.value}
                      >
                        {info.value}
                      </a>
                    ) : (
                      <div 
                        className="text-[18px] font-bold text-white mb-1 truncate max-w-full"
                        title={info.value}
                      >
                        {info.value}
                      </div>
                    )}
                    <div className="text-[12px] text-white/70">
                      {info.subtitle}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Wave Separator - EXACT same as original */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>
    </>
  );
}
