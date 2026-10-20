import { Image as ImageIcon } from 'lucide-react';
import { DeferredImageUploader } from '@/features/products/components/media';
import { FormSection } from '@/components/forms';
import type { PendingImage } from '@/features/products/types';

export interface DeferredMediaSectionProps {
    /** Pending primary image */
    pendingPrimaryImage: PendingImage | null;
    /** Pending additional images */
    pendingAdditionalImages: PendingImage[];
    /** Callback when pending primary image changes */
    onPendingPrimaryChange: (image: PendingImage | null) => void;
    /** Callback when pending additional images change */
    onPendingAdditionalChange: (images: PendingImage[]) => void;
    /** Existing primary image URL (edit mode) */
    existingPrimaryImage?: string;
    existingPrimaryThumbnail?: string;
    /** Existing additional image URLs (edit mode) */
    existingAdditionalImages?: string[];
    existingAdditionalThumbnails?: string[];
    /** Callback when existing primary changes */
    onExistingPrimaryChange?: (url: string) => void;
    /** Callback when existing additional images change */
    /** Callback when existing additional images change */
    onExistingAdditionalChange?: (urls: string[]) => void;
    /** Validation error message */
    error?: string;
}

/**
 * Media section using deferred upload pattern.
 * Images are stored locally until form submission.
 */
export function DeferredMediaSection({
    pendingPrimaryImage,
    pendingAdditionalImages,
    onPendingPrimaryChange,
    onPendingAdditionalChange,
    existingPrimaryImage,
    existingPrimaryThumbnail,
    existingAdditionalImages,
    existingAdditionalThumbnails,
    onExistingPrimaryChange,
    onExistingAdditionalChange,
    error,
}: DeferredMediaSectionProps) {
    return (
        <FormSection icon={ImageIcon} title="Media" id="section-media">
            <DeferredImageUploader
                pendingPrimaryImage={pendingPrimaryImage}
                pendingAdditionalImages={pendingAdditionalImages}
                onPendingPrimaryChange={onPendingPrimaryChange}
                onPendingAdditionalChange={onPendingAdditionalChange}
                existingPrimaryImage={existingPrimaryImage}
                existingPrimaryThumbnail={existingPrimaryThumbnail}
                existingAdditionalImages={existingAdditionalImages}
                existingAdditionalThumbnails={existingAdditionalThumbnails}
                onExistingPrimaryChange={onExistingPrimaryChange}
                onExistingAdditionalChange={onExistingAdditionalChange}
            />
            {error && (
                <p className="text-red-400 text-xs px-6 pb-4 -mt-2">{error}</p>
            )}
        </FormSection>
    );
}
