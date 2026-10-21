import { getCurrentDeal } from '@/lib/data/home';
import Image from 'next/image';
import { Shield, Wrench, CheckCircle2, Zap, Phone, ShieldCheck } from 'lucide-react';
import { CountdownTimer, DealCTAButtons } from '../client';
import * as motion from 'motion/react-client';
import { FloatingCard } from '@/components/layout/FloatingCard';

/**
 * DealSection - Server Component
 * 
 * Fetches current deal server-side
 * Maintains EXACT same visual appearance as original DealOfTheDay component
 */
export async function DealSection() {
    const deal = await getCurrentDeal();

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-[32px] overflow-hidden bg-linear-to-br from-[#0B1F51] via-[#0F2A66] to-[#0B1F51] shadow-2xl ring-1 ring-white/5"
                >
                    {/* Subtle Grain/Noise Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.03]"></div>

                    <div className="relative z-10 grid lg:grid-cols-[55%_45%] min-h-[500px]">
                        {/* Left Column: Content (55%) */}
                        <div className="flex flex-col justify-center p-8 md:p-12 lg:pr-0">
                            {/* Header Group */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="inline-block text-[#00C4CC] text-[13px] font-bold uppercase tracking-widest bg-[#00C4CC]/10 px-3 py-1 rounded-full border border-[#00C4CC]/20">
                                        Limited Time Offer
                                    </div>
                                    <CountdownTimer targetDate={deal.expiresAt} />
                                </div>

                                <h2 className="text-[36px] md:text-[42px] font-semibold text-white mb-3 leading-[1.1] tracking-tight">
                                    {deal.title}
                                </h2>
                                <p className="text-[16px] text-white/80 font-normal leading-relaxed max-w-xl">
                                    {deal.description}
                                </p>
                            </div>

                            {/* Feature List + Value Stack */}
                            <div className="space-y-6 mb-8">
                                <ul className="space-y-2">
                                    {deal.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-white/90 text-[15px]">
                                            <div className="w-5 h-5 rounded-full bg-[#00C4CC]/20 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00C4CC]" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* AMC Value Stack (Pills) */}
                                {deal.tags && (
                                    <div className="flex flex-wrap gap-2">
                                        {deal.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-full border border-[#00C4CC]/30 bg-[#00C4CC]/5 text-[#00C4CC] text-[12px] font-semibold tracking-wide">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pricing & CTA Zone */}
                            <div className="mt-auto">
                                <div className="flex items-baseline gap-3 mb-6">
                                    <div className="flex items-center gap-2 text-white/60 text-sm">
                                        <span className="line-through decoration-white/40">₹{deal.originalPrice.toLocaleString()}</span>
                                        <span className="text-white font-bold text-2xl">₹{deal.price.toLocaleString()}</span>
                                    </div>
                                    <span className="text-[#00C4CC] font-bold text-sm bg-[#00C4CC]/10 px-2 py-1 rounded">
                                        Save {deal.discount}% on Annual Plans
                                    </span>
                                </div>

                                {/* Buttons Island */}
                                <DealCTAButtons ctaText={deal.ctaText || "Chat with Expert"} />

                                {/* Micro Trust Line */}
                                {deal.terms && (
                                    <div className="flex items-center gap-2 mt-4 text-[12px] text-white/40 font-medium">
                                        <ShieldCheck className="w-3 h-3" />
                                        <span>{deal.terms}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Visual (45%) */}
                        <div className="relative h-[400px] lg:h-auto w-full flex items-center justify-center p-8 overflow-visible">
                            {/* Main Image Container */}
                            <div className="relative w-full max-w-[400px] aspect-4/5 flex items-center justify-center">

                                {/* Background Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00C4CC]/20 blur-[80px] rounded-full" />

                                {/* Product Image */}
                                <div className="relative z-20 w-full h-full drop-shadow-2xl">
                                    <Image
                                        src={deal.image}
                                        alt={deal.title}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>

                                {/* Floating Micro Card 1: Protection */}
                                <FloatingCard
                                    icon={Shield}
                                    title="99.9%"
                                    subtitle="Protection"
                                    position="top-right"
                                    animation="float-down"
                                    className="top-10 right-0 max-w-[160px]"
                                    iconColor="text-[#00C4CC]"
                                    iconBgColor="bg-[#00C4CC]/20"
                                    variant="glass"
                                />

                                {/* Floating Micro Card 2: Service */}
                                <FloatingCard
                                    icon={Zap}
                                    title="Priority"
                                    subtitle="Service"
                                    position="bottom-left"
                                    animation="float-up"
                                    className="bottom-20 -left-5 max-w-[160px]"
                                    iconColor="text-[#F5B012]"
                                    iconBgColor="bg-[#F5B012]/20"
                                    variant="glass"
                                />

                                {/* Floating Micro Card 3: Free Filter */}
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute top-[40%] -left-[30px] z-20 hidden sm:flex bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-input shadow-lg items-center gap-2"
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90">Free Filter Replacement</span>
                                </motion.div>

                                {/* Status Trust Card (Bottom Right) */}
                                <div className="absolute -bottom-4 -right-4 z-40 bg-white rounded-[16px] p-4 shadow-xl border border-gray-100 flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Wrench className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-[#0F172A]">Technician Available</div>
                                        <div className="flex items-center gap-1 text-[11px] text-[#00C4CC] font-medium">
                                            <Phone className="w-3 h-3" />
                                            <span>24/7 Support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
