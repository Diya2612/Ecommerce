import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { UseFormRegister } from 'react-hook-form';
import type { ProductSchemaData } from '../../validation/productSchema';

interface FaqItemProps {
    id: string;
    index: number;
    question: string;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    onRemove: (index: number, e: React.MouseEvent) => void;
    register: UseFormRegister<ProductSchemaData>;
    errors?: any;
}

export function FaqItem({
    id,
    index,
    question,
    isExpanded,
    onToggle,
    onRemove,
    register,
    errors
}: FaqItemProps) {
    return (
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden transition-all duration-200">
            {/* FAQ Header (Always Visible) */}
            <div
                onClick={() => onToggle(id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                        {index + 1}
                    </div>
                    <h3 className="text-sm font-medium text-slate-700 truncate">
                        {question || <span className="text-slate-400 italic">No question entered...</span>}
                    </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button
                        type="button"
                        onClick={(e) => onRemove(index, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete FAQ"
                    >
                        <Trash2 className="size-4" />
                    </button>
                    <div className="p-2 text-slate-400">
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                </div>
            </div>

            {/* FAQ Content (Conditional) */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-0">
                    <div className="pt-4">
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Question
                        </Label>
                        <Input
                            id={`faqs.${index}.question`}
                            {...register(`faqs.${index}.question` as const)}
                            className="rounded-lg bg-white"
                            placeholder="Enter question..."
                            onClick={(e) => e.stopPropagation()}
                        />
                        {errors?.faqs?.[index]?.question && (
                            <p className="text-red-400 text-xs mt-1.5">{errors.faqs[index]?.question?.message}</p>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Answer
                        </Label>
                        <Textarea
                            id={`faqs.${index}.answer`}
                            {...register(`faqs.${index}.answer` as const)}
                            rows={3}
                            className="rounded-lg resize-none bg-white"
                            placeholder="Enter answer..."
                            onClick={(e) => e.stopPropagation()}
                        />
                        {errors?.faqs?.[index]?.answer && (
                            <p className="text-red-400 text-xs mt-1.5">{errors.faqs[index]?.answer?.message}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
