/**
 * Category Selection Helpers
 * 
 * Generic utilities for working with hierarchical tier categories.
 * Replaces duplicated tier filtering logic across components.
 */

import type { Tier } from '@/features/tiers/types';

/**
 * Gets child categories for a given parent tier.
 * Generic function that works for any tier level.
 * 
 * @param hierarchy - The full tier hierarchy array
 * @param parentId - The ID of the parent tier (null for root level)
 * @param level - The tier level to filter (1, 2, 3, or 4)
 * @returns Array of tier categories at the specified level
 */
export const getChildCategories = (
    hierarchy: Tier[],
    parentId: string | null,
    level: number
): Tier[] => {
    if (!hierarchy || hierarchy.length === 0) {
        return [];
    }

    // For level 1 (root), just filter by level
    if (level === 1 || !parentId) {
        return hierarchy.filter(tier => tier.level === level);
    }

    // For other levels, filter by both level and parentId
    return hierarchy.filter(
        tier => tier.level === level && tier.parentId === parentId
    );
};

/**
 * Finds a tier by its ID in the hierarchy.
 * 
 * @param hierarchy - The full tier hierarchy array
 * @param tierId - The ID of the tier to find
 * @returns The tier object if found, undefined otherwise
 */
export const findTierById = (
    hierarchy: Tier[],
    tierId: string | null
): Tier | undefined => {
    if (!tierId || !hierarchy) {
        return undefined;
    }

    return hierarchy.find(tier => tier.id === tierId);
};

/**
 * Finds a tier by its name in the hierarchy (case-sensitive).
 * 
 * @param hierarchy - The full tier hierarchy array
 * @param tierName - The name of the tier to find
 * @returns The tier object if found, undefined otherwise
 */
export const findTierByName = (
    hierarchy: Tier[],
    tierName: string | null
): Tier | undefined => {
    if (!tierName || !hierarchy) {
        return undefined;
    }

    return hierarchy.find(tier => tier.name === tierName);
};

/**
 * Gets all children tiers for a given tier recursively.
 * Returns both direct children and nested children.
 * 
 * @param hierarchy - The full tier hierarchy array
 * @param parentId - The ID of the parent tier
 * @returns Flattened array of all descendant tiers
 */
export const getAllDescendants = (
    hierarchy: Tier[],
    parentId: string
): Tier[] => {
    if (!hierarchy || !parentId) {
        return [];
    }

    const directChildren = hierarchy.filter(tier => tier.parentId === parentId);

    const nestedChildren = directChildren.flatMap(child =>
        getAllDescendants(hierarchy, child.id)
    );

    return [...directChildren, ...nestedChildren];
};

/**
 * Validates if a tier selection path is valid.
 * Ensures each tier in the path is a valid child of the previous tier.
 * 
 * @param hierarchy - The full tier hierarchy array
 * @param tierIds - Array of tier IDs representing the selection path [tier1, tier2, tier3, tier4]
 * @returns true if the path is valid, false otherwise
 */
export const validateTierPath = (
    hierarchy: Tier[],
    tierIds: (string | null)[]
): boolean => {
    if (!hierarchy || tierIds.length === 0) {
        return false;
    }

    // Tier 1 must exist and have level 1
    const tier1 = tierIds[0] ? findTierById(hierarchy, tierIds[0]) : null;
    if (tierIds[0] && (!tier1 || tier1.level !== 1)) {
        return false;
    }

    // Validate tier 2 if present
    if (tierIds[1]) {
        const tier2 = findTierById(hierarchy, tierIds[1]);
        if (!tier2 || tier2.level !== 2 || tier2.parentId !== tierIds[0]) {
            return false;
        }
    }

    // Validate tier 3 if present
    if (tierIds[2]) {
        const tier3 = findTierById(hierarchy, tierIds[2]);
        if (!tier3 || tier3.level !== 3 || tier3.parentId !== tierIds[1]) {
            return false;
        }
    }

    // Validate tier 4 if present
    if (tierIds[3]) {
        const tier4 = findTierById(hierarchy, tierIds[3]);
        if (!tier4 || tier4.level !== 4 || tier4.parentId !== tierIds[2]) {
            return false;
        }
    }

    return true;
};
