"use client";

import { motion } from 'motion/react';
import {
    ShoppingBag,
    MapPin,
    Heart,
    Award,
    Settings,
    LucideIcon
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
    ShoppingBag,
    MapPin,
    Heart,
    Award,
    Settings,
};

interface PageContainerProps {
    children: React.ReactNode;
    title: string;
    description: string;
    iconName: string;
    color: string;
    bgColor: string;
}

export function PageContainer({
    children,
    title,
    description,
    iconName,
    color,
    bgColor
}: PageContainerProps) {
    const Icon = ICONS[iconName] || ShoppingBag;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-xl lg:rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
        >
            {/* Tab Header - Compact on mobile, full on desktop */}
            <div className="px-4 py-3 lg:px-6 lg:py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm lg:static">
                <div className="flex items-center gap-2.5 lg:gap-3">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 ${bgColor} rounded-lg lg:rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${color}`} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                            {title}
                        </h2>
                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Content - Less padding on mobile */}
            <div className="p-3 sm:p-4 lg:p-6">
                {children}
            </div>
        </motion.div>
    );
}

