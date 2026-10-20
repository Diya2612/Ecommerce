import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/productService";
import type {
  ProductsQueryParams,
  ProductFormData
} from "../types";
import { parseProductError } from "../types/api.types";
import { notifySuccess, notifyError } from "@/utils";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductsQueryParams) => [...productKeys.lists(), { ...params }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, "stats"] as const,
  inventoryHistory: (productId: string, page: number, limit: number) =>
    [...productKeys.detail(productId), 'inventory-history', { page, limit }] as const,
};

export const useProductStats = () => {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => productService.getProductStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    placeholderData: (previousData) => previousData,
  });
};


// Get products list with filters
export const useProducts = (params: ProductsQueryParams) => {
  const result = useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const data = await productService.getProducts(params);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev: any) => prev,
  });
  return result;
};

// Get single product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    // staleTime: 0, // Always fetch fresh data
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) => productService.createProduct(data),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      notifySuccess("Product created successfully!");
    },
    onError: (error: any) => {
      const parsedError = parseProductError(error);
      
      switch (parsedError.type) {
        case 'validation':
          notifyError(`Validation error: ${parsedError.message}${parsedError.field ? ` (${parsedError.field})` : ''}`);
          break;
        case 'conflict':
          notifyError(`Product already exists: ${parsedError.message}`);
          break;
        case 'network':
          notifyError('Network error. Please check your connection and try again.');
          break;
        case 'server':
          notifyError('Server error. Please try again later.');
          break;
        default:
          notifyError(parsedError.message || 'Failed to create product');
      }
    },
  });
};

// Update product mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productService.updateProduct(id, data),
    onError: (error: any) => {
      const parsedError = parseProductError(error);
      
      switch (parsedError.type) {
        case 'validation':
          notifyError(`Validation error: ${parsedError.message}${parsedError.field ? ` (${parsedError.field})` : ''}`);
          break;
        case 'not_found':
          notifyError('Product not found. It may have been deleted.');
          break;
        case 'conflict':
          notifyError(`Update conflict: ${parsedError.message}`);
          break;
        case 'network':
          notifyError('Network error. Please check your connection and try again.');
          break;
        case 'server':
          notifyError('Server error. Please try again later.');
          break;
        default:
          notifyError(parsedError.message || 'Failed to update product');
      }
    },
    onSuccess: (_, { id }) => {
      // Invalidate both detail and list queries to refetch fresh data
      // This ensures computed fields like total_stock are properly updated
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      notifySuccess("Product updated successfully!");
    },
  });
};

// Delete product mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueriesData({
        queryKey: productKeys.lists(),
      });

      // Optimistically remove from all list queries
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old: any) => {
        if (!old?.products) return old;
        return {
          ...old,
          products: old.products.filter((p: any) => p.id !== id),
          totalRecords: old.totalRecords - 1,
        };
      });

      return { previousProducts };
    },
    onError: (error: any, _id, context) => {
      const parsedError = parseProductError(error);
      
      // Rollback on error
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      switch (parsedError.type) {
        case 'not_found':
          notifyError('Product not found. It may have already been deleted.');
          break;
        case 'network':
          notifyError('Network error. Please check your connection and try again.');
          break;
        case 'server':
          notifyError('Server error. Please try again later.');
          break;
        default:
          notifyError(parsedError.message || 'Failed to delete product');
      }
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      notifySuccess("Product deleted successfully!");
    },
  });
};

// Bulk Delete products mutation
export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => productService.bulkDeleteProducts(ids),
    onMutate: async (ids) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueriesData({
        queryKey: productKeys.lists(),
      });

      // Optimistically remove from all list queries
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old: any) => {
        if (!old?.products) return old;
        return {
          ...old,
          products: old.products.filter((p: any) => !ids.includes(p.id)),
          totalRecords: old.totalRecords - ids.length,
        };
      });

      return { previousProducts };
    },
    onError: (error: any, _ids, context) => {
      const parsedError = parseProductError(error);
      
      // Rollback on error
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      switch (parsedError.type) {
        case 'not_found':
          notifyError('Some products were not found. They may have already been deleted.');
          break;
        case 'network':
          notifyError('Network error. Please check your connection and try again.');
          break;
        case 'server':
          notifyError('Server error. Please try again later.');
          break;
        default:
          notifyError(parsedError.message || 'Failed to delete products');
      }
    },
    onSuccess: (data) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      notifySuccess(data.message || `Successfully deleted products`);
    },
  });
};

export const useDuplicateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => productService.duplicateProducts(ids),
    onSuccess: (data) => {
      notifySuccess(data.message || 'Products duplicated successfully');
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      const parsedError = parseProductError(error);
      
      switch (parsedError.type) {
        case 'not_found':
          notifyError('Some products were not found and could not be duplicated.');
          break;
        case 'conflict':
          notifyError(`Duplication conflict: ${parsedError.message}`);
          break;
        case 'network':
          notifyError('Network error. Please check your connection and try again.');
          break;
        case 'server':
          notifyError('Server error. Please try again later.');
          break;
        default:
          notifyError(parsedError.message || 'Failed to duplicate products');
      }
    }
  });
};
