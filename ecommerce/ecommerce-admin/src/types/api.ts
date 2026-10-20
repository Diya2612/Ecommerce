
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface PaginatedData<T> {
    data: T[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedData<T>> { }
