'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

interface BannerStatCardProps {
    // Changed from LucideIcon component to rendered ReactNode
    icon: React.ReactNode;
    value: string;
    label: string;
    delay?: number;
    animate?: boolean;
}

export const BannerStatCard: React.FC<BannerStatCardProps> = ({
    icon,
    value,
    label,
    delay = 0,
    animate = true
}) => {
    return (
        <motion.div
            initial={animate ? { opacity: 0, scale: 0.9 } : undefined}
            animate={animate ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-card p-6 hover:bg-white/15 transition-all duration-300"
        >
            <div className="w-12 h-12 bg-[#00C4CC] rounded-input flex items-center justify-center mx-auto mb-4">
                {/* Icon is now a rendered node, expect caller to handle sizing/colors if needed, 
                   but we can wrap it or expect generic SVG. 
                   Original code had: <Icon className="w-6 h-6 text-white" />
                   So Server Parent must apply these classes. */}
                {icon}
            </div>
            <div className="text-[36px] font-bold text-white mb-2 leading-[120%]">
                {value}
            </div>
            <div className="text-[14px] text-white/80 font-medium">
                {label}
            </div>
        </motion.div>
    );
};
