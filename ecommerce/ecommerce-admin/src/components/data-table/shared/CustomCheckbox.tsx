/**
 * CustomCheckbox Component
 * Reusable checkbox component with custom styling
 * Used throughout the data-table for selection functionality
 */

import { memo } from 'react';
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/styling';

export interface CustomCheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Whether to show partial selection state (indeterminate) */
  partial?: boolean;
  /** Callback when checkbox state changes */
  onChange: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

/**
 * Custom checkbox component with purple theme
 */
const CustomCheckboxComponent: React.FC<CustomCheckboxProps> = ({
  checked,
  partial = false,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <div
      role="checkbox"
      aria-checked={partial ? 'mixed' : checked}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={disabled ? undefined : (e) => {
        e.stopPropagation();
        onChange();
      }}
      onKeyDown={
        disabled
          ? undefined
          : (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              onChange();
            }
          }
      }
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer',
        checked || partial
          ? 'bg-white border-purple-600'
          : 'bg-gray-50 border-gray-400 hover:border-gray-500 hover:bg-gray-100',
        className
      )}
    >
      {checked && (
        <Check size={12} className="text-purple-600" strokeWidth={4} />
      )}
      {partial && !checked && (
        <div className="w-2.5 h-2.5 bg-purple-600 rounded-sm" />
      )}
    </div>
  );
};

// Export memoized version
export const CustomCheckbox = memo(CustomCheckboxComponent);

CustomCheckbox.displayName = 'CustomCheckbox';
