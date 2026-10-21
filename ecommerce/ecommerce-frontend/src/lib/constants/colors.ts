export const colors = {
    brand: {
        navy: '#0B1F51',           // Primary brand color (50+ occurrences)
        teal: '#00C4CC',           // Accent color (40+ occurrences)
        gold: '#F5B012',           // Star ratings, highlights (15+ occurrences)
    },
    text: {
        primary: '#0B1F51',        // Headings, prices
        secondary: '#6B7280',      // Gray-600, body text
        accent: '#00C4CC',         // Links, badges
    },
    background: {
        white: '#FFFFFF',
        lightGray: '#F9FAFB',
        darkNavy: '#0B1F51',
        darkTeal: '#00C4CC',
    },
    border: {
        default: 'rgba(0, 0, 0, 0.06)',
        focus: '#00C4CC',
        light: 'rgba(0, 196, 204, 0.3)',
    },
    overlay: {
        white10: 'rgba(255, 255, 255, 0.1)',
        white20: 'rgba(255, 255, 255, 0.2)',
    }
} as const;

export type Colors = typeof colors;
