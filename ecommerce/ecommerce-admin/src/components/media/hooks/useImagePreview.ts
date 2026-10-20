import { useState, useEffect, useCallback } from 'react';

export interface PreviewImage {
    url: string;
    alt?: string;
}

export interface UseImagePreviewReturn {
    /** Whether the preview modal is open */
    isOpen: boolean;
    /** Current image index being previewed */
    currentIndex: number;
    /** Array of images in the preview */
    images: PreviewImage[];
    /** Open preview with a single image */
    openPreview: (image: PreviewImage) => void;
    /** Open preview with multiple images at a specific index */
    openPreviewAt: (images: PreviewImage[], index: number) => void;
    /** Close the preview modal */
    closePreview: () => void;
    /** Navigate to previous/next image */
    navigate: (direction: -1 | 1) => void;
}

/**
 * useImagePreview Hook
 * 
 * Manages state for image preview modal with keyboard navigation.
 * Handles Escape key to close and arrow keys for navigation.
 */
export function useImagePreview(): UseImagePreviewReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState<PreviewImage[]>([]);

    const closePreview = useCallback(() => {
        setIsOpen(false);
    }, []);

    const navigate = useCallback((direction: -1 | 1) => {
        setCurrentIndex((prev) => {
            if (images.length <= 1) return prev;

            let newIndex = prev + direction;
            // Wrap around at boundaries
            if (newIndex < 0) {
                newIndex = images.length - 1;
            } else if (newIndex >= images.length) {
                newIndex = 0;
            }

            return newIndex;
        });
    }, [images.length]);

    const openPreview = useCallback((image: PreviewImage) => {
        setImages([image]);
        setCurrentIndex(0);
        setIsOpen(true);
    }, []);

    const openPreviewAt = useCallback((imgs: PreviewImage[], index: number) => {
        setImages(imgs);
        setCurrentIndex(index);
        setIsOpen(true);
    }, []);

    // Keyboard event handling
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closePreview();
            } else if (e.key === 'ArrowLeft') {
                navigate(-1);
            } else if (e.key === 'ArrowRight') {
                navigate(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closePreview, navigate]);

    return {
        isOpen,
        currentIndex,
        images,
        openPreview,
        openPreviewAt,
        closePreview,
        navigate,
    };
}
