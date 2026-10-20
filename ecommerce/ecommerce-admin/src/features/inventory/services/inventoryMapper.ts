/**
 * Inventory Data Mapper
 * 
 * Maps backend API responses to admin panel data format
 */

import type { InventoryApiItem, InventoryHistoryEntry } from './inventoryApi.types';
import type { InventoryItem, HistoryEntry, InventoryState } from '../types';

/**
 * Maps backend API inventory item to admin panel format
 */
export const mapApiToInventoryItem = (apiItem: InventoryApiItem): InventoryItem => {
    return {
        id: apiItem.id,
        productName: apiItem.product_name,
        thumbnail: apiItem.thumbnail || '',
        variant: '', // TODO: Need to fetch from products API
        sku: apiItem.sku,
        category: '', // TODO: Need to fetch from products API
        brand: '', // TODO: Need to fetch from products API
        incoming: apiItem.incoming_quantity,
        incomingPO: apiItem.incoming_po_reference,
        incomingETA: apiItem.incoming_eta ? formatDate(apiItem.incoming_eta) : undefined,
        committed: apiItem.reserved_quantity,
        available: apiItem.available_quantity,
        blocked: 0, // TODO: Backend doesn't track blocked quantity separately
        blockedBreakdown: {
            damaged: apiItem.condition === 'damaged' ? apiItem.available_quantity : 0,
            quarantine: apiItem.condition === 'quarantined' ? apiItem.available_quantity : 0,
            qualityHold: 0,
        },
        state: mapConditionToState(apiItem.condition),
        lastUpdated: formatDateTime(apiItem.updated_at),
        lastUpdatedBy: 'System', // TODO: Backend doesn't return user info yet
        location: apiItem.location_id, // TODO: Need to fetch location name from location_id
        type: apiItem.type === 'Variant' ? 'Variant' : 'Base', // Map API type
        updatedAt: apiItem.updated_at,
    };
};

/**
 * Maps backend history entry to admin panel format
 */
export const mapApiToHistoryEntry = (apiEntry: InventoryHistoryEntry): HistoryEntry => {
    return {
        id: apiEntry.id,
        date: formatDateTime(apiEntry.created_at),
        action: mapAdjustmentTypeToAction(apiEntry.adjustment_type),
        quantityDelta: apiEntry.quantity_change,
        reason: apiEntry.reason,
        location: '', // TODO: Need location info from backend
        user: apiEntry.created_by, // TODO: Map user ID to user name
        beforeQty: apiEntry.before_quantity,
        afterQty: apiEntry.after_quantity,
        poReference: apiEntry.reference_type === 'purchase_order' ? apiEntry.reference_id : undefined,
    };
};

/**
 * Helper: Map backend condition to admin state
 */
const mapConditionToState = (condition: string): InventoryState => {
    const mapping: Record<string, InventoryState> = {
        sellable: 'Sellable',
        damaged: 'Damaged',
        quarantined: 'Quarantined',
        expired: 'Expired',
    };
    return mapping[condition] || 'Sellable';
};

/**
 * Helper: Map adjustment type to admin action
 */
const mapAdjustmentTypeToAction = (type: string): 'Received' | 'Adjusted' | 'Transferred' | 'Damaged' | 'Returned' => {
    const mapping: Record<string, 'Received' | 'Adjusted' | 'Transferred' | 'Damaged' | 'Returned'> = {
        manual: 'Adjusted',
        transfer_in: 'Transferred',
        transfer_out: 'Transferred',
        order_fulfillment: 'Adjusted',
        order_cancellation: 'Returned',
    };
    return mapping[type] || 'Adjusted';
};

/**
 * Helper: Format date to short format (e.g., "Jan 12")
 */
const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Helper: Format date-time to full format
 */
const formatDateTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
