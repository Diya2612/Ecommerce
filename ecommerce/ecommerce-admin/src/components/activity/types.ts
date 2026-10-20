export interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    amount: string | null;
    timestamp: string;
    category: "order" | "payment" | "account" | "cart" | "wishlist";
    icon?: any;
    iconColor?: string;

    raw_timestamp?: string; // ISO timestamp
    metadata?: {
        changes?: Array<{ field: string, label: string, oldVal: string | null, newVal: string | null }>;
        performer?: string;
        [key: string]: any;
    };
}

export interface ActivityTimelineListProps {
    activities: ActivityItem[];
    isLoading?: boolean;
    emptyMessage?: string;
    verticalLineLeftOffset?: string;
}
