'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Layers,
  Check,
  ShoppingBag,
  Sliders,
  ShieldCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

interface FinishOption {
  id: string;
  name: string;
  tag: string;
  extraPerUnit: number;
  previewClass: string;
  borderGlow: string;
  description: string;
}

const FINISH_OPTIONS: FinishOption[] = [
  {
    id: 'gold-foil',
    name: '3D Gold Foil Stamping',
    tag: 'Executive Premium',
    extraPerUnit: 2.5,
    previewClass: 'gold-foil-shine',
    borderGlow: 'ring-amber-400 border-amber-400',
    description: 'Raised tactile metallic gold foil that catches light dynamically with 3D reflections.',
  },
  {
    id: 'holographic',
    name: 'Holographic Prism 3D',
    tag: 'Trending Choice',
    extraPerUnit: 3.2,
    previewClass: 'purple-metallic-shine',
    borderGlow: 'ring-purple-400 border-purple-400',
    description: 'Prismatic multi-spectrum sheen reflecting iridescent color gradients at every angle.',
  },
  {
    id: 'velvet-matte',
    name: 'Velvet Soft-Touch Matte',
    tag: 'Ultra Luxurious',
    extraPerUnit: 1.8,
    previewClass: 'bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900',
    borderGlow: 'ring-indigo-400 border-indigo-400',
    description: 'Silky smooth tactile finish with zero glare and scratch-resistant matte protection.',
  },
  {
    id: 'spot-uv',
    name: 'Raised Spot Gloss UV',
    tag: 'High Contrast',
    extraPerUnit: 2.0,
    previewClass: 'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-950',
    borderGlow: 'ring-cyan-400 border-cyan-400',
    description: 'Selective gloss lacquer creating 3D embossed depth over silky matte stock.',
  },
];

interface ThreeDMaterialSimulatorProps {
  onAddToCart?: (item: any) => void;
}

export const ThreeDMaterialSimulator: React.FC<ThreeDMaterialSimulatorProps> = ({
  onAddToCart,
}) => {
  const [selectedFinish, setSelectedFinish] = useState<FinishOption>(FINISH_OPTIONS[0]);
  const [quantity, setQuantity] = useState(250);
  const [paperWeight, setPaperWeight] = useState('350 GSM Heavy Linen');
  const [isAdded, setIsAdded] = useState(false);

  // Volume discount computation
  const baseRate = 1.99;
  const unitPrice = (baseRate + selectedFinish.extraPerUnit) * (quantity >= 1000 ? 0.75 : quantity >= 500 ? 0.85 : 1);
  const totalPrice = Math.round(unitPrice * quantity);

  const handleSimulateAdd = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ['#f59e0b', '#a855f7', '#06b6d4'],
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    if (onAddToCart) {
      onAddToCart({
        id: `custom-${selectedFinish.id}-${Date.now()}`,
        name: `Custom Premium Suite (${selectedFinish.name})`,
        price: totalPrice,
        category: 'custom-print',
        categoryName: 'Custom Print & Merchandise',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
        quantity,
        finish: selectedFinish.name,
      });
    }
  };

  return (
    <section className="py-8 bg-slate-50 border-b border-slate-200 text-slate-900 relative overflow-hidden">
      {/* Background ambient light orbs */}
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Material Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Custom Finishes &amp; Live 3D Texture Preview
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Rotate and tilt the card below to see authentic reflections of metallic gold foil, holographic prisms, and velvet matte lamination before placing your order.
          </p>
        </div>

        {/* 2-Column interactive simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* LEFT: 3D Tilting Material Card Showcase (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <ThreeDCard
              maxTilt={20}
              scale={1.04}
              glareEffect={true}
              className={`w-full max-w-md h-72 sm:h-84 rounded-3xl p-6 sm:p-8 relative flex flex-col justify-between shadow-2xl transition-all duration-500 border ${
                selectedFinish.id === 'gold-foil'
                  ? 'border-amber-400/50 shadow-amber-900/20'
                  : selectedFinish.id === 'holographic'
                  ? 'border-purple-400/50 shadow-purple-900/20'
                  : 'border-slate-300'
              } ${selectedFinish.previewClass}`}
            >
              {/* Card Header */}
              <div
                style={{ transform: 'translateZ(40px)' }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-white text-base">
                    P
                  </div>
                  <div>
                    <div className="font-extrabold text-sm sm:text-base tracking-wide text-white drop-shadow-md">
                      PRINTO LUXE
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-200 tracking-wider">
                      {selectedFinish.tag}
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-black/50 backdrop-blur-md border border-white/30 text-white">
                  3D Finish Active
                </span>
              </div>

              {/* Center Embossed Emblem */}
              <div
                style={{ transform: 'translateZ(60px)' }}
                className="text-center py-2"
              >
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xl">
                  {selectedFinish.name}
                </h3>
                <p className="text-xs text-slate-100 mt-1 max-w-xs mx-auto drop-shadow-md">
                  {selectedFinish.description}
                </p>
              </div>

              {/* Card Footer */}
              <div
                style={{ transform: 'translateZ(35px)' }}
                className="flex items-center justify-between pt-3 border-t border-white/20 text-xs text-white"
              >
                <span className="font-mono font-medium">{paperWeight}</span>
                <span className="font-bold text-amber-300">
                  Tier: {quantity} Units
                </span>
              </div>
            </ThreeDCard>

            <p className="text-xs text-slate-500 mt-3 text-center flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Hover &amp; move cursor across card to experience live 3D depth and reflections.
            </p>
          </div>

          {/* RIGHT: Customizer Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-4 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md">
            {/* 1. Finish Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-2">
                1. Select 3D Luxury Finish:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FINISH_OPTIONS.map((f) => {
                  const isSelected = selectedFinish.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFinish(f)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? `bg-purple-50 border-purple-500 ring-1 ring-purple-400 text-purple-900 shadow-xs`
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{f.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        +₹{f.extraPerUnit.toFixed(2)} / unit
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Paper Stock Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1.5">
                2. Card Stock &amp; Paper Weight:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  '350 GSM Heavy Linen',
                  '400 GSM Cotton Velvet',
                  '300 GSM Recycled Kraft',
                  '0.5mm Polymer Frosted',
                ].map((stock) => (
                  <button
                    key={stock}
                    onClick={() => setPaperWeight(stock)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      paperWeight === stock
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {stock}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Quantity Tier Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  3. Quantity Tier:
                </label>
                <span className="text-sm font-black text-slate-900">
                  {quantity} Units{' '}
                  {quantity >= 1000 && (
                    <span className="text-xs text-amber-600 font-bold ml-1">
                      (25% Bulk Discount)
                    </span>
                  )}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={2500}
                step={50}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>100 min</span>
                <span>500 (15% off)</span>
                <span>1,000 (25% off)</span>
                <span>2,500+</span>
              </div>
            </div>

            {/* 4. Live Price Box & Action */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">Total Estimated Price:</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">
                    (₹{unitPrice.toFixed(2)}/unit + GST)
                  </span>
                </div>
              </div>

              <button
                onClick={handleSimulateAdd}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/40 scale-105'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/30 hover:scale-105'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Order!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add Custom Pack
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
