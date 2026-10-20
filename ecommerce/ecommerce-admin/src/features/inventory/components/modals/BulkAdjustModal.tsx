import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";
import type { InventoryItem } from '../../types';

interface BulkAdjustModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: InventoryItem[];
    onConfirm: (data: {
        mode: 'delta' | 'absolute';
        deltaValue?: number;
        absoluteValues?: Record<string, number>;
        reason: string;
    }) => void;
}

type AdjustmentMode = 'delta' | 'absolute';

export const BulkAdjustModal: React.FC<BulkAdjustModalProps> = ({
    isOpen,
    onClose,
    selectedItems,
    onConfirm
}) => {
    const [mode, setMode] = useState<AdjustmentMode>('delta');
    const [deltaValue, setDeltaValue] = useState<number>(0);
    const [absoluteValues, setAbsoluteValues] = useState<Record<string, number>>({});
    const [reason, setReason] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode('delta');
            setDeltaValue(0);
            setAbsoluteValues({});
            setReason('');
        }
    }, [isOpen]);

    const handleAbsoluteChange = (itemId: string, value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            setAbsoluteValues(prev => ({
                ...prev,
                [itemId]: numValue
            }));
        } else {
            // Handle empty input or invalid number by removing the key or setting to 0 depending on UX preference
            // Here we'll just not update if it's not a number, strict handling
            if (value === '') {
                const newValues = { ...absoluteValues };
                delete newValues[itemId];
                setAbsoluteValues(newValues);
            }
        }
    };

    const handleConfirm = () => {
        onConfirm({
            mode,
            deltaValue: mode === 'delta' ? deltaValue : undefined,
            absoluteValues: mode === 'absolute' ? absoluteValues : undefined,
            reason
        });
        onClose();
    };

    const calculateNewValue = (current: number) => {
        return Math.max(0, current + deltaValue);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px] max-h-[70vh] overflow-hidden flex flex-col p-0 gap-0 rounded-xl bg-white shadow-xl border-0">
                <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-shrink-0 flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-[#0E042F]/5 flex items-center justify-center">
                            <FileText className="size-5 text-[#0E042F]" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                                Bulk Adjust Inventory
                            </DialogTitle>
                            <p className="text-sm text-slate-500 font-medium">
                                {selectedItems.length} variants selected
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Adjustment Mode Tabs */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Adjustment Mode</label>
                        <div className="flex p-1 bg-slate-100/80 rounded-lg gap-1">
                            <button
                                onClick={() => setMode('delta')}
                                className={cn(
                                    "flex-1 py-1.5 text-sm font-semibold rounded-md transition-all",
                                    mode === 'delta'
                                        ? "bg-[#0E042F]/5 text-[#0E042F] shadow-sm border border-[#0E042F]/10"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                )}
                            >
                                Plus / Minus Delta
                            </button>
                            <button
                                onClick={() => setMode('absolute')}
                                className={cn(
                                    "flex-1 py-1.5 text-sm font-semibold rounded-md transition-all",
                                    mode === 'absolute'
                                        ? "bg-[#0E042F]/5 text-[#0E042F] shadow-sm border border-[#0E042F]/10"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                )}
                            >
                                Absolute Value
                            </button>
                        </div>
                    </div>

                    {mode === 'delta' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Delta Value</label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 bg-slate-50 hover:bg-slate-100"
                                        onClick={() => setDeltaValue(prev => prev - 1)}
                                    >
                                        <Minus className="size-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        value={deltaValue}
                                        onChange={(e) => setDeltaValue(parseInt(e.target.value) || 0)}
                                        className="h-10 text-center font-medium bg-white"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 bg-slate-50 hover:bg-slate-100"
                                        onClick={() => setDeltaValue(prev => prev + 1)}
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">Positive values add stock, negative values subtract</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Preview Changes</label>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                                <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">Current</th>
                                                <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">New</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {selectedItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-semibold text-slate-900 block">{item.productName}</span>
                                                        <span className="text-xs text-slate-500">{item.variant}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-slate-600 font-medium">
                                                        {item.available}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                        {calculateNewValue(item.available)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'absolute' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Preview Changes</label>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">Current</th>
                                            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-32">Set To</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {selectedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-semibold text-slate-900 block">{item.productName}</span>
                                                    <span className="text-xs text-slate-500">{item.variant}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-slate-600 font-medium">
                                                    {item.available}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        value={absoluteValues[item.id] !== undefined ? absoluteValues[item.id] : ''}
                                                        onChange={(e) => handleAbsoluteChange(item.id, e.target.value)}
                                                        className="h-8 w-24 ml-auto text-right font-medium"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            placeholder="e.g., Physical count correction, data migration..."
                            className="bg-white min-h-[80px]"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center gap-3 mt-auto bg-white rounded-b-xl">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-11 text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1 h-11 text-sm font-semibold bg-[#0E042F] hover:bg-[#0E042F]/90 text-white shadow-sm hover:shadow rounded-lg border border-transparent"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Confirm Adjustment
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
