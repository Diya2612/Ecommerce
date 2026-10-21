/**
 * Header Component Types
 */

import type { Product } from '@/types/home';

// Navigation Item
export interface NavItem {
    name: string;
    href: string;
    hasDropdown?: boolean;
}

// Search State
export interface SearchState {
    query: string;
    results: Product[];
    isLoading: boolean;
    recentSearches: string[];
}

// Component Props
export interface HeaderProps {
    className?: string;
}

export interface LogoProps {
    isExpanded?: boolean;
    className?: string;
}

export interface NavigationProps {
    navItems: NavItem[];
    pathname: string;
    className?: string;
}

export interface ActionButtonsProps {
    onSearchClick: () => void;
    cartItemCount: number;
    onCartClick: () => void;
    onProfileClick: () => void;
    className?: string;
}

export interface MobileMenuProps {
    navItems: NavItem[];
    pathname: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cartItemCount: number;
    onCartClick: () => void;
    onProfileClick: () => void;
    onContactClick: () => void;
}

export interface ExpandedSearchProps {
    onClose: () => void;
}

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export interface SearchResultsGridProps {
    results: Product[];
    onProductClick: (productId: number | string) => void;
    isLoading?: boolean;
}

export interface TrendingTagsProps {
    trendingSearches: string[];
    recentSearches: string[];
    onTagClick: (term: string) => void;
    onClearRecent: () => void;
}

// Mega Menu Panel Props
export interface MegaMenuPanelProps {
    tiers: import('@/types/tier').TierNode[];
    activeTierId: string | null;
    onClose: () => void;
}

