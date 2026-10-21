import * as motion from 'motion/react-client';
import Image from 'next/image';
import { Check } from 'lucide-react';
import type { Technology } from '@/types/technology';

interface TechnologyCardProps {
    technology: Technology;
    index: number;
}

/**
 * TechnologyCard - Server Component
 * 
 * Renders a single technology card with alternating layout based on index.
 * Uses Motion SSR for smooth entry animations.
 */
export function TechnologyCard({ technology, index }: TechnologyCardProps) {
    const isReversed = index % 2 !== 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-xs border border-gray-100 overflow-hidden`}
        >
            {/* Image Side */}
            <div className="w-full lg:w-1/2 h-[300px] lg:h-[400px] relative rounded-2xl overflow-hidden shadow-lg group">
                <Image
                    src={technology.image}
                    alt={technology.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#0B1F51]">
                        {technology.title}
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {technology.description}
                    </p>
                </div>

                <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-bold text-[#00C4CC] uppercase tracking-wider">
                        Key Benefits
                    </h3>
                    <ul className="space-y-3">
                        {technology.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                <div className="shrink-0 w-6 h-6 rounded-full bg-[#E0F8F9] flex items-center justify-center">
                                    <Check className="w-4 h-4 text-[#00C4CC]" />
                                </div>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
}
