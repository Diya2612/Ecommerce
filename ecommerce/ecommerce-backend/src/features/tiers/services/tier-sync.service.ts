import { sql, inArray } from 'drizzle-orm';
import { db } from '../../../database';
import { tiers } from '../shared/tiers.schema';
import { tierCacheService } from './tier-cache.service';

/**
 * Tiers Sync Service
 */
export async function incrementTierUsage(tierIds: (string | null)[]): Promise<void> {
  const validTierIds = [
    ...new Set(tierIds.filter((id): id is string => id !== null && id !== undefined)),
  ];
  if (validTierIds.length === 0) return;

  await db
    .update(tiers)
    .set({
      usage_count: sql`${tiers.usage_count} + 1`,
      updated_at: new Date(),
    })
    .where(inArray(tiers.id, validTierIds));

  for (const id of validTierIds) {
    await tierCacheService.invalidateTier(id);
  }
}

export async function decrementTierUsage(tierIds: (string | null)[]): Promise<void> {
  const validTierIds = [
    ...new Set(tierIds.filter((id): id is string => id !== null && id !== undefined)),
  ];
  if (validTierIds.length === 0) return;

  await db
    .update(tiers)
    .set({
      usage_count: sql`GREATEST(0, ${tiers.usage_count} - 1)`,
      updated_at: new Date(),
    })
    .where(inArray(tiers.id, validTierIds));

  for (const id of validTierIds) {
    await tierCacheService.invalidateTier(id);
  }
}

export async function updateTierUsage(
  oldTiers: (string | null)[] = [null, null, null, null],
  newTiers: (string | null)[] = [null, null, null, null],
): Promise<void> {
  const oldTierIds = [...oldTiers];
  const newTierIds = [...newTiers];
  while (oldTierIds.length < 4) oldTierIds.push(null);
  while (newTierIds.length < 4) newTierIds.push(null);

  const addedTiers: string[] = [];
  const removedTiers: string[] = [];

  for (let i = 0; i < 4; i++) {
    const oldTier = oldTierIds[i];
    const newTier = newTierIds[i];
    if (!oldTier && newTier) {
      addedTiers.push(newTier);
    } else if (oldTier && !newTier) {
      removedTiers.push(oldTier);
    } else if (oldTier && newTier && oldTier !== newTier) {
      removedTiers.push(oldTier);
      addedTiers.push(newTier);
    }
  }

  if (addedTiers.length > 0) await incrementTierUsage(addedTiers);
  if (removedTiers.length > 0) await decrementTierUsage(removedTiers);
}
