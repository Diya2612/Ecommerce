/**
 * Products Query Module Index
 */

// Keys
export { productKeys } from './keys';

// Query functions
export {
    getProductById,
    getProductBySlug,
    getProducts,
    getAllProducts,
    getFeaturedProducts,
    searchProducts,
    getRelatedProducts,
    getSimilarProducts,
    getProductsByCategory,
    getProductsByBrand,
    getProductReviews,
    getProductBundles,
    getFilterOptions,
} from './queries';

// Types
export type {
    Product,
    ProductDetail,
    ProductReview,
    ReviewsResponse,
    ProductBundle,
    ProductsResponse,
    GetProductsParams,
    PaginatedProducts,
    FilterOptions,
    FilterOption,
    RatingOption,
} from './types';
