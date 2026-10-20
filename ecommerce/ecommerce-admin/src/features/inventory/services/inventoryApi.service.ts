/**
 * Inventory API Service Layer
 * 
 * Service functions for making inventory API calls to the backend
 */

import { makeGetRequest, makeGetRequestWithParams, makePostRequest, makePutRequest } from '@/lib/api/baseApi';
import { API_ROUTES } from '@/lib/constants/api-routes';
import type {
    InventoryListResponse,
    InventoryItemResponse,
    InventoryHistoryResponse,
    InventoryApiItem,
    InventoryHistoryEntry,
    AdjustInventoryRequest,
    UpdateInventoryRequest,
    TransferRequest,
    ProductLocationStock,
    InventoryFilters,
} from './inventoryApi.types';

/**
 * Get all inventory items with optional filters
 */
export const getInventory = async (filters: InventoryFilters = {}): Promise<InventoryListResponse> => {
    const response = await makeGetRequestWithParams<InventoryListResponse>(
        API_ROUTES.INVENTORY.BASE,
        filters
    );
    return response.data;
};

/**
 * Get a single inventory item by ID
 */
export const getInventoryById = async (id: string): Promise<InventoryApiItem> => {
    const response = await makeGetRequest<InventoryItemResponse>(
        API_ROUTES.INVENTORY.BY_ID(id)
    );
    return response.data.data;
};

/**
 * Get inventory adjustment history for an item
 */
export const getInventoryHistory = async (id: string, limit = 50): Promise<InventoryHistoryEntry[]> => {
    const response = await makeGetRequestWithParams<InventoryHistoryResponse>(
        API_ROUTES.INVENTORY.HISTORY(id),
        { limit }
    );
    return response.data.data;
};

/**
 * Adjust inventory quantity (manual adjustment)
 */
export const adjustInventory = async (id: string, data: AdjustInventoryRequest) => {
    const response = await makePostRequest(
        API_ROUTES.INVENTORY.ADJUST(id),
        data
    );
    return response.data;
};

/**
 * Adjust variant inventory quantity
 * Phase 2A: DEPRECATED - Use adjustInventory with inventory record ID instead
 * To adjust variant inventory:
 * 1. Query inventory table to get inventory_id for the variant
 * 2. Use adjustInventory(inventory_id, data)
 */
// export const adjustVariantInventory = async (id: string, data: AdjustInventoryRequest) => {
//     const url = `inventory/variants/${id}/adjust`;
//     const response = await makePostRequest(url, data);
//     return response.data;
// };

/**
 * Update inventory metadata (condition, status, incoming stock)
 */
export const updateInventory = async (id: string, data: UpdateInventoryRequest) => {
    const response = await makePutRequest(
        API_ROUTES.INVENTORY.BY_ID(id),
        data
    );
    return response.data;
};

/**
 * Create a transfer between locations
 */
export const createTransfer = async (data: TransferRequest) => {
    const response = await makePostRequest(
        API_ROUTES.INVENTORY.TRANSFERS,
        data
    );
    return response.data;
};

/**
 * Execute a pending transfer
 */
export const executeTransfer = async (transferId: string) => {
    const response = await makePutRequest(
        API_ROUTES.INVENTORY.EXECUTE_TRANSFER(transferId),
        {}
    );
    return response.data;
};

/**
 * Get product stock across all locations
 */
export const getProductLocations = async (productId: string): Promise<ProductLocationStock> => {
    const response = await makeGetRequest<{ success: boolean; data: ProductLocationStock }>(
        API_ROUTES.INVENTORY.PRODUCT_LOCATIONS(productId)
    );
    return response.data.data;
};

// TODO: Bulk operations to be implemented when backend APIs are ready
// export const bulkReceiveInventory = async (data: any) => { ... };
// export const bulkAdjustInventory = async (data: any) => { ... };
// export const bulkTransferInventory = async (data: any) => { ... };
// export const bulkMarkDamaged = async (data: any) => { ... };
