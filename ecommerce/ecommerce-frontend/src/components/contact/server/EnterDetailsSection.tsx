import * as motion from 'motion/react-client';
import { getTrustIndicators } from '@/lib/data/contact';
import { EnterDetailsForm } from '../client/EnterDetailsForm';

/**
 * EnterDetailsSection - Server Component
 * 
 * Server-rendered section shell with:
 * - SSR-compatible motion animations for header
 * - Client island for form (inherently client-side)
 * - Server-rendered trust indicators
 * 
 * MAINTAINS EXACT SAME UI as original EnterDetailsSection.tsx
 */
export async function EnterDetailsSection() {
    const trustIndicators = await getTrustIndicators();

    return (
        <section className="py-24 bg-[#F9FBFD]">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header - Server Rendered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#F5B012] rounded-full flex items-center justify-center text-white font-bold">
                            3
                        </div>
                        <h2 className="text-[36px] md:text-[48px] font-semibold text-[#0B1F51] tracking-[-0.01em] leading-[120%]">
                            Enter Your Details
                        </h2>
                    </div>
                    <p className="text-[18px] text-gray-600 leading-[150%] max-w-3xl mx-auto">
                        Fill in your information so we can serve you better
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    {/* Form - Client Island */}
                    <EnterDetailsForm />

                    {/* Trust Indicators - Server Rendered */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-3 gap-6 mt-8"
                    >
                        {trustIndicators.map((item) => (
                            <div key={item.id} className="text-center">
                                <div className="text-[32px] mb-2" aria-hidden="true">{item.icon}</div>
                                <p className="text-[14px] font-medium text-gray-600">{item.text}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
