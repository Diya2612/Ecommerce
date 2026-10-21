'use client';

import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
    containerClassName?: string;
}

export const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
    ({ label, icon: Icon, error, className, containerClassName, required, ...props }, ref) => {
        return (
            <div className={containerClassName}>
                {label && (
                    <label className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3">
                        {Icon && <Icon className="w-4 h-4 text-[#00C4CC]" />}
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    required={required}
                    className={cn(
                        "w-full h-14 px-6 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px]",
                        error && "border-red-300 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

StyledInput.displayName = 'StyledInput';
