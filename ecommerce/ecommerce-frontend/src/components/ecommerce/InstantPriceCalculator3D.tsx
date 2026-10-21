'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calculator,
  Layers,
  Sparkles,
  ShoppingBag,
  Check,
  Percent,
  Clock,
  ShieldCheck,
  FileText,
  CreditCard,
  Shirt,
  Package,
  Coffee,
  Flag,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

interface CalculatorProductOption {
  id: string;
  name: string;
  icon: string;
  baseUnit: string;
  baseRate: number;
  minQty: number;
  maxQty: number;
  step: number;
  defaultQty: number;
  finishes: { id: string; name: string; multiplier: number; extraPerUnit: number; tag: string }[];
  materials: { id: string; name: string; extra: number }[];
  sizes: string[];
}

const PRICING_PRODUCTS: CalculatorProductOption[] = [
  {
    id: 'visiting-cards',
    name: 'Visiting Cards & Business Cards',
    icon: 'CreditCard',
    baseUnit: 'Cards',
    baseRate: 2.5,
    minQty: 100,
    maxQty: 5000,
    step: 100,
    defaultQty: 250,
    sizes: ['Standard (3.5" x 2.0")', 'Square (2.5" x 2.5")', 'Slim (3.5" x 1.5")'],
    materials: [
      { id: '350gsm', name: '350 GSM Matte Art Card', extra: 0 },
      { id: '400gsm', name: '400 GSM Super Velvet Card', extra: 0.8 },
      { id: 'linen', name: '350 GSM Italian Textured Linen', extra: 1.2 },
      { id: 'nfc', name: 'Smart NFC Embedded Tap Card', extra: 45.0 },
    ],
    finishes: [
      { id: 'matte', name: 'Classic Matte Lamination', multiplier: 1.0, extraPerUnit: 0, tag: 'Popular' },
      { id: 'gloss', name: 'High-Gloss UV Lamination', multiplier: 1.0, extraPerUnit: 0.2, tag: 'Vibrant' },
      { id: 'gold-foil', name: '3D Embossed Gold Foil Stamping', multiplier: 1.35, extraPerUnit: 2.5, tag: 'Luxury 3D' },
      { id: 'spot-uv', name: 'Raised Spot Gloss UV (Tactile 3D)', multiplier: 1.25, extraPerUnit: 1.8, tag: 'Premium 3D' },
    ],
  },
  {
    id: 'custom-tshirt',
    name: 'Custom Polo & Round Neck T-Shirts',
    icon: 'Shirt',
    baseUnit: 'Pieces',
    baseRate: 380,
    minQty: 5,
    maxQty: 1000,
    step: 5,
    defaultQty: 25,
    sizes: ['Mixed Assorted (S, M, L, XL)', 'Size M (38")', 'Size L (40")', 'Size XL (42")'],
    materials: [
      { id: '180gsm', name: '180 GSM Bio-Washed Combed Cotton', extra: 0 },
      { id: '240gsm', name: '240 GSM Heavyweight Pique Cotton', extra: 90 },
      { id: 'popcorn', name: 'Signature Popcorn Textured Knit', extra: 140 },
    ],
    finishes: [
      { id: 'embroidery', name: 'German Thread Chest Embroidery', multiplier: 1.15, extraPerUnit: 45, tag: 'Corporate' },
      { id: 'dtf', name: 'Full Color 3D HD DTF Print', multiplier: 1.1, extraPerUnit: 35, tag: 'Full Color' },
      { id: 'screen', name: 'Plastisol Screen Print (Metallic Foil)', multiplier: 1.2, extraPerUnit: 55, tag: 'Luxury 3D' },
    ],
  },
  {
    id: 'packaging-boxes',
    name: 'Custom Corrugated Mailer Boxes',
    icon: 'Package',
    baseUnit: 'Boxes',
    baseRate: 48,
    minQty: 25,
    maxQty: 2500,
    step: 25,
    defaultQty: 100,
    sizes: ['Small (6x4x3 inches)', 'Medium (9x6x3.5 inches)', 'Large (12x10x4 inches)'],
    materials: [
      { id: '3ply-kraft', name: '3-Ply Natural Virgin Kraft Board', extra: 0 },
      { id: '3ply-white', name: '3-Ply Bleached Pure White Board', extra: 8 },
      { id: 'heavy-duty', name: 'Heavy-Duty 5-Ply Stacking Board', extra: 18 },
    ],
    finishes: [
      { id: 'ext-print', name: 'Exterior 4-Color CMYK Print', multiplier: 1.0, extraPerUnit: 0, tag: 'Standard' },
      { id: 'dual-print', name: 'Inside + Outside 360° Full HD Print', multiplier: 1.35, extraPerUnit: 16, tag: 'Unboxing 3D' },
      { id: 'foil-box', name: 'Metallic Foil Brand Logo Accent', multiplier: 1.45, extraPerUnit: 24, tag: 'Luxury 3D' },
    ],
  },
  {
    id: 'standees-banners',
    name: 'Rollup Standees & Event Displays',
    icon: 'Flag',
    baseUnit: 'Units',
    baseRate: 1199,
    minQty: 1,
    maxQty: 100,
    step: 1,
    defaultQty: 2,
    sizes: ['Standard 6 x 2.5 Feet', 'Wide 6 x 3.0 Feet', 'Executive 6 x 4.0 Feet'],
    materials: [
      { id: 'pvc-star', name: 'Star Non-Curling Poly Vinyl (280 Micron)', extra: 0 },
      { id: 'fabric', name: 'Zero-Reflection Fabric Texture', extra: 350 },
    ],
    finishes: [
      { id: 'silver-base', name: 'Economy Aluminum Roller Mechanism', multiplier: 1.0, extraPerUnit: 0, tag: 'Standard' },
      { id: 'luxury-base', name: 'Heavy-Duty Broad Base Aluminum with Bag', multiplier: 1.25, extraPerUnit: 300, tag: 'Heavy Duty' },
    ],
  },
  {
    id: 'mugs-drinkware',
    name: 'Custom Ceramic Mugs & Tumblers',
    icon: 'Coffee',
    baseUnit: 'Items',
    baseRate: 160,
    minQty: 6,
    maxQty: 500,
    step: 6,
    defaultQty: 24,
    sizes: ['11 oz / 325ml Standard Mug', '15 oz / 450ml Jumbo Mug', '500ml Insulated Steel Tumbler'],
    materials: [
      { id: 'ceramic-white', name: 'Grade A Gloss Ceramic', extra: 0 },
      { id: 'magic-mug', name: 'Heat Color-Changing Morphing Ceramic', extra: 90 },
      { id: 'steel-304', name: 'Food Grade 304 Double Wall Vacuum Steel', extra: 380 },
    ],
    finishes: [
      { id: 'full-wrap', name: '360° Panoramic Sublimation Photo Print', multiplier: 1.0, extraPerUnit: 0, tag: 'Photo HD' },
      { id: 'laser-engrave', name: 'Permanent High-Precision Fiber Laser Etch', multiplier: 1.2, extraPerUnit: 40, tag: 'Permanent 3D' },
    ],
  },
];

interface InstantPriceCalculator3DProps {
  onAddToCart?: (item: any) => void;
}

export const InstantPriceCalculator3D: React.FC<InstantPriceCalculator3DProps> = ({
  onAddToCart,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<CalculatorProductOption>(PRICING_PRODUCTS[0]);
  const [quantity, setQuantity] = useState<number>(PRICING_PRODUCTS[0].defaultQty);
  const [selectedSize, setSelectedSize] = useState<string>(PRICING_PRODUCTS[0].sizes[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(PRICING_PRODUCTS[0].materials[0].id);
  const [selectedFinish, setSelectedFinish] = useState<string>(PRICING_PRODUCTS[0].finishes[0].id);
  const [needDesignHelp, setNeedDesignHelp] = useState<boolean>(false);
  const [expressSpeed, setExpressSpeed] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const activeMaterialObj = selectedProduct.materials.find((m) => m.id === selectedMaterial) || selectedProduct.materials[0];
  const activeFinishObj = selectedProduct.finishes.find((f) => f.id === selectedFinish) || selectedProduct.finishes[0];

  // Bulk discount calculation
  let bulkDiscountPercent = 0;
  if (quantity >= selectedProduct.minQty * 10) {
    bulkDiscountPercent = 25;
  } else if (quantity >= selectedProduct.minQty * 5) {
    bulkDiscountPercent = 15;
  } else if (quantity >= selectedProduct.minQty * 2) {
    bulkDiscountPercent = 8;
  }

  const rawUnitCost = (selectedProduct.baseRate + activeMaterialObj.extra + activeFinishObj.extraPerUnit) * activeFinishObj.multiplier;
  const discountedUnitCost = rawUnitCost * (1 - bulkDiscountPercent / 100);
  const baseSubtotal = discountedUnitCost * quantity;
  const designFee = needDesignHelp ? 499 : 0;
  const expressFee = expressSpeed ? 299 : 0;
  const totalAmount = Math.round(baseSubtotal + designFee + expressFee);
  const effectiveUnitPrice = (totalAmount / quantity).toFixed(2);
  const totalSavings = Math.round((rawUnitCost * quantity) - baseSubtotal);

  const handleProductChange = (prod: CalculatorProductOption) => {
    setSelectedProduct(prod);
    setQuantity(prod.defaultQty);
    setSelectedSize(prod.sizes[0]);
    setSelectedMaterial(prod.materials[0].id);
    setSelectedFinish(prod.finishes[0].id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ['#7c3aed', '#ec4899', '#3b82f6', '#f59e0b', '#10b981'],
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);

    if (onAddToCart) {
      onAddToCart({
        id: `calc-${selectedProduct.id}-${Date.now()}`,
        name: `${selectedProduct.name} (${quantity} ${selectedProduct.baseUnit})`,
        price: totalAmount,
        category: selectedProduct.id,
        categoryName: selectedProduct.name,
        tagline: `${selectedSize} • ${activeMaterialObj.name} • ${activeFinishObj.name}`,
        images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'],
        quantity: 1,
      });
    }
  };

  return (
    <section id="instant-calculator" className="py-8 bg-slate-50 text-slate-900 relative border-b border-slate-200 overflow-hidden">
      {/* 3D ambient light orbs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Instant Price Estimator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Configure Specifications &amp; Live Bulk Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Printo&apos;s signature transparent volume pricing engine. Customize product size, luxury 3D finishing, card weight, and quantity tiers with real-time wholesale discounts.
          </p>
        </div>

        {/* Product selector buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {PRICING_PRODUCTS.map((p) => {
            const isSelected = selectedProduct.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleProductChange(p)}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300 scale-105'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.icon === 'CreditCard' && <CreditCard className="w-4 h-4" />}
                {p.icon === 'Shirt' && <Shirt className="w-4 h-4" />}
                {p.icon === 'Package' && <Package className="w-4 h-4" />}
                {p.icon === 'Flag' && <Flag className="w-4 h-4" />}
                {p.icon === 'Coffee' && <Coffee className="w-4 h-4" />}
                <span>{p.name.split(' ')[0]} {p.name.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Calculator grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Configuration Options (7 cols) */}
          <div className="lg:col-span-7 space-y-5 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md">
            {/* 1. Size / Dimension Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-2">
                1. Select Dimensions &amp; Size:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedProduct.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      selectedSize === s
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Material & Substrate Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-2">
                2. Substrate &amp; Material Stock:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedProduct.materials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedMaterial === m.id
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{m.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {m.extra > 0 ? `+₹${m.extra}/unit` : 'Standard Base'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Luxury 3D Finish Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-2">
                3. Surface Finish &amp; 3D Embellishments:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedProduct.finishes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFinish(f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedFinish === f.id
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{f.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                        {f.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {f.extraPerUnit > 0 ? `+₹${f.extraPerUnit}/unit` : 'Included'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Quantity Tier Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  4. Select Quantity ({selectedProduct.baseUnit}):
                </label>
                <div className="text-sm font-black text-slate-900">
                  {quantity.toLocaleString()} {selectedProduct.baseUnit}
                  {bulkDiscountPercent > 0 && (
                    <span className="text-xs text-emerald-600 font-bold ml-2">
                      ({bulkDiscountPercent}% Bulk Off)
                    </span>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={selectedProduct.minQty}
                max={selectedProduct.maxQty}
                step={selectedProduct.step}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>{selectedProduct.minQty} (Min)</span>
                <span>{selectedProduct.minQty * 5} (15% Off)</span>
                <span>{selectedProduct.minQty * 10}+ (25% Bulk Discount)</span>
              </div>
            </div>

            {/* 5. Additional Printo Value Addons */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-purple-50/40">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={needDesignHelp}
                    onChange={(e) => setNeedDesignHelp(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hire Professional Designer (+₹499)</div>
                    <div className="text-[11px] text-slate-500">1-on-1 designer crafts your layout with unlimited revisions</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700">₹499</span>
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-purple-50/40">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={expressSpeed}
                    onChange={(e) => setExpressSpeed(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">HyperLocal Express Dispatch (+₹299)</div>
                    <div className="text-[11px] text-slate-500">Prioritize print queue for same-day 4-hour dispatch</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-700">₹299</span>
              </label>
            </div>
          </div>

          {/* RIGHT: Live 3D Price Summary Card (5 cols) */}
          <div className="lg:col-span-5">
            <ThreeDCard
              maxTilt={14}
              scale={1.02}
              glareEffect={true}
              className="rounded-3xl bg-white border border-purple-200 p-5 sm:p-7 shadow-xl space-y-5 text-slate-900"
            >
              {/* Header */}
              <div style={{ transform: 'translateZ(30px)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-purple-700">
                    Live Quotation Breakdown
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Tax Inclusive
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedSize} • {activeMaterialObj.name}
                </p>
              </div>

              {/* Specs Table */}
              <div
                style={{ transform: 'translateZ(20px)' }}
                className="space-y-2 text-xs py-3 border-y border-slate-100 text-slate-600"
              >
                <div className="flex justify-between">
                  <span>Selected Quantity:</span>
                  <strong className="text-slate-900">{quantity} {selectedProduct.baseUnit}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Effective Unit Rate:</span>
                  <strong className="text-slate-900">₹{effectiveUnitPrice} / {selectedProduct.baseUnit.slice(0, -1)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Finish Embellishment:</span>
                  <strong className="text-purple-700">{activeFinishObj.name}</strong>
                </div>
                {bulkDiscountPercent > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Bulk Tier Savings ({bulkDiscountPercent}%):</span>
                    <strong>-₹{totalSavings.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {needDesignHelp && (
                  <div className="flex justify-between text-amber-700">
                    <span>In-House Designer Addon:</span>
                    <strong>+₹499</strong>
                  </div>
                )}
                {expressSpeed && (
                  <div className="flex justify-between text-cyan-700">
                    <span>4-Hour Express Queue:</span>
                    <strong>+₹299</strong>
                  </div>
                )}
              </div>

              {/* Total & Action */}
              <div style={{ transform: 'translateZ(35px)' }} className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase font-bold text-slate-500">Total Estimated Cost:</span>
                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-500">Includes all GST &amp; proofing</div>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isAdded
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.02]'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/30 hover:scale-[1.02]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5 animate-bounce" /> Added to Your Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" /> Add Configured Package to Cart
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 text-center pt-1">
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Free Proof in 1 hr</span>
                  </div>
                </div>
              </div>
            </ThreeDCard>
          </div>
        </div>
      </div>
    </section>
  );
};
