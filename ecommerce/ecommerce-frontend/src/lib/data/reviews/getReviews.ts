import { cache } from 'react';
import type { Review } from './types';

// ============================================================================
// getReviews - Server-side Data Fetcher
// ============================================================================
// Fetches customer reviews with React cache for deduplication
// TODO: Replace with actual API call when backend is ready

const REVIEWS_DATA: Review[] = [
    {
        id: 1,
        name: "Priya Sharma",
        location: "Mumbai, India",
        text: "The installation was flawless and the water quality is noticeably better. The team at Anant Enterprises is professional and courteous.",
        rating: 5,
        outcome: "TDS reduced from 420 to 45",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 2,
        name: "Rahul Verma",
        location: "Delhi, India",
        text: "I was looking for a premium RO system for my new apartment. Their product design is sleek and modern, perfect for my kitchen.",
        rating: 5,
        outcome: "Perfect installation in 24hrs",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 3,
        name: "Anita Desai",
        location: "Bangalore, India",
        text: "Excellent after-sales service. The technician arrived on time for the first service and did a thorough job. Highly recommended.",
        rating: 4,
        outcome: "Zero maintenance issues",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 4,
        name: "Vikram Singh",
        location: "Hyderabad, India",
        text: "Industrial grade quality for our office. We installed 3 units and they have been working perfectly for over a year now.",
        rating: 5,
        outcome: "30% cost savings",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 5,
        name: "Meera Reddy",
        location: "Chennai, India",
        text: "The alkaline water enhancer is a game changer. My family feels healthier and more energetic. Great product!",
        rating: 5,
        outcome: "Improved hydration",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 6,
        name: "Arjun Mehta",
        location: "Pune, India",
        text: "Very silent operation and looks elegant. The smart indicators for filter change are very helpful.",
        rating: 4,
        outcome: "Smart features work great",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"
    }
];

export const getReviews = cache(async (): Promise<Review[]> => {
    // Simulate API delay in development
    await new Promise(resolve => setTimeout(resolve, 100));

    // TODO: Replace with actual API call
    // const response = await fetch('https://api.example.com/reviews');
    // const data = await response.json();
    // return data;

    return REVIEWS_DATA;
});
