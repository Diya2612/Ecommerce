/**
 * TierSelect Component
 * 
 * A reusable select component for tier/category selection with:
 * - Consistent styling across all tier levels
 * - Disabled state handling with appropriate placeholder
 * - Helper text for dependencies
 * - Error state handling
 */

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface TierOption {
    id: string;
    name: string;
}

export interface TierSelectProps {
    /** Unique ID for the select element */
    id: string;
    /** Display label for the select */
    label: string;
    /** Current selected value (tier ID) */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Available options for this tier */
    options: TierOption[];
    /** Whether this field is required */
    required?: boolean;
    /** Whether the select is disabled */
    disabled?: boolean;
    /** Placeholder text when no value is selected */
    placeholder?: string;
    /** Placeholder text when disabled */
    disabledPlaceholder?: string;
    /** Optional error message to display */
    error?: string;
    /** Optional helper text to display */
    helperText?: string;
    /** Loading state */
    isLoading?: boolean;
}

export function TierSelect({
    id,
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
    placeholder = 'Select category...',
    disabledPlaceholder = 'Select parent category first',
    error,
    helperText,
    isLoading = false,
}: TierSelectProps) {
    return (
        <div className="w-full">
            <Label htmlFor={id} className="text-sm font-medium text-slate-700 mb-2 block">
                {label}
                {required && <span className="text-amber-600 ml-1">*</span>}
            </Label>
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled || isLoading}
            >
                <SelectTrigger
                    id={id}
                    className={`rounded-xl ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''
                        } ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''
                        }`}
                >
                    <SelectValue
                        placeholder={disabled ? disabledPlaceholder : placeholder}
                    />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    {isLoading ? (
                        <div className="py-2 px-3 text-sm text-slate-500">
                            Loading categories...
                        </div>
                    ) : options.length > 0 ? (
                        options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.name}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="py-2 px-3 text-sm text-slate-500">
                            {disabled ? 'Select parent category first' : 'No categories available'}
                        </div>
                    )}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-red-400 text-xs mt-1.5">{error}</p>
            )}
            {!error && helperText && (
                <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
            )}
        </div>
    );
}
