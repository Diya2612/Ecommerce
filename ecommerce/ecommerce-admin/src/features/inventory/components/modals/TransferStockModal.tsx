import React, { useState } from 'react';
import { ArrowRightLeft, X, MapPin, ChevronDown, Minus, Plus } from 'lucide-react';
import type { InventoryItem, Location } from '../../types';

interface TransferStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    currentLocationId: string;
    locations: Location[];
    onConfirm: (destinationId: string, quantity: number, reason: string) => void;
}

export const TransferStockModal: React.FC<TransferStockModalProps> = ({ isOpen, onClose, item, currentLocationId, locations, onConfirm }) => {
    const [destinationId, setDestinationId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [reason, setReason] = useState<string>('');

    if (!isOpen) return null;

    const availableLocations = locations.filter((loc) => loc.id !== currentLocationId);
    const maxQuantity = item.available;

    const handleConfirm = () => {
        if (destinationId && quantity > 0 && quantity <= maxQuantity && reason.trim()) {
            onConfirm(destinationId, quantity, reason);
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-slate-900/30 z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[20px] shadow-2xl border border-slate-200 overflow-hidden z-50">
                {/* Header */}
                <div className="p-5 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <ArrowRightLeft className="size-4 text-purple-700" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Transfer Stock</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <X className="size-5 text-slate-600" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-600">All transfers require destination, quantity, and reason</p>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Product Info */}
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <img
                                src={item.thumbnail}
                                alt={item.productName}
                                className="size-10 rounded-lg object-cover bg-slate-100"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{item.productName}</p>
                                <p className="text-xs text-slate-500">{item.variant} · {item.sku}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Available at current location:</span>
                            <span className="font-semibold text-slate-900">{item.available} units</span>
                        </div>
                    </div>

                    {/* Destination Location */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-2 block">
                            Destination Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={destinationId}
                                onChange={(e) => setDestinationId(e.target.value)}
                                className="w-full h-10 pl-10 pr-8 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none cursor-pointer"
                            >
                                <option value="">Select destination...</option>
                                {availableLocations.map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-2 block">
                            Quantity to Transfer <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Minus className="size-4" />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setQuantity(Math.max(1, Math.min(maxQuantity, val)));
                                }}
                                min={1}
                                max={maxQuantity}
                                className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-center text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                            <button
                                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                disabled={quantity >= maxQuantity}
                                className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="size-4" />
                            </button>
                            <button
                                onClick={() => setQuantity(maxQuantity)}
                                className="h-9 px-3 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                                Max
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Maximum: {maxQuantity} units</p>
                    </div>

                    {/* Transfer Preview */}
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-700">Remaining at source:</span>
                            <span className="font-semibold text-slate-900">{item.available - quantity} units</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">Arriving at destination:</span>
                            <span className="font-semibold text-purple-700">+{quantity} units</span>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-2 block">
                            Transfer Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Store replenishment, warehouse consolidation..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!destinationId || quantity <= 0 || quantity > maxQuantity || !reason.trim()}
                        className="flex-1 h-10 px-4 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
                    >
                        <ArrowRightLeft className="size-4" />
                        Confirm Transfer
                    </button>
                </div>
            </div>
        </>
    );
};
