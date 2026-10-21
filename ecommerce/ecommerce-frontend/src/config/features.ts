/**
 * Feature Flags Configuration
 * 
 * Toggle features on/off by changing the boolean values.
 * This allows easy enabling/disabling of features without code changes.
 */

export const FEATURES = {
    /**
     * Phone OTP Login
     * Set to false to disable phone login feature entirely
     */
    PHONE_LOGIN: false,

    /**
     * Google OAuth Login
     * Set to false to disable Google login
     */
    GOOGLE_LOGIN: true,

    /**
     * Email/Password Login
     * Set to false to disable traditional email login
     */
    EMAIL_LOGIN: true,
} as const;

// Type for feature flags
export type FeatureFlag = keyof typeof FEATURES;

// Helper to check if feature is enabled
export function isFeatureEnabled(feature: FeatureFlag): boolean {
    return FEATURES[feature];
}
