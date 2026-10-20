import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import type { TierSchemaData } from '../../validation/tierSchema';

/**
 * Tier Basic Info Section
 * Handles tier name, code/slug, and description
 * Styled to match exact UI fidelity
 */
export function TierBasicInfoSection() {
    const { register, formState: { errors } } = useFormContext<TierSchemaData>();

    const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wider";
    const inputClass = "bg-slate-50 border-slate-200";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Tier Name */}
            <div className="space-y-2">
                <Label htmlFor="tier-name" className={labelClass}>
                    TIER NAME <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="tier-name"
                    {...register('name')}
                    placeholder="e.g. Electronics"
                    className={`${inputClass} ${errors.name ? 'border-red-300' : ''}`}
                />
                {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
            </div>

            {/* Tier Code */}
            <div className="space-y-2">
                <Label htmlFor="tier-code" className={labelClass}>
                    TIER CODE
                </Label>
                <Input
                    id="tier-code"
                    {...register('code')}
                    placeholder="Auto-generated if empty"
                    className={`font-mono ${inputClass} ${errors.code ? 'border-red-300' : ''}`}
                />
                {errors.code && (
                    <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="tier-description" className={labelClass}>
                    DESCRIPTION
                </Label>
                <Input
                    id="tier-description"
                    {...register('description')}
                    placeholder="Enter description..."
                    className={inputClass}
                />
                {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                )}
            </div>
        </div>
    );
}
