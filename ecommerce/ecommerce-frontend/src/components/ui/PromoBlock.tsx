"use client";
import React from 'react';
import { motion } from 'motion/react';
import { Button } from './button';
import { Clock } from 'lucide-react';

export type PromoType = 'offer' | 'amc' | 'combo' | 'subscription' | 'referral' | 'seasonal' | 'business';

interface PromoBlockProps {
    type: PromoType;
    badge: string;
    title: string;
    valueAmplifier?: string;
    bullets?: string[];
    price?: {
        original?: string;
        discounted: string;
        discountPercentage?: string;
        label?: string;
        isTaxInclusive?: boolean;
    };
    primaryCta: {
        text: string;
        onClick?: () => void;
    };
    secondaryCta?: {
        text: string;
        onClick?: () => void;
    };
    expiryDate?: Date;
    visual: React.ReactNode;
    className?: string;
}

// Countdown Timer Component - Redesigned to be "Pill-shaped glass cards"
function Countdown({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +targetDate - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft as any;
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="flex gap-2 mb-6">
            {['Hours', 'Minutes', 'Seconds'].map((label, i) => {
                const val = i === 0 ? timeLeft.hours || 0 : i === 1 ? timeLeft.minutes || 0 : timeLeft.seconds || 0;
                return (
                    <div key={label} className="flex flex-col items-center justify-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-xs border border-white/10 min-w-[70px]">
                        <span className="text-lg font-bold text-white leading-none">
                            {String(val).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-white/50 mt-1">{label.slice(0, 3)}</span>
                    </div>
                )
            })}
        </div>
    );
}

export function PromoBlock({
    type,
    badge,
    title,
    valueAmplifier,
    bullets = [],
    price,
    primaryCta,
    secondaryCta,
    expiryDate,
    visual,
    className = ""
}: PromoBlockProps) {

    // Background style: Strictly Navy or subtle gradient
    const bgStyle = "bg-[#0B1F51]";
    // We can add a subtle gradient overlay if needed, but the rule says "Navy brand background OR subtle premium gradient".
    // Let's use a subtle gradient to keep it premium but not "heavy".
    const gradientStyle = "bg-linear-to-br from-[#0B1F51] via-[#0F2A66] to-[#0B1F51]";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`relative rounded-[32px] overflow-hidden ${gradientStyle} ${className} shadow-2xl ring-1 ring-white/5`}
        >
            {/* Clean Background - removed heavy blobs */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.03]"></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 items-center">
                {/* Left Panel: Content Core */}
                <div className="flex flex-col items-start text-left">
                    {/* Badge - Clean, minimal */}
                    <div className="inline-block text-[#00C4CC] text-[12px] md:text-[14px] font-bold uppercase tracking-widest mb-3 md:mb-4">
                        {badge}
                    </div>

                    {/* Headline - H2 36px or H1 48px depending on context. Using H2 size for block title usually. */}
                    <h2 className="text-[28px] md:text-[42px] font-semibold text-white mb-3 md:mb-4 leading-[1.2] tracking-tight">
                        {title}
                    </h2>

                    {/* Value Amplifier - Body-L 18px */}
                    {valueAmplifier && (
                        <p className="text-[16px] md:text-[18px] text-white/80 font-normal mb-6 leading-relaxed max-w-lg">
                            {valueAmplifier}
                        </p>
                    )}

                    {/* Bullets - Clean list */}
                    {bullets.length > 0 && (
                        <ul className="space-y-3 mb-8 w-full">
                            {bullets.map((bullet, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-[#00C4CC]/20 flex items-center justify-center shrink-0">
                                        <span className="text-[#00C4CC] text-xs font-bold">✓</span>
                                    </div>
                                    <span className="text-[15px] md:text-[16px]">{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Price Block */}
                    {price && (
                        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs inline-block">
                            <div className="flex items-baseline gap-3 mb-1">
                                {price.original && (
                                    <span className="text-[16px] md:text-[18px] text-white/40 line-through">
                                        {price.original}
                                    </span>
                                )}
                                <span className="text-[28px] md:text-[32px] font-bold text-white">
                                    {price.discounted}
                                </span>
                                {price.discountPercentage && (
                                    <span className="text-[#00C4CC] text-sm font-bold bg-[#00C4CC]/10 px-2 py-1 rounded">
                                        {price.discountPercentage}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3 text-sm text-white/60 font-medium">
                                {price.label && <span>{price.label}</span>}
                                {price.isTaxInclusive && <span>(Tax inclusive)</span>}
                            </div>
                        </div>
                    )}

                    {/* Urgency / Countdown */}
                    {expiryDate && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-[#00C4CC] text-xs font-bold uppercase tracking-wider mb-3">
                                <Clock className="w-4 h-4" />
                                <span>Offer Ends In</span>
                            </div>
                            <Countdown targetDate={expiryDate} />
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-auto">
                        <Button
                            onClick={primaryCta.onClick}
                            className="bg-[#00C4CC] hover:bg-[#00b2b9] text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#00C4CC]/20 rounded-card h-[50px] md:h-[56px] px-8 text-[15px] md:text-[16px] font-bold border-none w-full sm:w-auto"
                        >
                            {primaryCta.text}
                        </Button>

                        {secondaryCta && (
                            <Button
                                variant="outline"
                                onClick={secondaryCta.onClick}
                                className="bg-transparent border border-[#00C4CC]/50 text-[#00C4CC] hover:bg-[#00C4CC]/10 rounded-card h-[50px] md:h-[56px] px-8 text-[15px] md:text-[16px] font-semibold w-full sm:w-auto"
                            >
                                {secondaryCta.text}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Panel: Visual Core */}
                <div className="relative flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                    {/* Visual content container - strictly clipped to rounded corners if needed, or floating */}
                    <div className="w-full h-full flex items-center justify-center relative z-10">
                        {visual}
                    </div>

                    {/* Subtle Glow behind visual - allowed "Soft shadows only" */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#00C4CC]/20 blur-[80px] rounded-full -z-10" />
                </div>
            </div>
        </motion.div>
    );
}

