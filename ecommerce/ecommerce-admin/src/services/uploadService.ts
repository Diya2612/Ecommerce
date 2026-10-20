import axios from 'axios';
import { supabase } from '@/lib/supabase';

const _apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = _apiBaseUrl ? _apiBaseUrl.replace(/\/$/, '') : '';

export interface UploadResponse {
    id: string;
    filename: string;
    original_filename: string;
    mime_type: string;
    file_size: number;
    file_path: string;
    file_url: string;
    thumbnail_url?: string;
    created_at: string;
}

export interface UploadOptions {
    folder?: string;
    onProgress?: (percentage: number) => void;
}

export interface BatchUploadResult {
    successful: UploadResponse[];
    failed: { file: File; error: string }[];
}

export async function uploadFile(
    file: File,
    options?: UploadOptions | ((percentage: number) => void)
): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    let folder: string | undefined;
    let onProgress: ((percentage: number) => void) | undefined;

    if (typeof options === 'function') {
        onProgress = options;
    } else if (options) {
        folder = options.folder;
        onProgress = options.onProgress;
    }

    if (folder) {
        formData.append('folder', folder);
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
        const response = await axios.post<{ data: UploadResponse }>(
            `${API_BASE_URL}/uploads`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        onProgress(percentage);
                    }
                },
            }
        );

        return response.data?.data || (response.data as unknown as UploadResponse);
    } catch (error: any) {
        console.error('❌ [UploadService] Upload failed:', error.response?.data || error.message);
        const errorMessage =
            error?.response?.data?.message || error?.message || 'Failed to upload file';
        throw new Error(errorMessage);
    }
}

export async function uploadFiles(
    files: File[],
    folder?: string,
    onFileProgress?: (fileIndex: number, percentage: number) => void
): Promise<BatchUploadResult> {
    const successful: UploadResponse[] = [];
    const failed: { file: File; error: string }[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const response = await uploadFile(file, {
                folder,
                onProgress: (percentage) => {
                    onFileProgress?.(i, percentage);
                },
            });
            successful.push(response);
        } catch (error: any) {
            failed.push({
                file,
                error: error.message || 'Upload failed',
            });
        }
    }

    return { successful, failed };
}

export function createBlobPreview(file: File): string {
    return URL.createObjectURL(file);
}

export function revokeBlobPreview(blobUrl: string): void {
    if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
    }
}

export function isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
}

export function isWithinSizeLimit(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

export function validateImage(file: File, maxSizeMB: number = 10): string | null {
    if (!isValidImage(file)) {
        return 'Please select a valid image file (JPG, PNG, or WebP)';
    }
    if (!isWithinSizeLimit(file, maxSizeMB)) {
        return `File size must be under ${maxSizeMB}MB`;
    }
    return null;
}

export const uploadService = {
    uploadFile,
    uploadFiles,
    createBlobPreview,
    revokeBlobPreview,
    isValidImage,
    isWithinSizeLimit,
    validateImage,
};
