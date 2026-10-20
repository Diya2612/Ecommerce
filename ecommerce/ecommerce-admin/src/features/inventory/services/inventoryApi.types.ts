/**
 * Inventory API Type Definitions
 * 
 * TypeScript types matching backend inventory API responses
 */

// Backend API inventory item structure
export interface InventoryApiItem {
    id: string;
    product_id: string;
    location_id: string;
    product_name: string;
    sku: string;
    available_quantity: number;
    reserved_quantity: number;
    incoming_quantity: number;
    incoming_po_reference?: string;
    incoming_eta?: string;
    condition: 'sellable' | 'damaged' | 'quarantined' | 'expired';
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    created_at: string;
    updated_at: string;
    type?: 'Base' | 'Variant'; // Optional to maintain compatibility if missing
    thumbnail?: string; // Mapped from primary_image_url or thumbnail_url
}

// Paginated inventory list response (matches ResponseFormatter.paginated format)
export interface InventoryListResponse {
    success: boolean;
    data: InventoryApiItem[];  // Array directly, not nested under 'inventory'
    message: string;
    meta: {
        timestamp: string;
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    };
}

// Single inventory item response
export interface InventoryItemResponse {
    success: boolean;
    data: InventoryApiItem;
    message: string;
}

// Inventory history entry
export interface InventoryHistoryEntry {
    id: string;
    adjustment_type: 'manual' | 'order_fulfillment' | 'order_cancellation' | 'transfer_in' | 'transfer_out';
    quantity_change: number;
    before_quantity: number;
    after_quantity: number;
    reason: string;
    reference_type?: string;
    reference_id?: string;
    created_at: string;
    created_by: string;
}

// Inventory history response
export interface InventoryHistoryResponse {
    success: boolean;
    data: InventoryHistoryEntry[];
    message: string;
}

// Adjust inventory request
export interface AdjustInventoryRequest {
    quantity_change: number;
    reason: string;
    reference_number?: string;
    notes?: string;
}

// Update inventory request
export interface UpdateInventoryRequest {
    condition?: 'sellable' | 'damaged' | 'quarantined' | 'expired';
    status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    incoming_quantity?: number;
    incoming_po_reference?: string;
    incoming_eta?: string;
}

// Transfer request
export interface TransferRequest {
    product_id: string;
    from_location_id: string;
    to_location_id: string;
    quantity: number;
    reason?: 'rebalancing' | 'customer_order' | 'return' | 'manual' | 'damaged';
    notes?: string;
}

// Product location stock
export interface ProductLocationStock {
    product_id: string;
    total_available: number;
    total_reserved: number;
    location_count: number;
    locations: Array<{
        location_id: string;
        location_name: string;
        location_code: string;
        available_quantity: number;
        reserved_quantity: number;
        status: 'in_stock' | 'low_stock' | 'out_of_stock';
        is_active: boolean;
    }>;
}

// Inventory query filters
export interface InventoryFilters {
    page?: number;
    limit?: number;
    search?: string;
    condition?: 'sellable' | 'damaged' | 'quarantined' | 'expired';
    status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    location?: string;
    category?: string;
    quickFilter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    _rid?: string; // Request ID for debugging
}
