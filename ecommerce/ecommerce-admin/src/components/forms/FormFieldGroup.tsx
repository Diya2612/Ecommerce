import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldGroupProps {
    /** Field label text */
    label: string;
    /** Whether the field is required */
    required?: boolean;
    /** Field input component */
    children: ReactNode;
    /** Error message to display */
    error?: string;
    /** Helper text to display below the input */
    helperText?: string;
    /** Additional CSS classes for the container */
    className?: string;
}

/**
 * FormFieldGroup - Wrapper for Label + Input + Error message pattern
 * 
 * Provides consistent spacing and styling for form fields.
 * Eliminates repeated Label/Input/Error combinations in 60+ components.
 * 
 * @example
 * ```tsx
 * <FormFieldGroup label="Email" required error={errors.email}>
 *   <Input type="email" {...register('email')} />
 * </FormFieldGroup>
 * ```
 */
export function FormFieldGroup({
    label,
    required = false,
    children,
    error,
    helperText,
    className = '',
}: FormFieldGroupProps) {
    return (
        <div className={className}>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {children}

            {/* Helper text or error */}
            {(helperText || error) && (
                <p className={`text-xs mt-1.5 ${error ? 'text-red-600' : 'text-slate-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}
