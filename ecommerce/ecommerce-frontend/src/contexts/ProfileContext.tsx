"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import {
  MOCK_AMC_PLANS as INITIAL_AMC_PLANS,
} from '@/lib/data/profile/mock';

import {
  UserProfile,
  Order,
  OrderItem,
  Address,
  WishlistItem,
  AMCPlan
} from '@/lib/data/profile/types';
import { useAuth } from './AuthContext';
import { api } from '@/api/client';
import { useProfile as useUserProfileQuery } from '@/hooks/queries/useUser';

// Re-export specific types
export type { UserProfile, Order, OrderItem, Address, WishlistItem, AMCPlan };

interface ProfileContextType {
  wishlist: WishlistItem[];
  amcPlans: AMCPlan[];

  // Actions
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;

  // State
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// State - Initialize with defaults which will be populated by API
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [amcPlans, setAmcPlans] = useState<AMCPlan[]>(INITIAL_AMC_PLANS as AMCPlan[]); // AMC still mock for now
  const [isLoading, setIsLoading] = useState(true);

  const { user: authUser } = useAuth();
  const { user: userProfile } = useUserProfileQuery(); // Get public user profile including ID

  // Fetch wishlist when user is available
  useEffect(() => {
    const userId = userProfile?.id;
    if (!userId) {
      setWishlist([]);
      setIsLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        // Define the backend item type for typing the response
        interface BackendWishlistItem {
          product_id: string;
          product_name: string;
          product_image: string;
          selling_price: number;
          compare_at_price: number;
          rating: number;
          reviews: number;
          inStock: boolean;
          availableStock: number;
        }

        const response = await api<{ items: BackendWishlistItem[] }>(`/wishlist/${userId}/wishlist`, {
          auth: true
        });

        if (response && response.items) {
          const mappedItems: WishlistItem[] = response.items.map(item => ({
            id: item.product_id,
            name: item.product_name,
            price: Number(item.selling_price),
            originalPrice: Number(item.compare_at_price),
            rating: Number(item.rating),
            reviews: Number(item.reviews),
            image: item.product_image,
            inStock: item.inStock,
            total_stock: item.availableStock,
            url: `/collections/${item.product_id}`
          }));
          setWishlist(mappedItems);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [userProfile?.id]); // Depend on userProfile.id

  // Actions
  const addToWishlist = async (item: WishlistItem) => {
    if (!userProfile?.id) {
      toast.error("Please log in to add items to wishlist");
      return;
    }

    // Optimistic update
    const previousWishlist = [...wishlist];

    if (wishlist.some(w => w.id === item.id)) {
      toast.info("Item already in wishlist");
      return;
    }

    setWishlist(prev => [...prev, item]);

    try {
      // Use the Product ID (item.id) and User Public ID (userProfile.id)
      await api.post(`/wishlist/${userProfile.id}/wishlist/${item.id}`, {
        // Body if needed, but endpoint uses params mostly. 
        // Backend addToWishlist.ts accepts optional product_id in body if params missing, 
        // but we definitely pass it in URL.
      }, { auth: true });

      toast.success("Added to wishlist");
    } catch (error) {
      // Revert on error
      setWishlist(previousWishlist);
      toast.error("Failed to add to wishlist");
      console.error(error);
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!userProfile?.id) return;

    // Optimistic update
    const previousWishlist = [...wishlist];
    setWishlist(prev => prev.filter(item => item.id !== id));

    try {
      await api.delete(`/wishlist/${userProfile.id}/wishlist/${id}`, { auth: true });
      toast.success("Removed from wishlist");
    } catch (error) {
      // Revert on error
      setWishlist(previousWishlist);
      toast.error("Failed to remove from wishlist");
      console.error(error);
    }
  };

  return (
    <ProfileContext.Provider value={{
      wishlist,
      amcPlans,
      addToWishlist,
      removeFromWishlist,
      isLoading,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
