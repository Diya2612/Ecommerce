export const typography = {
    badge: 'text-[12px] font-bold uppercase tracking-wider',
    sectionHeading: 'text-[36px] md:text-[48px] font-semibold tracking-[-0.01em] leading-[120%]',
    sectionDescription: 'text-[18px] leading-[150%]',
    productName: 'text-[22px] font-semibold',
    body: 'text-[16px] leading-[150%]',
    price: 'text-[18px] font-bold',
    priceOriginal: 'text-[14px] line-through',
    label: 'text-[16px] font-medium',
} as const;

export type Typography = typeof typography;
