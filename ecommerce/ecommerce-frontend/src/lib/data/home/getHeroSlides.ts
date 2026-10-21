import { cache } from "react";
import type { HeroSlide } from "@/types/home";
import { HOME_PAGE_CACHE } from "@/lib/cache/strategies";
import { CACHE_TAGS } from "@/lib/cache/tags";

/**
 * Fetches hero slides for the home page
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  try {
    // TODO: Replace with actual API endpoint when backend is ready
    // const response = await fetch(
    //   `${process.env.API_BASE_URL}/hero-slides`,
    //   {
    //     next: {
    //       ...HOME_PAGE_CACHE.heroSlides,
    //       tags: [CACHE_TAGS.HERO],
    //     },
    //   }
    // );

    // if (!response.ok) {
    //   throw new Error('Failed to fetch hero slides');
    // }

    // return response.json();

    // Fallback to static data (current implementation)
    return [
      {
        id: 1,
        image: "/hero/banner/purifier_1.png",
        alt: "Premium water purifier in modern home kitchen",
        ctaText: "Book Service",
        link: "/services",
        priority: true,
      },
      {
        id: 2,
        image: "/hero/banner/purifier_2.png",
        alt: "Pure mineral water glass in sunlight",
        ctaText: "View Products",
        link: "/products",
      },
      {
        id: 3,
        image: "/hero/banner/purifier_3.png",
        alt: "Happy family drinking healthy water",
        ctaText: "Contact Us",
        link: "/contact",
      },
    ];
  } catch (error) {
    console.error("Error fetching hero slides:", error);

    // Return minimal fallback data on error
    return [
      {
        id: 1,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
        alt: "Water Purifier",
        ctaText: "View Products",
        link: "/products",
        priority: true,
      },
    ];
  }
});
