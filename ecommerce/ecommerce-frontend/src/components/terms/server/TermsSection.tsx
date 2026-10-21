import * as motion from 'motion/react-client';
import type { TermsSection as TermsSectionType } from '@/types/terms';

interface TermsSectionProps {
    section: TermsSectionType;
}

/**
 * TermsSection - Server Component
 * 
 * Renders a single Terms section with:
 * - Icon with colored background
 * - Numbered title
 * - Content paragraph
 * - Optional highlight box (yellow) with bullet points
 * - Optional two-column grid layout
 * 
 * Uses Motion SSR for smooth entry animations.
 */
export function TermsSection({ section }: TermsSectionProps) {
    const Icon = section.icon;

    return (
        <motion.section
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-12 scroll-mt-24"
        >
            {/* Icon + Title */}
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${section.iconBg}`}>
                    <Icon className="w-6 h-6 text-[#0B1F51]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[#0B1F51]">
                    {section.number}. {section.title}
                </h2>
            </div>

            {/* Content */}
            <p className="text-gray-600 leading-relaxed mb-4">
                {section.content}
            </p>

            {/* Optional Highlight Box */}
            {section.highlight && (
                <div className="mt-4 bg-[#FFF9E6] border-l-4 border-[#F5B012] p-4 md:p-6 rounded-r-lg">
                    <h4 className="font-semibold text-[#0B1F51] mb-3">
                        {section.highlight.title}
                    </h4>
                    <ul className="space-y-2">
                        {section.highlight.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-600 text-sm md:text-base">
                                <span className="text-[#F5B012] mt-1 shrink-0">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Optional Two-Column Grid */}
            {section.twoColumn && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100">
                        <h4 className="font-semibold text-[#0B1F51] mb-2">
                            {section.twoColumn.left.title}
                        </h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            {section.twoColumn.left.content}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100">
                        <h4 className="font-semibold text-[#0B1F51] mb-2">
                            {section.twoColumn.right.title}
                        </h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            {section.twoColumn.right.content}
                        </p>
                    </div>
                </div>
            )}
        </motion.section>
    );
}
