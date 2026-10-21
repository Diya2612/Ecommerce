import { useQuery } from '@tanstack/react-query';
import { tierKeys, getAllTiers, getTierHierarchy, type TierParams } from '@/queries';

export const useTierHierarchy = () => {
    return useQuery({
        queryKey: tierKeys.hierarchy(),
        queryFn: getTierHierarchy,
        staleTime: 1000 * 60 * 60, // 1 hour - Categories rarely change
    });
};

export const useTiers = (params?: TierParams) => {
    return useQuery({
        queryKey: tierKeys.list(params),
        queryFn: () => getAllTiers(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
