import * as motion from "motion/react-client";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TestimonialCard, TestimonialsCarousel } from "../client";
import { getAboutTestimonials } from "@/lib/data/about";

/**
 * AboutTestimonialsSection - Server Component
 *
 * Displays customer testimonials with rating card.
 * Desktop grid uses client TestimonialCard for hover effects.
 * Mobile carousel is a client island.
 * Trust badges section is server-rendered.
 *
 * Key changes from client version:
 * - Removed "use client" directive
 * - Changed import from 'motion/react' to 'motion/react-client'
 * - Data fetched server-side via getAboutTestimonials()
 * - Desktop cards use TestimonialCard client component
 * - Mobile carousel extracted to TestimonialsCarousel client island
 * - Trust badges buttons use CSS hover instead of whileHover
 */
export async function AboutTestimonialsSection() {
  const testimonials = await getAboutTestimonials();

  return (
    <section className="py-24 bg-[#F9FBFD]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[36px] md:text-[48px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em] leading-[120%]">
            What People Say About Us
          </h2>
          <p className="text-[18px] text-gray-600 leading-[150%] max-w-3xl mx-auto">
            Real experiences from real customers who trust us with their
            family's health
          </p>
        </motion.div>

        {/* Overall Rating Card - SERVER RENDERED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto mb-16 bg-white rounded-card border border-black/6 p-8 text-center shadow-lg"
        >
          <div className="text-[64px] font-bold text-[#0B1F51] leading-none mb-2">
            4.9
          </div>
          <div className="flex justify-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-[#F5B012] text-[#F5B012]" />
            ))}
          </div>
          <p className="text-[16px] text-gray-600 font-medium mb-4">
            Based on 5,000+ verified reviews
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-none px-4 py-2 rounded-[6px] text-[14px] font-bold">
              98% Recommended
            </Badge>
            <Badge className="bg-[#00C4CC]/10 text-[#00C4CC] border-none px-4 py-2 rounded-[6px] text-[14px] font-bold">
              5-Star Service
            </Badge>
          </div>
        </motion.div>

        {/* Testimonials Grid - Desktop (uses CLIENT TestimonialCard for hover) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 contain-content">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Testimonials Carousel - Mobile (CLIENT ISLAND) */}
        <div className="md:hidden contain-content">
          <TestimonialsCarousel testimonials={testimonials} />
        </div>

        {/* Trust Badges - SERVER RENDERED with CSS hover */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-linear-to-br from-[#0B1F51] via-[#0d2564] to-[#0B1F51] rounded-[28px] p-12 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C4CC] opacity-10 rounded-full blur-2xl" />

          <div className="relative z-10 text-center">
            <h3 className="text-[28px] md:text-[36px] font-semibold text-white mb-6 tracking-[-0.01em] leading-[120%]">
              Join 50,000+ Happy Customers
            </h3>
            <p className="text-[18px] text-white/90 leading-[150%] mb-8 max-w-2xl mx-auto">
              Experience the difference that comes with India's most trusted
              water purification brand. Your family deserves the best.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-[#0B1F51] px-12 h-14 rounded-input text-[16px] font-semibold hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-xl">
                Explore Products
              </button>
              <button className="bg-transparent border-2 border-white text-white px-12 h-14 rounded-input text-[16px] font-semibold hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
                Contact Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
