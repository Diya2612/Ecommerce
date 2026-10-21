'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  finish?: string;
  unitPrice: string | number;
  totalPrice: number;
  image?: string;
}

interface PrintoCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
}

export const PrintoCartDrawer: React.FC<PrintoCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>('PRINTOFIRST');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const discountAmount = appliedPromo === 'PRINTOFIRST' ? Math.round(rawSubtotal * 0.15) : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);
  const freeShippingThreshold = 999;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - finalTotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PRINTOFIRST') {
      setAppliedPromo('PRINTOFIRST');
    }
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in-right overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#700895] text-white flex items-center justify-center font-bold text-sm">
              <ShoppingCart size={16} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Your Shopping Cart</h3>
              <p className="text-[11px] text-slate-500">{items.length} custom product(s)</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-100 text-xs">
          {freeShippingRemaining > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-purple-900 font-semibold">
                <span>Add ₹{freeShippingRemaining} more for FREE shipping!</span>
                <span>Threshold: ₹{freeShippingThreshold}</span>
              </div>
              <div className="w-full h-1.5 bg-purple-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#700895] transition-all"
                  style={{ width: `${Math.min(100, (finalTotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <Truck size={14} />
              <span>You have unlocked FREE Pan-India Delivery!</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-[#700895] flex items-center justify-center mx-auto">
                <ShoppingCart size={28} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Your cart is currently empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Discover our bestselling visiting cards, personalized drinkware, and custom apparel!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                  <div className="text-[11px] text-slate-500 space-x-2 mt-0.5">
                    <span>Qty: <strong>{item.quantity}</strong></span>
                    {item.finish && <span>• Finish: <strong>{item.finish}</strong></span>}
                  </div>
                  <div className="text-xs font-black text-[#700895] mt-1">
                    ₹{item.totalPrice}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Checkout Section */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (e.g. PRINTOFIRST)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#700895]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Apply
              </button>
            </form>

            {appliedPromo && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span className="font-semibold flex items-center gap-1">
                  <Tag size={12} /> Code PRINTOFIRST applied (-15%)
                </span>
                <span className="font-bold">-₹{discountAmount}</span>
              </div>
            )}

            {/* Subtotal summary */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{rawSubtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>First Order Discount:</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-emerald-600 font-semibold">
                  {freeShippingRemaining === 0 ? 'FREE' : '₹99'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-xl text-[#700895]">₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#700895] to-[#8B1FAE] hover:from-[#5A0678] hover:to-[#700895] text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Fast Checkout</span>
              <ArrowRight size={16} />
            </button>

            {checkoutSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} />
                <span>Order placed successfully! Redirecting to confirmation...</span>
              </div>
            )}

            <div className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-600" /> 256-Bit SSL Encrypted
              </span>
              <span>•</span>
              <span>GST Input Credit Supported</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
