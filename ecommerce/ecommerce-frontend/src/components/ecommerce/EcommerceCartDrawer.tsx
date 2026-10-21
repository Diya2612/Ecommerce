'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Product } from './EcommerceData';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

interface EcommerceCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const EcommerceCartDrawer: React.FC<EcommerceCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discountAmount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 999 || items.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const freeShippingThreshold = 999;
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'NEXUS3D') {
      setPromoApplied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white text-slate-900 shadow-2xl flex flex-col h-full z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-black tracking-tight text-slate-900">Your Cart</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {items.reduce((acc, it) => acc + it.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="px-4 sm:px-6 py-3 bg-purple-50/70 border-b border-purple-100">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-700">
            <span>
              {subtotal >= freeShippingThreshold ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Free Express Shipping
                  Unlocked!
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="text-purple-600">
                    ₹{(freeShippingThreshold - subtotal).toLocaleString('en-IN')}
                  </strong>{' '}
                  more for Free Shipping
                </span>
              )}
            </span>
            <span className="text-slate-500 font-bold">
              {freeShippingProgress}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore our 3D interactive collection and discover trending items today.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm truncate text-slate-900">
                    {item.product.name}
                  </h4>
                  {item.selectedColor && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Color: {item.selectedColor}
                    </p>
                  )}
                  <div className="font-bold text-xs sm:text-sm text-purple-600 mt-1">
                    ₹{item.product.price.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.product.id,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/70 space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code (try NEXUS3D)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-white text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
              >
                Apply
              </button>
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Special Discount (10%)</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm sm:text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-purple-600">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => alert('Proceeding to Secure Checkout!')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-900/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
