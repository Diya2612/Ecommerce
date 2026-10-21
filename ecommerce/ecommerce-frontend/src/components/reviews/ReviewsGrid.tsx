import * as motion from 'motion/react-client';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import type { Review } from '@/lib/data/reviews';

// ============================================================================
// ReviewsGrid - Server Component
// ============================================================================
// Server-rendered reviews grid with SSR-compatible animations
// Uses motion/react-client for entry animations and hover effects

interface ReviewsGridProps {
    reviews: Review[];
}

export function ReviewsGrid({ reviews }: ReviewsGridProps) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    className="bg-white p-8 rounded-[24px] shadow-xs border border-gray-100 flex flex-col"
                >
                    {/* Quote Icon */}
                    <div className="mb-6 opacity-80">
                        <Quote className="w-10 h-10 text-[#00C4CC]/20 fill-current" />
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-600 text-[16px] leading-relaxed mb-6 flex-1 italic">
                        "{review.text}"
                    </p>

                    {/* Outcome Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 bg-[#00C4CC]/10 px-3 py-1.5 rounded-lg self-start">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00C4CC]" />
                        <span className="text-[#00C4CC] text-xs font-semibold tracking-wide uppercase">
                            {review.outcome}
                        </span>
                    </div>

                    {/* Author Info & Rating */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <Image
                                    src={review.image}
                                    alt={review.name}
                                    fill
                                    className="rounded-full object-cover border-2 border-white shadow-xs"
                                />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#0B1F51] text-[15px]">
                                    {review.name}
                                </h4>
                                <p className="text-xs text-gray-400">{review.location}</p>
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                            ? 'fill-[#F5B012] text-[#F5B012]'
                                            : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
