"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TabType } from '@/lib/data/profile/types';
import { ProfileContent } from './ProfileContent';

// Define the context
interface TabContextType {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function useTabContext() {
    const context = useContext(TabContext);
    if (!context) {
        throw new Error('useTabContext must be used within a ProfilePageClient');
    }
    return context;
}

interface ProfilePageClientProps {
    hero: ReactNode;
    ordersContent: ReactNode;
    addressesContent: ReactNode;
    wishlistContent: ReactNode;
    amcContent: ReactNode;
    accountContent: ReactNode;
    counts: {
        orders: number;
        addresses: number;
        wishlist: number;
        amc: number;
    };
}

export function ProfilePageClient({
    hero,
    ordersContent,
    addressesContent,
    wishlistContent,
    amcContent,
    accountContent,
    counts
}: ProfilePageClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>('orders');

    return (
        <TabContext.Provider value={{ activeTab, setActiveTab }}>
            {hero}
            <ProfileContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                counts={counts}
                ordersContent={ordersContent}
                addressesContent={addressesContent}
                wishlistContent={wishlistContent}
                amcContent={amcContent}
                accountContent={accountContent}
            />
        </TabContext.Provider>
    );
}
