import { getBrands } from "@/lib/data/home";

import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BrandsCarouselClient, BrandsMarqueeMobile } from "../client";

/**
 * BrandsSection - Server Component (Hybrid Pattern)
 *
 * Fetches brand data server-side and renders carousel with entrance animations
 * Maintains EXACT same visual appearance as original Brands.tsx component
 *
 * ✨ Phase 1 SSR: Header animations server-rendered
 * ✨ Phase 2 SSR: Card entrance animations server-rendered (staggered)
 *
 * Interactive elements (hover, carousel drag) handled by client wrapper
 */
export async function BrandsSection() {
  const brands = await getBrands();

  if (brands.length === 0) {
    return null; // Don't render section if no brands
  }

  return (
    <section className="py-12 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Header - Server-rendered animations */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-[#0A1A3F]"
          >
            Trusted Brands
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-[#475569] font-light"
          >
            Authorized service partner for top manufacturers
          </motion.p>
        </div>

        {/* Mobile: Creative Marquee - Creative Agency Style */}
        <BrandsMarqueeMobile brands={brands} />

        {/* Desktop: Standard Carousel */}
        <div className="relative px-4 md:px-12 hidden md:block">
          <Carousel
            opts={{ align: "start", loop: false, dragFree: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {brands.map((brand, index) => (
                <CarouselItem
                  key={brand.id}
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  {/* Server: Entrance animation with stagger */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full"
                  >
                    {/* Client: Hover interactions */}
                    <BrandsCarouselClient brand={brand} index={index} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              className="hidden md:flex -left-4 lg:-left-12 h-12 w-12 bg-white/80 hover:bg-white text-[#0A1A3F] shadow-lg backdrop-blur-xs"
              aria-label="Previous brand"
            />
            <CarouselNext
              className="hidden md:flex -right-4 lg:-right-12 h-12 w-12 bg-white/80 hover:bg-white text-[#0A1A3F] shadow-lg backdrop-blur-xs"
              aria-label="Next brand"
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
