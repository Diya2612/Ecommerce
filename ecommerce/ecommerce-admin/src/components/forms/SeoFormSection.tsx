import { FileText, Link as LinkIcon, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSection } from '@/components/forms';
import { useFormContext, useWatch } from 'react-hook-form';
import { openStorefrontPreview } from '@/utils/url-helpers';
import { cn } from '@/lib/utils';

export interface SeoFormSectionProps {
    /** Base path for the resource (e.g., 'products', 'blogs') */
    resourcePath: string;
    /** Whether the URL field is read-only (e.g., in edit mode) */
    readOnlyUrl?: boolean;
    /** Optional field name overrides if using RHF */
    fieldMapping?: {
        url?: string;
        title?: string;
        description?: string;
        slug?: string;
    };
    /** custom title for the section */
    title?: string;
    /** Controlled props for non-RHF usage */
    values?: {
        url?: string;
        title?: string;
        description?: string;
        slug?: string;
    };
    onChange?: (field: string, value: string) => void;
}

/**
 * Helper component to safely use useWatch only when context is available
 */
function RHFWatcher({ control, names, render }: { control: any, names: string[], render: (values: any[]) => React.ReactElement }) {
    const values = useWatch({ control, name: names });
    return render(values || []);
}

/**
 * SeoFormSection - A global component for managing SEO metadata across different features.
 * Integrates with react-hook-form context and provides a live SERP preview.
 */
export function SeoFormSection({
    resourcePath,
    readOnlyUrl = false,
    fieldMapping = {},
    title = "SEO & URL",
    values,
    onChange
}: SeoFormSectionProps) {
    const context = useFormContext();

    // Default field names
    const urlField = fieldMapping.url || 'productUrl';
    const titleField = fieldMapping.title || 'metaTitle';
    const descriptionField = fieldMapping.description || 'metaDescription';
    const slugField = fieldMapping.slug || 'slug';

    const renderUI = (watchedValues: any[]) => {
        const [urlRHF, titleRHF, descriptionRHF, slugRHF] = watchedValues;

        // Use controlled values if provided, otherwise fallback to RHF
        const urlValue = values?.url ?? urlRHF ?? '';
        const titleValue = values?.title ?? titleRHF ?? '';
        const descriptionValue = values?.description ?? descriptionRHF ?? '';
        const slugValue = values?.slug ?? slugRHF ?? '';

        const handlePreview = () => {
            // Prefer slug if available, fallback to URL handle
            const activeSlug = slugValue || urlValue;
            openStorefrontPreview(resourcePath, activeSlug);
        };

        const handleFieldChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const val = e.target.value;
            if (onChange) {
                onChange(field, val);
            }
        };

        return (
            <FormSection icon={FileText} title={title}>
                {/* URL / Slug Field */}
                <div>
                    <Label htmlFor={urlField} className="text-sm font-medium text-slate-700 mb-2 block">
                        {title.includes('Blog') ? 'Meta URL' : 'Handle / URL'} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-icon-muted" />
                        <Input
                            id={urlField}
                            {... (context ? context.register(urlField) : {})}
                            value={context ? undefined : urlValue}
                            onChange={context ? undefined : handleFieldChange('url')}
                            className={cn(
                                "pl-9 rounded-xl",
                                readOnlyUrl && "bg-slate-100 text-slate-500 cursor-not-allowed"
                            )}
                            placeholder="url-handle-slug"
                            readOnly={readOnlyUrl}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 font-sans">
                        Public URL: /{resourcePath}/{urlValue || 'handle'}
                    </p>
                </div>

                {/* Meta Title */}
                <div>
                    <Label htmlFor={titleField} className="text-sm font-medium text-slate-700 mb-2 block">
                        Meta Title
                    </Label>
                    <Input
                        id={titleField}
                        {... (context ? context.register(titleField) : {})}
                        value={context ? undefined : titleValue}
                        onChange={context ? undefined : handleFieldChange('title')}
                        className="rounded-xl"
                        placeholder="SEO title for search engines"
                        maxLength={70}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-slate-500">
                            {titleValue?.length || 0}/60 characters recommended
                        </p>
                        {titleValue?.length > 60 && (
                            <p className="text-[10px] text-amber-600 font-medium">Potential truncation</p>
                        )}
                    </div>
                </div>

                {/* Meta Description */}
                <div>
                    <Label htmlFor={descriptionField} className="text-sm font-medium text-slate-700 mb-2 block">
                        Meta Description
                    </Label>
                    <Textarea
                        id={descriptionField}
                        {... (context ? context.register(descriptionField) : {})}
                        value={context ? undefined : descriptionValue}
                        onChange={context ? undefined : handleFieldChange('description')}
                        rows={3}
                        className="rounded-xl resize-none"
                        placeholder="Brief description for search results"
                        maxLength={200}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-slate-500">
                            {descriptionValue?.length || 0}/160 characters recommended
                        </p>
                        {descriptionValue?.length > 160 && (
                            <p className="text-[10px] text-amber-600 font-medium">Potential truncation</p>
                        )}
                    </div>
                </div>

                {/* SERP Preview */}
                <div className="space-y-2 mt-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-slate-700 flex items-center gap-1.5">
                            <Globe className="size-3.5 text-slate-400" />
                            Search Engine Listing Preview
                        </Label>
                    </div>
                    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">S</div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-900 leading-none">anantenterprises.com</span>
                                    <span className="text-[10px] text-slate-500 leading-tight">https://anantenterprises.com › {resourcePath}</span>
                                </div>
                            </div>
                            <p
                                className="text-[15px] text-blue-700 hover:underline cursor-pointer font-medium leading-tight"
                                onClick={handlePreview}
                            >
                                {urlValue || 'handle'} › {titleValue || 'Title'}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {descriptionValue || 'A compelling meta description helps improve click-through rates from search engines.'}
                            </p>
                        </div>
                    </div>
                </div>
            </FormSection>
        );
    };

    if (context) {
        return (
            <RHFWatcher
                control={context.control}
                names={[urlField, titleField, descriptionField, slugField]}
                render={renderUI}
            />
        );
    }

    return renderUI([]);
}
