/**
 * Hook for fetching products with variants expanded
 * Used in order product selection modal
 */

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/features/products/services/productService";
import type { ProductsQueryParams } from "@/features/products/types";

export interface ProductVariantRow {
  id: string; // Unique ID for selection (variant_id or product_id)
  product_id: string;
  product_title: string;
  variant_label?: string; // e.g., "Size: Medium"
  sku: string;
  selling_price: string;
  cost_price: string;
  primary_image_url: string | null;
  category_tier_1: string | null;
  inventory_quantity: number;
  is_variant: boolean;
  variant_id?: string;
  has_variants?: boolean;
}

export interface ProductsWithVariantsResponse {
  products: ProductVariantRow[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const useProductsWithVariants = (params: ProductsQueryParams) => {
  return useQuery({
    queryKey: ["products-with-variants", params],
    queryFn: async (): Promise<ProductsWithVariantsResponse> => {
      // Fetch base products list
      const data = await productService.getProducts(params);
      const expandedProducts: ProductVariantRow[] = [];

      // For each product, fetch details to get variants
      for (const product of data.products) {
        try {
          // Fetch product detail which includes variants
          const detail = await productService.getProductById(product.id);

          const hasVariants = detail.productVariants && detail.productVariants.length > 0;

          if (hasVariants) {
            // Add base product first
            expandedProducts.push({
              id: product.id,
              product_id: product.id,
              product_title: product.product_title,
              sku: product.sku || '',
              selling_price: product.selling_price,
              cost_price: product.cost_price || '0',
              primary_image_url: product.primary_image_url || null,
              category_tier_1: product.category_tier_1 || null,
              inventory_quantity: parseInt(detail.inventoryQuantity || '0') || 0,
              is_variant: false,
              has_variants: true,
            });

            // Expand each variant as a separate row
            for (const variant of detail.productVariants!) {
              expandedProducts.push({
                id: variant.id, // Use variant ID for unique selection
                product_id: product.id,
                product_title: product.product_title,
                variant_label: `${variant.optionName}: ${variant.optionValue}`,
                sku: variant.sku,
                selling_price: variant.sellingPrice,
                cost_price: variant.costPrice || '0',
                primary_image_url: variant.image || product.primary_image_url || null,
                category_tier_1: product.category_tier_1 || null,
                inventory_quantity: parseInt(variant.inventoryQuantity) || 0,
                is_variant: true,
                variant_id: variant.id,
                has_variants: true,
              });
            }
          } else {
            // Add product without variants
            expandedProducts.push({
              id: product.id,
              product_id: product.id,
              product_title: product.product_title,
              sku: product.sku || '',
              selling_price: product.selling_price,
              cost_price: product.cost_price || '0',
              primary_image_url: product.primary_image_url || null,
              category_tier_1: product.category_tier_1 || null,
              inventory_quantity: product.total_stock || 0,
              is_variant: false,
              has_variants: false,
            });
          }
        } catch (error) {
          console.error(`Error fetching details for product ${product.id}:`, error);
          // Fallback: add product without variant info
          expandedProducts.push({
            id: product.id,
            product_id: product.id,
            product_title: product.product_title,
            sku: product.sku || '',
            selling_price: product.selling_price,
            cost_price: product.cost_price || '0',
            primary_image_url: product.primary_image_url || null,
            category_tier_1: product.category_tier_1 || null,
            inventory_quantity: product.total_stock || 0,
            is_variant: false,
            has_variants: false,
          });
        }
      }

      return {
        products: expandedProducts,
        total: data.total, // Keep original total for pagination context
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    placeholderData: (prev) => prev,
  });
};
