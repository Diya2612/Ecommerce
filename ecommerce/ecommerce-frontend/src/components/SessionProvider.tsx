"use client";

import { useCartSession } from '@/hooks/cart/useCartSession';

export function SessionProvider({ children }: { children: React.ReactNode }) {
    // Mount global session hooks here
    useCartSession();

    return <>{children}</>;
}
