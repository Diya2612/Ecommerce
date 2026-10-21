'use client';

import { useCallback } from 'react';
import { useProfile, WishlistItem } from '@/contexts/ProfileContext';
import { toast } from 'sonner';

interface UseWishlistReturn {
    wishlist: WishlistItem[];
    isInWishlist: (id: string) => boolean;
    toggleWishlist: (item: WishlistItem) => void;
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
}

export function useWishlist(): UseWishlistReturn {
    const { wishlist, addToWishlist, removeFromWishlist } = useProfile();

    const isInWishlist = useCallback((id: string) => {
        return wishlist.some(item => item.id === id);
    }, [wishlist]);

    const toggleWishlist = useCallback((item: WishlistItem) => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
            toast.info('Removed from Wishlist', {
                description: `${item.name} has been removed from your wishlist.`,
            });
        } else {
            addToWishlist(item);
            toast.success('Added to Wishlist', {
                description: `${item.name} has been added to your wishlist.`,
            });
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    return {
        wishlist,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
    };
}

export type { WishlistItem };
