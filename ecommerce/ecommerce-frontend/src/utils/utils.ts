import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a UUID v4 with fallback for non-secure contexts
 * 
 * crypto.randomUUID() requires a secure context (HTTPS or localhost).
 * When accessing the site via network IP over HTTP, we need a fallback.
 */
export function generateUUID(): string {
  // Try native crypto.randomUUID() first (secure contexts only)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (error) {
      // Fall through to fallback
      console.warn('crypto.randomUUID() failed, using fallback');
    }
  }

  // Fallback implementation for non-secure contexts
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
