import { Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ImageUploadPlaceholderProps {
    /** Callback when upload area is clicked */
    onClick: () => void;
    /** Label text to display */
    label?: string;
    /** Whether upload is in progress */
    isUploading?: boolean;
    /** Custom upload button text */
    buttonText?: string;
}

/**
 * ImageUploadPlaceholder Component
 * 
 * Empty state UI for image upload areas.
 * Shows an icon, message, and upload button.
 */
export function ImageUploadPlaceholder({
    onClick,
    label = 'No image uploaded',
    isUploading = false,
    buttonText = 'Upload Image',
}: ImageUploadPlaceholderProps) {
    return (
        <div className="text-center">
            <div
                className="cursor-pointer"
                onClick={() => !isUploading && onClick()}
            >
                <ImageIcon className="size-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-600 mb-3">
                    {isUploading ? 'Uploading...' : label}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={isUploading}
                >
                    <Upload className="size-3.5 mr-2" />
                    {isUploading ? 'Uploading...' : buttonText}
                </Button>
            </div>
        </div>
    );
}
