/**
 * Global URL and Preview Helpers
 */

/**
 * Generates the storefront preview URL for any resource.
 * @param path The resource path (e.g., 'products', 'blogs', 'collections').
 * @param slug The resource slug or identifier.
 * @returns The full URL to the resource on the storefront.
 */
export function getStorefrontUrl(path: string, slug: string | undefined): string {
    const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL as string | undefined;
    if (!storefrontUrl) throw new Error('VITE_STOREFRONT_URL is not set');
    // Ensure path doesn't have leading/trailing slashes for consistency
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    return `${storefrontUrl}/${cleanPath}/${slug || ''}`;
}

/**
 * Opens a resource preview in a new tab.
 * @param path The resource path (e.g., 'products', 'blogs', 'collections').
 * @param slug The resource slug or identifier.
 */
export function openStorefrontPreview(path: string, slug: string | undefined): void {
    if (!slug) return;
    const url = getStorefrontUrl(path, slug);
    window.open(url, '_blank');
}
