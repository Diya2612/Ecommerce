

export const productCatalog = [
    { id: 'P001', name: 'Professional Cricket Bat', sku: 'CB-PRO-001', price: 2999, stock: 45 },
    { id: 'P002', name: 'Cricket Ball Set (6 pcs)', sku: 'CB-BALL-006', price: 899, stock: 120 },
    { id: 'P003', name: 'Batting Gloves', sku: 'CG-BAT-001', price: 1299, stock: 67 },
    { id: 'P004', name: 'Cricket Helmet', sku: 'CH-PRO-001', price: 1899, stock: 34 },
    { id: 'P005', name: 'Leg Guards', sku: 'LG-PRO-001', price: 2499, stock: 28 },
    { id: 'P006', name: 'Badminton Racket Pro', sku: 'BR-PRO-001', price: 3599, stock: 56 },
    { id: 'P007', name: 'Shuttlecock Set (12 pcs)', sku: 'SC-SET-012', price: 599, stock: 200 },
    { id: 'P008', name: 'Football - Professional', sku: 'FB-PRO-005', price: 1999, stock: 89 },
    { id: 'P009', name: 'Tennis Racket Elite', sku: 'TR-ELT-001', price: 4999, stock: 23 },
    { id: 'P010', name: 'Gym Dumbbell Set', sku: 'GD-SET-20K', price: 6999, stock: 15 }
];

export const mockBundles: any[] = [
    {
        id: 'BDL-001',
        title: 'Cricket Starter Pack',
        type: 'Fixed Bundle',
        status: 'Active',
        priceType: 'Fixed Price',
        price: 4999,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalSales: 245,
        revenue: 1224755
    },
    {
        id: 'BDL-002',
        title: 'Badminton Pro Combo',
        type: 'Mix & Match',
        status: 'Active',
        priceType: 'Percentage Discount',
        price: 3599,
        discount: 15,
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        totalSales: 178,
        revenue: 640422
    },
    // ... more items can be added
];

export const bundleTypes = [
    { value: "Fixed Bundle", label: "Fixed Bundle" },
    { value: "Mix & Match", label: "Mix & Match" },
    { value: "Buy X Get Y", label: "Buy X Get Y" },
    { value: "Tiered Bundle", label: "Tiered Bundle" }
];
