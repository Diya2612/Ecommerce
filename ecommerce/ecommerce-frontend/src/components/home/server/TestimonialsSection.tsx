import { getTestimonials } from '@/lib/data/home';
import * as motion from 'motion/react-client';
import { Star } from 'lucide-react';
import { TestimonialsCarouselClient } from '../client';

/**
 * TestimonialsSection - Server Component (Hybrid Pattern)
 * 
 * Fetches testimonials server-side and passes to carousel
 * Maintains EXACT same visual appearance as original Testimonials component
 * 
 * ✨ Phase 1 SSR: Header animations server-rendered
 * ✨ Phase 2 SSR: Stats cards entrance animations server-rendered
 * 
 * Carousel interactions (auto-play, navigation) handled by client component
 */
export async function TestimonialsSection() {
    const testimonials = await getTestimonials();

    return (
        <section className="py-24 bg-linear-to-br from-[#0B1F51] via-[#0F2A66] to-[#0B1F51] relative overflow-hidden">
            {/* Background Ambience - EXACT same */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C4CC]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00C4CC]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Section Header - Server-rendered animations */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                    >
                        What Our Customers Say
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-white/70 text-lg max-w-2xl mx-auto"
                    >
                        Real experiences from families and businesses across India
                    </motion.p>
                </div>

                {/* Stats Bar - Server-rendered animations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center p-6 bg-white/5 backdrop-blur-xs rounded-card border border-[#00C4CC]/20"
                    >
                        <div className="text-4xl font-bold text-[#00C4CC] mb-2">5,000+</div>
                        <div className="text-white/80">Happy Customers</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-center p-6 bg-white/5 backdrop-blur-xs rounded-card border border-[#00C4CC]/20"
                    >
                        <div className="flex items-center justify-center gap-1 mb-2">
                            <span className="text-4xl font-bold text-[#00C4CC]">4.9</span>
                            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="text-white/80">Average Rating</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center p-6 bg-white/5 backdrop-blur-xs rounded-card border border-[#00C4CC]/20"
                    >
                        <div className="text-4xl font-bold text-[#00C4CC] mb-2">99%</div>
                        <div className="text-white/80">Satisfaction Rate</div>
                    </motion.div>
                </div>

                {/* Carousel and CTA buttons - Client component for interactivity */}
                <TestimonialsCarouselClient testimonials={testimonials} />
            </div>
        </section>
    );
}
