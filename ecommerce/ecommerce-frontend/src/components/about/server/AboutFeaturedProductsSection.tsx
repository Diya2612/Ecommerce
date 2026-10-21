import * as motion from "motion/react-client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AboutProductCard } from "../client/AboutProductCard";
import { AboutProductsMobile } from "../client/AboutProductsMobile";
import { getAboutFeaturedProducts } from "@/lib/data/about";

/**
 * AboutFeaturedProductsSection - Server Component
 *
 * Displays featured products with server-rendered header.
 * Desktop grid uses AboutProductCard client component for cart/hover interactions.
 * Mobile carousel uses AboutProductsMobile client component.
 *
 * Key changes from original AboutFeaturedProducts:
 * - Removed "use client" directive
 * - Changed import from 'motion/react' to 'motion/react-client'
 * - Data fetched server-side via getAboutFeaturedProducts()
 * - Desktop product cards extracted to AboutProductCard client component
 * - Mobile carousel extracted to AboutProductsMobile client component
 */
export async function AboutFeaturedProductsSection() {
  const products = await getAboutFeaturedProducts();

  return (
    <section className="py-24 bg-[#F9FBFD]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header - SERVER RENDERED */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[36px] md:text-[48px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em] leading-[120%]">
              Our Best-Selling Products
            </h2>
            <p className="text-[18px] text-gray-600 leading-[150%]">
              Trusted by thousands of families across India
            </p>
          </motion.div>
          <Link href="/collections">
            <Button
              variant="link"
              className="text-[#00C4CC] text-[18px] font-semibold p-0 h-auto hover:no-underline hover:opacity-80 flex items-center gap-2"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Desktop Grid - Uses CLIENT AboutProductCard for cart/hover interactions */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 contain-content">
          {products.map((product, index) => (
            <AboutProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>

        {/* Mobile Carousel - CLIENT ISLAND */}
        <div className="sm:hidden contain-content">
          <AboutProductsMobile products={products} />
        </div>
      </div>
    </section>
  );
}
