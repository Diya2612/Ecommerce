import { useCallback } from 'react';
import type { ProductFormData, ProductImage, ProductVariant, PendingImage } from '../types';
import { notifyInfo } from '@/utils';

/**
 * Result from image upload preparation
 */
export interface ImageUploadResult {
  productImages: ProductImage[];
  variantUploadResults: Record<string, { url: string; thumbnail?: string }>;
}

/**
 * Options for image upload preparation
 */
export interface ImageUploadOptions {
  formData: ProductFormData;
  pendingPrimaryImage: PendingImage | null;
  pendingAdditionalImages: PendingImage[];
  uploadPendingImages: (folderPath: string) => Promise<{
    primaryUrl: string | null;
    primaryThumbnailUrl: string | null;
    additionalUrls: string[];
    additionalThumbnailUrls: string[];
  }>;
  uploadVariantImages: (
    variants: ProductVariant[],
    folderPath: string
  ) => Promise<Record<string, { url: string; thumbnail?: string }>>;
  isEditMode?: boolean;
}

/**
 * Custom hook for handling product image uploads
 * Centralizes image upload preparation logic for both create and edit modes
 * 
 * @example
 * ```tsx
 * const { prepareImageUpload } = useProductImageUpload();
 * 
 * const result = await prepareImageUpload({
 *   formData,
 *   pendingPrimaryImage,
 *   pendingAdditionalImages,
 *   uploadPendingImages,
 *   uploadVariantImages,
 *   isEditMode: true
 * });
 * 
 * // Use result.productImages and result.variantUploadResults
 * ```
 */
export function useProductImageUpload() {
  /**
   * Generate folder path for product images
   */
  const generateFolderPath = useCallback((formData: ProductFormData, productId?: string): string => {
    const productSlug =
      formData.slug ||
      formData.productTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    return `products/${productSlug || productId || 'temp'}`;
  }, []);

  /**
   * Prepare and upload all product and variant images
   * Returns structured data ready for API submission
   */
  const prepareImageUpload = useCallback(
    async (options: ImageUploadOptions): Promise<ImageUploadResult> => {
      const {
        formData,
        pendingPrimaryImage,
        pendingAdditionalImages,
        uploadPendingImages,
        uploadVariantImages,
        isEditMode = false,
      } = options;

      let uploadedPrimaryUrl: string | null = null;
      let uploadedPrimaryThumbnailUrl: string | null = null;
      let uploadedAdditionalUrls: string[] = [];
      let uploadedAdditionalThumbnailUrls: string[] = [];
      let variantUploadResults: Record<string, { url: string; thumbnail?: string }> = {};

      // Step 1: Upload pending product images if any
      const hasPendingImages = pendingPrimaryImage !== null || pendingAdditionalImages.length > 0;

      if (hasPendingImages) {
        const folderPath = generateFolderPath(formData, formData.id);
        const totalImages = (pendingPrimaryImage ? 1 : 0) + pendingAdditionalImages.length;

        notifyInfo(`Uploading ${totalImages} image(s)...`);

        const result = await uploadPendingImages(folderPath);
        uploadedPrimaryUrl = result.primaryUrl;
        uploadedPrimaryThumbnailUrl = result.primaryThumbnailUrl;
        uploadedAdditionalUrls = result.additionalUrls;
        uploadedAdditionalThumbnailUrls = result.additionalThumbnailUrls;
      }

      // Step 2: Upload variant images
      if (formData.productVariants && formData.productVariants.length > 0) {
        const folderPath = generateFolderPath(formData, formData.id);
        variantUploadResults = await uploadVariantImages(formData.productVariants, folderPath);
      }

      // Step 3: Build product images array
      const productImages: ProductImage[] = [];

      // Primary image (new upload or existing)
      if (isEditMode) {
        const existingPrimary = formData.productImages.find((img) => img.isPrimary && !img.url.startsWith('blob:'));
        const finalPrimaryUrl = uploadedPrimaryUrl || existingPrimary?.url;
        const finalPrimaryThumbnailUrl = uploadedPrimaryThumbnailUrl || existingPrimary?.thumbnailUrl;

        if (finalPrimaryUrl) {
          productImages.push({
            id: 'img-primary',
            url: finalPrimaryUrl,
            isPrimary: true,
            uploadStatus: 'success',
            thumbnailUrl: finalPrimaryThumbnailUrl,
          });
        }

        // Additional images (existing + newly uploaded)
        const existingAdditionalList = formData.productImages.filter((img) => !img.isPrimary && !img.url.startsWith('blob:'));

        // Process existing additional images to preserve their thumbnails
        existingAdditionalList.forEach((img, idx) => {
          productImages.push({
            id: `img-additional-existing-${idx}`,
            url: img.url,
            isPrimary: false,
            uploadStatus: 'success',
            thumbnailUrl: img.thumbnailUrl,
          });
        });

        // Add newly uploaded additional images
        uploadedAdditionalUrls.forEach((url, idx) => {
          productImages.push({
            id: `img-additional-new-${idx}`,
            url,
            isPrimary: false,
            uploadStatus: 'success',
            thumbnailUrl: uploadedAdditionalThumbnailUrls[idx],
          });
        });
      } else {
        // Create mode - simpler logic
        const finalPrimaryUrl = uploadedPrimaryUrl || formData.productImages.find((img) => img.isPrimary && !img.url.startsWith('blob:'))?.url;

        if (finalPrimaryUrl) {
          productImages.push({
            id: 'img-primary',
            url: finalPrimaryUrl,
            isPrimary: true,
            uploadStatus: 'success',
            thumbnailUrl: uploadedPrimaryThumbnailUrl || undefined,
          });
        }

        // Additional images (existing + newly uploaded)
        const existingAdditionalUrls = formData.productImages
          .filter((img) => !img.isPrimary && !img.url.startsWith('blob:'))
          .map((img) => img.url);
        const allAdditionalUrls = [...existingAdditionalUrls, ...uploadedAdditionalUrls];

        allAdditionalUrls.forEach((url, idx) => {
          productImages.push({
            id: `img-additional-${idx}`,
            url,
            isPrimary: false,
            uploadStatus: 'success',
            thumbnailUrl: uploadedAdditionalThumbnailUrls[idx],
          });
        });
      }

      return {
        productImages,
        variantUploadResults,
      };
    },
    [generateFolderPath]
  );

  return {
    prepareImageUpload,
    generateFolderPath,
  };
}
