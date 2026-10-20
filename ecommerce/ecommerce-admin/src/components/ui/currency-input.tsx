/**
 * CurrencyInput Component
 * 
 * A reusable input component for currency values with:
 * - Currency symbol (₹) prefix
 * - Automatic validation for positive numbers
 * - Prevention of invalid input (negative, 'e' character)
 * - Consistent styling across forms
 * - Error state handling
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { preventInvalidNumberInput } from '@/utils';

export interface CurrencyInputProps {
    /** Unique ID for the input element */
    id: string;
    /** Display label for the input */
    label: string;
    /** Current value */
    value: string | number;
    /** Change handler */
    onChange: (value: string) => void;
    /** Optional placeholder text */
    placeholder?: string;
    /** Whether this field is required */
    required?: boolean;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Whether the input is read-only */
    readOnly?: boolean;
    /** Optional error message to display */
    error?: string;
    /** Optional helper text to display */
    helperText?: string;
    /** Additional CSS classes for the input */
    className?: string;
    /** Minimum value (default: 0) */
    min?: number;
    /** Step for increment/decrement (default: 0.01) */
    step?: string;
    /** Currency symbol to display (default: ₹) */
    currencySymbol?: string;
}

export function CurrencyInput({
    id,
    label,
    value,
    onChange,
    placeholder = '0.00',
    required = false,
    disabled = false,
    readOnly = false,
    error,
    helperText,
    className = '',
    min = 0,
    step = '0.01',
    currencySymbol = '₹',
}: CurrencyInputProps) {
    return (
        <div className="w-full">
            <Label htmlFor={id} className="text-sm font-medium text-slate-700 mb-2 block">
                {label}
                {required && <span className="text-amber-600 ml-1">*</span>}
            </Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {currencySymbol}
                </span>
                <Input
                    id={id}
                    type="number"
                    step={step}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`pl-7 rounded-xl ${readOnly ? 'bg-slate-50 cursor-not-allowed border-0' : ''
                        } ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''
                        } ${className}`}
                    placeholder={placeholder}
                    min={min}
                    disabled={disabled}
                    readOnly={readOnly}
                    onKeyDown={preventInvalidNumberInput}
                />
            </div>
            {error && (
                <p className="text-red-400 text-xs mt-1.5">{error}</p>
            )}
            {!error && helperText && (
                <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
            )}
        </div>
    );
}
