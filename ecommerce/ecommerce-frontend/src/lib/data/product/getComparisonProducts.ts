import { ComparisonProduct } from '@/types/home';

const MOCK_COMPARISON_PRODUCTS: ComparisonProduct[] = [
    {
        id: 'p1',
        name: 'Eco Pure Basic',
        image: '/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png',
        price: 8999,
        rating: 4.2,
        category: 'RO',
        description: 'Basic RO + UV purifier suitable for municipal water.',
        specs: {
            technology: 'RO + UV',
            storage: '7 Liters',
            stages: '5 Stage',
            mineral: false,
            display: false,
            power: '30 Watts',
            warranty: '1 Year',
            dimensions: '350 x 280 x 450 mm',
            certification: 'ISI',
        }
    },
    {
        id: 'p2',
        name: 'AquaGuard Pro',
        image: '/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png',
        price: 15499,
        rating: 4.8,
        category: 'RO + UV',
        bestValue: true,
        highlight: 'Most Popular',
        description: 'Advanced protection with MTDS for sweet tasting water.',
        specs: {
            technology: 'RO + UV + UF + MTDS',
            storage: '10 Liters',
            stages: '7 Stage',
            mineral: true,
            display: true,
            power: '45 Watts',
            warranty: '2 Years',
            dimensions: '380 x 300 x 500 mm',
            certification: 'NSF / ISI',
        }
    },
    {
        id: 'p3',
        name: 'Smart Mineral',
        image: '/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png',
        price: 18999,
        rating: 4.6,
        category: 'Alkaline',
        description: 'Alkaline water purifier for health conscious families.',
        specs: {
            technology: 'RO + Alkaline',
            storage: '12 Liters',
            stages: '8 Stage',
            mineral: true,
            display: true,
            power: '50 Watts',
            warranty: '1 Year',
            dimensions: '400 x 320 x 520 mm',
            certification: 'WQA Gold',
        }
    },
    {
        id: 'p4',
        name: 'Ultra Max 500',
        image: '/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png',
        price: 22499,
        rating: 4.9,
        category: 'UV',
        highlight: 'Premium',
        description: 'High capacity UV + UF purifier with Copper technology.',
        specs: {
            technology: 'UV + UF + Copper',
            storage: '8 Liters',
            stages: '6 Stage',
            mineral: true,
            display: true,
            power: '35 Watts',
            warranty: '3 Years',
            dimensions: '360 x 290 x 480 mm',
            certification: 'ISI',
        }
    },
    {
        id: 'p5',
        name: 'Pure Life Elite',
        image: '/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png',
        price: 12999,
        rating: 4.4,
        category: 'RO',
        description: 'Reliable RO purification at an affordable price.',
        specs: {
            technology: 'RO + MF',
            storage: '9 Liters',
            stages: '6 Stage',
            mineral: false,
            display: true,
            power: '40 Watts',
            warranty: '1.5 Years',
            dimensions: '370 x 280 x 460 mm',
            certification: 'ISI',
        }
    }
];

export const getComparisonProducts = async (): Promise<ComparisonProduct[]> => {
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_COMPARISON_PRODUCTS;
};
