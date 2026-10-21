'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Search,
  ChevronRight,
  TrendingUp,
  Star,
  Award,
} from 'lucide-react';
import { ECOMMERCE_PRODUCTS, Product } from './EcommerceData';
import { ThreeDProductViewer } from './ThreeDProductViewer';
import { ThreeDCard } from './ThreeDCard';

export const EcommerceHero3D: React.FC = () => {
  // Let user switch featured product on hero
  const heroProducts = ECOMMERCE_PRODUCTS.slice(0, 3);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeProduct = heroProducts[activeHeroIndex] || heroProducts[0];

  return (
    <section className="relative overflow-hidden pt-2 pb-4 sm:pb-6 bg-white">
      {/* Background soft subtle radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-purple-200/40 via-indigo-100/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Ticker / Badge - Compact Spacing */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 pb-2 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs sm:text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Mega Season Sale • Flat 40% - 60% Off Trending Categories</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" /> Free Shipping
              Above ₹999
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" /> 7-Day Easy
              Returns
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> 100%
              Authentic Brands
            </span>
          </div>
        </div>

        {/* Hero Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Hero Text / Value proposition (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold tracking-wide uppercase">
              <Award className="w-3.5 h-3.5" /> India&apos;s Premium E-Commerce Hub
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Next-Gen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500">
                Shopping
              </span>{' '}
              in True 3D.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Experience products before you buy. Explore high-fidelity 3D
              rotations, discover tactile engineering highlights, and shop top
              lifestyle brands with instant checkout.
            </p>

            {/* Clean Value Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-100">
              <div>
                <div className="text-xl font-black text-slate-900">500K+</div>
                <div className="text-xs text-slate-500">Shipped</div>
              </div>
              <div>
                <div className="text-xl font-black text-purple-600">4.9★</div>
                <div className="text-xs text-slate-500">Rating</div>
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">24h</div>
                <div className="text-xs text-slate-500">Fast Dispatch</div>
              </div>
            </div>
          </div>

          {/* Right Hero: The Interactive 3D Showcase (7 cols) */}
          <div className="lg:col-span-7">
            <ThreeDProductViewer product={activeProduct} />
          </div>
        </div>
      </div>
    </section>
  );
};
