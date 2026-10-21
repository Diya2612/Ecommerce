"use client";

import { useEffect } from "react";
import { useMergeCartMutation } from "@/hooks/useCart";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * CartAuthSync
 * 
 * Listens for authentication events (specifically SIGNED_IN) and triggers
 * the cart merge operation. This ensures that items added to a guest cart
 * (session-based) are moved to the user's persistent cart upon login.
 */
export function CartAuthSync() {
    const mergeMutation = useMergeCartMutation();

    useEffect(() => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {

                mergeMutation.mutate();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [mergeMutation]);

    return null;
}
