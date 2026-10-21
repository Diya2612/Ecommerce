'use client';

import React, { useState } from 'react';
import { 
  Star, 
  ShoppingCart, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Check, 
  CheckCircle2,
  SlidersHorizontal 
} from 'lucide-react';
import { PRINTO_PRODUCTS, PrintoProduct } from '@/lib/data/printoData';

interface PrintoFeaturedProductsProps {
  onAddToCart?: (item: any) => void;
  onOpenProductDetail?: (product: PrintoProduct) => void;
}

export const PrintoFeaturedProducts: React.FC<PrintoFeaturedProductsProps> = ({
  onAddToCart,
  onOpenProductDetail,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const tabs = [
    { id: 'all', label: 'All Bestsellers' },
    { id: 'visiting-cards', label: 'Visiting Cards' },
    { id: 'custom-apparel', label: 'Custom Apparel' },
    { id: 'drinkware', label: 'Mugs & Drinkware' },
    { id: 'stationery', label: 'Office Stationery' },
    { id: 'marketing', label: 'Marketing & Signs' },
    { id: 'corporate-gifting', label: 'Corporate Kits' },
  ];

  const filteredProducts = activeTab === 'all' 
    ? PRINTO_PRODUCTS 
    : PRINTO_PRODUCTS.filter((p) => p.category === activeTab);

  const handleQuickAdd = (product: PrintoProduct) => {
    onAddToCart?.({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      quantity: product.minQuantity,
      unitPrice: (product.startingPrice / product.minQuantity).toFixed(2),
      totalPrice: product.startingPrice,
      image: product.image,
    });
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 2000);
  };

  return (
    <section className="py-14 px-4 bg-white" id="bestsellers">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#700895] uppercase tracking-wider mb-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Trending Personalized Products</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              India's Most Ordered Custom Merchandise
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top rated by 10,000+ businesses and creative professionals across the nation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>24 - 48 Hour Express Delivery Available</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#700895] text-white shadow-md shadow-purple-900/15'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isAdded = justAddedId === product.id;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      {product.badge && (
                        <span className="bg-[#700895] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                          {product.badge}
                        </span>
                      )}
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={11} className="text-amber-300" />
                        {product.dispatchTime}
                      </span>
                    </div>

                    {/* Category Tag */}
                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-purple-900 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                      {product.categoryName}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-5 space-y-3">
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center text-amber-400">
                        <Star size={14} className="fill-amber-400" />
                        <span className="ml-1 font-bold text-slate-800">{product.rating}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        ({product.reviewsCount.toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#700895] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Feature bullets */}
                    <div className="space-y-1 pt-1">
                      {product.features.slice(0, 2).map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Check size={12} className="text-emerald-500 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & CTA */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-500">From</span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{product.startingPrice}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-purple-700 font-semibold block">
                        Min Qty: {product.minQuantity} units
                      </span>
                    </div>

                    {product.bulkPricing && product.bulkPricing.length > 0 && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md border border-emerald-200">
                        Bulk from ₹{product.bulkPricing[product.bulkPricing.length - 1].pricePerUnit}/pc
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenProductDetail?.(product)}
                      className="py-2.5 px-3 rounded-xl border border-purple-200 text-[#700895] hover:bg-purple-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <SlidersHorizontal size={14} />
                      <span>Customize</span>
                    </button>

                    <button
                      onClick={() => handleQuickAdd(product)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#700895] hover:bg-[#5A0678] text-white shadow-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} />
                          <span>Add {product.minQuantity} Qty</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
