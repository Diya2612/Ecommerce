import { db } from '../../../database';
import { tiers } from '../shared/tiers.schema';
import { eq } from 'drizzle-orm';
import { ITier, ITierHierarchyResponse } from '../shared/interface';
import { omitFields } from '../../../utils';

/**
 * Tiers Structure Service
 */
class TierStructureService {
  async getTierHierarchy(): Promise<ITierHierarchyResponse[]> {
    const allTiers = await db.select().from(tiers).where(eq(tiers.is_deleted, false));
    return this.buildTree(allTiers);
  }

  async getDescendants(rootIds: string[]): Promise<string[]> {
    if (rootIds.length === 0) return [];
    const allTiers = await db
      .select({ id: tiers.id, parent_id: tiers.parent_id })
      .from(tiers)
      .where(eq(tiers.is_deleted, false));

    const parentMap = new Map<string, string[]>();
    allTiers.forEach((t: { id: string; parent_id: string | null }) => {
      if (t.parent_id) {
        if (!parentMap.has(t.parent_id)) parentMap.set(t.parent_id, []);
        parentMap.get(t.parent_id)?.push(t.id);
      }
    });

    const descendants = new Set<string>();
    const collect = (parentId: string) => {
      const children = parentMap.get(parentId) || [];
      children.forEach((childId) => {
        if (!descendants.has(childId)) {
          descendants.add(childId);
          collect(childId);
        }
      });
    };

    rootIds.forEach((id) => collect(id));
    return Array.from(descendants);
  }

  private buildTree(flatTiers: ITier[]): ITierHierarchyResponse[] {
    const tierMap = new Map<string, ITierHierarchyResponse>();
    const rootTiers: ITierHierarchyResponse[] = [];

    flatTiers.forEach((tier) => {
      const publicTier = omitFields(tier, [
        'created_by',
        'updated_by',
        'is_deleted',
        'deleted_at',
        'deleted_by',
      ]);
      tierMap.set(tier.id, { ...publicTier, children: [] });
    });

    flatTiers.forEach((tier) => {
      const node = tierMap.get(tier.id);
      if (!node) return;
      if (tier.parent_id) {
        const parent = tierMap.get(tier.parent_id);
        if (parent) {
          parent.children.push(node);
        } else {
          rootTiers.push(node);
        }
      } else {
        rootTiers.push(node);
      }
    });

    const sortNodes = (nodes: ITierHierarchyResponse[]) => {
      nodes.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach((node) => sortNodes(node.children));
    };

    sortNodes(rootTiers);
    return rootTiers;
  }
}

export const tierStructureService = new TierStructureService();
