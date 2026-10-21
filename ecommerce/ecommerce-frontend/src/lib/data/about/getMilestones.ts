import { cache } from 'react';
import type { Milestone } from '@/types/about';

/**
 * Fetches milestone data for the About page Our Story section
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getMilestones = cache(async (): Promise<Milestone[]> => {
    try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch(
        //   `${process.env.API_BASE_URL}/about/milestones`,
        //   {
        //     next: {
        //       revalidate: 86400, // Cache for 24 hours
        //       tags: ['about-milestones'],
        //     },
        //   }
        // );
        //
        // if (!response.ok) {
        //   throw new Error('Failed to fetch milestones');
        // }
        //
        // return response.json();

        // Static data - migrated from OurStory.tsx
        return [
            {
                year: "2015",
                title: "The Beginning",
                description: "Started with a vision to provide affordable clean water solutions in Delhi NCR."
            },
            {
                year: "2018",
                title: "Expansion Phase",
                description: "Expanded operations to 5 major cities and launched our flagship AI-enabled purifier series."
            },
            {
                year: "2021",
                title: "Innovation Award",
                description: "Received 'Best Water Tech Innovation' award for our zero-wastage technology."
            },
            {
                year: "2024",
                title: "Pan India Presence",
                description: "Celebrating 1 million+ happy customers across 100+ cities in India."
            }
        ];
    } catch (error) {
        console.error('Error fetching milestones:', error);
        return [];
    }
});
