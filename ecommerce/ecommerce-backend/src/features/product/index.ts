import { Router } from 'express';
import Route from '../../interfaces/route.interface';

/** Product feature entry point with dynamic loading to prevent circular dependencies. */
class ProductRoute implements Route {
  public path = '/products';
  public router = Router();

  public async init() {
    const [
      create,
      detail,
      update,
      del,
      slug,
      filters,
      featured,
      search,
      bulk,
      stats,
      dup,
      list,
    ] = await Promise.all([
      import('./apis/create-product'),
      import('./apis/get-product-by-id'),
      import('./apis/update-product'),
      import('./apis/delete-product'),
      import('./apis/get-product-by-slug'),
      import('./apis/get-product-filters'),
      import('./apis/get-featured-products'),
      import('./apis/search-products'),
      import('./apis/bulk-delete-products'),
      import('./apis/get-product-stats'),
      import('./apis/duplicate-product'),
      import('./apis/get-all-products'),
    ]);

    this.router.use(this.path, list.default);
    this.router.use(this.path, create.default);
    this.router.use(this.path, bulk.default);
    this.router.use(this.path, dup.default);
    this.router.use(this.path, stats.default);
    this.router.use(this.path, filters.default);
    this.router.use(this.path, featured.default);
    this.router.use(this.path, search.default);
    this.router.use(this.path, detail.default);
    this.router.use(this.path, slug.default);
    this.router.use(this.path, update.default);
    this.router.use(this.path, del.default);
  }
}

export default ProductRoute;

// Feature exports
export { productCacheService, ProductCacheService } from './services/product-cache.service';
export { createProduct, updateProduct, deleteProduct } from './services/product.service';
export { duplicateProducts } from './services/product-duplicate.service';
export { getProductDetail } from './services/product-detail.service';

export { updateProductVariants } from './services/product-variant-update.service';
export * from './shared';
