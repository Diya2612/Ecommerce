'use client';

import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { PremiumSection } from '@/components/ui/PremiumSection';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

/**
 * CallToActionClient - Client Component
 * 
 * Handles router navigation and interaction for CTA section
 * Maintains EXACT same UI as original CallToAction component
 */
export function CallToActionClient() {
    const router = useRouter();

    return (
        <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-6">
                <PremiumSection
                    badge="Free Consultation"
                    title="Ready for Pure Water?"
                    highlightWord="Pure Water"
                    description="Our experts will visit your location, test your water quality, and recommend the perfect purification solution tailored to your needs."
                    bullets={[
                        "Free TDS Water Level Check",
                        "Professional Consultation",
                        "Transparent Pricing - No Hidden Costs",
                        "Expert Technician Visit"
                    ]}
                    primaryCta={{
                        text: "Book Free Demo",
                        icon: Calendar,
                        onClick: () => router.push('/contact')
                    }}
                    secondaryCta={{
                        text: "Contact Support",
                        onClick: () => router.push('/contact')
                    }}
                    rightContent={
                        <div className="relative h-full flex items-center justify-center w-full">
                            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-3 border border-white/10 transform rotate-3 shadow-2xl max-w-[320px] md:max-w-[400px]">
                                <Image
                                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop"
                                    alt="Technician"
                                    width={400}
                                    height={320}
                                    className="rounded-2xl w-full h-auto"
                                />
                            </div>
                            {/* Floating Card - EXACT same */}
                            <div className="absolute bottom-4 left-0 md:left-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-bounce-slow">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Status</div>
                                    <div className="font-bold text-[#1C2A54] dark:text-white">Technician Available</div>
                                </div>
                            </div>
                        </div>
                    }
                />
            </div>
        </section>
    );
}
