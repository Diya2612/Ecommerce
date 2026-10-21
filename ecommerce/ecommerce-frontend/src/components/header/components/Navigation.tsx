"use client";

import { motion } from 'motion/react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/utils';
import type { NavigationProps } from '../types';

export function Navigation({ navItems, pathname, className = "" }: NavigationProps) {
    return (
        <motion.nav
            className={cn("hidden lg:flex items-center gap-4 xl:gap-8", className)}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
        >
            {navItems.map((item) => (
                item.href.startsWith('/') ? (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "text-[#1C2A54] dark:text-gray-200 font-medium text-sm xl:text-[15px] tracking-wide hover:text-[#31CDD4] dark:hover:text-[#31CDD4] transition-colors flex items-center gap-1 group py-2",
                            pathname === item.href && "text-[#31CDD4] dark:text-[#31CDD4]"
                        )}
                    >
                        {item.name}
                        {item.hasDropdown && (
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#31CDD4] group-hover:rotate-180 transition-all duration-300" />
                        )}
                    </Link>
                ) : (
                    <a
                        key={item.name}
                        href={item.href}
                        className="text-[#1C2A54] dark:text-gray-200 font-medium text-sm xl:text-[15px] tracking-wide hover:text-[#31CDD4] dark:hover:text-[#31CDD4] transition-colors flex items-center gap-1 group py-2"
                    >
                        {item.name}
                        {item.hasDropdown && (
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#31CDD4] group-hover:rotate-180 transition-all duration-300" />
                        )}
                    </a>
                )
            ))}
        </motion.nav>
    );
}

