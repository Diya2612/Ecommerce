"use client";

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';

interface HideOnMobileProfileProps {
    children: ReactNode;
}

/**
 * Wrapper component that hides its children on mobile when viewing profile pages.
 * Used to hide the main header and footer on mobile profile pages since
 * they have their own mobile navigation (MobileProfileHeader + MobileProfileNav).
 * 
 * Uses useEffect to avoid hydration mismatch - initially renders children,
 * then hides on mobile after client hydration.
 */
export function HideOnMobileProfile({ children }: HideOnMobileProfileProps) {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    // Only apply conditional rendering after mount to avoid hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Check if we're on a profile page
    const isProfilePage = pathname.startsWith('/profile');

    // During SSR and initial hydration, render normally to avoid mismatch
    if (!isMounted) {
        return <>{children}</>;
    }

    // After hydration, hide on mobile for profile pages
    if (isProfilePage) {
        return (
            <div className="hidden lg:block">
                {children}
            </div>
        );
    }

    // Show normally for non-profile pages
    return <>{children}</>;
}
