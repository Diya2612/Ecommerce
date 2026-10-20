/**
 * Custom React Query hooks for inventory transfers
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/utils';
import { createTransfer, executeTransfer } from '../services/inventoryApi.service';
import type { TransferRequest } from '../services/inventoryApi.types';
import { inventoryKeys } from './useInventory';

/**
 * Hook to create a transfer between locations
 */
export const useCreateTransfer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TransferRequest) => createTransfer(data),
        onSuccess: () => {
            notifySuccess('Transfer created successfully');
            // Invalidate inventory queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
        onError: (error: any) => {
            notifyError(error?.response?.data?.message || 'Failed to create transfer');
        },
    });
};

/**
 * Hook to execute a pending transfer
 */
export const useExecuteTransfer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transferId: string) => executeTransfer(transferId),
        onSuccess: () => {
            notifySuccess('Transfer executed successfully');
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
        onError: (error: any) => {
            notifyError(error?.response?.data?.message || 'Failed to execute transfer');
        },
    });
};
