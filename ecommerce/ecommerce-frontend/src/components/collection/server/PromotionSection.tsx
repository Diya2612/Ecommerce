import { PromotionClient } from '../client/PromotionClient';

/**
 * PromotionSection - Server Component Shell
 * 
 * Renders the section wrapper and imports client island
 * for PromoBlock and interactive offer cards.
 */
export function PromotionSection() {
    return (
        <section className="py-10 md:py-16 bg-[#F9FBFD]">
            <div className="container mx-auto px-4 md:px-6">
                <PromotionClient />
            </div>
        </section>
    );
}
