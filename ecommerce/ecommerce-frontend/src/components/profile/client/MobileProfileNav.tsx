"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    ShoppingBag,
    MapPin,
    Heart,
    Award,
    Settings,
    LucideIcon
} from 'lucide-react';

interface NavItem {
    path: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
}

interface MobileProfileNavProps {
    counts: {
        orders: number;
        addresses: number;
        wishlist: number;
        amc: number;
    };
}

const NAV_ITEMS: NavItem[] = [
    { path: '/profile/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/profile/addresses', label: 'Address', icon: MapPin },
    /*
    { path: '/profile/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/profile/amc', label: 'AMC', icon: Award },
    */
    { path: '/profile/account', label: 'Account', icon: Settings },
];

export function MobileProfileNav({ counts }: MobileProfileNavProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(`${path}/`);
    };

    const getBadge = (path: string): number | undefined => {
        switch (path) {
            case '/profile/orders':
                return counts.orders > 0 ? counts.orders : undefined;
            case '/profile/wishlist':
                return counts.wishlist > 0 ? counts.wishlist : undefined;
            case '/profile/amc':
                return counts.amc > 0 ? counts.amc : undefined;
            default:
                return undefined;
        }
    };

    // Haptic feedback (if supported)
    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
            style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="flex items-center justify-around h-16 px-2">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    const badge = getBadge(item.path);

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={triggerHaptic}
                            className="relative flex flex-col items-center justify-center flex-1 h-full py-2 group"
                        >
                            {/* Active Pill Background */}
                            <AnimatePresence>
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30
                                        }}
                                        className="absolute inset-x-2 top-1 bottom-1 bg-linear-to-r from-[#0B1F51] to-[#1a3578] rounded-2xl"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Icon Container */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="relative">
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <Icon
                                            className={`w-5 h-5 transition-colors duration-200 ${active
                                                ? 'text-white'
                                                : 'text-gray-500 dark:text-gray-400 group-hover:text-[#0B1F51] dark:group-hover:text-white'
                                                }`}
                                        />
                                    </motion.div>

                                    {/* Badge */}
                                    {badge && badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 ${active
                                                ? 'bg-[#00C4CC] text-white'
                                                : 'bg-red-500 text-white'
                                                }`}
                                        >
                                            {badge > 99 ? '99+' : badge}
                                        </motion.span>
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`mt-1 text-[10px] font-medium transition-colors duration-200 ${active
                                        ? 'text-white'
                                        : 'text-gray-500 dark:text-gray-400 group-hover:text-[#0B1F51] dark:group-hover:text-white'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </div>

                            {/* Touch Ripple Effect */}
                            <motion.div
                                className="absolute inset-0 bg-gray-200/50 dark:bg-white/10 rounded-2xl opacity-0 pointer-events-none"
                                whileTap={{ opacity: 1 }}
                                transition={{ duration: 0.15 }}
                            />
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
