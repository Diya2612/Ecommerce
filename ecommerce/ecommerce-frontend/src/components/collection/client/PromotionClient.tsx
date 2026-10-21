'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { PromoBlock } from '@/components/ui/PromoBlock';
import { useChat } from '@/contexts/ChatContext';
import { Gift, Clock, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

/**
 * PromotionClient - Client Island
 * 
 * Handles interactive elements: PromoBlock with countdown, 
 * offer cards with whileHover, useChat hook.
 * Exact UI match of old PromotionSection.
 */
export function PromotionClient() {
    const { openChat } = useChat();
    const router = useRouter();

    const offers = [
        {
            icon: Gift,
            title: "Free Installation",
            description: "Professional setup included",
            color: "text-[#00C4CC]"
        },
        {
            icon: Clock,
            title: "1 Year AMC Free",
            description: "Comprehensive maintenance",
            color: "text-[#F5B012]"
        },
        {
            icon: Zap,
            title: "Extended Warranty",
            description: "5-year protection plan",
            color: "text-[#0B1F51]"
        },
        {
            icon: TrendingUp,
            title: "Trade-In Offer",
            description: "Up to ₹5,000 off on exchange",
            color: "text-[#22C55E]"
        }
    ];

    return (
        <>
            <PromoBlock
                type="seasonal"
                badge="LIMITED TIME OFFER"
                title="Festive Season Privileges"
                valueAmplifier="Upgrade your home hydration with our premium festive benefits. Exclusive savings for early bookings."
                bullets={[
                    "40% Privilege Discount on Premium Series",
                    "Complimentary Installation Service",
                    "1-Year All-Inclusive Maintenance"
                ]}
                primaryCta={{
                    text: "Claim Festive Offer",
                    onClick: openChat
                }}
                secondaryCta={{
                    text: "Explore Models",
                    onClick: () => router.push('/collection')
                }}
                expiryDate={new Date(Date.now() + 86400000 * 3)} // 3 days from now
                visual={
                    <div className="relative w-full max-w-sm">
                        {/* Premium Status Card Visual */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-[#00C4CC]/20 flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-[#00C4CC]" />
                                </div>
                                <div>
                                    <div className="text-white font-semibold text-lg">Offer Activated</div>
                                    <div className="text-white/60 text-sm">Valid until Sunday</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-white/80 text-sm">
                                    <span>Device Savings</span>
                                    <span className="font-mono text-[#00C4CC]">-₹6,000</span>
                                </div>
                                <div className="flex justify-between items-center text-white/80 text-sm">
                                    <span>Installation</span>
                                    <span className="font-mono text-[#00C4CC]">FREE</span>
                                </div>
                                <div className="flex justify-between items-center text-white/80 text-sm">
                                    <span>AMC Package</span>
                                    <span className="font-mono text-[#00C4CC]">FREE</span>
                                </div>
                                <div className="h-px bg-white/10 my-2"></div>
                                <div className="flex justify-between items-center text-white font-bold text-lg">
                                    <span>Total Savings</span>
                                    <span className="text-[#00C4CC]">₹9,500</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs text-white/50 justify-center bg-white/5 py-2 rounded-lg">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Offer</span>
                            </div>
                        </motion.div>
                    </div>
                }
                className="mb-12"
            />

            {/* Clean Offer Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {offers.map((offer, index) => {
                    const Icon = offer.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-card p-4 md:p-6 shadow-xs hover:shadow-md transition-all duration-300 border border-neutral-100"
                        >
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-input bg-neutral-50 flex items-center justify-center mb-3 md:mb-4`}>
                                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${offer.color}`} />
                            </div>
                            <h3 className="text-[14px] md:text-[18px] font-semibold text-[#0B1F51] mb-1 md:mb-2 tracking-tight">
                                {offer.title}
                            </h3>
                            <p className="text-[12px] md:text-[14px] text-gray-500 leading-relaxed">
                                {offer.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </>
    );
}
