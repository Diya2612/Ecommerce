'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

interface BannerFeaturePillProps {
    // Changed from LucideIcon component to rendered ReactNode to allow server-side rendering of the icon
    icon: React.ReactNode;
    text: string;
    animationProps?: any;
}

export const BannerFeaturePill: React.FC<BannerFeaturePillProps> = ({ icon, text, animationProps }) => {
    return (
        <motion.div
            {...animationProps}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-input px-5 py-3 shadow-xs"
        >
            <div className="w-5 h-5 text-[#00C4CC] shrink-0 flex items-center justify-center">
                {icon}
            </div>
            <span className="text-[15px] font-semibold text-white tracking-wide whitespace-nowrap">
                {text}
            </span>
        </motion.div>
    );
};
