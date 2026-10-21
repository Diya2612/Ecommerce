'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Type,
  Palette,
  ShoppingBag,
  RotateCcw,
  Check,
  CreditCard,
  Coffee,
  Package,
  Shirt,
  Flame,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

interface CustomizerProductType {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  image: string;
  badge: string;
  availableColors: { name: string; hex: string; bgClass: string }[];
}

const CUSTOMIZABLE_PRODUCTS: CustomizerProductType[] = [
  {
    id: 'custom-card',
    name: '3D Gold Foil Luxury Visiting Card',
    category: 'Business Cards',
    basePrice: 499,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    badge: 'Pack of 100',
    availableColors: [
      { name: 'Velvet Obsidian', hex: '#09090b', bgClass: 'from-zinc-950 via-slate-900 to-black' },
      { name: 'Imperial Navy', hex: '#0f172a', bgClass: 'from-slate-950 via-indigo-950 to-slate-900' },
      { name: 'Royal Emerald', hex: '#064e3b', bgClass: 'from-emerald-950 via-teal-950 to-slate-950' },
      { name: 'Burgundy Crimson', hex: '#4c0519', bgClass: 'from-rose-950 via-red-950 to-slate-950' },
    ],
  },
  {
    id: 'custom-mug',
    name: 'Custom HD Ceramic Coffee Mug',
    category: 'Drinkware',
    basePrice: 249,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    badge: '11 oz Ceramic',
    availableColors: [
      { name: 'Pure Pearl White', hex: '#f8fafc', bgClass: 'from-slate-100 via-white to-slate-200' },
      { name: 'Midnight Matte Black', hex: '#18181b', bgClass: 'from-zinc-900 via-black to-zinc-950' },
      { name: 'Electric Purple', hex: '#581c87', bgClass: 'from-purple-950 via-indigo-950 to-black' },
    ],
  },
  {
    id: 'custom-polo',
    name: 'Executive Embroidered Polo T-Shirt',
    category: 'Apparel',
    basePrice: 599,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    badge: '240 GSM Cotton',
    availableColors: [
      { name: 'Navy Blue', hex: '#0f172a', bgClass: 'from-slate-950 via-blue-950 to-slate-900' },
      { name: 'Classic Crimson', hex: '#991b1b', bgClass: 'from-red-950 via-rose-950 to-black' },
      { name: 'Stealth Black', hex: '#111827', bgClass: 'from-black via-zinc-950 to-slate-900' },
    ],
  },
  {
    id: 'custom-box',
    name: 'Corrugated E-Commerce Mailer Box',
    category: 'Packaging',
    basePrice: 1299,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    badge: 'Pack of 25',
    availableColors: [
      { name: 'Eco Natural Kraft', hex: '#b45309', bgClass: 'from-amber-950 via-orange-950 to-stone-900' },
      { name: 'Luxury Matte Black', hex: '#1e293b', bgClass: 'from-slate-950 via-slate-900 to-black' },
    ],
  },
];

interface ThreeDLiveProductCustomizerProps {
  onAddToCart?: (item: any) => void;
}

export const ThreeDLiveProductCustomizer: React.FC<ThreeDLiveProductCustomizerProps> = ({
  onAddToCart,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<CustomizerProductType>(
    CUSTOMIZABLE_PRODUCTS[0]
  );
  const [brandName, setBrandName] = useState('NEXUS LABS');
  const [tagline, setTagline] = useState('CREATIVE STUDIO');
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [fontStyle, setFontStyle] = useState<'font-sans' | 'font-serif' | 'font-mono'>('font-sans');
  const [finishEffect, setFinishEffect] = useState<'gold' | 'silver' | 'white'>('gold');
  const [isAdded, setIsAdded] = useState(false);

  const activeColor =
    selectedProduct.availableColors[activeColorIndex] ||
    selectedProduct.availableColors[0];

  const handleProductSwitch = (prod: CustomizerProductType) => {
    setSelectedProduct(prod);
    setActiveColorIndex(0);
  };

  const handleAddCustomToCart = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ['#a855f7', '#ec4899', '#f59e0b', '#10b981'],
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);

    if (onAddToCart) {
      onAddToCart({
        id: `customized-${selectedProduct.id}-${Date.now()}`,
        name: `${selectedProduct.name} (Custom: "${brandName}")`,
        price: selectedProduct.basePrice,
        category: selectedProduct.id,
        categoryName: selectedProduct.category,
        tagline: `${brandName} • ${tagline}`,
        images: [selectedProduct.image],
        quantity: 1,
        selectedColor: activeColor.name,
      });
    }
  };

  return (
    <section className="py-8 bg-white border-b border-slate-100 relative overflow-hidden">
      {/* Background ambient light glows */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time 3D Brand Customizer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Design &amp; Preview Your Brand in True 3D
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Type your company name, select your material finish, and see your customized merchandise come alive in real-time 3D before placing your order.
          </p>
        </div>

        {/* Product Type Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CUSTOMIZABLE_PRODUCTS.map((prod) => (
            <button
              key={prod.id}
              onClick={() => handleProductSwitch(prod)}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedProduct.id === prod.id
                  ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300 scale-105'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {prod.id === 'custom-card' && <CreditCard className="w-4 h-4" />}
              {prod.id === 'custom-mug' && <Coffee className="w-4 h-4" />}
              {prod.id === 'custom-polo' && <Shirt className="w-4 h-4" />}
              {prod.id === 'custom-box' && <Package className="w-4 h-4" />}
              <span>{prod.name.split(' ')[0]} {prod.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Main 2-Column Customizer Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* LEFT: 3D Product Interactive Canvas (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <ThreeDCard
              maxTilt={18}
              scale={1.03}
              glareEffect={true}
              className={`w-full max-w-md h-80 sm:h-96 rounded-3xl p-6 sm:p-8 relative flex flex-col justify-between shadow-2xl border border-white/20 transition-all duration-500 bg-gradient-to-br ${activeColor.bgClass}`}
            >
              {/* Top Bar of 3D Item */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                    Live 3D Simulated Proof
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-black/50 border border-white/20 text-white">
                  {selectedProduct.badge}
                </span>
              </div>

              {/* Center Branding Customization Display */}
              <div
                style={{ transform: 'translateZ(65px)' }}
                className="text-center py-6 select-none"
              >
                {/* 3D Brand Logo / Monogram */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                  <span
                    className={`text-2xl font-black ${
                      finishEffect === 'gold'
                        ? 'text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]'
                        : finishEffect === 'silver'
                        ? 'text-slate-100 drop-shadow-[0_2px_10px_rgba(255,255,255,0.6)]'
                        : 'text-white'
                    }`}
                  >
                    {brandName ? brandName.charAt(0) : 'P'}
                  </span>
                </div>

                {/* Brand Name with Metallic Shader */}
                <h3
                  className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${fontStyle} ${
                    finishEffect === 'gold'
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-md'
                      : finishEffect === 'silver'
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-300 drop-shadow-md'
                      : 'text-white'
                  }`}
                >
                  {brandName || 'YOUR BRAND'}
                </h3>

                {/* Subtitle / Tagline */}
                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-white/70 mt-2">
                  {tagline || 'ESTABLISHED 2026'}
                </p>
              </div>

              {/* Bottom Footer Details */}
              <div
                style={{ transform: 'translateZ(25px)' }}
                className="flex items-center justify-between pt-3 border-t border-white/15 text-xs text-white/80"
              >
                <span>Color: {activeColor.name}</span>
                <span className="font-bold text-amber-300 capitalize">
                  {finishEffect} Foil Finish
                </span>
              </div>
            </ThreeDCard>

            <p className="text-xs text-slate-400 mt-4 text-center flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Tilt your cursor to inspect 3D metallic highlights and material reflections.
            </p>
          </div>

          {/* RIGHT: Interactive Customization Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-4 bg-slate-50 rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md">
            {/* 1. Custom Text Inputs */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block">
                1. Enter Custom Branding &amp; Text:
              </label>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Company / Brand Name</span>
                <input
                  type="text"
                  maxLength={28}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. ACME CORP"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Tagline or Designation</span>
                <input
                  type="text"
                  maxLength={36}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. INNOVATION & DESIGN"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* 2. Colorways Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1.5">
                2. Base Material Colorway:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.availableColors.map((col, idx) => (
                  <button
                    key={col.name}
                    onClick={() => setActiveColorIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                      activeColorIndex === idx
                        ? 'bg-purple-100 border-purple-500 text-purple-900 ring-1 ring-purple-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Foil / Texture Finish */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1.5">
                3. Text &amp; Logo Emboss Finish:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFinishEffect('gold')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    finishEffect === 'gold'
                      ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ✨ 3D Gold Foil
                </button>
                <button
                  onClick={() => setFinishEffect('silver')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    finishEffect === 'silver'
                      ? 'bg-slate-200 border-slate-400 text-slate-900 ring-2 ring-slate-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Metallic Chrome
                </button>
                <button
                  onClick={() => setFinishEffect('white')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    finishEffect === 'white'
                      ? 'bg-purple-100 border-purple-500 text-purple-900 ring-2 ring-purple-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ⚪ Crisp Matte
                </button>
              </div>
            </div>

            {/* 4. Font Typography Style */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1.5">
                4. Typography Style:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFontStyle('font-sans')}
                  className={`py-2 rounded-xl border text-xs font-sans transition-all ${
                    fontStyle === 'font-sans'
                      ? 'bg-purple-100 border-purple-500 text-purple-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Modern Sans
                </button>
                <button
                  onClick={() => setFontStyle('font-serif')}
                  className={`py-2 rounded-xl border text-xs font-serif transition-all ${
                    fontStyle === 'font-serif'
                      ? 'bg-purple-100 border-purple-500 text-purple-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Luxury Serif
                </button>
                <button
                  onClick={() => setFontStyle('font-mono')}
                  className={`py-2 rounded-xl border text-xs font-mono transition-all ${
                    fontStyle === 'font-mono'
                      ? 'bg-purple-100 border-purple-500 text-purple-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Tech Monospace
                </button>
              </div>
            </div>

            {/* 5. Pricing & Add to Cart */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">Customized Set Price:</div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{selectedProduct.basePrice.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-500">incl. custom proofs</span>
                </div>
              </div>

              <button
                onClick={handleAddCustomToCart}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/40 scale-105'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/30 hover:scale-105'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" /> Added to Your Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Order Customized Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
