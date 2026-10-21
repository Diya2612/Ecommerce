/**
 * Auth Query Functions
 *
 * Pure async functions for authentication operations.
 */

import { api } from '@/api';

// ============================================================================
// Types
// ============================================================================

export interface AuthResponse {
    success: boolean;
    message: string;
}

export interface SyncUserResponse {
    id: string;
    synced: boolean;
    message: string;
}

// ============================================================================
// Auth Operations
// ============================================================================

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<AuthResponse> {
    return api<AuthResponse>('/auth/password-reset/request', {
        method: 'POST',
        body: { email },
    });
}

/**
 * Confirm password reset with new password
 */
export async function resetPassword(
    accessToken: string,
    newPassword: string
): Promise<AuthResponse> {
    return api<AuthResponse>('/auth/password-reset/confirm', {
        method: 'POST',
        body: { access_token: accessToken, new_password: newPassword },
    });
}

/**
 * Sync user to backend database
 * Call after OAuth or magic link login
 */
export async function syncUser(
    name?: string,
    phoneNumber?: string,
    firstName?: string,
    lastName?: string
): Promise<SyncUserResponse> {
    return api<SyncUserResponse>('/auth/sync-user', {
        method: 'POST',
        body: {
            name,
            phone_number: phoneNumber,
            first_name: firstName,
            last_name: lastName
        },
        auth: true,
    });
}

/**
 * Sync user with access token (for server-side usage)
 * Used in auth callback and middleware
 */
export async function syncUserWithToken(
    accessToken: string,
    name?: string
): Promise<SyncUserResponse> {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';

    const response = await fetch(`${API_BASE_URL}/auth/sync-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error('User sync failed');
    }

    return response.json();
}
