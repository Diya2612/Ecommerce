import { eq, or, inArray, gt, asc } from 'drizzle-orm';
import { HttpException, buildSearchConditions } from '../../../utils';
import {
  createTier,
  updateTierById,
  softDeleteTier,
  bulkSoftDeleteTiers,
  findTierById,
  findTierByCode,
  isTierCodeTaken,
  getActiveParentTier,
  baseFetchTiers,
} from '../shared/queries';
import { tiers } from '../shared/tiers.schema';
import { validateTierHierarchy } from '../shared/validation';
import {
  ICreateTierInput,
  IUpdateTierInput,
  IGetTiersQuery,
  generateTierCode,
} from '../shared/interface';

/**
 * Tiers Service
 */
export class TiersService {
  async createTierAction(data: ICreateTierInput, userId: string) {
    const code = data.code || generateTierCode(data.name);
    const existingCode = await findTierByCode(code);
    if (existingCode) throw new HttpException(409, `Tier with code "${code}" already exists`);

    let parentLevel: number | null = null;
    if (data.parent_id) {
      const parent = await getActiveParentTier(data.parent_id);
      if (!parent) throw new HttpException(404, 'Parent tier not found or inactive');
      parentLevel = parent.level;
    }

    const hierarchyValidation = validateTierHierarchy(data.level, parentLevel);
    if (!hierarchyValidation.valid) {
      throw new HttpException(400, hierarchyValidation.error || 'Invalid tier hierarchy');
    }

    const newTier = await createTier({
      name: data.name,
      code: code,
      description: data.description || null,
      level: data.level,
      parent_id: data.parent_id || null,
      priority: data.priority || 0,
      status: data.status,
      usage_count: 0,
      is_deleted: false,
      created_by: userId,
      updated_by: userId,
    });


    return newTier;
  }

  async updateTierAction(id: string, data: IUpdateTierInput, userId: string) {
    const existing = await findTierById(id);
    if (!existing) throw new HttpException(404, 'Tier not found');

    if (data.code && data.code !== existing.code) {
      const codeTaken = await isTierCodeTaken(data.code, id);
      if (codeTaken) throw new HttpException(409, `Tier with code "${data.code}" already exists`);
    }

    const auditFields: Array<keyof typeof data> = [
      'name',
      'code',
      'description',
      'priority',
      'status',
    ];
    const newValuesToLog: Record<string, unknown> = {};
    const oldValuesToLog: Record<string, unknown> = {};
    const normalize = (v: any) => (v === null || v === undefined || v === '' ? null : v);

    for (const field of auditFields) {
      if (field in data) {
        const newValue = data[field];
        const oldValue = existing[field as keyof typeof existing];
        if (normalize(newValue) !== normalize(oldValue)) {
          newValuesToLog[field] = newValue;
          oldValuesToLog[field] = oldValue ?? null;
        }
      }
    }

    const updated = await updateTierById(id, { ...data, updated_by: userId });
    if (!updated) throw new HttpException(500, 'Failed to update tier');


    return updated;
  }

  async deleteTierAction(id: string, userId: string) {
    const existing = await findTierById(id);
    if (!existing) throw new HttpException(404, 'Tier not found');

    const deleted = await softDeleteTier(id, userId);


    return deleted;
  }

  async bulkDeleteTiersAction(ids: string[], userId: string) {
    const count = await bulkSoftDeleteTiers(ids, userId);
    return { success: true, count };
  }

  async getAllTiers(filters: IGetTiersQuery) {
    const conditions = [eq(tiers.is_deleted, false)];

    if (filters.status) {
      const statuses = filters.status.split(',').filter((s) => s === 'active' || s === 'inactive');
      if (statuses.length > 0)
        conditions.push(inArray(tiers.status, statuses as ('active' | 'inactive')[]));
    }

    if (filters.level) {
      const levels = filters.level
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n));
      if (levels.length > 0) conditions.push(inArray(tiers.level, levels));
    }
    if (filters.parent_id) conditions.push(eq(tiers.parent_id, filters.parent_id));

    if (filters.usage) {
      const usageOptions = filters.usage.split(',').filter(Boolean);
      const usageConditions = [];
      if (usageOptions.includes('used')) usageConditions.push(gt(tiers.usage_count, 0));
      if (usageOptions.includes('unused')) usageConditions.push(eq(tiers.usage_count, 0));

      if (usageConditions.length > 0) {
        const orCondition = or(...usageConditions);
        if (orCondition) conditions.push(orCondition);
      }
    }

    if (filters.search) {
      const searchCondition = buildSearchConditions(filters.search, {
        fuzzyColumns: [tiers.name],
        exactColumns: [tiers.code],
      });
      if (searchCondition) conditions.push(searchCondition);
    }

    return await baseFetchTiers(conditions);
  }

  async getTierById(id: string, includeChildren: boolean = false) {
    const tier = await findTierById(id);
    if (!tier) throw new HttpException(404, 'Tier not found');

    if (includeChildren) {
      const childrenConditions = [eq(tiers.parent_id, id), eq(tiers.is_deleted, false)];
      const children = await baseFetchTiers(childrenConditions, [
        asc(tiers.priority),
        asc(tiers.name),
      ]);
      return { ...tier, children };
    }
    return tier;
  }
}

export const tiersService = new TiersService();
