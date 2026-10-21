import { cache } from "react";
import type { Brand } from "@/types/home";
import { HOME_PAGE_CACHE } from "@/lib/cache/strategies";
import { CACHE_TAGS } from "@/lib/cache/tags";

/**
 * Fetches brand data for the home page
 * Server-side only - called in Server Components
 *
 * Matches EXACT data from original Brands.tsx
 */
export const getBrands = cache(async (): Promise<Brand[]> => {
  try {
    // TODO: Replace with actual API endpoint when backend is ready
    // const response = await fetch(
    //   `${process.env.API_BASE_URL}/brands`,
    //   {
    //     next: {
    //       ...HOME_PAGE_CACHE.brands,
    //       tags: [CACHE_TAGS.BRANDS],
    //     },
    //   }
    // );

    // if (!response.ok) {
    //   throw new Error('Failed to fetch brands');
    // }

    // return response.json();

    // Fallback to static data - EXACT same as original Brands.tsx
    return [
      {
        id: 1,
        name: "Aquaguard",
        logo: "/hero/brands/aqua_guard_mobile.png",
        category: "Premium Protection",
        link: "/collections?search=Aquaguard",
      },
      {
        id: 2,
        name: "Kent",
        logo: "/hero/brands/kent_mobile.png",
        category: "Mineral RO",
        link: "/collections?search=Kent",
      },
      {
        id: 3,
        name: "Livpure",
        logo: "/hero/brands/livepure_mobile.png",
        category: "Smart Touch",
        link: "/collections?search=Livpure",
      },
      {
        id: 4,
        name: "Blue Star",
        logo: "/hero/brands/bluestar_mobile.png",
        category: "Corporate Solutions",
        link: "/collections?search=Blue%20Star",
      },
      {
        id: 5,
        name: "A.O. Smith",
        logo: "/hero/brands/aosmith_mobile.png",
        category: "Hot & Cold",
        link: "/collections?search=A.O.%20Smith",
      },
      {
        id: 6,
        name: "Havells",
        logo: "/hero/brands/havells_mobile.png",
        category: "Family Care",
        link: "/collections?search=Havells",
      },
      {
        id: 7,
        name: "Pureit",
        logo: "/hero/brands/pureit_mobile.png",
        category: "Advanced Filtration",
        link: "/collections?search=Pureit",
      },
      {
        id: 8,
        name: "LG",
        logo: "/hero/brands/lg_mobile.png",
        category: "True Water",
        link: "/collections?search=LG",
      },
    ];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
});
