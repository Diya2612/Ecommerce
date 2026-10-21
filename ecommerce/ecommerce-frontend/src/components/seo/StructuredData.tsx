'use client';

import Script from 'next/script';

interface ProductSchemaProps {
    product: {
        id: string | number;
        name: string;
        description?: string;
        subtitle?: string;
        image: string;
        price: number;
        originalPrice?: number;
        rating?: number;
        reviewCount?: number;
        category?: string;
        brandName?: string;
        inStock?: boolean;
    };
}

/**
 * ProductSchema - JSON-LD Structured Data for SEO
 * 
 * Adds rich product snippets to Google search results including:
 * - Product name, description, image
 * - Price and availability
 * - Ratings and reviews
 * - Brand and category
 * 
 * @see https://developers.google.com/search/docs/appearance/structured-data/product
 */
export function ProductSchema({ product }: ProductSchemaProps) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.subtitle || product.description || `Premium ${product.name} water purifier`,
        image: product.image,
        brand: {
            '@type': 'Brand',
            name: product.brandName || 'Anant Enterprises',
        },
        category: product.category || 'Water Purifier',
        offers: {
            '@type': 'Offer',
            url: `https://anantenterprises.com/product/${product.id}`,
            priceCurrency: 'INR',
            price: product.price,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            availability: product.inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Anant Enterprises',
            },
        },
        ...(product.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                bestRating: 5,
                worstRating: 1,
                reviewCount: product.reviewCount || 10,
            },
        }),
    };

    return (
        <Script
            id="product-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

/**
 * BreadcrumbSchema - JSON-LD for breadcrumb navigation
 */
interface BreadcrumbSchemaProps {
    items: Array<{
        name: string;
        url?: string;
    }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            ...(item.url && { item: item.url }),
        })),
    };

    return (
        <Script
            id="breadcrumb-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

/**
 * FAQSchema - JSON-LD for FAQ section (if present)
 */
interface FAQSchemaProps {
    faqs: Array<{
        question: string;
        answer: string;
    }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <Script
            id="faq-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

/**
 * OrganizationSchema - JSON-LD for site-wide organization data
 */
export function OrganizationSchema() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Anant Enterprises',
        description: 'Premium water purification systems and RO services in India',
        url: 'https://anantenterprises.com',
        logo: 'https://anantenterprises.com/logo.png',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91-XXXXXXXXXX',
            contactType: 'customer service',
            availableLanguage: ['English', 'Hindi'],
        },
        sameAs: [
            'https://www.facebook.com/anantenterprises',
            'https://www.instagram.com/anantenterprises',
            'https://www.linkedin.com/company/anantenterprises',
        ],
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'India',
            addressCountry: 'IN',
        },
    };

    return (
        <Script
            id="organization-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
