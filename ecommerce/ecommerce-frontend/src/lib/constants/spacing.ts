export const spacing = {
    section: {
        paddingY: 'py-24',
        paddingX: 'px-4 md:px-6',
    },
    container: 'container mx-auto',
    card: {
        padding: 'p-6',
        gap: 'gap-6',
    },
    grid: {
        productGrid: 'grid-cols-2 lg:grid-cols-4 gap-8',
        formGrid: 'grid md:grid-cols-2 gap-6',
    },
} as const;

export type Spacing = typeof spacing;
