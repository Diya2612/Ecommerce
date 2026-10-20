export type CatalogStatus = 'Active' | 'Inactive' | 'Draft';
export type DiscountType = 'Percentage' | 'Fixed Amount' | 'Buy X Get Y';

export interface Catalog {
  id: string;
  catalog_id: string;
  catalogName: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  products: number;
  status: CatalogStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CatalogFormData {
  catalogName: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  status: CatalogStatus;
  adminComment: string;
}

export interface CatalogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CatalogStatus;
  discountType?: DiscountType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CatalogFilters {
  search: string;
  status: string;
  discountType: string;
  sort: string;
}
