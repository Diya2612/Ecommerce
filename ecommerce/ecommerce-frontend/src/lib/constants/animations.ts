import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
};

export const scaleOnHover = {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
};

export const subtleScaleOnHover = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.98 },
};

export const floatingAnimation = {
    animate: { y: [0, -10, 0] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

export const floatingAnimationAlt = {
    animate: { y: [0, 10, 0] },
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 },
};

export const carouselTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
};

export const defaultTransition = {
    duration: 0.6,
};

export const staggerChildren = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};
