"use client";

import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { Package } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { CartItemControls } from "../client/CartItemControls";

// ============================================================================
// CartItemsDisplay - Hybrid Component (Client for cart access)
// ============================================================================
// Accesses cart from context, renders with SSR animations
// Interactive controls handled by CartItemControls client island

export function CartItemsDisplay() {
  const { cartItems, isLoading } = useCart();



  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-gray-500">Your cart is empty.</p>
        <a
          href="/collections"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F51] px-8 text-sm font-medium text-white shadow-sm hover:bg-[#0B1F51]/90 transition-colors"
        >
          Return to Shop
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card border border-black/6 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {cartItems.map((item, index) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-6 ${index !== cartItems.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="w-24 h-24 bg-[#F9FBFD] rounded-[16px] shrink-0 flex items-center justify-center p-2 relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain mix-blend-multiply"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-2 leading-[140%]">
                      {item.name}
                    </h3>
                    {item.variant && (
                      <p className="text-[14px] text-gray-500 mb-2">
                        Variant: {item.variant}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-[20px] font-bold text-[#0B1F51]">
                        ₹{item.price.toLocaleString()}
                      </span>
                      {item.originalPrice &&
                        item.originalPrice > item.price && (
                          <>
                            <span className="text-[14px] text-gray-400 line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-[12px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-[6px]">
                              {Math.round(
                                ((item.originalPrice - item.price) /
                                  item.originalPrice) *
                                100,
                              )}
                              % OFF
                            </span>
                          </>
                        )}
                    </div>

                    {/* Stock Warnings - Only show low stock, not when user has all available */}
                    {item.maxStock !== undefined && item.maxStock > 0 && item.maxStock <= 10 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Only {item.maxStock} more available (max {item.quantity + item.maxStock} total)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Client Island: Quantity & Actions */}
                  <CartItemControls item={item} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Shipping Notice */}
      <div className="bg-linear-to-r from-[#F0FDFA] to-[#F9FBFD] border border-[#CCFBF1] rounded-[16px] p-4 flex items-start gap-4">
        <div className="w-10 h-10 bg-[#00C4CC]/10 text-[#00C4CC] rounded-full flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[16px] font-semibold text-[#0B1F51] mb-1">
            Free Shipping & Installation
          </h4>
          <p className="text-[14px] text-gray-600 leading-[150%]">
            Your order includes free shipping and professional installation by
            our certified technicians within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
