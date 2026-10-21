"use client";

import { createContext, useContext, useMemo } from 'react';
import { useProfileCounts, type ProfileCounts } from '@/hooks/queries/useProfileCounts';

// ============================================================================
// Context
// ============================================================================

interface ProfileCountsContextValue {
    counts: ProfileCounts;
    isLoading: boolean;
}

const ProfileCountsContext = createContext<ProfileCountsContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function ProfileCountsProvider({ children }: { children: React.ReactNode }) {
    const { counts, isLoading } = useProfileCounts();

    const value = useMemo(() => ({
        counts,
        isLoading,
    }), [counts, isLoading]);

    return (
        <ProfileCountsContext.Provider value={value}>
            {children}
        </ProfileCountsContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useProfileCountsContext() {
    const context = useContext(ProfileCountsContext);

    if (!context) {
        // Return default values if not within provider (graceful degradation)
        return {
            counts: { orders: 0, addresses: 0, wishlist: 0, amc: 0, notifications: 0 },
            isLoading: true,
        };
    }

    return context;
}
