import * as motion from 'motion/react-client';
import { PaymentMethodClient } from '../client/PaymentMethodClient';

// ============================================================================
// PaymentMethodDisplay - Server Component
// ============================================================================
// Server-rendered payment method section with animations
// Payment selection and forms handled by PaymentMethodClient island

export function PaymentMethodDisplay() {
    return (
        <section className="py-12 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8"
                >
                    <h2 className="text-[28px] md:text-[36px] font-semibold text-[#0B1F51] dark:text-white mb-2 tracking-[-0.01em] leading-[120%]">
                        Payment Method
                    </h2>
                    <p className="text-[16px] text-gray-600 dark:text-gray-400">
                        Choose your preferred payment method
                    </p>
                </motion.div>

                {/* Client Island: Payment Method Selection & Forms */}
                <PaymentMethodClient />
            </div>
        </section>
    );
}
