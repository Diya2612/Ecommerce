import * as motion from 'motion/react-client';
import Link from 'next/link';
import { Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatButton } from '../client/ChatButton';

/**
 * ProductCTASection - Server Component
 * 
 * Static CTA section with server-rendered content
 * Uses ChatButton client island for interactive chat functionality
 */
export function ProductCTASection() {
    const benefits = [
        "Free home demonstration",
        "Expert consultation",
        "Same-day installation",
        "30-day money back guarantee"
    ];

    return (
        <motion.section
            className="py-24 bg-linear-to-br from-[#0B1F51] via-[#152C69] to-[#0B1F51]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="text-center lg:text-left">
                        <span className="inline-block px-4 py-1.5 bg-[#00C4CC]/10 border border-[#00C4CC]/20 rounded-full text-[#00C4CC] text-sm font-medium mb-6">
                            Premium Support
                        </span>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                            Still Have{' '}
                            <span className="text-[#00C4CC]">Questions?</span>
                        </h2>

                        <p className="text-white/70 text-lg mb-8 max-w-xl">
                            Our water purification experts are ready to help you make the right choice.
                            Get personalized recommendations and exclusive offers.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                            <ChatButton /> {/* Client Island */}

                            <Button
                                asChild
                                className="bg-[#00C4CC] hover:bg-[#00C4CC]/90 text-white border-0 h-14 px-8 rounded-xl text-lg"
                            >
                                <a href="tel:9075366955">
                                    <Phone className="w-5 h-5 mr-2" />
                                    Call Us
                                </a>
                            </Button>
                        </div>

                        {/* Footer text */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/60 text-sm font-medium justify-center lg:justify-start">
                            <span>Instant support</span>
                            <span className="w-1 h-1 bg-white/40 rounded-full" />
                            <span>Product guidance</span>
                            <span className="w-1 h-1 bg-white/40 rounded-full" />
                            <span>Installation help</span>
                        </div>
                    </div>

                    {/* Right: Benefits */}
                    <div className="grid gap-4 w-full max-w-md mx-auto lg:mr-0">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="flex items-center gap-4 bg-[#1e3a8a]/30 border border-white/10 p-4 rounded-2xl backdrop-blur-xs hover:bg-[#1e3a8a]/50 transition-colors duration-300"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#00C4CC]/10 flex items-center justify-center shrink-0 border border-[#00C4CC]/20">
                                    <CheckCircle2 className="w-5 h-5 text-[#00C4CC]" />
                                </div>
                                <span className="text-white font-medium text-lg">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
