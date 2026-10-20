import React, { useState, useEffect } from 'react';
import { Minus, Plus, ChevronRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdjustmentReason } from '../../types';
import { ADJUSTMENT_REASONS } from '../../constants/reasons';
import { createPortal } from 'react-dom';

interface QuantityStepperProps {
    value: number;
    onChange: (value: number) => void;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    originalValue: number;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({ value, onChange, onConfirm, onCancel, originalValue }) => {
    const [reason, setReason] = useState<AdjustmentReason>('Physical count correction');
    const [otherReason, setOtherReason] = useState('');

    const reasons = ADJUSTMENT_REASONS;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    useEffect(() => {
        // Prevent body scroll when modal is open
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const modal = (
        <div 
            className="fixed inset-x-4 bottom-6 md:fixed md:inset-0 md:flex md:items-center md:justify-center bg-black/10 md:bg-black/20 md:backdrop-blur-sm w-auto md:w-auto bg-white rounded-[20px] shadow-2xl border border-slate-200 overflow-hidden z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-200 md:zoom-in-95"
            onClick={handleBackdropClick}
        >
            <div 
                className="md:w-80 md:max-w-sm md:bg-white md:rounded-[20px] md:shadow-2xl md:border md:border-slate-200 md:overflow-hidden md:text-left"
                onClick={e => e.stopPropagation()}
            >
            <div className="p-5 bg-slate-50 border-b border-slate-200 text-left">
                <h3 className="font-semibold text-slate-900 mb-1 text-left">Adjust Inventory</h3>
                <p className="text-xs text-slate-600">All changes require a reason and are logged</p>
            </div>

            <div className="p-5 space-y-4 text-left">
                {/* Quantity Adjuster */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">New Quantity</label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onChange(Math.max(0, value - 1))}
                            className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                        >
                            <Minus className="size-4" />
                        </button>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 h-9 px-3 border border-slate-200 rounded-lg text-center text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        />
                        <button
                            onClick={() => onChange(value + 1)}
                            className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Before/After Display */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                        <p className="text-xs text-slate-500">Before</p>
                        <p className="text-sm font-semibold text-slate-900">{originalValue}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                    <div>
                        <p className="text-xs text-slate-500">After</p>
                        <p className="text-sm font-semibold text-indigo-600">{value}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Change</p>
                        <p
                            className={`text-sm font-semibold ${value > originalValue
                                ? 'text-emerald-600'
                                : value < originalValue
                                    ? 'text-red-600'
                                    : 'text-slate-600'
                                }`}
                        >
                            {value > originalValue ? '+' : ''}
                            {value - originalValue}
                        </p>
                    </div>
                </div>

                {/* Reason Selector */}
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                        Reason <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={reason}
                        onValueChange={(value) => setReason(value as AdjustmentReason)}
                    >
                        <SelectTrigger className="w-full h-9 rounded-lg border-slate-200 bg-white text-slate-900 focus:ring-indigo-500/20 focus:border-indigo-400">
                            <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl z-[10000]">
                            {reasons.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Other Reason Input */}
                {reason === 'Other' && (
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-2 block">Specify Reason</label>
                        <input
                            type="text"
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            placeholder="Enter reason..."
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 h-9 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        const finalReason = reason === 'Other' ? `Other: ${otherReason.trim()}` : reason;
                        onConfirm(finalReason);
                    }}
                    disabled={value === originalValue || (reason === 'Other' && !otherReason.trim())}
                    className="flex-1 h-9 px-4 text-sm font-medium text-white bg-[#0E042F] hover:bg-[#1a0852] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg"
                >
                    Confirm
                </button>
            </div>
            </div>
        </div>
    );

    // Portaling ensures the modal appears above all other elements (fixes mobile clipping)
    if (typeof document !== 'undefined') {
        return createPortal(modal, document.body);
    }

    return modal;
};
