import * as motion from 'motion/react-client';
import { getBookingServices, getTimeSlots } from '@/lib/data/contact';
import { ServiceSelector } from '../client/ServiceSelector';
import { DateTimePicker } from '../client/DateTimePicker';

/**
 * BookNowSection - Server Component
 * 
 * Server-rendered section wrapper with:
 * - SSR-compatible motion animations for header
 * - Data fetching for services and time slots
 * - Client islands for interactive elements
 * 
 * MAINTAINS EXACT SAME UI as original BookNowSection.tsx
 */
export async function BookNowSection() {
    // Parallel data fetching
    const [services, timeSlots] = await Promise.all([
        getBookingServices(),
        getTimeSlots(),
    ]);

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header - Server Rendered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[36px] md:text-[48px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em] leading-[120%]">
                        Book a Service
                    </h2>
                    <p className="text-[18px] text-gray-600 leading-[150%] max-w-3xl mx-auto">
                        Schedule a convenient time for our experts to visit you
                    </p>
                </motion.div>

                <div className="max-w-6xl mx-auto">
                    {/* Step 1: Select Service - Client Island */}
                    <ServiceSelector services={services} />

                    {/* Step 2: Pick Date & Time - Client Island */}
                    <DateTimePicker timeSlots={timeSlots} />
                </div>
            </div>
        </section>
    );
}
