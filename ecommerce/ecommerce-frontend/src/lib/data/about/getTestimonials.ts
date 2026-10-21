import { cache } from 'react';
import type { AboutTestimonial } from '@/types/about';

/**
 * Fetches testimonials for the About page testimonials section
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 * 
 * Note: This is separate from home page testimonials to allow for
 * different testimonials on each page if needed in the future.
 */
export const getAboutTestimonials = cache(async (): Promise<AboutTestimonial[]> => {
    try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch(
        //   `${process.env.API_BASE_URL}/about/testimonials`,
        //   {
        //     next: {
        //       revalidate: 3600, // Cache for 1 hour
        //       tags: ['about-testimonials'],
        //     },
        //   }
        // );
        //
        // if (!response.ok) {
        //   throw new Error('Failed to fetch testimonials');
        // }
        //
        // return response.json();

        // Static data - migrated from AboutTestimonials.tsx
        return [
            {
                id: 1,
                name: "Ramesh Gupta",
                role: "Homeowner, Mumbai",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh",
                rating: 5,
                text: "Anant Enterprises transformed our water quality completely. The installation was professional, and the after-sales service is exceptional. Our family's health has improved noticeably since we started using their purifier.",
                verified: true
            },
            {
                id: 2,
                name: "Sunita Desai",
                role: "Restaurant Owner, Pune",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita",
                rating: 5,
                text: "For our restaurant, water quality is critical. Anant's commercial purification system handles our high-volume needs perfectly. The IoT monitoring gives us peace of mind that our customers always get the best.",
                verified: true
            },
            {
                id: 3,
                name: "Dr. Anil Mehta",
                role: "Healthcare Professional, Delhi",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil",
                rating: 5,
                text: "As a doctor, I recommend Anant purifiers to all my patients. The multi-stage filtration and copper boost technology align perfectly with health requirements. Outstanding quality and reliability.",
                verified: true
            },
            {
                id: 4,
                name: "Kavita Sharma",
                role: "IT Professional, Bangalore",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
                rating: 5,
                text: "The smart features on their IoT purifier are amazing! I can monitor water quality from my phone. Installation was quick, and the team answered all my technical questions. Highly impressed!",
                verified: true
            },
            {
                id: 5,
                name: "Vijay Kumar",
                role: "Business Owner, Chennai",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay",
                rating: 5,
                text: "Best investment for our office. The purifier handles 100+ employees daily without any issues. The AMC service ensures it's always working perfectly. Great value for money!",
                verified: true
            },
            {
                id: 6,
                name: "Meera Iyer",
                role: "Teacher, Hyderabad",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
                rating: 5,
                text: "I've been using Anant purifiers for 5 years now. The water tastes amazing, and I love that minerals are retained. Customer service is always helpful and responsive. Truly a trustworthy brand!",
                verified: true
            }
        ];
    } catch (error) {
        console.error('Error fetching about testimonials:', error);
        return [];
    }
});
