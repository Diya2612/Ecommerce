import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * 
 * Combines multiple class values and resolves Tailwind CSS conflicts.
 * This is the primary utility for conditional styling in the app.
 * 
 * @param inputs - Class values to merge
 * @returns Merged className string
 * 
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'text-white')
 * // Returns: 'px-2 py-1 bg-blue-500 text-white' (if isActive is true)
 * 
 * @example
 * // Resolves Tailwind conflicts (last one wins)
 * cn('px-2', 'px-4')
 * // Returns: 'px-4'
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
