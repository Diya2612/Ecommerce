import {
    makeGetRequest,
    makeGetRequestWithParams,
    makePostRequest,
    makePutRequest,
    makeDeleteRequest,
    httpClient
} from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';
import type {
    Tier,
    TierFormData,
    TierResponseDTO,
    TierHierarchyResponse,
    TierImportResult
} from '../types';

/**
 * Transformation utilities for converting between frontend and backend formats
 */
const transformHelpers = {
    /** Map backend DTO to frontend Tier interface */
    toTier: (dto: TierResponseDTO): Tier => ({
        id: dto.id,
        name: dto.name,
        code: dto.code,
        description: dto.description || '',
        level: dto.level,
        parentId: dto.parent_id,
        status: dto.status,
        isDeleted: false,
        usageCount: dto.usage_count || 0,
        children: dto.children?.map(transformHelpers.toTier),
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
    }),

    /** Map frontend form data to backend request body */
    toRequest: (data: Partial<TierFormData>) => {
        const payload: any = {};

        if (data.name !== undefined) payload.name = data.name;

        // Backend validates code length > 0. Only send if non-empty string.
        if (typeof data.code === 'string' && data.code.trim() !== '') {
            payload.code = data.code;
        }

        // Backend expects optional string. Omit if empty or null.
        if (typeof data.description === 'string' && data.description.trim() !== '') {
            payload.description = data.description;
        }

        if (data.level !== undefined) payload.level = data.level;

        // Backend expects optional UUID string. Omit if null or empty.
        if (data.parentId !== undefined && data.parentId !== null && data.parentId !== '') {
            payload.parent_id = data.parentId;
        }

        if (data.status !== undefined) payload.status = data.status;

        return payload;
    }
};

/**
 * Tier Service
 * Handles all API calls for tier management
 */
export const tierService = {
    /**
     * Get all tiers with optional filters
     */
    getAllTiers: async (params?: {
        status?: string;
        level?: string | number;
        search?: string;
        usage?: string;
    }): Promise<Tier[]> => {
        const response = await makeGetRequestWithParams<{ data: TierResponseDTO[] }>(
            API_ROUTES.TIERS.BASE,
            params || {}
        );
        return (response.data.data || []).map(transformHelpers.toTier);
    },

    /**
     * Get a single tier by ID
     */
    getTierById: async (id: string): Promise<Tier> => {
        const response = await makeGetRequest<{ data: TierResponseDTO }>(
            API_ROUTES.TIERS.BY_ID(id)
        );
        return transformHelpers.toTier(response.data.data);
    },

    /**
     * Create a new tier
     */
    createTier: async (data: TierFormData): Promise<Tier> => {
        const requestBody = transformHelpers.toRequest(data);
        const response = await makePostRequest<{ data: TierResponseDTO }>(
            API_ROUTES.TIERS.BASE,
            requestBody
        );
        return transformHelpers.toTier(response.data.data);
    },

    /**
     * Update an existing tier
     */
    updateTier: async (id: string, data: Partial<TierFormData>): Promise<Tier> => {
        const requestBody = transformHelpers.toRequest(data);
        const response = await makePutRequest<{ data: TierResponseDTO }>(
            API_ROUTES.TIERS.BY_ID(id),
            requestBody
        );
        return transformHelpers.toTier(response.data.data);
    },

    /**
     * Delete a tier
     */
    deleteTier: async (id: string): Promise<void> => {
        await makeDeleteRequest(API_ROUTES.TIERS.BY_ID(id));
    },

    /**
     * Bulk delete tiers
     */
    bulkDeleteTiers: async (ids: string[]): Promise<void> => {
        await makePostRequest(
            API_ROUTES.TIERS.BULK_DELETE,
            { ids }
        );
    },

    /**
     * Get available parent tiers for a given level
     */
    getAvailableParents: async (level: 2 | 3 | 4): Promise<Tier[]> => {
        const parentLevel = level - 1;
        const response = await makeGetRequestWithParams<{ data: TierResponseDTO[] }>(
            API_ROUTES.TIERS.BASE,
            { level: parentLevel, status: 'active' }
        );
        return (response.data.data || []).map(transformHelpers.toTier);
    },

    /**
     * Get tier hierarchy (tree structure)
     */
    getTierHierarchy: async (): Promise<Tier[]> => {
        const response = await makeGetRequest<{ data: TierHierarchyResponse }>(
            API_ROUTES.TIERS.HIERARCHY
        );
        return (response.data.data.tiers || []).map(transformHelpers.toTier);
    },

    /**
     * Import tiers from CSV data
     */
    importTiers: async (
        data: any[],
        mode: 'create' | 'update' | 'upsert'
    ): Promise<TierImportResult> => {
        try {
            const response = await makePostRequest<{ data: any }, { data: any[]; mode: string }>(
                API_ROUTES.TIERS.IMPORT,
                {
                    data: data.map(item => ({
                        ...item,
                        level: item.level ? Number(item.level) : item.level,
                        priority: item.priority !== undefined && item.priority !== null && item.priority !== ''
                            ? Number(item.priority)
                            : undefined
                    })),
                    mode
                }
            );
            return response.data.data;
        } catch (error) {
            logger.error('Failed to import tiers', error);
            throw error;
        }
    },

    /**
     * Export tiers with various filters and formats
     */
    exportTiers: async (options: {
        scope: 'all' | 'selected';
        format: 'csv' | 'xlsx';
        selectedIds?: string[];
        selectedColumns: string[];
        dateRange?: {
            from: string;
            to: string;
        };
    }): Promise<Blob> => {
        try {
            const response = await httpClient.post(
                API_ROUTES.TIERS.EXPORT,
                options,
                {
                    responseType: 'blob',
                }
            );
            return response.data;
        } catch (error) {
            logger.error('Failed to export tiers', error);
            throw error;
        }
    }
};
