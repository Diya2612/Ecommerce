/**
 * About Page Type Definitions
 * 
 * These types define the data structures used across all About page components.
 * They support the server-side data fetching layer and ensure type safety
 * throughout the migration from client to server components.
 * 
 * IMPORTANT: For Server->Client component data passing, we use icon names (strings)
 * instead of icon components, since React components are not serializable.
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// Icon Name Types (for serializable data passing)
// ============================================================================

// Icon names that can be passed from server to client
export type MissionIconName = 'Target' | 'Eye' | 'Lightbulb';
export type ValueIconName = 'Shield' | 'Users' | 'Zap' | 'Heart' | 'Leaf' | 'TrendingUp';
export type ContactIconName = 'MapPin' | 'Clock' | 'Headphones' | 'Phone' | 'MessageCircle' | 'Mail';

// ============================================================================
// Team Section Types
// ============================================================================

export interface TeamMember {
    name: string;
    role: string;
    bio: string;
    image: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
}

// ============================================================================
// Our Story Section Types
// ============================================================================

export interface Milestone {
    year: string;
    title: string;
    description: string;
}

// ============================================================================
// Testimonials Section Types
// ============================================================================

export interface AboutTestimonial {
    id: number;
    name: string;
    role: string;
    avatar: string;
    rating: number;
    text: string;
    verified: boolean;
}

// ============================================================================
// Mission Section Types
// ============================================================================

// Server-side type (with icon component for server rendering)
export interface MissionItem {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
    gradient: string;
}

// Serializable type for passing to client components
export interface MissionItemSerializable {
    iconName: MissionIconName;
    title: string;
    description: string;
    color: string;
    gradient: string;
}

// ============================================================================
// Values Section Types
// ============================================================================

// Server-side type (with icon component for server rendering)
export interface ValueItem {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
    bg: string;
}

// Serializable type for passing to client components
export interface ValueItemSerializable {
    iconName: ValueIconName;
    title: string;
    description: string;
    color: string;
    bg: string;
}

// ============================================================================
// CTA Section Types
// ============================================================================

// Server-side type (with icon component for server rendering)
export interface QuickContactInfo {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    description: string;
    iconBg: string;
}

// Serializable type for passing to client components
export interface QuickContactInfoSerializable {
    iconName: ContactIconName;
    title: string;
    subtitle: string;
    description: string;
    iconBg: string;
}

// Server-side type (with icon component for server rendering)
export interface ContactMethod {
    icon: LucideIcon;
    title: string;
    value: string;
    description: string;
    bg: string;
    iconBg: string;
}

// Serializable type for passing to client components
export interface ContactMethodSerializable {
    iconName: ContactIconName;
    title: string;
    value: string;
    description: string;
    bg: string;
    iconBg: string;
}

// ============================================================================
// Featured Products Types (extends from home)
// ============================================================================

export interface AboutFeaturedProduct {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    tags: string[];
    image: string;
}

// ============================================================================
// Aggregate Types for Page-Level Data
// ============================================================================

export interface AboutPageData {
    milestones: Milestone[];
    missionItems: MissionItem[];
    values: ValueItem[];
    team: TeamMember[];
    testimonials: AboutTestimonial[];
    featuredProducts: AboutFeaturedProduct[];
    quickContactInfo: QuickContactInfo[];
    contactMethods: ContactMethod[];
}
