import { ShoppingCart } from 'lucide-react';
import type { BundleItem } from '../types/bundle.types';

interface BundlePreviewProps {
    title: string;
    description: string;
    items: BundleItem[];
    calculateTotalPrice: () => number;
    calculateDiscount: () => number;
}

export const BundlePreview = ({
    title,
    description,
    items,
    calculateTotalPrice,
    calculateDiscount
}: BundlePreviewProps) => {
    const mandatoryItems = items.filter(item => !item.isOptional);
    const optionalItems = items.filter(item => item.isOptional);
    const discount = calculateDiscount();
    const totalPrice = calculateTotalPrice();

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-8 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="size-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="size-5 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Live Bundle Preview</h2>
            </div>

            <div className="bg-white rounded-lg p-6 space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{title || 'Bundle Title'}</h3>
                    <p className="text-sm text-slate-600 mt-1">{description || 'Bundle description will appear here'}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Included Products:</p>
                    <div className="space-y-1.5">
                        {mandatoryItems.length > 0 ? (
                            mandatoryItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-900">• {item.productName} (x{item.quantity})</span>
                                    <span className="text-slate-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 italic">No mandatory products added</p>
                        )}
                    </div>
                </div>

                {optionalItems.length > 0 && (
                    <div className="border-t border-slate-200 pt-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Optional Add-ons:</p>
                        <div className="space-y-1.5">
                            {optionalItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">○ {item.productName}</span>
                                    <span className="text-slate-500">₹{item.price.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t border-slate-200 pt-4 space-y-2">
                    {discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Discount</span>
                            <span className="text-green-600 font-semibold">-₹{discount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">Bundle Price</span>
                        <span className="text-2xl font-bold text-slate-900">₹{totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
