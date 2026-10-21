'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  Timer,
  Zap,
  ShoppingBag,
  Star,
  Check,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ECOMMERCE_PRODUCTS, Product } from './EcommerceData';
import { ThreeDCard } from './ThreeDCard';

interface EcommerceFlashDealsProps {
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const EcommerceFlashDeals: React.FC<EcommerceFlashDealsProps> = ({
  onProductClick,
  onAddToCart,
}) => {
  // Live countdown timer: 06h 45m 12s
  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 42,
    seconds: 19,
  });

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter flash deal products
  const dealProducts = ECOMMERCE_PRODUCTS.filter(
    (p) => p.discount >= 20
  ).slice(0, 4);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { x, y },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6'],
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Deal Header with Urgency Timer - Vibrant & Compact */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 p-5 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-600/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-slate-950" /> FLASH SALE
              </span>
              <span className="text-xs text-purple-100 font-medium">Limited quantities remaining</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Deals of the Day
            </h2>
            <p className="text-xs sm:text-sm text-purple-100">
              Handpicked premium tech and lifestyle products at up to 45% off.
            </p>
          </div>

          {/* Countdown Clock Pills */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-purple-100 font-bold flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-300" /> Ends In:
            </span>
            <div className="flex items-center gap-2 font-mono font-bold text-base sm:text-lg">
              <div className="px-3 py-1 rounded-xl bg-black/25 border border-white/20 text-white shadow-inner flex flex-col items-center">
                <span>{padZero(timeLeft.hours)}</span>
                <span className="text-[9px] font-sans text-purple-200 font-normal">HRS</span>
              </div>
              <span className="text-purple-200">:</span>
              <div className="px-3 py-1 rounded-xl bg-black/25 border border-white/20 text-white shadow-inner flex flex-col items-center">
                <span>{padZero(timeLeft.minutes)}</span>
                <span className="text-[9px] font-sans text-purple-200 font-normal">MIN</span>
              </div>
              <span className="text-purple-200">:</span>
              <div className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 shadow-inner flex flex-col items-center">
                <span>{padZero(timeLeft.seconds)}</span>
                <span className="text-[9px] font-sans text-slate-800 font-extrabold">SEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {dealProducts.map((product) => {
            const isAdded = addedIds[product.id];
            const stockPercent = Math.min(100, Math.max(15, (product.stockLeft / 20) * 100));

            return (
              <ThreeDCard
                key={product.id}
                maxTilt={12}
                scale={1.02}
                onClick={() => onProductClick && onProductClick(product)}
                className="cursor-pointer rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between hover:border-purple-400 transition-colors shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-50 text-pink-600 border border-pink-200">
                      -{product.discount}%
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  {/* Image container with 3D Pop */}
                  <div
                    style={{ transform: 'translateZ(25px)' }}
                    className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 p-4 mb-4 flex items-center justify-center group"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Title & Tagline */}
                  <div style={{ transform: 'translateZ(15px)' }}>
                    <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
                      {product.categoryName}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mt-0.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {product.tagline}
                    </p>
                  </div>
                </div>

                <div
                  style={{ transform: 'translateZ(20px)' }}
                  className="mt-4 pt-3 border-t border-slate-100 space-y-3"
                >
                  {/* Stock meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Available</span>
                      <span className="text-rose-600 font-bold">
                        Only {product.stockLeft} left
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-lg font-black text-slate-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-slate-400 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${isAdded
                          ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30'
                        }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </ThreeDCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
