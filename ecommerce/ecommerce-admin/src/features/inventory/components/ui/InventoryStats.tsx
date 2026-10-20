import React from 'react';
import { Package, AlertTriangle, AlertCircle, Ban } from 'lucide-react';
import type { InventoryItem } from '../../types';

interface InventoryStatsProps {
    data: InventoryItem[];
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ data }) => {
    const totalItems = data.length;
    const lowStock = data.filter(item => item.available < 10 && item.available > 0).length;
    const outOfStock = data.filter(item => item.available === 0).length;
    const blockedItems = data.filter(item => item.blocked > 0).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Items</p>
                        <h3 className="text-2xl font-bold text-slate-900">{totalItems}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Low Stock</p>
                        <h3 className="text-2xl font-bold text-slate-900">{lowStock}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Out of Stock</p>
                        <h3 className="text-2xl font-bold text-slate-900">{outOfStock}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <Ban className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Blocked Items</p>
                        <h3 className="text-2xl font-bold text-slate-900">{blockedItems}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};
