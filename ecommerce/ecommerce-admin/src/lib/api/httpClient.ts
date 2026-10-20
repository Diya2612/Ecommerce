import axios from "axios";
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "../config/env";
import { notifyError } from "@/utils";
import { supabase } from "@/lib/supabase";

/**
 * HTTP Client Configuration
 * 
 * Configured Axios instance with:
 * - Base URL from environment
 * - Request/Response interceptors
 * - Authentication handling
 * - Error handling
 */

const httpClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Adds authentication token to requests
 */
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error responses
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Sign out from Supabase (clears session automatically)
      await supabase.auth.signOut();

      // Clear legacy user data
      localStorage.removeItem("user");

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      notifyError('Access denied. You do not have permission to perform this action.');
    }

    // Note: 500 errors are NOT handled here globally to allow individual API handlers
    // to show context-specific error messages (e.g., "Email already exists")

    return Promise.reject(error);
  }
);

export default httpClient;
