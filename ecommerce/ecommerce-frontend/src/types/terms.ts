/**
 * Terms Page Type Definitions
 * 
 * These types define the data structures used across all Terms page components.
 * They support the server-side data fetching layer and ensure type safety.
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// Icon Name Types (for serializable data passing)
// ============================================================================

export type TermsSectionIconName =
    | 'FileText'      // Agreement
    | 'Shield'        // Services & AMC
    | 'User'          // User Accounts
    | 'CreditCard'    // Payments
    | 'AlertTriangle' // Limitation
    | 'Mail';         // Contact

// ============================================================================
// Table of Contents Types
// ============================================================================

export interface TermsTOCItem {
    id: string;
    number: number;
    title: string;
}

// ============================================================================
// Section Content Types
// ============================================================================

// Highlight box with bullet points (yellow background)
export interface TermsHighlight {
    title: string;
    items: string[];
}

// Two-column content grid (for Payments section)
export interface TermsTwoColumn {
    left: {
        title: string;
        content: string;
    };
    right: {
        title: string;
        content: string;
    };
}

// ============================================================================
// Main Section Types
// ============================================================================

// Server-side type (with icon component for server rendering)
export interface TermsSection {
    id: string;
    number: number;
    icon: LucideIcon;
    iconBg: string;
    title: string;
    content: string;
    highlight?: TermsHighlight;
    twoColumn?: TermsTwoColumn;
}

// Serializable type for passing to client components (if needed in future)
export interface TermsSectionSerializable {
    id: string;
    number: number;
    iconName: TermsSectionIconName;
    iconBg: string;
    title: string;
    content: string;
    highlight?: TermsHighlight;
    twoColumn?: TermsTwoColumn;
}

// ============================================================================
// Contact Types
// ============================================================================

export interface TermsContactInfo {
    email: string;
    phone: string;
}

// ============================================================================
// Page Data Aggregate Type
// ============================================================================

export interface TermsPageData {
    sections: TermsSection[];
    tableOfContents: TermsTOCItem[];
    contactInfo: TermsContactInfo;
}
