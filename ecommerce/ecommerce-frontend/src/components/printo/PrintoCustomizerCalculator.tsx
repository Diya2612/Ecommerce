'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Check, 
  Upload, 
  ShoppingCart, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Percent,
  CheckCircle2
} from 'lucide-react';

interface PrintoCustomizerCalculatorProps {
  onAddToCart?: (item: any) => void;
}

export const PrintoCustomizerCalculator: React.FC<PrintoCustomizerCalculatorProps> = ({
  onAddToCart,
}) => {
  // Configurable presets
  const productOptions = [
    {
      id: 'cards',
      name: 'Classic Visiting Cards (350 GSM)',
      baseUnitRate: 1.80,
      minQty: 100,
      quantities: [100, 250, 500, 1000, 2500],
      finishes: [
        { name: 'Matte Lamination', extraPct: 0 },
        { name: 'Gloss Lamination', extraPct: 0 },
        { name: 'Spot UV Emboss', extraPct: 35 },
        { name: 'Gold Foil Stamped', extraPct: 50 },
      ],
      turnaround: '24-48 Hours',
    },
    {
      id: 'tshirt',
      name: 'Bio-Washed Cotton T-Shirt (180 GSM)',
      baseUnitRate: 399,
      minQty: 1,
      quantities: [1, 5, 10, 25, 50, 100],
      finishes: [
        { name: 'Single Side DTG', extraPct: 0 },
        { name: 'Front & Back Print', extraPct: 25 },
        { name: 'Chest Pocket Logo + Back', extraPct: 30 },
      ],
      turnaround: '48-72 Hours',
    },
    {
      id: 'mug',
      name: 'Ceramic Magic Photo Mug (325 ml)',
      baseUnitRate: 349,
      minQty: 1,
      quantities: [1, 6, 12, 24, 48, 100],
      finishes: [
        { name: 'Standard Magic Black', extraPct: 0 },
        { name: 'Dual Tone Inner Color', extraPct: 15 },
        { name: 'Gift Box Packaging', extraPct: 20 },
      ],
      turnaround: 'Same Day Dispatch',
    },
    {
      id: 'standee',
      name: 'Roll-up Aluminum Standee (6x2.5 ft)',
      baseUnitRate: 999,
      minQty: 1,
      quantities: [1, 2, 5, 10, 20],
      finishes: [
        { name: 'Standard Star Flex', extraPct: 0 },
        { name: 'Non-Tear Synthetic Film', extraPct: 25 },
        { name: 'Anti-Glare Matte Fabric', extraPct: 40 },
      ],
      turnaround: 'Same Day Dispatch',
    },
  ];

  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const currentProduct = productOptions[selectedProductIdx];
  const [selectedQty, setSelectedQty] = useState(currentProduct.quantities[1] || currentProduct.quantities[0]);
  const [selectedFinishIdx, setSelectedFinishIdx] = useState(0);
  const [isExpress, setIsExpress] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // When changing product, reset selected quantity
  const handleProductChange = (idx: number) => {
    setSelectedProductIdx(idx);
    setSelectedQty(productOptions[idx].quantities[1] || productOptions[idx].quantities[0]);
    setSelectedFinishIdx(0);
  };

  // Calculate volume discount percentage
  const getVolumeDiscount = (qty: number) => {
    if (qty >= 1000 || (currentProduct.id !== 'cards' && qty >= 50)) return 40;
    if (qty >= 500 || (currentProduct.id !== 'cards' && qty >= 24)) return 30;
    if (qty >= 250 || (currentProduct.id !== 'cards' && qty >= 10)) return 20;
    if (qty >= 100 || (currentProduct.id !== 'cards' && qty >= 5)) return 10;
    return 0;
  };

  const volumeDiscountPct = getVolumeDiscount(selectedQty);
  const finishExtraPct = currentProduct.finishes[selectedFinishIdx]?.extraPct || 0;
  
  // Adjusted unit rate
  const rawUnitRate = currentProduct.baseUnitRate * (1 + finishExtraPct / 100);
  const discountedUnitRate = rawUnitRate * (1 - volumeDiscountPct / 100);
  const expressFee = isExpress ? 150 : 0;
  
  const totalSubtotal = Math.round(discountedUnitRate * selectedQty) + expressFee;
  const regularTotal = Math.round(rawUnitRate * selectedQty) + expressFee;
  const totalSavings = Math.max(0, regularTotal - totalSubtotal);

  const handleAdd = () => {
    const item = {
      id: `${currentProduct.id}-${Date.now()}`,
      name: currentProduct.name,
      quantity: selectedQty,
      finish: currentProduct.finishes[selectedFinishIdx]?.name,
      unitPrice: discountedUnitRate.toFixed(2),
      totalPrice: totalSubtotal,
      express: isExpress,
    };
    onAddToCart?.(item);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <section className="py-14 px-4 bg-gradient-to-b from-white via-purple-50/40 to-white" id="calculator">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#700895]/10 text-[#700895] text-xs font-bold">
            <Calculator size={14} />
            <span>Instant Price Estimator & Customizer</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Calculate Your Order in 30 Seconds
          </h2>
          <p className="text-sm text-slate-600">
            Real-time bulk discounts, choice of luxury finishes, and transparent delivery dates.
          </p>
        </div>

        {/* Interactive Estimator Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Form Configuration */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            
            {/* 1. Choose Product */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                1. Select Product Type
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {productOptions.map((prod, idx) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductChange(idx)}
                    className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                      selectedProductIdx === idx
                        ? 'border-[#700895] bg-purple-50/80 text-[#700895] shadow-xs ring-2 ring-[#700895]/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <p className="line-clamp-1">{prod.name}</p>
                    <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">
                      Min Qty: {prod.minQty}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Choose Quantity */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Choose Quantity
                </label>
                {volumeDiscountPct > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Percent size={11} /> {volumeDiscountPct}% Bulk Savings Applied!
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProduct.quantities.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQty(q)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedQty === q
                        ? 'bg-[#700895] text-white shadow-md shadow-purple-900/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {q} units
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Choose Finish / Material */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                3. Surface Finish & Coating
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {currentProduct.finishes.map((f, idx) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFinishIdx(idx)}
                    className={`p-3 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                      selectedFinishIdx === idx
                        ? 'border-[#700895] bg-purple-50 text-[#700895] font-bold ring-1 ring-[#700895]'
                        : 'border-slate-200 text-slate-700 font-medium hover:border-slate-300'
                    }`}
                  >
                    <span>{f.name}</span>
                    {f.extraPct > 0 ? (
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                        +{f.extraPct}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold">Standard</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Priority Speed Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isExpress}
                  onChange={(e) => setIsExpress(e.target.checked)}
                  className="w-4 h-4 text-[#700895] rounded focus:ring-purple-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500" />
                      Priority Express Dispatch (Within 24 Hours)
                    </span>
                    <span className="font-bold text-slate-900">+₹150</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Orders placed before 2 PM dispatched the very same evening.
                  </p>
                </div>
              </label>
            </div>

          </div>

          {/* Right Column: Live Price Summary & Order Actions */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#200329] to-[#3B074B] text-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-semibold text-purple-200">Live Quotation</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-400 text-purple-950 px-2 py-0.5 rounded">
                  GST Invoiced
                </span>
              </div>

              {/* Item preview details */}
              <div className="py-5 space-y-3">
                <h3 className="text-lg font-bold text-white leading-snug">
                  {currentProduct.name}
                </h3>
                
                <div className="space-y-1.5 text-xs text-purple-200">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <strong className="text-white">{selectedQty} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Finish:</span>
                    <strong className="text-white">{currentProduct.finishes[selectedFinishIdx]?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Effective Unit Rate:</span>
                    <strong className="text-amber-300">₹{discountedUnitRate.toFixed(2)} / unit</strong>
                  </div>
                  {isExpress && (
                    <div className="flex justify-between text-amber-300">
                      <span>Express Processing:</span>
                      <strong>+₹150</strong>
                    </div>
                  )}
                </div>

                {/* Savings Pill */}
                {totalSavings > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex items-center justify-between">
                    <span className="font-medium">Total Bulk Savings:</span>
                    <span className="font-black text-white text-sm">Save ₹{totalSavings}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Total & Actions */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-purple-200 block">Total Estimated Price:</span>
                  <span className="text-xs text-purple-300">(All taxes & packing included)</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white tracking-tight">
                    ₹{totalSubtotal}
                  </span>
                  {totalSavings > 0 && (
                    <span className="text-xs text-purple-300 line-through block">
                      ₹{regularTotal}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAdd}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <ShoppingCart size={17} />
                  <span>Add To Cart Now</span>
                </button>

                <button
                  onClick={handleAdd}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload size={14} className="text-amber-300" />
                  <span>Upload Custom Artwork & Order</span>
                </button>
              </div>

              {/* Success Notification */}
              {addedSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} />
                  <span>Added {selectedQty} units to your cart successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-[11px] text-purple-300 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-400" /> 100% Quality Reprints
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-amber-400" /> Dispatches {currentProduct.turnaround}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
