import { useRef } from 'react';

export interface UseFileInputOptions {
    /** Accept attribute for file input (e.g., 'image/*') */
    accept?: string;
    /** Allow multiple file selection */
    multiple?: boolean;
    /** Callback when files are selected */
    onFileSelect: (files: FileList) => void;
}

export interface UseFileInputReturn {
    /** Ref to attach to the file input element */
    inputRef: React.RefObject<HTMLInputElement | null>;
    /** Handler for input onChange event */
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Trigger file input click programmatically */
    trigger: () => void;
}

/**
 * useFileInput Hook
 * 
 * Manages file input state and interactions.
 * Provides ref, change handler, and trigger function.
 */
export function useFileInput({
    onFileSelect,
}: UseFileInputOptions): UseFileInputReturn {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files);
        }

        // Reset input value to allow selecting the same file again
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const trigger = () => {
        inputRef.current?.click();
    };

    return {
        inputRef,
        handleChange,
        trigger,
    };
}
