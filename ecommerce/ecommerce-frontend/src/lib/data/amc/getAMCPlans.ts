import { cache } from 'react';
import type { AMCPlan } from './types';

// ============================================================================
// getAMCPlans - Server-side Data Fetcher
// ============================================================================
// Fetches AMC plans with React cache for deduplication
// TODO: Replace with actual API call when backend is ready

const AMC_PLANS_DATA: AMCPlan[] = [
    {
        name: "Basic Care",
        price: "₹2,499",
        period: "/ year",
        description: "Essential maintenance for your purifier.",
        features: [
            "2 Preventive Maintenance Visits",
            "Unlimited Breakdown Support",
            "10% Discount on Spares",
            "Priority Service Booking"
        ],
        notIncluded: [
            "Consumables (Filters/Membrane)",
            "Electrical Parts"
        ],
        popular: false,
        color: "bg-blue-50 dark:bg-blue-900/10"
    },
    {
        name: "Gold Protection",
        price: "₹4,999",
        period: "/ year",
        description: "Comprehensive coverage including filters.",
        features: [
            "3 Preventive Maintenance Visits",
            "All Filters Included (Sediment, Carbon)",
            "RO Membrane Replacement (1/yr)",
            "Unlimited Breakdown Support",
            "No Service Charges"
        ],
        notIncluded: [
            "Electrical Parts (Pump, SMPS)"
        ],
        popular: true,
        color: "bg-[#31CDD4]/10 border-[#31CDD4]"
    },
    {
        name: "Platinum Shield",
        price: "₹6,999",
        period: "/ year",
        description: "Total peace of mind with zero hidden costs.",
        features: [
            "4 Preventive Maintenance Visits",
            "All Filters & Membrane Included",
            "All Electrical Parts Covered",
            "24-Hour Breakdown Resolution",
            "Extended Warranty"
        ],
        notIncluded: [],
        popular: false,
        color: "bg-purple-50 dark:bg-purple-900/10"
    }
];

export const getAMCPlans = cache(async (): Promise<AMCPlan[]> => {
    // Simulate API delay in development
    await new Promise(resolve => setTimeout(resolve, 50));

    // TODO: Replace with actual API call
    // const response = await fetch('https://api.example.com/amc-plans');
    // const data = await response.json();
    // return data;

    return AMC_PLANS_DATA;
});
