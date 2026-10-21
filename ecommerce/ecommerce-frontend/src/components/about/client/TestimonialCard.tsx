'use client';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { AboutTestimonial } from '@/types/about';

interface TestimonialCardProps {
    testimonial: AboutTestimonial;
    index: number;
}

/**
 * TestimonialCard - Client Island Component
 * 
 * Desktop testimonial card with hover effect.
 * Uses whileHover for y-axis translation.
 */
export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-card border border-black/6 p-8 hover:shadow-xl transition-all duration-500 relative"
        >
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 w-12 h-12 bg-[#00C4CC]/10 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-[#00C4CC]" />
            </div>

            {/* Rating */}
            <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#F5B012] text-[#F5B012]" />
                ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-[16px] text-gray-700 leading-[150%] mb-6">
                &ldquo;{testimonial.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <Avatar className="w-12 h-12 border-2 border-gray-100">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-[#0B1F51] text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[16px] font-semibold text-[#0B1F51]">
                            {testimonial.name}
                        </h4>
                        {testimonial.verified && (
                            <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-none px-2 py-0.5 rounded-[6px] text-[10px] font-bold">
                                ✓ Verified
                            </Badge>
                        )}
                    </div>
                    <p className="text-[14px] text-gray-600">{testimonial.role}</p>
                </div>
            </div>
        </motion.div>
    );
}
