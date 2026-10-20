/**
 * Inventory Reasons Constants
 * Constants for adjustment reasons and damage reasons
 */

import type { AdjustmentReason } from '../types';

/**
 * Adjustment reasons for inventory modifications
 */
export const ADJUSTMENT_REASONS: AdjustmentReason[] = [
    'Goods received',
    'Physical count correction',
    'Damaged',
    'Lost / Missing',
    'Expired',
    'Other',
] as const;

/**
 * Damage reasons for marking items as damaged
 */
export const DAMAGE_REASONS = [
    "Physical damage",
    "Water damage",
    "Expired",
    "Quality issue",
    "Other"
] as const;

export type DamageReason = typeof DAMAGE_REASONS[number];