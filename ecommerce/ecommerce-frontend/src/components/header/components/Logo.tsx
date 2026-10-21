"use client";

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import type { LogoProps } from '../types';

const logoDarkText = '/assets/ANANT_ENTERPRISES-03.png';
const logoLightText = '/assets/Untitled-1-02.png';

export function Logo({ isExpanded = false, className = "" }: LogoProps) {
    return (
        <motion.div
            layout
            className={className}
        >
            <Link href="/" className="flex items-center shrink-0 cursor-pointer py-1">
                <Image
                    src={logoDarkText}
                    alt="Anant Enterprises"
                    width={160}
                    height={40}
                    className="block dark:hidden h-8 md:h-10 w-auto object-contain transition-all duration-300"
                />
                <Image
                    src={logoLightText}
                    alt="Anant Enterprises"
                    width={160}
                    height={40}
                    className="hidden dark:block h-8 md:h-10 w-auto object-contain transition-all duration-300"
                />
            </Link>
        </motion.div>
    );
}
