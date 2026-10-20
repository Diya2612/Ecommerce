import { Product } from './products.schema';
import { ProductFaq } from './product-faqs.schema';
import { ProductVariant } from './product-variants.schema';

export type IProduct = Product;
export type IProductFaq = ProductFaq;

/** Product variant with calculated stock levels. */
export interface IProductVariant extends ProductVariant {
  inventory_quantity: number;
}

/** Sanitized product/variant types excluding internal audit fields. */
export type SanitizedProduct = Omit<
  IProduct,
  'is_deleted' | 'deleted_at' | 'deleted_by' | 'created_by' | 'updated_by'
>;
export type SanitizedProductVariant = Omit<
  IProductVariant,
  'is_deleted' | 'deleted_at' | 'deleted_by' | 'created_by' | 'updated_by'
>;
export type SanitizedProductFaq = IProductFaq;

export type { Product, ProductFaq, ProductVariant };

/** Detailed product data for single item views. */
export interface IProductResponse {
  id: string;
  slug: string;
  product_title: string;
  secondary_title: string | null;
  short_description: string | null;
  full_description: string | null;
  status: string;
  cost_price: string;
  selling_price: string;
  compare_at_price: string | null;
  discount: number | null;
  sku: string;
  inStock: boolean;
  total_stock: number | undefined;
  available_stock?: number;
  reserved_stock?: number;
  base_inventory: number;
  primary_image_url: string | null;
  additional_images: string[];
  images: string[];
  category_tier_1: string | null;
  category_tier_2: string | null;
  category_tier_3: string | null;
  category_tier_4: string | null;
  rating: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
  weight: string | null;
  length: string | null;
  breadth: string | null;
  height: string | null;
  meta_title: string | null;
  meta_description: string | null;
  product_url: string | null;
  hsn_code: string | null;
  barcode: string | null;
  tags: string[];
  admin_comment: string | null;
  featured: boolean;
  faqs: Array<{ id: string; question: string; answer: string }>;
  has_variants: boolean;
  variants: IProductVariant[];
  max_order_quantity: number;
}

/** Essential product information for catalog/collection views. */
export interface IProductListItem {
  id: string;
  name: string;
  tags: string[] | null;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number | null;
  image: string | null;
  isNew: boolean;
  category: string;
  technologies: string[];
  description: string | null;
  inStock: boolean;
  total_stock: number | undefined;
  variants?: Array<{
    id: string;
    option_name: string;
    option_value: string;
    image_url: string | null;
  }>;
}

export interface ProductListParams {
  page: number;
  limit: number;
  status?: string | string[];
  category_tier_1?: string | string[];
  categories?: string;
  technologies?: string;
  ratings?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  stockStatus?: string | string[];
  quickFilter?: string | string[];
  startDate?: string;
  endDate?: string;
}

export interface ProductListResponse {
  products: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductExportQueryOptions {
  scope?: 'all' | 'selected';
  selectedIds?: string[];
  startDate?: Date;
  endDate?: Date;
  status?: string | string[];
  categoryId?: string | string[];
  search?: string;
}

export interface ProductExportDataOptions {
  selectedColumns: string[];
}

export interface SearchProductsOptions {
  searchQuery: string;
  status?: 'draft' | 'active' | 'archived';
  page?: number;
  limit?: number;
}

export interface GetProductDetailOptions {
  id?: string;
  slug?: string;
  userId?: string;
}

export interface CachedProduct {
  product: Product;
  expiresAt: number;
}
