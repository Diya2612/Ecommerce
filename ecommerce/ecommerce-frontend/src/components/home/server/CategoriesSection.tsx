import { getCategories, getUsageTypes } from '@/lib/data/home';
import { TechnologySlider } from '../TechnologySlider';
import { UsageTypesMobile } from '../client/UsageTypesMobile';
import Image from 'next/image';
import Link from 'next/link';

/**
 * CategoriesSection - Server Component
 * 
 * Fetches categories and usage types server-side
 * This maintains the EXACT same visual appearance as the original Categories component
 * 
 * Note: TechnologySlider handles purification types (it's already client-side)
 * Note: UsageTypesMobile handles mobile drag carousel (client component)
 */
export async function CategoriesSection() {
    const [categories, usageTypes] = await Promise.all([
        getCategories(),
        getUsageTypes(),
    ]);

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Purification Types - EXACT same */}
                <div className="mb-24">
                    <TechnologySlider />
                </div>

                {/* Usage Types - EXACT same */}
                <div>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1C2A54]">
                            Solutions for Every Space
                        </h2>
                    </div>

                    {/* Desktop Grid - EXACT same */}
                    <div className="hidden md:grid md:grid-cols-3 gap-8 h-auto md:h-[500px]">
                        {usageTypes.map((item, idx) => (
                            <Link href={item.link || "/collections"} key={idx} className="block relative h-full" aria-label={`View ${item.title} solutions`}>
                                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 h-full">
                                    {/* Background Image with Slow Zoom - EXACT same */}
                                    <div className="absolute inset-0 overflow-hidden relative h-full">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Gradient Overlay - EXACT same */}
                                    <div className="absolute inset-0 bg-linear-to-t from-[#0A1A3F]/90 via-[#0A1A3F]/20 to-transparent z-10" />

                                    {/* Blue Tint Overlay (Mix Blend) - EXACT same */}
                                    <div className="absolute inset-0 bg-[#16C4DA]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-10" />

                                    {/* Glowing Border - EXACT same */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#16C4DA]/50 transition-colors duration-500 pointer-events-none z-30" />

                                    {/* Content - EXACT same */}
                                    <div className="absolute bottom-0 left-0 p-8 z-20 w-full text-white flex flex-col justify-end h-full">
                                        <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                                            <h3 className="text-3xl font-bold tracking-wide drop-shadow-md mb-2">
                                                {item.title}
                                            </h3>

                                            {/* Expanding Line - EXACT same */}
                                            <div className="w-12 h-1 bg-[#16C4DA] rounded-full transition-all duration-300 group-hover:w-full opacity-80" />
                                        </div>

                                        {/* Description & CTA Reveal - EXACT same */}
                                        <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 group-hover:mt-4">
                                            <p className="text-white/90 text-lg mb-3">
                                                {item.description}
                                            </p>
                                            <span className="inline-flex items-center text-sm font-semibold text-[#16C4DA] uppercase tracking-wider">
                                                Learn More &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Carousel - now client component - EXACT same */}
                    <UsageTypesMobile usageTypes={usageTypes} />
                </div>
            </div>
        </section>
    );
}
