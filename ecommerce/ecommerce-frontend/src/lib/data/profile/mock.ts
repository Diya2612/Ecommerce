import { WishlistItem, AMCPlan } from './types';

export const MOCK_WISHLIST: WishlistItem[] = [
    {
        id: 'mock-wishlist-1',
        name: "Anant Pure X1 Pro",
        price: 12999,
        originalPrice: 15999,
        rating: 4.8,
        reviews: 128,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
        inStock: true
    },
    {
        id: 'mock-wishlist-2',
        name: "Filter Replacement Kit",
        price: 1299,
        originalPrice: 1999,
        rating: 4.9,
        reviews: 85,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
        inStock: true
    },
    {
        id: 'mock-wishlist-3',
        name: "Copper Boost Bottle",
        price: 999,
        originalPrice: 1499,
        rating: 4.5,
        reviews: 42,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
        inStock: false
    }
];

export const MOCK_AMC_PLANS: AMCPlan[] = [
    {
        id: 'AMC-2024-001',
        planName: 'Premium Annual Care',
        productName: 'Anant Pure X1 Pro',
        status: 'active',
        startDate: 'Jan 15, 2024',
        endDate: 'Jan 14, 2025',
        servicesRemaining: 3,
        totalServices: 4,
        nextServiceDate: 'Jan 5, 2025',
        lastServiceDate: 'Oct 10, 2024',
        price: 2499
    },
    {
        id: 'AMC-2024-002',
        planName: 'Standard Annual Care',
        productName: 'Anant Aqua Classic',
        status: 'active',
        startDate: 'Mar 20, 2024',
        endDate: 'Mar 19, 2025',
        servicesRemaining: 2,
        totalServices: 3,
        nextServiceDate: 'Jan 15, 2025',
        lastServiceDate: 'Sep 18, 2024',
        price: 1999
    }
];
