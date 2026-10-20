export interface Bundle {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: 'Active' | 'Draft' | 'Inactive';
    priceType: 'Fixed Price' | 'Percentage Discount';
    price: number;
    discount?: number;
    startDate: string;
    endDate: string;
    totalSales: number;
    revenue: number;
    image?: string; // URL or placeholder
    tags?: string[];
    adminComment?: string;
}

export interface BundleItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    isOptional: boolean;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    stock: number;
    price: number;
}

export interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    trend?: string;
}
