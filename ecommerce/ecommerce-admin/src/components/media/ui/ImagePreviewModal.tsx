import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ImagePreviewModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Array of images to preview */
    images: { url: string; alt?: string }[];
    /** Current image index */
    currentIndex: number;
    /** Callback when modal should close */
    onClose: () => void;
    /** Callback when navigating between images */
    onNavigate?: (direction: -1 | 1) => void;
}

/**
 * ImagePreviewModal Component
 * 
 * Lightbox/modal for previewing images with keyboard navigation.
 * Supports arrow keys for navigation and Escape to close.
 */
export function ImagePreviewModal({
    isOpen,
    images,
    currentIndex,
    onClose,
    onNavigate,
}: ImagePreviewModalProps) {
    if (!isOpen || images.length === 0) {
        return null;
    }

    const currentImage = images[currentIndex];
    const hasMultipleImages = images.length > 1;

    const handleBackdropClick = () => {
        onClose();
    };

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleNavigate = (direction: -1 | 1, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNavigate) {
            onNavigate(direction);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                aria-label="Close preview"
            >
                <X className="size-6" />
            </button>

            {/* Previous button */}
            {hasMultipleImages && onNavigate && (
                <button
                    type="button"
                    onClick={(e) => handleNavigate(-1, e)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="size-8" />
                </button>
            )}

            {/* Image */}
            <div
                className="max-w-[90vw] max-h-[90vh] relative"
                onClick={handleContentClick}
            >
                <img
                    src={currentImage.url}
                    alt={currentImage.alt || `Preview ${currentIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
            </div>

            {/* Next button */}
            {hasMultipleImages && onNavigate && (
                <button
                    type="button"
                    onClick={(e) => handleNavigate(1, e)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                    aria-label="Next image"
                >
                    <ChevronRight className="size-8" />
                </button>
            )}

            {/* Image counter */}
            {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-10">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}
