"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useTierHierarchy } from '@/lib/hooks/useTiers';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import type { MobileMenuProps } from '../types';

const logoDarkText = '/assets/10d9e162195ae525bf94f3d12e99419e24d10bb6.png';
const logoLightText = '/assets/937cb708e8b193c60b6be8546d5017b2b875e939.png';

export function MobileMenu({
    navItems,
    pathname,
    isOpen,
    onOpenChange,
    cartItemCount,
    onCartClick,
    onProfileClick,
    onContactClick,
}: MobileMenuProps) {
    const handleLinkClick = () => {
        onOpenChange(false);
    };

    return (
        <div className="w-full bg-transparent pt-6 pb-8 px-6 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col gap-6 items-start">
                {navItems.filter(item => !['Services', 'About'].includes(item.name)).map((item) => (
                    <div key={item.name} className="w-full text-left group">
                        {item.name === 'Collection' && item.hasDropdown ? (
                            <MobileCategoryAccordion
                                item={item}
                                pathname={pathname}
                                onLinkClick={handleLinkClick}
                            />
                        ) : (
                            item.href.startsWith('/') ? (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "block text-2xl font-semibold text-[#1C2A54] dark:text-white hover:text-[#31CDD4] transition-colors",
                                        pathname === item.href && "text-[#31CDD4]"
                                    )}
                                    onClick={handleLinkClick}
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <a
                                    href={item.href}
                                    className="block text-2xl font-semibold text-[#1C2A54] dark:text-white hover:text-[#31CDD4] transition-colors"
                                >
                                    {item.name}
                                </a>
                            )
                        )}
                    </div>
                ))}

                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2" />

                <div className="flex flex-col gap-6 w-full">
                    <Button
                        className="w-full bg-linear-to-r from-[#1C2A54] to-[#31CDD4] text-white rounded-xl h-14 text-lg font-bold shadow-lg"
                        onClick={() => {
                            onContactClick();
                            onOpenChange(false);
                        }}
                    >
                        Book Now
                    </Button>
                    <div className="flex justify-start gap-6 text-[#1C2A54] dark:text-white px-2">
                        <button
                            onClick={() => {
                                onProfileClick();
                                onOpenChange(false);
                            }}
                            aria-label="My profile"
                            className="flex items-center gap-3 text-lg font-medium hover:text-[#31CDD4] transition-colors"
                        >
                            <User className="w-6 h-6" />
                            <span>Profile</span>
                        </button>
                        <button
                            className="relative flex items-center gap-3 text-lg font-medium hover:text-[#31CDD4] transition-colors"
                            onClick={() => {
                                onCartClick();
                                onOpenChange(false);
                            }}
                            aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`}
                        >
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-[#31CDD4] text-white text-[11px] font-bold rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center px-1" aria-hidden="true">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                            <span>Cart</span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}

function MobileCategoryAccordion({ item, pathname, onLinkClick }: { item: any, pathname: string, onLinkClick: () => void }) {
    const [isOpen, setIsOpen] = useState(true);
    const { data: tiers } = useTierHierarchy();

    return (
        <div className="flex flex-col items-start w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full text-2xl font-semibold text-[#1C2A54] dark:text-white hover:text-[#31CDD4] transition-colors group",
                    pathname.startsWith(item.href) && "text-[#31CDD4]"
                )}
            >
                {item.name}
                {isOpen ? <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-[#31CDD4]" /> : <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-[#31CDD4]" />}
            </button>

            {isOpen && tiers && (
                <div className="flex flex-col gap-3 w-full pl-4 mt-4 border-l-2 border-gray-100 dark:border-gray-800 ml-1">
                    <Link
                        href="/collections"
                        className="text-lg font-medium text-[#1C2A54] dark:text-white hover:text-[#31CDD4] py-1 text-left"
                        onClick={onLinkClick}
                    >
                        All Products
                    </Link>
                    {tiers.map(tier => (
                        <div key={tier.id} className="flex flex-col items-start w-full">
                            <Link
                                href={`/collections?categories=${tier.code}`}
                                className="text-lg text-gray-600 dark:text-gray-300 hover:text-[#31CDD4] py-1 text-left w-full"
                                onClick={onLinkClick}
                            >
                                {tier.name}
                            </Link>
                        </div>
                    ))}
                    <Link
                        href="/categories"
                        className="text-sm font-bold text-[#31CDD4] uppercase tracking-wider mt-2 py-1 text-left"
                        onClick={onLinkClick}
                    >
                        View All Categories
                    </Link>
                </div>
            )}
        </div>
    );
}
