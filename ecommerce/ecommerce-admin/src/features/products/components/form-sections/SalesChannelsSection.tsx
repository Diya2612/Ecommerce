import { Globe } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';
import { cn } from '@/lib/utils';

const salesChannelOptions = ['Web', 'POS', 'Marketplace', 'B2B'];

export function SalesChannelsSection() {
    const { control, setValue } = useFormContext<ProductSchemaData>();
    const currentChannels = useWatch({ control, name: 'salesChannels' }) || [];

    const handleToggle = (channel: string) => {
        let newChannels = [...currentChannels];

        if (newChannels.includes(channel)) {
            newChannels = newChannels.filter(c => c !== channel);
        } else {
            newChannels.push(channel);
        }

        setValue('salesChannels', newChannels, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <FormSection icon={Globe} title="Sales & Channels">
            <div className="space-y-3">
                {salesChannelOptions.map((channel) => {
                    const isSelected = currentChannels.includes(channel);

                    return (
                        <div
                            key={channel}
                            onClick={() => handleToggle(channel)}
                            className={cn(
                                "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                                isSelected
                                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-center mr-3 h-5 w-5 rounded-full border-2 transition-colors",
                                isSelected
                                    ? "border-[#4F46E5]"
                                    : "border-slate-300"
                            )}>
                                {isSelected && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]" />
                                )}
                            </div>
                            <span className="font-medium text-sm">{channel}</span>
                        </div>
                    );
                })}
            </div>
        </FormSection>
    );
}
