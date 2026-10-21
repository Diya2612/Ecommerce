import * as motion from 'motion/react-client';
import { getTermsSections, getTermsContactInfo } from '@/lib/data/terms';
import { TermsSection } from './TermsSection';

/**
 * TermsContent - Server Component
 * 
 * Main content area that renders all Terms sections and contact info.
 * Uses parallel data fetching for optimal performance.
 */
export async function TermsContent() {
    // Parallel fetch for optimal performance
    const [sections, contact] = await Promise.all([
        getTermsSections(),
        getTermsContactInfo(),
    ]);

    return (
        <div className="space-y-0">
            {/* Terms Sections */}
            {sections.map((section) => (
                <TermsSection key={section.id} section={section} />
            ))}

            {/* Contact Section */}
            <motion.section
                id="contact"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="pt-8 border-t border-gray-200 scroll-mt-24"
            >
                <h2 className="text-xl md:text-2xl font-bold text-[#0B1F51] mb-4">
                    Contact
                </h2>
                <p className="text-gray-600 mb-4">
                    For any questions regarding these Terms, please contact us at:
                </p>
                <div className="flex flex-wrap items-center gap-4">
                    <a
                        href={`mailto:${contact.email}`}
                        className="text-[#00C4CC] hover:text-[#00a8b0] hover:underline transition-colors duration-200"
                    >
                        {contact.email}
                    </a>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-600">{contact.phone}</span>
                </div>
            </motion.section>
        </div>
    );
}
