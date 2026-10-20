import { Router } from 'express';
import Route from '../../interfaces/route.interface';

/**
 * Tiers Feature
 */
class TierRoute implements Route {
  public path = '/tiers';
  public router = Router();

  public async init() {
    const { default: createTierRouter } = await import('./apis/create-tier');
    const { default: getTiersRouter } = await import('./apis/get-tiers');
    const { default: getTierHierarchyRouter } = await import('./apis/get-tier-hierarchy');
    const { default: getTierByIdRouter } = await import('./apis/get-tier-by-id');
    const { default: updateTierRouter } = await import('./apis/update-tier');
    const { default: deleteTierRouter } = await import('./apis/delete-tier');
    const { default: bulkDeleteTierRouter } = await import('./apis/bulk-delete-tiers');

    this.router.use(this.path, createTierRouter);
    this.router.use(this.path, getTiersRouter);
    this.router.use(this.path, getTierHierarchyRouter);
    this.router.use(this.path, bulkDeleteTierRouter);
    this.router.use(this.path, getTierByIdRouter);
    this.router.use(this.path, updateTierRouter);
    this.router.use(this.path, deleteTierRouter);
  }
}

export default TierRoute;

export * from './shared';
export * from './services/tier-sync.service';
