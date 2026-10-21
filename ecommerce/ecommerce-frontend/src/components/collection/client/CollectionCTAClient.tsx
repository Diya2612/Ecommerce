'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { PremiumSection } from '@/components/ui/PremiumSection';
import { MessageCircle, FileText, CheckCircle2 } from 'lucide-react';

/**
 * CollectionCTAClient - Client Island
 * 
 * Handles interactive elements: PremiumSection, motion animations, router.
 * Exact UI match of old CollectionCTA.
 */
export function CollectionCTAClient() {
    const router = useRouter();

    return (
        <PremiumSection
            badge="Free Consultation"
            title="Not Sure Which Purifier is Right for You?"
            highlightWord="Right for You"
            description="Our water purification experts are here to help. Get personalized recommendations based on your water quality, usage, and budget."
            bullets={["Free Water Quality Test", "Expert Consultation", "Customized Solutions"]}
            primaryCta={{
                text: "Chat with a Water Expert",
                icon: MessageCircle,
                onClick: () => router.push('/contact')
            }}
            ctaFooter={
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/60 text-sm font-medium">
                    <span>Instant support</span>
                    <span className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>Product guidance</span>
                    <span className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>Installation help</span>
                </div>
            }
            rightContent={
                <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#00C4CC] opacity-10 blur-3xl rounded-full" />

                    <div className="relative z-10 grid gap-4">
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#00C4CC]/20 flex items-center justify-center text-[#00C4CC]">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-white font-bold">Personalized Choice</div>
                                <div className="text-white/60 text-xs">Based on your TDS level</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl ml-8"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#F5B012]/20 flex items-center justify-center text-[#F5B012]">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-white font-bold">Free Guide</div>
                                <div className="text-white/60 text-xs">Download buying guide</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            }
        />
    );
}
