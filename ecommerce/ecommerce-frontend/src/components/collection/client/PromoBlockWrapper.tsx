'use client';

import { useRouter } from 'next/navigation';
import { Gift, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { PromoBlock } from '@/components/ui/PromoBlock';
import { useChat } from '@/contexts/ChatContext';

interface PromoBlockWrapperProps {
    className?: string;
}

/**
 * PromoBlockWrapper - Client Component
 * 
 * Wraps PromoBlock with client-side hooks (useChat, useRouter)
 * and provides the visual content.
 */
export function PromoBlockWrapper({ className }: PromoBlockWrapperProps) {
    const { openChat } = useChat();
    const router = useRouter();

    return (
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
            visual={<PromotionVisual />}
            className={className}
        />
    );
}

/**
 * PromotionVisual - Visual content for the PromoBlock
 */
function PromotionVisual() {
    return (
        <div className="relative w-full max-w-sm">
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
    );
}
