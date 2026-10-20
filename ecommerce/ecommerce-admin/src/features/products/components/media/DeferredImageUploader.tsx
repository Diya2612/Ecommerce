import { useRef, useEffect, useState } from 'react';
import { Upload, ZoomIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { notifySuccess, notifyError, notifyWarning, validateImageDimensions } from '@/utils';
import { uploadService } from '@/services/uploadService';
import type { PendingImage } from '@/features/products/types';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { v4 as uuidv4 } from 'uuid';
import { useImagePreview, ImagePreviewModal, ImageUploadPlaceholder, ImagePreview } from '@/components/media';
import { PRODUCT_LIMITS } from '@/features/products/constants';

const MAX_FILE_SIZE_MB = PRODUCT_LIMITS.MAX_FILE_SIZE_MB;
const MAX_ADDITIONAL_IMAGES = PRODUCT_LIMITS.MAX_ADDITIONAL_IMAGES;

export interface DeferredImageUploaderProps {
    /** Pending primary image (not yet uploaded) */
    pendingPrimaryImage: PendingImage | null;
    /** Pending additional images (not yet uploaded) */
    pendingAdditionalImages: PendingImage[];
    /** Callback when pending primary image changes */
    onPendingPrimaryChange: (image: PendingImage | null) => void;
    /** Callback when pending additional images change */
    onPendingAdditionalChange: (images: PendingImage[]) => void;
    /** Existing primary image URL (already uploaded, for edit mode) */
    existingPrimaryImage?: string;
    /** Existing primary thumbnail URL */
    existingPrimaryThumbnail?: string;
    /** Existing additional image URLs (already uploaded, for edit mode) */
    existingAdditionalImages?: string[];
    /** Existing additional thumbnail URLs */
    existingAdditionalThumbnails?: string[];
    /** Callback when existing primary changes (removal) */
    onExistingPrimaryChange?: (url: string) => void;
    /** Callback when existing additional images change (removal) */
    onExistingAdditionalChange?: (urls: string[]) => void;
}

/**
 * DeferredImageUploader - Matches original ImageUploader UI layout
 * 
 * Has separate sections for Primary and Additional images.
 * Files are stored locally until form submission.
 * Features: 5 image limit, image preview with navigation
 */
export function DeferredImageUploader({
    pendingPrimaryImage,
    pendingAdditionalImages,
    onPendingPrimaryChange,
    onPendingAdditionalChange,
    existingPrimaryImage = '',
    existingPrimaryThumbnail = '',
    existingAdditionalImages = [],
    existingAdditionalThumbnails = [],
    onExistingAdditionalChange,
}: DeferredImageUploaderProps) {
    const primaryInputRef = useRef<HTMLInputElement>(null);
    const additionalInputRef = useRef<HTMLInputElement>(null);

    // Calculate total additional images (existing + pending)
    const totalAdditionalImages = existingAdditionalImages.length + pendingAdditionalImages.length;
    const canAddMoreImages = totalAdditionalImages < MAX_ADDITIONAL_IMAGES;
    const remainingSlots = MAX_ADDITIONAL_IMAGES - totalAdditionalImages;

    // Use shared preview hook
    const { isOpen, currentIndex, images: previewImages, openPreview, openPreviewAt, closePreview, navigate } = useImagePreview();

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            if (pendingPrimaryImage) {
                uploadService.revokeBlobPreview(pendingPrimaryImage.previewUrl);
            }
            pendingAdditionalImages.forEach(img => {
                uploadService.revokeBlobPreview(img.previewUrl);
            });
        };
    }, []); // Only on unmount

    // === DELETE CONFIRMATION STATE ===
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<
        { type: 'primary-pending' } |
        { type: 'additional-pending', id: string } |
        { type: 'additional-existing', index: number } |
        null
    >(null);

    // === PRIMARY IMAGE HANDLERS ===

    const handlePrimaryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (!uploadService.isValidImage(file)) {
            notifyError('Please select a valid image file');
            return;
        }
        if (!uploadService.isWithinSizeLimit(file, MAX_FILE_SIZE_MB)) {
            notifyError(`File must be under ${MAX_FILE_SIZE_MB}MB`);
            return;
        }

        // Dimension validation
        validateImageDimensions(file, {
            minDimension: PRODUCT_LIMITS.MIN_IMAGE_DIMENSION,
            maxDimension: PRODUCT_LIMITS.MAX_IMAGE_DIMENSION,
            requireSquare: true,
        }).then(errorMsg => {
            if (errorMsg) {
                notifyError(errorMsg);
                // Reset input
                if (primaryInputRef.current) {
                    primaryInputRef.current.value = '';
                }
                return;
            }

            // Revoke old blob URL if exists
            if (pendingPrimaryImage) {
                uploadService.revokeBlobPreview(pendingPrimaryImage.previewUrl);
            }

            // Create new pending image
            const previewUrl = uploadService.createBlobPreview(file);
            onPendingPrimaryChange({
                id: uuidv4(),
                file,
                previewUrl,
                isPrimary: true,
                status: 'pending',
            });

            notifySuccess('Primary image selected');

            // Reset input
            if (primaryInputRef.current) {
                primaryInputRef.current.value = '';
            }
        });
    };

    const handleRemovePrimaryPending = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTarget({ type: 'primary-pending' });
        setShowDeleteDialog(true);
    };

    const openPrimaryPreview = () => {
        const primaryUrl = pendingPrimaryImage?.previewUrl || existingPrimaryImage;
        if (!primaryUrl) return;

        openPreview({ url: primaryUrl, alt: 'Primary product image' });
    };

    // === ADDITIONAL IMAGES HANDLERS ===

    const handleAdditionalFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check limit
        if (!canAddMoreImages) {
            notifyError(`Maximum ${MAX_ADDITIONAL_IMAGES} additional images allowed`);
            return;
        }

        const newImages: PendingImage[] = [];
        let addedCount = 0;

        for (const file of Array.from(files)) {
            // Check if we've hit the limit
            if (totalAdditionalImages + addedCount >= MAX_ADDITIONAL_IMAGES) {
                notifyWarning(`Maximum ${MAX_ADDITIONAL_IMAGES} images reached. Some files were skipped.`);
                break;
            }

            // Validate
            if (!uploadService.isValidImage(file)) {
                notifyError(`${file.name} is not a valid image`);
                continue;
            }
            if (!uploadService.isWithinSizeLimit(file, MAX_FILE_SIZE_MB)) {
                notifyError(`${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit`);
                continue;
            }

            // Dimension Validation (Async)
            const dimensionError = await validateImageDimensions(file, {
                minDimension: PRODUCT_LIMITS.MIN_IMAGE_DIMENSION,
                maxDimension: PRODUCT_LIMITS.MAX_IMAGE_DIMENSION,
                requireSquare: true,
            });
            if (dimensionError) {
                notifyError(`${file.name}: ${dimensionError}`);
                continue;
            }

            // Check for duplicates
            const isDuplicate = pendingAdditionalImages.some(
                img => img.file.name === file.name &&
                    img.file.size === file.size
            );
            if (isDuplicate) {
                notifyWarning(`${file.name} is already added`);
                continue;
            }

            const previewUrl = uploadService.createBlobPreview(file);
            newImages.push({
                id: uuidv4(),
                file,
                previewUrl,
                isPrimary: false,
                status: 'pending',
            });
            addedCount++;
        }

        if (newImages.length > 0) {
            onPendingAdditionalChange([...pendingAdditionalImages, ...newImages]);
            notifySuccess(`${newImages.length} image(s) added`);
        }

        // Reset input
        if (additionalInputRef.current) {
            additionalInputRef.current.value = '';
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'primary-pending') {
            if (pendingPrimaryImage) {
                uploadService.revokeBlobPreview(pendingPrimaryImage.previewUrl);
                onPendingPrimaryChange(null);
                notifySuccess('Primary image removed');
            }
        } else if (deleteTarget.type === 'additional-pending') {
            const image = pendingAdditionalImages.find(img => img.id === deleteTarget.id);
            if (image) {
                uploadService.revokeBlobPreview(image.previewUrl);
                onPendingAdditionalChange(pendingAdditionalImages.filter(img => img.id !== deleteTarget.id));
                notifySuccess('Image removed');
            }
        } else if (deleteTarget.type === 'additional-existing') {
            onExistingAdditionalChange?.(existingAdditionalImages.filter((_, idx) => idx !== deleteTarget.index));
            notifySuccess('Image removed');
        }

        setShowDeleteDialog(false);
        setDeleteTarget(null);
    };

    const openAdditionalPreview = (index: number) => {
        // Build combined list of all additional images
        const allImages = [
            ...existingAdditionalImages.map(url => ({ url, alt: 'Additional product image' })),
            ...pendingAdditionalImages.map(img => ({ url: img.previewUrl, alt: 'Pending additional image' })),
        ];

        openPreviewAt(allImages, index);
    };

    // Determine what to show for primary
    const showPendingPrimary = pendingPrimaryImage !== null;
    const primaryPreviewUrl = showPendingPrimary
        ? pendingPrimaryImage!.previewUrl
        : (existingPrimaryThumbnail || existingPrimaryImage); // Use thumbnail if available for grid

    return (
        <div className="space-y-4">
            {/* Hidden file inputs */}
            <input
                ref={primaryInputRef}
                type="file"
                accept="image/*"
                onChange={handlePrimaryFileSelect}
                className="hidden"
            />
            <input
                ref={additionalInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalFilesSelect}
                className="hidden"
            />

            {/* Primary Image Section */}
            <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Primary Product Image <span className="text-red-600">*</span>
                </Label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                    {primaryPreviewUrl ? (
                        <div className="space-y-3">
                            <div
                                className="relative w-full max-w-100 mx-auto bg-slate-100 rounded-lg overflow-hidden cursor-pointer group"
                                onClick={openPrimaryPreview}
                            >
                                <img
                                    src={primaryPreviewUrl}
                                    alt="Primary product"
                                    className="w-full h-auto transition-transform group-hover:scale-105"
                                />
                                {/* Hover overlay with zoom icon */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ZoomIn className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {showPendingPrimary && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePrimaryPending}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                                        aria-label="Remove primary image"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-lg w-full"
                                onClick={() => primaryInputRef.current?.click()}
                            >
                                <Upload className="size-3.5 mr-2" />
                                Change Image
                            </Button>
                        </div>
                    ) : (
                        <ImageUploadPlaceholder
                            onClick={() => primaryInputRef.current?.click()}
                            label="No image uploaded"
                            buttonText="Upload Image"
                        />
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                    Recommended: 1200x1200px, JPG, PNG or WebP
                </p>
            </div>

            {/* Additional Images Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-slate-700">
                        Additional Images
                    </Label>
                    <span className="text-xs text-slate-500">
                        {totalAdditionalImages} / {MAX_ADDITIONAL_IMAGES}
                    </span>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                    {(existingAdditionalImages.length > 0 || pendingAdditionalImages.length > 0) ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {/* Existing additional images */}
                                {existingAdditionalImages.map((imageUrl, idx) => (
                                    <ImagePreview
                                        key={`existing-${idx}`}
                                        src={existingAdditionalThumbnails?.[idx] || imageUrl}
                                        alt={`Additional ${idx + 1}`}
                                        onRemove={() => {
                                            setDeleteTarget({ type: 'additional-existing', index: idx });
                                            setShowDeleteDialog(true);
                                        }}
                                        onPreview={() => openAdditionalPreview(idx)}
                                    />
                                ))}

                                {/* Pending additional images */}
                                {pendingAdditionalImages.map((img, idx) => (
                                    <ImagePreview
                                        key={img.id}
                                        src={img.previewUrl}
                                        alt="Pending upload"
                                        onRemove={() => {
                                            setDeleteTarget({ type: 'additional-pending', id: img.id });
                                            setShowDeleteDialog(true);
                                        }}
                                        onPreview={() => openAdditionalPreview(existingAdditionalImages.length + idx)}
                                    />
                                ))}
                            </div>
                            {canAddMoreImages && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg w-full"
                                    onClick={() => additionalInputRef.current?.click()}
                                >
                                    <Upload className="size-3.5 mr-2" />
                                    Add More Images ({remainingSlots} remaining)
                                </Button>
                            )}
                        </div>
                    ) : (
                        <ImageUploadPlaceholder
                            onClick={() => additionalInputRef.current?.click()}
                            label="No additional images"
                            buttonText={`Upload Images (max ${MAX_ADDITIONAL_IMAGES})`}
                        />
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                    Upload up to {MAX_ADDITIONAL_IMAGES} additional product images
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                    Recommended: 1200x1200px, JPG, PNG or WebP
                </p>
            </div >

            {/* Image Preview Modal / Lightbox */}
            <ImagePreviewModal
                isOpen={isOpen}
                images={previewImages}
                currentIndex={currentIndex}
                onClose={closePreview}
                onNavigate={navigate}
            />

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Delete Image"
                description="Are you sure you want to delete this image? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div >
    );
}

export default DeferredImageUploader;
