import { getHeroSlides } from '@/lib/data/home';
import { HeroCarousel } from '../client/HeroCarousel';

/**
 * HeroSection - Server Component
 * 
 * Fetches hero slides data server-side and passes to client carousel
 * This maintains the EXACT same visual appearance as the original Hero component
 * 
 * Benefits:
 * - Hero slide data is server-rendered (SEO-friendly)
 * - Images can be optimized at build time
 * - Only carousel interactions require client-side JS
 */
export async function HeroSection() {
    const slides = await getHeroSlides();

    return (
        <section className="relative w-full bg-white dark:bg-slate-950 pt-0 pb-0 transition-colors duration-300">
            {/* Visually hidden h1 for accessibility and SEO - every page should have one h1 */}
            <h1 className="sr-only">
                Anant Enterprises - Premium Water Purifiers & RO Systems
            </h1>
            {/* Banner Container - Full Width */}
            <HeroCarousel slides={slides} />
        </section>
    );
}
