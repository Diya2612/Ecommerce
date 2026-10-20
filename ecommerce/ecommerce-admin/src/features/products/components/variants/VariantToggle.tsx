import { Switch } from '@/components/ui/switch';

interface VariantToggleProps {
    hasVariants: boolean;
    onToggle: (value: boolean) => void;
}

export function VariantToggle({ hasVariants, onToggle }: VariantToggleProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
                <h4 className="text-sm font-medium text-slate-900">
                    This product has variants
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                    Enable to add product variations
                </p>
            </div>
            <Switch checked={hasVariants} onCheckedChange={onToggle} />
        </div>
    );
}
