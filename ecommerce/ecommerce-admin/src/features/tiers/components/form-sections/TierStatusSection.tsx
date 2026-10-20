import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFormContext, Controller } from 'react-hook-form';
import type { TierSchemaData } from '../../validation/tierSchema';

/**
 * Tier Status Section
 * Handles tier active/inactive status toggle
 */
export function TierStatusSection() {
    const { control } = useFormContext<TierSchemaData>();

    return (
        <Controller
            control={control}
            name="status"
            render={({ field }) => (
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div>
                        <Label htmlFor="tier-status" className="text-sm font-semibold text-slate-900">
                            Status
                        </Label>
                        <p className="text-xs text-slate-500 mt-1">
                            {field.value === 'active' ? 'Tier is visible and usable' : 'Tier is hidden from users'}
                        </p>
                    </div>
                    <Switch
                        id="tier-status"
                        checked={field.value === 'active'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                    />
                </div>
            )}
        />
    );
}
