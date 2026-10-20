import {
    makeGetRequestWithParams,
    makeGetRequest,
    makePostRequest,
    makePutRequest,
    makeDeleteRequest,
    httpClient
} from "@/lib/api";
import { API_ROUTES } from '@/lib/constants';
import type {
    CustomersApiResponse,
    CustomersQueryParams,
    CustomerFormData,
    Customer,
    CreateCustomerPayload,
    UpdateCustomerPayload
} from "../types/customer.types";


export const customerService = {
    getCustomers: async (params: CustomersQueryParams) => {
        // Note: Assuming API_ROUTES.CUSTOMERS.BASE exists. If not, this might need adjustment based on valid routes.
        // For now mirroring products pattern.
        const response = await makeGetRequestWithParams<CustomersApiResponse>(
            API_ROUTES.CUSTOMERS.BASE,
            params
        );
        return response.data;
    },

    getCustomerById: async (id: string) => {
        const response = await makeGetRequest<{ data: CustomerFormData }>(
            API_ROUTES.CUSTOMERS.BY_ID(id)
        );
        return response.data.data;
    },

    createCustomer: async (data: CreateCustomerPayload) => {
        const response = await makePostRequest<{ data: Customer }>(
            API_ROUTES.CUSTOMERS.CREATE,
            data
        );
        return response.data.data;
    },

    updateCustomer: async (id: string, data: UpdateCustomerPayload) => {
        const response = await makePutRequest<{ data: CustomerFormData }>(
            API_ROUTES.CUSTOMERS.BY_ID(id),
            data
        );
        return response.data.data;
    },

    deleteCustomer: async (id: string) => {
        const response = await makeDeleteRequest<{ message: string }>(
            API_ROUTES.CUSTOMERS.BY_ID(id)
        );
        return response.data;
    },

    bulkDeleteCustomers: async (ids: string[]) => {
        const response = await makeDeleteRequest<{
            data: { deleted_count: number; ids: string[] };
            message: string;
        }>(
            API_ROUTES.CUSTOMERS.BULK_DELETE,
            { ids }
        );
        return response.data;
    },

    getCustomerMetrics: async () => {
        const response = await makeGetRequest<{
            data: { total: number; active: number; inactive: number }
        }>(API_ROUTES.CUSTOMERS.METRICS);
        return response.data.data;
    },

    getTags: async () => {
        const response = await makeGetRequest<{ data: string[] }>(
            API_ROUTES.CUSTOMERS.TAGS
        );
        return response.data.data;
    },

    // ============================================
    // ADDRESS MANAGEMENT
    // ============================================

    createAddress: async (userId: string, addressData: {
        address_type: 'home' | 'office' | 'other';
        address_name?: string;
        name: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
        country?: string;
        isDefaultBilling?: boolean;
        isDefaultShipping?: boolean;
        deliveryInstructions?: string;
    }) => {
        const response = await makePostRequest<{ data: any }>(
            API_ROUTES.CUSTOMERS.ADDRESSES(userId),
            addressData
        );
        return response.data.data;
    },

    updateAddress: async (userId: string, addressId: string, addressData: {
        address_type?: 'home' | 'office' | 'other';
        address_name?: string;
        name?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
        isDefaultBilling?: boolean;
        isDefaultShipping?: boolean;
        deliveryInstructions?: string;
    }) => {
        const response = await makePutRequest<{ data: any }>(
            API_ROUTES.CUSTOMERS.ADDRESS_BY_ID(userId, addressId),
            addressData
        );
        return response.data.data;
    },

    deleteAddress: async (userId: string, addressId: string) => {
        const response = await makeDeleteRequest<{ message: string }>(
            API_ROUTES.CUSTOMERS.ADDRESS_BY_ID(userId, addressId)
        );
        return response.data;
    },

    // ============================================
    // EMAIL OTP VERIFICATION
    // ============================================

    /**
     * Send OTP to email for verification
     */
    sendEmailOtp: async (email: string) => {
        const response = await makePostRequest<{
            data: { success: boolean; expiresIn: number; message: string }
        }>(
            API_ROUTES.CUSTOMERS.SEND_OTP,
            { email }
        );
        return response.data.data;
    },

    /**
     * Verify OTP code
     */
    verifyEmailOtp: async (email: string, otp: string) => {
        const response = await makePostRequest<{
            data: { verified: boolean }
        }>(
            API_ROUTES.CUSTOMERS.VERIFY_OTP,
            { email, otp }
        );
        return response.data.data;
    },

    /**
     * Check if email already exists
     */
    checkEmailExists: async (email: string) => {
        const response = await makeGetRequestWithParams<{
            data: { exists: boolean }
        }>(
            API_ROUTES.CUSTOMERS.CHECK_EMAIL,
            { email }
        );
        return response.data;
    },

    // ============================================
    // IMPORT/EXPORT METHODS
    // ============================================

    /**
     * Import customers from CSV/JSON data
     */
    importCustomers: async (
        data: any[],
        mode: 'create' | 'update' | 'upsert'
    ) => {
        const response = await makePostRequest<{
            success: number;
            failed: number;
            skipped: number;
            errors: Array<{ row: number; name: string; error: string }>;
        }>(
            API_ROUTES.CUSTOMERS.IMPORT,
            { data, mode }
        );
        return response.data;
    },

    /**
     * Export customers with various filters and formats
     * POST /api/users/customers/export
     */
    exportCustomers: async (options: {
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
                API_ROUTES.CUSTOMERS.EXPORT,
                options,
                {
                    responseType: 'blob',
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to export customers', error);
            throw error;
        }
    },

    /**
     * Fetch customer payment history
     */
    getCustomerPaymentHistory: async (userId: string, params: { page?: number; limit?: number; status?: string }) => {
        const response = await makeGetRequestWithParams<{
            data: {
                transactions: any[];
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    total_pages: number;
                }
            }
        }>(
            API_ROUTES.CUSTOMERS.PAYMENTS(userId),
            params
        );
        return response.data.data;
    },

    /**
     * Fetch customer activity timeline
     */
    getCustomerActivity: async (userId: string, params?: { limit?: number; offset?: number; category?: string }) => {
        const response = await makeGetRequestWithParams<{
            data: {
                activities: any[];
                pagination: {
                    limit: number;
                    offset: number;
                    total: number;
                    hasMore: boolean;
                }
            }
        }>(
            API_ROUTES.CUSTOMERS.ACTIVITY(userId),
            params || {}
        );
        return response.data.data;
    },
};
