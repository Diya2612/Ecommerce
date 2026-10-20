import { useState, useEffect } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImagePreview, useFileInput, ImagePreviewModal, ImagePreview } from '@/components/media';

interface VariantImageUploadProps {
    imageUrl?: string;
    onImageChange: (file: File | null) => void;
}

export function VariantImageUpload({ imageUrl, onImageChange }: VariantImageUploadProps) {
    const [preview, setPreview] = useState<string | undefined>(imageUrl);
    const { isOpen, currentIndex, images, openPreview, closePreview } = useImagePreview();

    // Sync preview with imageUrl prop (for when parent updates it)
    useEffect(() => {
        setPreview(imageUrl);
    }, [imageUrl]);

    const handleFilesSelected = (files: FileList) => {
        const file = files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onImageChange(file);
    };

    const { inputRef, handleChange, trigger } = useFileInput({
        onFileSelect: handleFilesSelected,
    });

    const handleRemove = () => {
        setPreview(undefined);
        onImageChange(null);
    };

    const handlePreviewClick = () => {
        if (preview) {
            openPreview({ url: preview, alt: 'Variant image' });
        }
    };

    return (
        <>
            <div className="relative w-full">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />

                {preview ? (
                    // Image selected - show preview with Change Image button
                    <div className="space-y-2">
                        <ImagePreview
                            src={preview}
                            alt="Variant"
                            onRemove={handleRemove}
                            onPreview={handlePreviewClick}
                            className="relative w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg w-32 text-xs"
                            onClick={trigger}
                        >
                            <Upload className="h-3 w-3 mr-1" />
                            Change Image
                        </Button>
                    </div>
                ) : (
                    // No image - show upload placeholder (compact variant style)
                    <div 
                        className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={trigger}
                    >
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                        <p className="text-xs text-slate-500 text-center px-2">Upload Image</p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <ImagePreviewModal
                isOpen={isOpen}
                images={images}
                currentIndex={currentIndex}
                onClose={closePreview}
            />
        </>
    );
}
