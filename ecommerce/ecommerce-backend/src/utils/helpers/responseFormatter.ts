import { Response } from 'express';

interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
    timestamp: string;
  };
}

export const ResponseFormatter = {
  /**
   * Sends a successful HTTP response.
   */
  success<T = unknown>(
    res: Response,
    data: T | null = null,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: SuccessResponse<T>['meta'],
  ): Response<SuccessResponse<T>> {
    const response: SuccessResponse<T> = {
      success: true,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    // Only include data if it's provided
    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  },

  /**
   * Sends a successful HTTP response for resource creation (201).
   */
  created<T = unknown>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
  ): Response<SuccessResponse<T>> {
    return this.success(res, data, message, 201);
  },

  /**
   * Sends a successful HTTP response with no content (204).
   */
  noContent(res: Response): Response {
    return res.status(204).end();
  },

  /**
   * Sends a paginated HTTP response.
   */
  paginated<T = unknown>(
    res: Response,
    data: T[],
    pagination: { page: number; limit: number; total: number },
    message: string = 'Data retrieved successfully',
  ): Response<SuccessResponse<T[]>> {
    return this.success(res, data, message, 200, {
      timestamp: new Date().toISOString(),
      pagination,
    });
  },

  /**
   * Sends a structured error response.
   * Note: Primarily intended to be used by the global error handling middleware.
   */
  error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>,
  ): Response<ErrorResponse> {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    });
  },
};
