import { cache } from 'react';
import type { Testimonial } from '@/types/home';
import { HOME_PAGE_CACHE } from '@/lib/cache/strategies';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fetches testimonials for the home page
 * Server-side only - called in Server Components
 */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
    try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch(
        //   `${process.env.API_BASE_URL}/testimonials`,
        //   {
        //     next: {
        //       ...HOME_PAGE_CACHE.testimonials,
        //       tags: [CACHE_TAGS.TESTIMONIALS],
        //     },
        //   }
        // );

        // if (!response.ok) {
        //   throw new Error('Failed to fetch testimonials');
        // }

        // return response.json();

        // Fallback to static data
        return [
            {
                id: 1,
                name: "Priya Sharma",
                location: "Mumbai, India",
                text: "The installation was flawless and the water quality is noticeably better. The team at Anant Enterprises is professional and courteous.",
                rating: 5,
                outcome: "TDS reduced from 420 to 45",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                verified: true,
            },
            {
                id: 2,
                name: "Rahul Verma",
                location: "Delhi, India",
                text: "I was looking for a premium RO system for my new apartment. Their product design is sleek and modern, perfect for my kitchen.",
                rating: 5,
                outcome: "Perfect installation in 24hrs",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                verified: true,
            },
            {
                id: 3,
                name: "Anita Desai",
                location: "Bangalore, India",
                text: "Excellent after-sales service. The technician arrived on time for the first service and did a thorough job. Highly recommended.",
                rating: 4,
                outcome: "Zero maintenance issues",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
                verified: true,
            },
            {
                id: 4,
                name: "Vikram Singh",
                location: "Hyderabad, India",
                text: "Industrial grade quality for our office. We installed 3 units and they have been working perfectly for over a year now.",
                rating: 5,
                outcome: "30% cost savings",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                verified: true,
            }
        ];
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return [];
    }
});
