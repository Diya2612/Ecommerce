'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Linkedin, Twitter, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TeamMember } from '@/types/about';

interface TeamCarouselProps {
    members: TeamMember[];
}

/**
 * TeamCarousel - Client Island Component
 * 
 * Handles the mobile/tablet carousel for team member cards.
 * Includes full card with image, info, and social links.
 */
export function TeamCarousel({ members }: TeamCarouselProps) {
    const [carouselIndex, setCarouselIndex] = useState(0);

    const handlePrev = () => {
        setCarouselIndex((prev) => (prev === 0 ? members.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCarouselIndex((prev) => (prev === members.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="lg:hidden relative">
            <div className="overflow-hidden">
                <motion.div
                    className="flex"
                    animate={{ x: `-${carouselIndex * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {members.map((member, index) => (
                        <div key={index} className="w-full shrink-0 px-4">
                            <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-xs">
                                <div className="relative aspect-square">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 25vw"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-[22px] font-bold text-[#0B1F51] mb-1">{member.name}</h3>
                                    <p className="text-[14px] font-bold text-[#00C4CC] uppercase tracking-wider mb-4">{member.role}</p>
                                    <p className="text-[16px] text-gray-600 leading-[150%] mb-6">{member.bio}</p>

                                    <div className="flex justify-center gap-4">
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                className="p-2 bg-gray-50 rounded-full text-[#0B1F51] hover:bg-[#00C4CC] hover:text-white transition-colors"
                                                aria-label={`${member.name}'s LinkedIn`}
                                            >
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.twitter && (
                                            <a
                                                href={member.twitter}
                                                className="p-2 bg-gray-50 rounded-full text-[#0B1F51] hover:bg-[#00C4CC] hover:text-white transition-colors"
                                                aria-label={`${member.name}'s Twitter`}
                                            >
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.email && (
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="p-2 bg-gray-50 rounded-full text-[#0B1F51] hover:bg-[#00C4CC] hover:text-white transition-colors"
                                                aria-label={`Email ${member.name}`}
                                            >
                                                <Mail className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#0B1F51] z-10"
                aria-label="Previous team member"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={handleNext}
                className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#0B1F51] z-10"
                aria-label="Next team member"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
