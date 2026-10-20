import { useState, useCallback, useEffect } from 'react';
import { uploadService } from '@/services/uploadService';
import type { PendingImage, ProductVariant } from '@/features/products/types';

export interface UseDeferredUploadOptions {
    /** Called when upload starts */
    onUploadStart?: () => void;
    /** Called when all uploads complete */
    onUploadComplete?: (primaryUrl: string | null, additionalUrls: string[]) => void;
    /** Called on error */
    onError?: (error: string) => void;
}

export interface UseDeferredUploadReturn {
    /** Pending primary image */
    pendingPrimaryImage: PendingImage | null;
    /** Set pending primary image */
    setPendingPrimaryImage: React.Dispatch<React.SetStateAction<PendingImage | null>>;
    /** Pending additional images */
    pendingAdditionalImages: PendingImage[];
    /** Set pending additional images */
    setPendingAdditionalImages: React.Dispatch<React.SetStateAction<PendingImage[]>>;
    /** Whether uploads are in progress */
    isUploading: boolean;
    /** Upload all pending images */
    uploadPendingImages: (folder?: string) => Promise<{
        primaryUrl: string | null;
        primaryThumbnailUrl: string | null;
        additionalUrls: string[];
        additionalThumbnailUrls: string[];
    }>;
    /** Clear all pending images (revokes blob URLs) */
    clearPendingImages: () => void;
    /** Check if there are unsaved pending images */
    hasUnsavedImages: boolean;
    /** Remove pending primary image with cleanup */
    removePendingPrimaryImage: () => void;
    /** Remove pending additional image by index with cleanup */
    removePendingAdditionalImage: (index: number) => void;

    /** 
     * Upload images for all variants 
     * Returns a map of variantId -> { url, thumbnail? }
     */
    uploadVariantImages: (
        variants: ProductVariant[],
        baseFolder: string
    ) => Promise<Record<string, { url: string; thumbnail?: string }>>;
}

/**
 * Hook for managing deferred image uploads with separate primary and additional images
 * 
 * Usage:
 * ```tsx
 * const { 
 *   pendingPrimaryImage, 
 *   setPendingPrimaryImage,
 *   pendingAdditionalImages,
 *   setPendingAdditionalImages,
 *   uploadPendingImages 
 * } = useDeferredUpload();
 * 
 * // On form submit:
 * const { primaryUrl, additionalUrls } = await uploadPendingImages('products/my-product');
 * ```
 */
export function useDeferredUpload(options?: UseDeferredUploadOptions): UseDeferredUploadReturn {
    const [pendingPrimaryImage, setPendingPrimaryImage] = useState<PendingImage | null>(null);
    const [pendingAdditionalImages, setPendingAdditionalImages] = useState<PendingImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const hasUnsavedImages = pendingPrimaryImage !== null || pendingAdditionalImages.length > 0;

    // Cleanup blob URLs on unmount
    useEffect(() => {
        const primaryImage = pendingPrimaryImage;
        const additionalImages = [...pendingAdditionalImages];
        
        return () => {
            if (primaryImage) {
                uploadService.revokeBlobPreview(primaryImage.previewUrl);
            }
            additionalImages.forEach(img => {
                uploadService.revokeBlobPreview(img.previewUrl);
            });
        };
    }, [pendingPrimaryImage, pendingAdditionalImages]);

    // Warn user before leaving page with unsaved images
    useEffect(() => {
        if (hasUnsavedImages) {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = 'You have images that have not been saved. Are you sure you want to leave?';
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [hasUnsavedImages]);

    // Upload all pending images
    const uploadPendingImages = useCallback(async (folder?: string): Promise<{
        primaryUrl: string | null;
        primaryThumbnailUrl: string | null;
        additionalUrls: string[];
        additionalThumbnailUrls: string[];
    }> => {
        if (!hasUnsavedImages) {
            return { primaryUrl: null, primaryThumbnailUrl: null, additionalUrls: [], additionalThumbnailUrls: [] };
        }

        setIsUploading(true);
        options?.onUploadStart?.();

        let primaryUrl: string | null = null;
        let primaryThumbnailUrl: string | null = null;
        const additionalUrls: string[] = [];
        const additionalThumbnailUrls: string[] = [];
        const errors: string[] = [];

        // Upload primary image first
        if (pendingPrimaryImage) {
            try {
                const response = await uploadService.uploadFile(pendingPrimaryImage.file, {
                    folder,
                });
                primaryUrl = response.file_url;
                primaryThumbnailUrl = response.thumbnail_url || null;

                // Mark as uploaded
                setPendingPrimaryImage(prev => prev ? {
                    ...prev,
                    status: 'uploaded',
                    uploadedUrl: response.file_url,
                    uploadedThumbnailUrl: response.thumbnail_url,
                } : null);
            } catch (error: any) {
                const errorMsg = error.message || 'Primary image upload failed';
                errors.push(errorMsg);
                setPendingPrimaryImage(prev => prev ? { ...prev, status: 'error', errorMessage: errorMsg } : null);
            }
        }

        // Upload additional images
        for (let i = 0; i < pendingAdditionalImages.length; i++) {
            const image = pendingAdditionalImages[i];

            try {
                const response = await uploadService.uploadFile(image.file, {
                    folder,
                });
                additionalUrls.push(response.file_url);
                additionalThumbnailUrls.push(response.thumbnail_url || response.file_url);

                // Mark as uploaded
                setPendingAdditionalImages(prev => prev.map((img, idx) =>
                    idx === i ? {
                        ...img,
                        status: 'uploaded',
                        uploadedUrl: response.file_url,
                        uploadedThumbnailUrl: response.thumbnail_url,
                    } : img
                ));
            } catch (error: any) {
                const errorMsg = error.message || 'Upload failed';
                errors.push(`${image.file.name}: ${errorMsg}`);

                // Mark as error
                setPendingAdditionalImages(prev => prev.map((img, idx) =>
                    idx === i ? { ...img, status: 'error', errorMessage: errorMsg } : img
                ));
            }
        }

        setIsUploading(false);

        if (errors.length > 0) {
            options?.onError?.(`Failed to upload ${errors.length} image(s): ${errors.join(', ')}`);
        }

        options?.onUploadComplete?.(primaryUrl, additionalUrls);

        return { primaryUrl, primaryThumbnailUrl, additionalUrls, additionalThumbnailUrls };
    }, [pendingPrimaryImage, pendingAdditionalImages, hasUnsavedImages, options]);

    // Upload variant images
    const uploadVariantImages = useCallback(async (
        variants: ProductVariant[],
        baseFolder: string
    ): Promise<Record<string, { url: string; thumbnail?: string }>> => {
        const results: Record<string, { url: string; thumbnail?: string }> = {};
        const folder = `${baseFolder}/variants`;

        // Filter variants that have a new file to upload
        const variantsToUpload = variants.filter(v => v.imageFile);

        if (variantsToUpload.length === 0) {
            return {};
        }

        setIsUploading(true);

        // Process sequentially to be safe with connection limits
        for (const variant of variantsToUpload) {
            if (!variant.imageFile || !variant.id) continue;

            try {
                // Use the shared folder path logic
                const response = await uploadService.uploadFile(variant.imageFile, {
                    folder: folder
                });

                results[variant.id] = {
                    url: response.file_url,
                    thumbnail: response.thumbnail_url || undefined
                };
            } catch (error: any) {
                console.error(`Failed to upload image for variant ${variant.id}`, error);
                // We'll proceed with other uploads even if one fails
                options?.onError?.(`Failed to upload image for variant ${variant.optionValue}: ${error.message}`);
            }
        }

        setIsUploading(false);
        return results;
    }, [options]);

    // Clear all pending images
    const clearPendingImages = useCallback(() => {
        if (pendingPrimaryImage) {
            uploadService.revokeBlobPreview(pendingPrimaryImage.previewUrl);
        }
        pendingAdditionalImages.forEach(img => {
            uploadService.revokeBlobPreview(img.previewUrl);
        });
        setPendingPrimaryImage(null);
        setPendingAdditionalImages([]);
    }, [pendingPrimaryImage, pendingAdditionalImages]);

    // Remove pending primary image with cleanup
    const removePendingPrimaryImage = useCallback(() => {
        if (pendingPrimaryImage) {
            uploadService.revokeBlobPreview(pendingPrimaryImage.previewUrl);
            setPendingPrimaryImage(null);
        }
    }, [pendingPrimaryImage]);

    // Remove pending additional image by index with cleanup
    const removePendingAdditionalImage = useCallback((index: number) => {
        const image = pendingAdditionalImages[index];
        if (image) {
            uploadService.revokeBlobPreview(image.previewUrl);
            setPendingAdditionalImages(prev => prev.filter((_, i) => i !== index));
        }
    }, [pendingAdditionalImages]);

    return {
        pendingPrimaryImage,
        setPendingPrimaryImage,
        pendingAdditionalImages,
        setPendingAdditionalImages,
        isUploading,
        uploadPendingImages,
        uploadVariantImages,
        clearPendingImages,
        removePendingPrimaryImage,
        removePendingAdditionalImage,
        hasUnsavedImages,
    };
}

export default useDeferredUpload;
