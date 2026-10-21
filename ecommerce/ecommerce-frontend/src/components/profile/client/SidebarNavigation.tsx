"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
    ShoppingBag,
    MapPin,
    Heart,
    Settings,
    Award,
    ChevronRight,
    Bell,
} from 'lucide-react';

const ICONS = {
    orders: ShoppingBag,
    addresses: MapPin,
    wishlist: Heart,
    amc: Award,
    account: Settings,
    notifications: Bell,
};

export interface TabConfig {
    path: string;
    id: keyof typeof ICONS;
    label: string;
    description: string;
    color: string;
    bgColor: string;
}

interface SidebarNavigationProps {
    tabs: TabConfig[];
    counts: {
        orders: number;
        addresses: number;
        wishlist: number;
        amc: number;
        notifications: number;
    };
}

export function SidebarNavigation({ tabs, counts }: SidebarNavigationProps) {
    const pathname = usePathname();

    const getTabCount = (tabId: string) => {
        switch (tabId) {
            case 'orders': return counts.orders;
            case 'addresses': return counts.addresses;
            case 'wishlist': return counts.wishlist;
            case 'amc': return counts.amc;
            case 'notifications': return counts.notifications;
            default: return 0;
        }
    };

    const isTabActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

    return (
        <nav className="p-2">
            {tabs.map((tab, index) => {
                const count = getTabCount(tab.id);
                const isActive = isTabActive(tab.path);
                const Icon = ICONS[tab.id];

                return (
                    <Link
                        key={tab.id}
                        href={tab.path}
                        className="block"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group mb-1 ${isActive
                                ? 'bg-gradient-to-r from-[#0B1F51] to-[#1a3578] text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive
                                ? 'bg-white/20'
                                : tab.bgColor
                                }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : tab.color}`} />
                            </div>

                            {/* Label & Description */}
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                    {tab.label}
                                </p>
                                <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'} hidden lg:block`}>
                                    {tab.description}
                                </p>
                            </div>

                            {/* Count Badge or Chevron */}
                            {count > 0 ? (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive
                                    ? 'bg-[#00C4CC] text-white'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {count}
                                </span>
                            ) : (
                                <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white' : 'text-gray-400'
                                    }`} />
                            )}
                        </motion.div>
                    </Link>
                );
            })}
        </nav>
    );
}

