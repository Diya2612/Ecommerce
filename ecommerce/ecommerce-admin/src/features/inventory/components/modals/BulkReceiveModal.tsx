import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus } from 'lucide-react';
import type { InventoryItem } from '../../types';

interface BulkReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: InventoryItem[];
    onConfirm: (data: { poNumber: string; grnId: string; quantities: Record<string, number> }) => void;
}

export const BulkReceiveModal: React.FC<BulkReceiveModalProps> = ({
    isOpen,
    onClose,
    selectedItems,
    onConfirm
}) => {
    const [poNumber, setPoNumber] = useState('');
    const [grnId, setGrnId] = useState('');
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleQuantityChange = (itemId: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setQuantities(prev => ({
            ...prev,
            [itemId]: numValue
        }));
    };

    const handleConfirm = () => {
        onConfirm({
            poNumber,
            grnId,
            quantities
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1000px] max-h-[70vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl bg-white shadow-xl border-0">
                <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-shrink-0 flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-[#0E042F]/5 flex items-center justify-center border border-[#0E042F]/10">
                            <PackagePlus className="size-5 text-[#0E042F]" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                                Receive Stock (Bulk)
                            </DialogTitle>
                            <p className="text-sm text-slate-500 font-medium">
                                {selectedItems.length} variants selected
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                    {/* Header Inputs */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">PO Number (Optional)</label>
                            <Input
                                placeholder="PO-12345"
                                value={poNumber}
                                onChange={(e) => setPoNumber(e.target.value)}
                                className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">GRN ID (Optional)</label>
                            <Input
                                placeholder="GRN-67890"
                                value={grnId}
                                onChange={(e) => setGrnId(e.target.value)}
                                className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Receive Quantities</h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[30%]">Product</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">Variant</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[25%]">SKU</th>
                                        <th className="px-5 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[25%]">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {selectedItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-slate-900 block">{item.productName}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-slate-600 font-medium">{item.variant}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-mono text-slate-500 font-medium tracking-tight">{item.sku}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    value={quantities[item.id] || ''}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    className="h-9 w-24 mx-auto text-center font-medium border-slate-200 focus:ring-[#0E042F]/20 focus:border-[#0E042F]"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center gap-3 mt-auto bg-white rounded-b-2xl">
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
                        <PackagePlus className="w-4 h-4 mr-2" />
                        Confirm Receive
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
