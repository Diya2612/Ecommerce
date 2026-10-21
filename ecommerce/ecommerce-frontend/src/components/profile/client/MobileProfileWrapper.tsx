"use client";

import { MobileProfileNav } from './MobileProfileNav';
import { MobileProfileHeader } from './MobileProfileHeader';
import type { UserProfile } from '@/lib/data/profile/types';
import { use } from 'react';

interface MobileProfileWrapperProps {
    userPromise: Promise<UserProfile | null>;
    countsPromise: Promise<{
        orders: number;
        addresses: number;
        wishlist: number;
        amc: number;
    }>;
    children: React.ReactNode;
}

export function MobileProfileWrapper({
    userPromise,
    countsPromise,
    children
}: MobileProfileWrapperProps) {
    const user = use(userPromise);
    const counts = use(countsPromise);

    return (
        <>
            {/* Mobile Header - Only visible on mobile */}
            <MobileProfileHeader user={user} />

            {/* Main Content */}
            {children}

            {/* Mobile Bottom Navigation - Only visible on mobile */}
            <MobileProfileNav counts={counts} />

            {/* Bottom padding spacer for mobile to account for fixed bottom nav */}
            <div className="h-20 lg:hidden" aria-hidden="true" />
        </>
    );
}
