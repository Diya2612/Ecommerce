'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  ArrowRight,
  Star,
  Package,
} from 'lucide-react';
import { ECOMMERCE_PRODUCTS, type Product } from './EcommerceData';
import { ThreeDProductViewer } from './ThreeDProductViewer';

const TRUST_BADGES = [
  { icon: Truck, label: 'Free Ship >₹999', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: RotateCcw, label: '7-Day Returns', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: ShieldCheck, label: '100% Authentic', color: 'text-purple-600', bg: 'bg-purple-50' },
];

const STATS = [
  { value: '500K+', label: 'Orders Shipped', gradient: 'from-purple-600 to-indigo-600' },
  { value: '4.9★', label: 'Avg Rating', gradient: 'from-amber-500 to-orange-500' },
  { value: '24h', label: 'Fast Dispatch', gradient: 'from-emerald-500 to-teal-600' },
  { value: '250+', label: 'Products', gradient: 'from-pink-500 to-rose-500' },
];

export const EcommerceHero3D: React.FC = () => {
  const heroProducts = ECOMMERCE_PRODUCTS.slice(0, 4);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeProduct: Product = heroProducts[activeHeroIndex] ?? heroProducts[0];

  // Auto-advance hero product every 7s
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveHeroIndex((i) => (i + 1) % heroProducts.length);
        setIsTransitioning(false);
      }, 250);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const handleSelect = (idx: number) => {
    if (idx === activeHeroIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveHeroIndex(idx);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <section className="relative overflow-hidden pt-2 pb-6 sm:pb-8 bg-white">
      {/* Background ambient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-purple-200/50 via-indigo-100/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-10 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-10 w-80 h-80 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* ── Top Sale Banner ── */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 pb-3 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/20">
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            Mega Season Sale — Flat 40–60% Off Trending Categories
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {TRUST_BADGES.map(({ icon: Icon, label, color, bg }) => (
              <span key={label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg} text-xs font-semibold ${color}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Hero Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

          {/* Left: Text Content (5 cols) */}
          <div className="lg:col-span-5 space-y-5">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold tracking-wide uppercase border border-purple-200">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              India&apos;s Premium E-Commerce Hub
            </div>

            {/* H1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Next-Gen{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500">
                  Shopping
                </span>
                {/* Underline accent */}
                <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 opacity-60" />
              </span>{' '}
              in True 3D.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Experience products before you buy. Explore high-fidelity 3D
              rotations, discover tactile engineering highlights, and shop top
              lifestyle brands with instant checkout.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="#trending-products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#trending-products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-purple-300 transition-all"
              >
                <Package className="w-4 h-4 text-purple-600" />
                Browse Catalog
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              {STATS.map(({ value, label, gradient }) => (
                <div key={label} className="text-center">
                  <div className={`text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
                    {value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 leading-tight">{label}</div>
                </div>
              ))}
            </div>

            {/* Product Switcher Tabs */}
            <div className="flex flex-wrap gap-2 pt-1">
              {heroProducts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    idx === activeHeroIndex
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/30'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700'
                  }`}
                >
                  {p.name.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Right: 3D Product Viewer (7 cols) */}
          <div
            className={`lg:col-span-7 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            <ThreeDProductViewer product={activeProduct} />

            {/* Rating pill under viewer */}
            <div className="mt-3 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-700">
                  {activeProduct.rating} ({activeProduct.reviewsCount.toLocaleString()} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <span className="text-xs font-bold text-emerald-700">
                  ₹{activeProduct.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ₹{activeProduct.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  {activeProduct.discount}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
