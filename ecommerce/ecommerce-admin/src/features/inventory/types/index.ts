export type Location = {
    id: string;
    name: string;
    type: 'warehouse' | 'store';
};

export type InventoryState = 'Sellable' | 'Damaged' | 'Quarantined' | 'Expired';

export type AdjustmentReason =
    | 'Goods received'
    | 'Physical count correction'
    | 'Damaged'
    | 'Lost / Missing'
    | 'Expired'
    | 'Other';

export type QuickFilter = 'low-stock' | 'zero-available' | 'blocked' | 'recently-updated';

export type BlockedBreakdown = {
    damaged: number;
    quarantine: number;
    qualityHold: number;
};

export type InventoryItem = {
    id: string;
    productName: string;
    thumbnail: string;
    variant: string;
    sku: string;
    category: string;
    brand: string;
    incoming: number;
    incomingPO?: string;
    incomingETA?: string;
    committed: number;
    available: number;
    blocked: number;
    blockedBreakdown?: BlockedBreakdown;
    state: InventoryState;
    lastUpdated: string;
    lastUpdatedBy: string;
    location: string;
    type: 'Base' | 'Variant';
    updatedAt: string; // Raw ISO date for client-side filtering
};

export type HistoryEntry = {
    id: string;
    date: string;
    action: 'Received' | 'Adjusted' | 'Transferred' | 'Damaged' | 'Returned';
    quantityDelta: number;
    reason: string;
    location: string;
    fromLocation?: string;
    toLocation?: string;
    user: string;
    beforeQty: number;
    afterQty: number;
    poReference?: string;
    supplierName?: string;
};
