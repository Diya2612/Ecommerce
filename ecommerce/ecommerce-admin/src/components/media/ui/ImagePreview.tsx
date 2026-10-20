import { X } from 'lucide-react';

export interface ImagePreviewProps {
    /** Image source URL */
    src: string;
    /** Alt text for accessibility */
    alt: string;
    /** Callback when remove button is clicked */
    onRemove?: () => void;
    /** Callback when image is clicked for preview */
    onPreview?: () => void;
    /** Whether to show the remove button */
    showRemove?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ImagePreview Component
 * 
 * Displays an uploaded or pending image with optional remove button.
 * Supports click-to-preview functionality.
 */
export function ImagePreview({
    src,
    alt,
    onRemove,
    onPreview,
    showRemove = true,
    className = 'relative aspect-square bg-slate-100 rounded-lg overflow-hidden',
}: ImagePreviewProps) {
    const handleImageClick = () => {
        if (onPreview) {
            onPreview();
        }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove();
        }
    };

    return (
        <div
            className={`${className} ${onPreview ? 'cursor-pointer group' : ''}`}
            onClick={handleImageClick}
        >
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover ${onPreview ? 'transition-transform group-hover:scale-105' : ''}`}
            />

            {/* Hover overlay when preview is enabled */}
            {onPreview && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            )}

            {/* Remove button */}
            {showRemove && onRemove && (
                <button
                    type="button"
                    onClick={handleRemoveClick}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                    aria-label="Remove image"
                >
                    <X className="size-3" />
                </button>
            )}
        </div>
    );
}
