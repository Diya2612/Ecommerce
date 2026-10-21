import { getTableOfContents } from '@/lib/data/terms';

/**
 * TermsTableOfContents - Server Component
 * 
 * Renders the left sidebar navigation with anchor links to each section.
 * Sticky positioning on desktop for easy navigation while scrolling.
 */
export async function TermsTableOfContents() {
    const items = await getTableOfContents();

    return (
        <aside className="lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                Contents
            </h3>
            <nav className="space-y-1">
                {items.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block py-2 text-[#00C4CC] hover:text-[#00a8b0] hover:underline transition-colors duration-200 text-sm"
                    >
                        {item.number}. {item.title}
                    </a>
                ))}
            </nav>
        </aside>
    );
}
