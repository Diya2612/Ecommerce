import { cache } from 'react';
import type { TeamMember } from '@/types/about';

/**
 * Fetches team member data for the About page OurTeam section
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getTeamMembers = cache(async (): Promise<TeamMember[]> => {
    try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch(
        //   `${process.env.API_BASE_URL}/about/team`,
        //   {
        //     next: {
        //       revalidate: 86400, // Cache for 24 hours
        //       tags: ['about-team'],
        //     },
        //   }
        // );
        //
        // if (!response.ok) {
        //   throw new Error('Failed to fetch team members');
        // }
        //
        // return response.json();

        // Static data - migrated from OurTeam.tsx
        return [
            {
                name: "Rajesh Kumar",
                role: "Founder & CEO",
                bio: "20+ years of experience in water purification technology. Visionary leader committed to clean water for all.",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
                linkedin: "#",
                twitter: "#",
                email: "rajesh@anantpure.com"
            },
            {
                name: "Dr. Sarah Sharma",
                role: "Head of R&D",
                bio: "PhD in Chemical Engineering. leads our innovation lab developing next-gen filtration systems.",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
                linkedin: "#",
                twitter: "#",
                email: "sarah@anantpure.com"
            },
            {
                name: "Amit Patel",
                role: "Operations Director",
                bio: "Expert in supply chain management and customer service excellence. Ensures smooth delivery and support.",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
                linkedin: "#",
                twitter: "#",
                email: "amit@anantpure.com"
            },
            {
                name: "Priya Singh",
                role: "Marketing Head",
                bio: "Passionate about building brand trust and community engagement. creating awareness about water safety.",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
                linkedin: "#",
                twitter: "#",
                email: "priya@anantpure.com"
            }
        ];
    } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
    }
});
