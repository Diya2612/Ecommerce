/**
 * Technology Page Type Definitions
 * 
 * These types define the data structures used across all Technology page components.
 * They support the server-side data fetching layer and ensure type safety.
 */

// ============================================================================
// Technology Types
// ============================================================================

export interface Technology {
    id: string;
    title: string;
    description: string;
    benefits: string[];
    image: string;
}

// ============================================================================
// Page Data Aggregate Type
// ============================================================================

export interface TechnologyPageData {
    technologies: Technology[];
}
