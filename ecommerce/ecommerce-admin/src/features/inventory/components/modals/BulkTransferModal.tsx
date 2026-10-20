import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Plus, Trash2, MapPin, Info } from 'lucide-react';
import { cn } from "@/lib/utils";
import type { InventoryItem } from '../../types';

interface BulkTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: InventoryItem[];
    onConfirm: (data: any) => void;
    locations: { id: string; name: string }[];
}

type TransferMode = 'single' | 'multiple';
type QuantityRule = 'full' | 'fixed' | 'manual';

export const BulkTransferModal: React.FC<BulkTransferModalProps> = ({
    isOpen,
    onClose,
    selectedItems,
    onConfirm,
    locations
}) => {
    const [mode, setMode] = useState<TransferMode>('single');

    // Single Destination State
    const [destination, setDestination] = useState<string>('');
    const [quantityRule, setQuantityRule] = useState<QuantityRule>('full');
    const [fixedQuantity, setFixedQuantity] = useState<number>(0);
    const [manualQuantities, setManualQuantities] = useState<Record<string, number>>({});

    // Multiple Destination State
    const [destinations, setDestinations] = useState<{ id: string; locationId: string; quantity: number }[]>([]);

    const totalAvailable = selectedItems.reduce((acc, item) => acc + item.available, 0);

    const handleAddDestination = () => {
        setDestinations([
            ...destinations,
            { id: Math.random().toString(36).substr(2, 9), locationId: '', quantity: 0 }
        ]);
    };

    const handleRemoveDestination = (id: string) => {
        setDestinations(destinations.filter(d => d.id !== id));
    };

    const handleDestinationChange = (id: string, field: 'locationId' | 'quantity', value: any) => {
        setDestinations(destinations.map(d =>
            d.id === id ? { ...d, [field]: value } : d
        ));
    };

    const calculateTotalTransferring = () => {
        if (mode === 'single') {
            if (quantityRule === 'full') return totalAvailable;
            if (quantityRule === 'fixed') return fixedQuantity * selectedItems.length;
            // Manual sum
            return Object.values(manualQuantities).reduce((a, b) => a + b, 0);
        }
        // Multiple
        // Here the logic implies we are distributing the *same* quantity type across locations? 
        // Or is it splitting the stock? The screenshot says "Distribute stock from X variants".
        // Usually bulk transfer to multiple destinations means splitting the source stock.
        // For simplicity based on screenshot "Quantity" input, it seems to be a flat number per destination?
        // Or maybe total quantity being moved? 
        // Let's assume the user enters Total Quantity to move to that destination, which is then split/taken from items?
        // Or maybe it's quantity PER item? 
        // The screenshot shows "Quantity" input next to location. 
        // Let's assume it's "Quantity per variant" for now or "Total Quantity" if it was a single item.
        // Given it's BULK, usually it means "Move 5 of EACH selected item to Location A" or "Move ALL selected items to Location A".
        // The screenshot design is a bit ambiguous for bulk multiple. 
        // "Total units transferring: 0". 
        // Let's assume the input is "Total units to send to this location" (which might be hard if items differ) OR "Quantity per item".
        // Let's go with "Sum of quantities assigned" for the summary.
        return destinations.reduce((acc, d) => acc + (d.quantity || 0), 0);
    };

    const totalTransferring = calculateTotalTransferring();
    const remainingAtSource = totalAvailable - totalTransferring;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 rounded-xl bg-white shadow-xl border-0">
                <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-shrink-0 flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-[#0E042F]/5 flex items-center justify-center">
                            <ArrowRightLeft className="size-5 text-[#0E042F]" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                                Bulk Transfer Stock
                            </DialogTitle>
                            <p className="text-sm text-slate-500 font-medium">
                                {selectedItems.length} variants selected for transfer
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Mode Tabs */}
                    <div className="flex gap-4 p-1 bg-slate-50 rounded-xl border border-slate-100">
                        <button
                            onClick={() => setMode('single')}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                mode === 'single'
                                    ? "bg-[#0E042F]/5 text-[#0E042F] shadow-sm ring-1 ring-[#0E042F]/10"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            )}
                        >
                            Single Destination
                        </button>
                        <button
                            onClick={() => setMode('multiple')}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                mode === 'multiple'
                                    ? "bg-[#0E042F]/5 text-[#0E042F] shadow-sm ring-1 ring-[#0E042F]/10"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            )}
                        >
                            Multiple Destinations
                        </button>
                    </div>

                    {mode === 'single' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Destination Location <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E042F]/20 focus:border-[#0E042F]"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                >
                                    <option value="">Select destination...</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Quantity Rule</label>
                                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={cn(
                                            "size-4 rounded-full border flex items-center justify-center",
                                            quantityRule === 'full' ? "border-[#0E042F]" : "border-slate-300"
                                        )}>
                                            {quantityRule === 'full' && <div className="size-2 rounded-full bg-[#0E042F]" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={quantityRule === 'full'} onChange={() => setQuantityRule('full')} />
                                        <span className="text-sm font-medium text-slate-700">Transfer full available quantity</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={cn(
                                            "size-4 rounded-full border flex items-center justify-center",
                                            quantityRule === 'fixed' ? "border-[#0E042F]" : "border-slate-300"
                                        )}>
                                            {quantityRule === 'fixed' && <div className="size-2 rounded-full bg-[#0E042F]" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={quantityRule === 'fixed'} onChange={() => setQuantityRule('fixed')} />
                                        <span className="text-sm font-medium text-slate-700">Transfer fixed quantity per variant</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={cn(
                                            "size-4 rounded-full border flex items-center justify-center",
                                            quantityRule === 'manual' ? "border-[#0E042F]" : "border-slate-300"
                                        )}>
                                            {quantityRule === 'manual' && <div className="size-2 rounded-full bg-[#0E042F]" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={quantityRule === 'manual'} onChange={() => setQuantityRule('manual')} />
                                        <span className="text-sm font-medium text-slate-700">Manually set quantity per variant</span>
                                    </label>
                                </div>

                                {quantityRule === 'fixed' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                                            Fixed Quantity Amount
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={fixedQuantity || ''}
                                            onChange={(e) => setFixedQuantity(parseInt(e.target.value) || 0)}
                                            placeholder="Enter quantity per item"
                                            className="max-w-[200px]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* List Preview */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="max-h-[200px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                                <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available</th>
                                                {quantityRule === 'manual' && (
                                                    <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-32">Transfer Qty</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {selectedItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-slate-900 block">{item.productName}</span>
                                                        <span className="text-xs text-slate-500">{item.variant}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                        {item.available}
                                                    </td>
                                                    {quantityRule === 'manual' && (
                                                        <td className="px-4 py-2 text-right">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={item.available}
                                                                value={manualQuantities[item.id] || ''}
                                                                onChange={(e) => setManualQuantities(prev => ({
                                                                    ...prev,
                                                                    [item.id]: parseInt(e.target.value) || 0
                                                                }))}
                                                                className="h-8 w-24 ml-auto text-right"
                                                            />
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'multiple' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="bg-[#0E042F]/5 border border-[#0E042F]/10 rounded-lg p-4 flex items-start gap-3">
                                <Info className="size-5 text-[#0E042F] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-[#0E042F]">
                                    Distribute stock from {selectedItems.length} variants across multiple locations. Total cannot exceed available stock.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Destinations</label>
                                    <Button
                                        onClick={handleAddDestination}
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#0E042F] hover:text-[#0E042F]/80 hover:bg-[#0E042F]/5 h-8 text-xs font-semibold"
                                    >
                                        <Plus className="size-3.5 mr-1.5" />
                                        Add Destination
                                    </Button>
                                </div>

                                {destinations.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-500">No destinations added yet. Click "Add Destination" to start.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {destinations.map((dest) => (
                                            <div key={dest.id} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                                                <div className="flex-1 relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                        <MapPin className="size-4" />
                                                    </div>
                                                    <select
                                                        value={dest.locationId}
                                                        onChange={(e) => handleDestinationChange(dest.id, 'locationId', e.target.value)}
                                                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0E042F] focus:ring-1 focus:ring-[#0E042F] transition-colors bg-white appearance-none"
                                                    >
                                                        <option value="">Select location...</option>
                                                        {locations.map(loc => (
                                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-32">
                                                    <Input
                                                        type="number"
                                                        placeholder="Quantity"
                                                        value={dest.quantity || ''}
                                                        onChange={(e) => handleDestinationChange(dest.id, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="h-10"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveDestination(dest.id)}
                                                    className="size-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Summary Box */}
                    <div className="bg-[#0E042F]/5 rounded-xl p-4 border border-[#0E042F]/10 space-y-2 mt-auto">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 font-medium">Total units transferring:</span>
                            <span className="text-[#0E042F] font-bold text-base">{totalTransferring}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 font-medium">Remaining at source:</span>
                            <span className="text-slate-900 font-bold">{remainingAtSource}</span>
                        </div>
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
                        onClick={() => onConfirm({ mode, destinations })}
                        className="flex-1 h-11 text-sm font-semibold bg-[#0E042F] hover:bg-[#0E042F]/90 text-white shadow-sm hover:shadow rounded-lg border border-transparent"
                    >
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Confirm Transfer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
