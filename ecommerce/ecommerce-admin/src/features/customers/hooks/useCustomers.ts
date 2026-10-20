import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../services/customerService";
import type {
    CustomersQueryParams,
    CustomerFormData
} from "../types/customer.types";
import { notifySuccess, notifyError } from "@/utils";

// Query keys
export const customerKeys = {
    all: ["customers"] as const,
    lists: () => [...customerKeys.all, "list"] as const,
    list: (params: CustomersQueryParams) => [...customerKeys.lists(), params] as const,
    details: () => [...customerKeys.all, "detail"] as const,
    detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Get customers list with filters
export const useCustomers = (params: CustomersQueryParams) => {
    return useQuery({
        queryKey: customerKeys.list(params),
        queryFn: () => customerService.getCustomers(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: (previousData) => previousData,
    });
};

// Get single customer by ID
export const useCustomer = (id: string) => {
    return useQuery({
        queryKey: customerKeys.detail(id),
        queryFn: () => customerService.getCustomerById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Create customer mutation
export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerFormData) => customerService.createCustomer(data as unknown as import('../types/customer.types').CreateCustomerPayload),
        onSuccess: () => {
            // Invalidate customers list to refetch
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            notifySuccess("Customer created successfully!");
        },
        onError: (error: any) => {
            notifyError(error?.message || "Failed to create customer");
        },
    });
};

// Update customer mutation
export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormData> }) =>
            customerService.updateCustomer(id, data as unknown as import('../types/customer.types').UpdateCustomerPayload),
        onMutate: async ({ id, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: customerKeys.detail(id) });

            // Snapshot previous value
            const previousCustomer = queryClient.getQueryData(customerKeys.detail(id));

            // Optimistically update to the new value
            queryClient.setQueryData(customerKeys.detail(id), (old: any) => ({
                ...old,
                ...data,
            }));

            return { previousCustomer };
        },
        onError: (_error, { id }, context) => {
            // Rollback on error
            if (context?.previousCustomer) {
                queryClient.setQueryData(customerKeys.detail(id), context.previousCustomer);
            }
            notifyError("Failed to update customer");
        },
        onSuccess: (_, { id }) => {
            // Invalidate both detail and list queries
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            notifySuccess("Customer updated successfully!");
        },
    });
};

// Delete customer mutation
export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => customerService.deleteCustomer(id),
        onMutate: async (id) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: customerKeys.lists() });

            // Snapshot previous value
            const previousCustomers = queryClient.getQueriesData({
                queryKey: customerKeys.lists(),
            });

            // Optimistically remove from all list queries
            queryClient.setQueriesData({ queryKey: customerKeys.lists() }, (old: any) => {
                if (!old?.customers) return old;
                return {
                    ...old,
                    customers: old.customers.filter((c: any) => c.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousCustomers };
        },
        onError: (_error, _id, context) => {
            // Rollback on error
            if (context?.previousCustomers) {
                context.previousCustomers.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            notifyError("Failed to delete customer");
        },
        onSuccess: () => {
            // Invalidate to refetch fresh data
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            notifySuccess("Customer deleted successfully!");
        },
    });
};

// Add Address Mutation
export const useAddAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, addressData }: { userId: string, addressData: any }) =>
            customerService.createAddress(userId, addressData),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(userId) });
            notifySuccess("Address added successfully!");
        },
        onError: (error: any) => {
            notifyError(error?.message || "Failed to add address");
        }
    });
};

