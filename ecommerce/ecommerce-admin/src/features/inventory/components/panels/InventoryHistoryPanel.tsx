import React from 'react';
import { PackageCheck, FileText, ArrowRightLeft, PackageX, Archive, X, Truck, MapPin, ChevronRight, Calendar, User, Loader2 } from 'lucide-react';
import { useInventoryHistory } from '../../hooks/useInventory';

interface InventoryHistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    inventoryId: string;
}

export const InventoryHistoryPanel: React.FC<InventoryHistoryPanelProps> = ({ isOpen, onClose, itemName, inventoryId }) => {
    // Fetch history from API
    const { data: history = [], isLoading, isError } = useInventoryHistory(inventoryId);

    if (!isOpen) return null;

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'Received':
                return <PackageCheck className="size-4" />;
            case 'Adjusted':
                return <FileText className="size-4" />;
            case 'Transferred':
                return <ArrowRightLeft className="size-4" />;
            case 'Damaged':
                return <PackageX className="size-4" />;
            case 'Returned':
                return <Archive className="size-4" />;
            default:
                return <FileText className="size-4" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'Received':
                return 'bg-emerald-50 text-emerald-600';
            case 'Adjusted':
                return 'bg-blue-50 text-blue-600';
            case 'Transferred':
                return 'bg-purple-50 text-purple-600';
            case 'Damaged':
                return 'bg-red-50 text-red-600';
            case 'Returned':
                return 'bg-amber-50 text-amber-600';
            default:
                return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-slate-900/20 z-40" onClick={onClose} />

            {/* Side Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-slate-900 font-semibold">Inventory History</h2>
                            <p className="text-xs text-slate-500 mt-1">Read-only audit trail</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <X className="size-5 text-slate-600" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-600">{itemName}</p>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="size-8 text-slate-400 animate-spin mb-3" />
                            <p className="text-sm text-slate-500">Loading history...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-sm text-red-600">Failed to load history</p>
                            <p className="text-xs text-slate-500 mt-1">Please try again later</p>
                        </div>
                    )}

                    {!isLoading && !isError && history.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <FileText className="size-12 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-600">No history available</p>
                            <p className="text-xs text-slate-500 mt-1">Changes will appear here</p>
                        </div>
                    )}

                    {!isLoading && !isError && history.length > 0 && (
                        <div className="space-y-6">
                            {history.map((entry, index) => (
                                <div key={entry.id} className="relative">
                                    {/* Timeline connector */}
                                    {index < history.length - 1 && (
                                        <div className="absolute left-5 top-12 bottom-0 w-px bg-slate-200" />
                                    )}

                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`size-10 rounded-lg ${getActionColor(entry.action)} flex items-center justify-center shrink-0`}
                                        >
                                            {getActionIcon(entry.action)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{entry.action}</h3>

                                                    {/* PO Reference */}
                                                    {entry.action === 'Received' && entry.poReference && (
                                                        <p className="text-sm text-indigo-600 mt-0.5 flex items-center gap-1">
                                                            <Truck className="size-3" />
                                                            {entry.poReference} · {entry.supplierName}
                                                        </p>
                                                    )}

                                                    {/* Transfer Details */}
                                                    {entry.action === 'Transferred' && entry.fromLocation && entry.toLocation && (
                                                        <div className="mt-1 flex items-center gap-2 text-sm">
                                                            <div className="flex items-center gap-1 text-slate-600">
                                                                <MapPin className="size-3" />
                                                                <span className="text-xs">From:</span>
                                                                <span className="font-medium">{entry.fromLocation}</span>
                                                            </div>
                                                            <ChevronRight className="size-3 text-slate-400" />
                                                            <div className="flex items-center gap-1 text-slate-600">
                                                                <MapPin className="size-3" />
                                                                <span className="text-xs">To:</span>
                                                                <span className="font-medium">{entry.toLocation}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="text-sm text-slate-600 mt-0.5">{entry.reason}</p>
                                                </div>
                                                <span
                                                    className={`text-sm font-semibold ${entry.quantityDelta > 0 ? 'text-emerald-600' : 'text-red-600'
                                                        }`}
                                                >
                                                    {entry.quantityDelta > 0 ? '+' : ''}
                                                    {entry.quantityDelta}
                                                </span>
                                            </div>

                                            {/* Quantity change */}
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-600 mb-3">
                                                <span className="font-medium">{entry.beforeQty}</span>
                                                <ChevronRight className="size-3" />
                                                <span className="font-medium text-indigo-600">{entry.afterQty}</span>
                                            </div>

                                            {/* Metadata */}
                                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {entry.date}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="size-3" />
                                                    {entry.user}
                                                </div>
                                                {!entry.fromLocation && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="size-3" />
                                                        {entry.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
