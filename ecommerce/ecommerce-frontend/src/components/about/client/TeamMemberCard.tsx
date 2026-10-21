'use client';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import type { TeamMember } from '@/types/about';

interface TeamMemberCardProps {
    member: TeamMember;
    index: number;
}

/**
 * TeamMemberCard - Client Island Component
 * 
 * Desktop team member card with hover effects for social links overlay.
 * Uses whileHover for image scale and overlay transitions.
 */
export function TeamMemberCard({ member, index }: TeamMemberCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <div className="relative mb-6 rounded-[24px] overflow-hidden aspect-3/4">
                <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                />

                {/* Social Overlay - Shows on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    {member.linkedin && (
                        <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={member.linkedin}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0B1F51] hover:bg-[#0077b5] hover:text-white transition-colors"
                            aria-label={`${member.name}'s LinkedIn`}
                        >
                            <Linkedin className="w-5 h-5" />
                        </motion.a>
                    )}
                    {member.twitter && (
                        <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={member.twitter}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0B1F51] hover:bg-[#1DA1F2] hover:text-white transition-colors"
                            aria-label={`${member.name}'s Twitter`}
                        >
                            <Twitter className="w-5 h-5" />
                        </motion.a>
                    )}
                    {member.email && (
                        <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={`mailto:${member.email}`}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0B1F51] hover:bg-red-500 hover:text-white transition-colors"
                            aria-label={`Email ${member.name}`}
                        >
                            <Mail className="w-5 h-5" />
                        </motion.a>
                    )}
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-[20px] font-bold text-[#0B1F51] mb-1">{member.name}</h3>
                <p className="text-[14px] font-bold text-[#00C4CC] uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-[15px] text-gray-600 leading-[150%]">{member.bio}</p>
            </div>
        </motion.div>
    );
}
