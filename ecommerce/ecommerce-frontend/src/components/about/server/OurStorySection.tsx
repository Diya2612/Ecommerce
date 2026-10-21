import React from 'react';
import Image from "next/image";
import * as motion from "motion/react-client";
import { getMilestones } from '@/lib/data/about';

/**
 * OurStorySection - Server Component
 * 
 * Displays the company's journey timeline with milestones.
 * Fully server-rendered with SSR-compatible motion animations.
 * 
 * Key changes from client version:
 * - Removed "use client" directive
 * - Changed import from 'motion/react' to 'motion/react-client'
 * - Data fetched server-side via getMilestones()
 * - Added priority to hero image for LCP optimization
 * 
 * All animations use whileInView which is SSR-compatible.
 */
export async function OurStorySection() {
    const milestones = await getMilestones();

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[#00C4CC] font-bold uppercase tracking-wider mb-2 block">Our Journey</span>
                        <h2 className="text-[36px] md:text-[48px] font-bold text-[#0B1F51] mb-6 leading-[120%]">
                            Pioneering Clean Water Since 2015
                        </h2>
                        <p className="text-[18px] text-gray-600 leading-[160%] mb-12">
                            What started as a small workshop in Delhi has now grown into India's most trusted water purification brand. Our journey has been defined by a relentless pursuit of quality and innovation.
                        </p>

                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-6 group"
                                >
                                    <div className="shrink-0 w-20">
                                        <span className="text-[24px] font-bold text-[#0B1F51] group-hover:text-[#00C4CC] transition-colors">{milestone.year}</span>
                                    </div>
                                    <div className="relative pl-8 border-l border-gray-100 group-hover:border-[#00C4CC] transition-colors">
                                        <div className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-gray-200 group-hover:bg-[#00C4CC] transition-colors" />
                                        <h3 className="text-[20px] font-bold text-[#0B1F51] mb-2">{milestone.title}</h3>
                                        <p className="text-gray-600 leading-[150%]">{milestone.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[600px] rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        <Image
                            src="/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png"
                            alt="Our Story - Clean Water Technology"
                            fill
                            className="object-cover"
                            priority // LCP optimization - this is a key visual element
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0B1F51]/80 via-transparent to-transparent">
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <p className="text-[24px] font-light italic opacity-90">
                                    "We believe everyone deserves access to pure, safe drinking water."
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
