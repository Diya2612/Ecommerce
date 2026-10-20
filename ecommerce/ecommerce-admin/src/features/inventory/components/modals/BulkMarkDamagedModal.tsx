import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PackageX, AlertCircle, ChevronDown, Check } from 'lucide-react';
import type { InventoryItem } from '../../types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkMarkDamagedModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: InventoryItem[];
    onConfirm: (data: any) => void;
}

import { DAMAGE_REASONS } from '../../constants/reasons';

export const BulkMarkDamagedModal: React.FC<BulkMarkDamagedModalProps> = ({
    isOpen,
    onClose,
    selectedItems,
    onConfirm
}) => {
    const [reason, setReason] = useState<string>('Physical damage');
    const [notes, setNotes] = useState('');
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleQuantityChange = (id: string, value: any) => {
        setQuantities(prev => ({
            ...prev,
            [id]: parseInt(value) || 0
        }));
    };

    const handleConfirm = () => {
        onConfirm({
            reason,
            notes,
            quantities
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 rounded-xl bg-white shadow-xl border-0">
                <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-shrink-0 flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                            <PackageX className="size-5 text-red-600" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                                Mark Damaged (Bulk)
                            </DialogTitle>
                            <p className="text-sm text-slate-500 font-medium">
                                {selectedItems.length} variants selected
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Damage Reason */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Damage Reason <span className="text-red-500">*</span>
                        </label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center justify-between h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-left font-medium text-slate-900">
                                    {reason}
                                    <ChevronDown className="size-4 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border-slate-200 shadow-lg rounded-lg p-1" align="start">
                                {DAMAGE_REASONS.map((r) => (
                                    <DropdownMenuItem
                                        key={r}
                                        onClick={() => setReason(r)}
                                        className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 cursor-pointer rounded-md"
                                    >
                                        {r}
                                        {reason === r && <Check className="size-4 text-slate-900" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Additional Notes
                        </label>
                        <Textarea
                            placeholder="Optional details about the damage..."
                            className="bg-white min-h-[80px] border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Damaged Quantities Table */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Damaged Quantities
                        </label>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 bg-opacity-100 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Variant</th>
                                            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-24">Available</th>
                                            <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-32">Damaged Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {selectedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-900 text-sm">
                                                    {item.productName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500">
                                                    {item.variant}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                    {item.available}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={item.available}
                                                        value={quantities[item.id] || ''}
                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        className="h-9 w-24 ml-auto text-right font-medium border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">
                            Damaged stock will be moved to "Blocked → Damaged" and cannot be sold. This action is logged permanently.
                        </p>
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
                        className="flex-1 h-11 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:shadow-red-500/20 rounded-lg border border-transparent transition-all"
                    >
                        <PackageX className="w-4 h-4 mr-2" />
                        Confirm Mark Damaged
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
