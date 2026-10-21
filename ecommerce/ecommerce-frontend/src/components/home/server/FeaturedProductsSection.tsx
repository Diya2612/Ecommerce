import { getFeaturedProducts } from "@/queries/products";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FeaturedProductsMobile, ProductCardClient, FeaturedProductsCarousel } from "../client";
import * as motion from "motion/react-client";

/**
 * FeaturedProductsSection - Server Component (Hybrid Pattern - Phase 3)
 *
 * Fetches featured products server-side and renders them with entrance animations
 * This maintains the EXACT same visual appearance as the original FeaturedProducts component
 *
 * ✨ Phase 3 SSR: Product card entrance animations server-rendered with stagger
 *
 * Note: ProductCardClient handles all client-side interactions (cart/wishlist/hover)
 * Note: FeaturedProductsMobile handles mobile carousel (client component)
 */
export async function FeaturedProductsSection() {
  const products = (await getFeaturedProducts()).slice(0, 8);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header - EXACT same as original */}
        <SectionHeader
          title="Featured Products"
          description="Meticulously engineered for purity and performance."
          action={{
            label: "View All Collection →",
            href: "/products",
            variant: "link",
          }}
          spacing="normal"
        />

        <div className="hidden sm:block">
          <FeaturedProductsCarousel products={products} />
        </div>

        {/* Mobile Carousel View (below sm) - EXACT same - now client component */}
        <FeaturedProductsMobile products={products} />
      </div>
    </section>
  );
}
