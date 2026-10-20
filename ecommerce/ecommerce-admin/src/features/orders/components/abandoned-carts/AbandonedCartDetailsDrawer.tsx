import { X, Mail, Clock, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AbandonedCartDetailsDrawerProps } from '../../types';
import type { AbandonedOrderProduct } from '../../types';

export const AbandonedCartDetailsDrawer = ({
    cart,
    onClose,
    onSendEmail
}: AbandonedCartDetailsDrawerProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end">
            <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Cart Details</h3>
                            <p className="text-sm text-slate-600 mt-1">{cart.cartId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Customer Info */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Customer Information</h4>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-slate-600">Name</p>
                                <p className="text-sm font-medium text-slate-900">{cart.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Email</p>
                                <p className="text-sm font-medium text-slate-900">{cart.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Phone</p>
                                <p className="text-sm font-medium text-slate-900">{cart.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Cart Items</h4>
                        <div className="space-y-3">
                            {cart.products.map((product: AbandonedOrderProduct) => (
                                <div key={product.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                                        <p className="text-xs text-slate-600 mt-1">Quantity: {product.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        ₹{(product.price * product.quantity).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-700">Subtotal</p>
                            <p className="text-sm font-medium text-slate-900">
                                ₹{cart.cartValue.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-indigo-200">
                            <p className="text-sm font-semibold text-slate-900">Total</p>
                            <p className="text-lg font-bold text-indigo-900">
                                ₹{cart.cartValue.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    {/* Activity Info */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Activity</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="size-4 text-slate-400" />
                                <span className="text-slate-600">Abandoned: {cart.abandonedAt}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="size-4 text-slate-400" />
                                <span className="text-slate-600">Last Activity: {cart.lastActivity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {cart.channel === 'web' ? <Globe className="size-4 text-slate-400" /> : <Smartphone className="size-4 text-slate-400" />}
                                <span className="text-slate-600">Channel: {cart.channel === 'web' ? 'Web' : 'App'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200">
                    <Button
                        className="w-full bg-[#0e042f] hover:bg-[#0e042f]/90 text-white"
                        size="lg"
                        onClick={onSendEmail}
                        disabled={cart.recoveryStatus === 'recovered'}
                    >
                        <Mail className="size-4 mr-2" />
                        Send Recovery Email
                    </Button>
                </div>
            </div>
        </div>
    );
};
