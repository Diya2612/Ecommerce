import { useState } from 'react';
import type { ProductImage } from '@/features/products/types';

/**
 * Hook for managing product images
 * Handles primary image, additional images, and image operations
 * 
 * @param initialImages - Initial product images
 * @returns Image state and handlers
 * 
 * @example
 * ```tsx
 * const { images, addImage, removeImage, setPrimaryImage, reorderImages } = useProductImages(initialData?.productImages);
 * ```
 */
export function useProductImages(initialImages: ProductImage[] = []) {
    const [images, setImages] = useState<ProductImage[]>(initialImages);

    /**
     * Add a new image
     */
    const addImage = (image: ProductImage) => {
        setImages(prev => [...prev, image]);
    };

    /**
     * Remove an image by ID
     */
    const removeImage = (imageId: string) => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    };

    /**
     * Set a specific image as primary
     * Unsets any existing primary image
     */
    const setPrimaryImage = (imageId: string) => {
        setImages(prev => prev.map(img => ({
            ...img,
            isPrimary: img.id === imageId
        })));
    };

    /**
     * Reorder images (drag and drop support)
     */
    const reorderImages = (startIndex: number, endIndex: number) => {
        setImages(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    };

    /**
     * Validate images
     * Returns error object if validation fails
     */
    const validateImages = (): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (images.length === 0) {
            errors.productImages = 'At least one product image is required';
        }

        const hasPrimary = images.some(img => img.isPrimary);
        if (images.length > 0 && !hasPrimary) {
            errors.productImages = 'Please select a primary image';
        }

        return errors;
    };

    return {
        // State
        images,

        // Setter
        setImages,

        // Operations
        addImage,
        removeImage,
        setPrimaryImage,
        reorderImages,
        validateImages,
    };
}
