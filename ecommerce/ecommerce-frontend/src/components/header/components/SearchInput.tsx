"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import type { SearchInputProps } from '../types';

export function SearchInput({
    value,
    onChange,
    onKeyDown,
    placeholder = "Search for products, parts, services...",
    autoFocus = true,
}: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (autoFocus) {
            // Small delay to ensure animation has started
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [autoFocus]);

    return (
        <motion.div
            className="relative w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
            <div className="relative flex items-center">
                <Search className="absolute left-0 w-6 h-6 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 text-xl md:text-2xl font-light tracking-wide bg-transparent border-none outline-hidden text-[#1C2A54] dark:text-white placeholder:text-gray-400"
                />
            </div>

            {/* Animated Underline */}
            <div className="relative h-[2px] bg-gray-200 dark:bg-gray-700 mt-2">
                <motion.div
                    className="absolute left-1/2 h-full bg-linear-to-r from-[#31CDD4] to-[#1C2A54]"
                    initial={{ width: "0%", x: "-50%" }}
                    animate={{
                        width: isFocused ? "100%" : value ? "60%" : "40%",
                        x: "-50%"
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>
        </motion.div>
    );
}
