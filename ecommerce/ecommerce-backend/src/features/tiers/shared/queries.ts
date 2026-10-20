import { eq, and, inArray, asc, count } from 'drizzle-orm';
import { db } from '../../../database';
import { tiers, Tier } from './tiers.schema';
import { tierCacheService } from '../services/tier-cache.service';
import { ITiersDatabase, INewTier } from './interface';

/**
 * Tier Queries
 */

export const findTierById = async (
  id: string,
  tx: ITiersDatabase = db,
): Promise<Tier | undefined> => {
  if (tx !== db) {
    const [tier] = await tx
      .select()
      .from(tiers)
      .where(and(eq(tiers.id, id), eq(tiers.is_deleted, false)))
      .limit(1);
    return tier;
  }
  return tierCacheService.getTierById(id);
};

export const findTierByCode = async (
  code: string,
  tx: ITiersDatabase = db,
): Promise<Tier | undefined> => {
  if (tx !== db) {
    const [tier] = await tx
      .select()
      .from(tiers)
      .where(and(eq(tiers.code, code), eq(tiers.is_deleted, false)))
      .limit(1);
    return tier;
  }
  return tierCacheService.getTierByCode(code);
};

export const isTierCodeTaken = async (
  code: string,
  excludeId?: string,
  tx: ITiersDatabase = db,
): Promise<boolean> => {
  const conditions = [eq(tiers.code, code), eq(tiers.is_deleted, false)];
  const result = await tx
    .select({ id: tiers.id })
    .from(tiers)
    .where(and(...conditions))
    .limit(1);

  if (result.length === 0) return false;
  if (excludeId && result[0].id === excludeId) return false;
  return true;
};

export const baseFetchTiers = async (
  conditions: any[],
  orderBy: any[] = [asc(tiers.level), asc(tiers.priority), asc(tiers.name)],
  limit?: number,
  offset?: number,
  tx: ITiersDatabase = db,
): Promise<Tier[]> => {
  const query = tx
    .select()
    .from(tiers)
    .where(and(...conditions))
    .orderBy(...orderBy)
    .$dynamic();

  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);
  return query;
};

export const baseCountTiers = async (
  conditions: any[],
  tx: ITiersDatabase = db,
): Promise<number> => {
  const [result] = await tx
    .select({ value: count() })
    .from(tiers)
    .where(and(...conditions));
  return result.value || 0;
};

export const getActiveParentTier = async (
  parentId: string,
  tx: ITiersDatabase = db,
): Promise<Tier | undefined> => {
  const [parent] = await tx
    .select()
    .from(tiers)
    .where(and(eq(tiers.id, parentId), eq(tiers.status, 'active'), eq(tiers.is_deleted, false)))
    .limit(1);
  return parent;
};

export const baseFetchTiersByIds = async (
  ids: string[],
  tx: ITiersDatabase = db,
): Promise<Tier[]> => {
  if (ids.length === 0) return [];
  return tx
    .select()
    .from(tiers)
    .where(and(inArray(tiers.id, ids), eq(tiers.is_deleted, false)));
};

export const createTier = async (tierData: INewTier, tx: ITiersDatabase = db): Promise<Tier> => {
  const [newTier] = await tx.insert(tiers).values(tierData).returning();
  if (newTier) await tierCacheService.invalidateTier(newTier.id, newTier.code);
  return newTier;
};

export const updateTierById = async (
  id: string,
  data: Partial<Omit<Tier, 'id' | 'created_at' | 'created_by'>>,
  tx: ITiersDatabase = db,
): Promise<Tier | undefined> => {
  const [updatedTier] = await tx
    .update(tiers)
    .set({ ...data, updated_at: new Date() })
    .where(eq(tiers.id, id))
    .returning();

  if (updatedTier) await tierCacheService.invalidateTier(id, updatedTier.code);
  return updatedTier;
};

export const softDeleteTier = async (
  id: string,
  deletedBy: string,
  tx: ITiersDatabase = db,
): Promise<Tier | undefined> => {
  const [deletedTier] = await tx
    .update(tiers)
    .set({
      is_deleted: true,
      deleted_by: deletedBy,
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(tiers.id, id))
    .returning();

  if (deletedTier) await tierCacheService.invalidateTier(id, deletedTier.code);
  return deletedTier;
};

export const bulkSoftDeleteTiers = async (
  ids: string[],
  deletedBy: string,
  tx: ITiersDatabase = db,
): Promise<number> => {
  const result = await tx
    .update(tiers)
    .set({
      is_deleted: true,
      deleted_by: deletedBy,
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .where(inArray(tiers.id, ids));

  await tierCacheService.invalidateAll();
  return result.rowCount || 0;
};
