'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ============================================================================
// Types
// ============================================================================

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Label text */
    label?: string;
    /** Icon to display before label */
    labelIcon?: React.ReactNode;
    /** Whether field is required */
    required?: boolean;
    /** Error message */
    error?: string;
    /** Helper text (shown when no error) */
    helperText?: string;
    /** Input size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Icon on left side of input */
    leftIcon?: React.ReactNode;
    /** Icon on right side of input */
    rightIcon?: React.ReactNode;
    /** Container class overrides */
    containerClassName?: string;
    /** Label class overrides */
    labelClassName?: string;
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Label text */
    label?: string;
    /** Icon to display before label */
    labelIcon?: React.ReactNode;
    /** Whether field is required */
    required?: boolean;
    /** Error message */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Number of rows */
    rows?: number;
    /** Container class overrides */
    containerClassName?: string;
    /** Label class overrides */
    labelClassName?: string;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Label text */
    label?: string;
    /** Icon to display before label */
    labelIcon?: React.ReactNode;
    /** Whether field is required */
    required?: boolean;
    /** Error message */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Select options */
    options: SelectOption[];
    /** Placeholder text */
    placeholder?: string;
    /** Container class overrides */
    containerClassName?: string;
    /** Label class overrides */
    labelClassName?: string;
}

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CLASSES = {
    sm: 'h-12 px-4 text-[14px]',
    md: 'h-14 px-6 text-[16px]',
    lg: 'h-16 px-8 text-[18px]',
};

// ============================================================================
// FormField Component
// ============================================================================

/**
 * FormField - Unified input field component with label, icons, and error handling
 * 
 * @example Basic usage
 * ```tsx
 * <FormField
 *   label="Full Name"
 *   placeholder="Enter your name"
 *   required
 * />
 * ```
 * 
 * @example With icon and error
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   labelIcon={<Mail className="w-4 h-4" />}
 *   type="email"
 *   placeholder="your@email.com"
 *   error="Please enter a valid email"
 *   required
 * />
 * ```
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    (
        {
            label,
            labelIcon,
            required,
            error,
            helperText,
            size = 'md',
            leftIcon,
            rightIcon,
            containerClassName,
            labelClassName,
            className,
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className={cn('flex flex-col w-full', containerClassName)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'flex items-center gap-2 text-[16px] font-medium text-gray-700 dark:text-gray-300 mb-3',
                            labelClassName
                        )}
                    >
                        {labelIcon && (
                            <span className="text-[#00C4CC] shrink-0">{labelIcon}</span>
                        )}
                        <span>
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                    </label>
                )}

                {/* Input Container */}
                <div className="relative">
                    {/* Left Icon */}
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    {/* Input Field */}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={cn(
                            'w-full rounded-input border-2 transition-all duration-200',
                            'focus:outline-hidden focus:ring-0',
                            'bg-white dark:bg-slate-950',
                            'text-[#0B1F51] dark:text-white',
                            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                            SIZE_CLASSES[size],
                            leftIcon && 'pl-12',
                            rightIcon && 'pr-12',
                            error
                                ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                                : 'border-gray-200 dark:border-slate-700 focus:border-[#00C4CC]',
                            disabled && 'bg-gray-100 dark:bg-slate-800 cursor-not-allowed opacity-60',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                        {...props}
                    />

                    {/* Right Icon */}
                    {rightIcon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="text-red-500 text-[14px] mt-2 flex items-center gap-1.5"
                        role="alert"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zm0-6H7V4h2v2z" />
                        </svg>
                        {error}
                    </p>
                )}

                {/* Helper Text */}
                {helperText && !error && (
                    <p
                        id={`${inputId}-helper`}
                        className="text-gray-500 dark:text-gray-400 text-[14px] mt-2"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormField.displayName = 'FormField';

// ============================================================================
// TextArea Component
// ============================================================================

/**
 * TextArea - Unified textarea component with label and error handling
 * 
 * @example Basic usage
 * ```tsx
 * <TextArea
 *   label="Message"
 *   labelIcon={<MessageSquare className="w-4 h-4" />}
 *   placeholder="Tell us about your requirements..."
 *   required
 *   rows={6}
 * />
 * ```
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            label,
            labelIcon,
            required,
            error,
            helperText,
            rows = 4,
            containerClassName,
            labelClassName,
            className,
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className={cn('flex flex-col w-full', containerClassName)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={textareaId}
                        className={cn(
                            'flex items-center gap-2 text-[16px] font-medium text-gray-700 dark:text-gray-300 mb-3',
                            labelClassName
                        )}
                    >
                        {labelIcon && (
                            <span className="text-[#00C4CC] shrink-0">{labelIcon}</span>
                        )}
                        <span>
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                    </label>
                )}

                {/* TextArea Field */}
                <textarea
                    ref={ref}
                    id={textareaId}
                    rows={rows}
                    disabled={disabled}
                    className={cn(
                        'w-full px-6 py-4 rounded-input border-2 transition-all duration-200',
                        'focus:outline-hidden focus:ring-0 text-[16px] resize-y',
                        'bg-white dark:bg-slate-950',
                        'text-[#0B1F51] dark:text-white',
                        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                        error
                            ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                            : 'border-gray-200 dark:border-slate-700 focus:border-[#00C4CC]',
                        disabled && 'bg-gray-100 dark:bg-slate-800 cursor-not-allowed opacity-60',
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
                    {...props}
                />

                {/* Error Message */}
                {error && (
                    <p
                        id={`${textareaId}-error`}
                        className="text-red-500 text-[14px] mt-2 flex items-center gap-1.5"
                        role="alert"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zm0-6H7V4h2v2z" />
                        </svg>
                        {error}
                    </p>
                )}

                {/* Helper Text */}
                {helperText && !error && (
                    <p
                        id={`${textareaId}-helper`}
                        className="text-gray-500 dark:text-gray-400 text-[14px] mt-2"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

// ============================================================================
// SelectField Component
// ============================================================================

/**
 * SelectField - Premium select dropdown component using Radix UI
 * 
 * @example Basic usage
 * ```tsx
 * <SelectField
 *   label="State"
 *   labelIcon={<MapPin className="w-4 h-4" />}
 *   placeholder="Select your state"
 *   options={[
 *     { value: 'MH', label: 'Maharashtra' },
 *     { value: 'DL', label: 'Delhi' },
 *   ]}
 *   required
 * />
 * ```
 */
export const SelectField = forwardRef<HTMLButtonElement, Omit<SelectFieldProps, 'onChange'> & {
    onChange?: (value: string) => void;
}>(
    (
        {
            label,
            labelIcon,
            required,
            error,
            helperText,
            options,
            placeholder = "Select an option",
            containerClassName,
            labelClassName,
            className,
            disabled,
            id,
            value,
            onChange,
        },
        ref
    ) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className={cn('flex flex-col w-full', containerClassName)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={selectId}
                        className={cn(
                            'flex items-center gap-2 text-[16px] font-medium text-gray-700 dark:text-gray-300 mb-3',
                            labelClassName
                        )}
                    >
                        {labelIcon && (
                            <span className="text-[#00C4CC] shrink-0">{labelIcon}</span>
                        )}
                        <span>
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                    </label>
                )}

                {/* Radix UI Select */}
                <Select
                    value={value as string}
                    onValueChange={onChange}
                    disabled={disabled}
                >
                    <SelectTrigger
                        ref={ref}
                        className={cn(
                            'w-full !h-14 px-6 rounded-input border-2 justify-between text-left font-normal gap-3',
                            'bg-white dark:bg-slate-950',
                            'text-[#0B1F51] dark:text-white',
                            'hover:border-[#00C4CC]/50 dark:hover:border-[#00C4CC]/50',
                            'focus:ring-2 focus:ring-[#00C4CC]/20 focus:border-[#00C4CC]',
                            'transition-all duration-200',
                            error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-900/10'
                                : 'border-gray-200 dark:border-slate-700',
                            disabled && 'bg-gray-100 dark:bg-slate-800 cursor-not-allowed opacity-60',
                            !value && 'text-gray-400 dark:text-gray-500',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[280px]">
                        {options.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer rounded-lg hover:bg-[#00C4CC]/10 focus:bg-[#00C4CC]/10"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Error Message */}
                {error && (
                    <p
                        id={`${selectId}-error`}
                        className="text-red-500 text-[14px] mt-2 flex items-center gap-1.5"
                        role="alert"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zm0-6H7V4h2v2z" />
                        </svg>
                        {error}
                    </p>
                )}

                {/* Helper Text */}
                {helperText && !error && (
                    <p
                        id={`${selectId}-helper`}
                        className="text-gray-500 dark:text-gray-400 text-[14px] mt-2"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

SelectField.displayName = 'SelectField';

// ============================================================================
// Exports
// ============================================================================

export default FormField;
