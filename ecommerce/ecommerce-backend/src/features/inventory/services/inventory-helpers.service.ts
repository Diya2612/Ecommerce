/**
 * Inventory Helpers
 * Pure utility functions for ID validation and status mapping.
 */

import { findFirstAdminUser } from '../shared/queries';

let cachedSystemUserId: string | null = null;

/** Validates if a string is a properly formatted UUID. */
export function isValidUUID(str: string | null | undefined): str is string {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Resolves a valid user ID for audit trails.
 * Falls back to first available user if provided ID is invalid.
 */
export async function resolveValidUserId(
  userId: string | null | undefined,
): Promise<string | null> {
  if (isValidUUID(userId)) return userId;
  if (cachedSystemUserId) return cachedSystemUserId;

  try {
    const fallbackUser = await findFirstAdminUser();

    if (fallbackUser?.id) {
      cachedSystemUserId = fallbackUser.id;
      return cachedSystemUserId;
    }
  } catch {
    // Fail silently
  }

  return null;
}

/** Maps inventory quantities to status enums. */
export function getStatusFromQuantity(quantity: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= 10) return 'low_stock';
  return 'in_stock';
}
