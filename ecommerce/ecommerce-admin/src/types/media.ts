
/**
 * Represents a file that is pending upload (held in browser memory).
 */
export interface PendingFile {
    /** Unique local ID (e.g., crypto.randomUUID()) */
    id: string;
    /** The actual File object (not uploaded yet) */
    file: File;
    /** Blob URL for instant preview - MUST call URL.revokeObjectURL() when done */
    previewUrl: string;
    /** Is this the primary/cover image? */
    isPrimary?: boolean;
    /** Current status in the upload lifecycle */
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    /** Upload progress percentage (0-100) */
    uploadProgress?: number;
    /** Error message if upload failed */
    errorMessage?: string;
    /** The final URL after successful upload */
    uploadedUrl?: string;
}

/**
 * Represents an uploaded file/image.
 */
export interface UploadedFile {
    id: string;
    url: string;
    name?: string;
    size?: number;
    type?: string;
}
