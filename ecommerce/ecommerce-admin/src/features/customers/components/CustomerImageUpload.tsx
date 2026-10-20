import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useFileInput } from '@/components/media';
import { notifyError } from '@/utils';
import { uploadService } from '@/services/uploadService';

interface CustomerImageUploadProps {
    onFileChange: (file: File | null) => void;
    preview?: string | null;
}

export const CustomerImageUpload: React.FC<CustomerImageUploadProps> = ({ onFileChange, preview }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (files: FileList) => {
        const file = files[0];
        if (!file) return;

        const error = uploadService.validateImage(file, 2); // Max 2MB
        if (error) {
            notifyError(error);
            return;
        }

        onFileChange(file);
    };

    const { inputRef, handleChange, trigger } = useFileInput({
        accept: 'image/*',
        onFileSelect: handleFileSelect,
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-600 mb-2">
                Upload Profile Image
            </label>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={trigger}
                className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${dragActive
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
                <div className="p-6 pointer-events-none">
                    {preview ? (
                        <div className="flex flex-col items-center">
                            <div className="size-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-3">
                                <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm text-slate-600">Click or drag to change</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <User className="size-8 text-slate-400" />
                            </div>
                            <div className="mb-2">
                                <p className="text-sm text-slate-700 mb-1">
                                    <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500">JPG, PNG, max 2MB</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

