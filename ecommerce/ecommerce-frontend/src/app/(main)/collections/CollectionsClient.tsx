'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EcommerceHeader } from '@/components/ecommerce/EcommerceHeader';
import { EcommerceProductGrid } from '@/components/ecommerce/EcommerceProductGrid';
import { EcommerceCartDrawer } from '@/components/ecommerce/EcommerceCartDrawer';
import { EcommerceFooter } from '@/components/ecommerce/EcommerceFooter';
import { BulkQuoteModal } from '@/components/ecommerce/BulkQuoteModal';
import { ThreeDModalViewer } from '@/components/ecommerce/ThreeDModalViewer';
import { useCartSync } from '@/hooks/useCartSync';
import { ECOMMERCE_CATEGORIES, type Product } from '@/components/ecommerce/EcommerceData';
import {
  Sparkles,
  ShoppingBag,
  Layers,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Grid,
} from 'lucide-react';

export function CollectionsClient() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('categories') || searchParams.get('category') || 'all';

  // Normalize category (e.g. 'sports' -> 'apparel' if not direct match)
  const resolveCategory = (cat: string) => {
    if (!cat || cat === 'all') return 'all';
    const lower = cat.toLowerCase();
    if (lower === 'sports' || lower === 'sportswear' || lower === 'clothing') return 'apparel';
    if (lower === 'cards' || lower === 'visiting') return 'visiting-cards';
    if (lower === 'boxes' || lower === 'packing') return 'custom-packaging';
    if (lower === 'mugs' || lower === 'bottles') return 'drinkware-gifts';
    return lower;
  };

  const [activeCategory, setActiveCategory] = useState<string>(resolveCategory(urlCategory));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedProductFor3D, setSelectedProductFor3D] = useState<Product | null>(null);

  const {
    cartItems,
    cartCount,
    addItem,
    updateItem,
    removeItem,
  } = useCartSync();

  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(resolveCategory(urlCategory));
    }
  }, [urlCategory]);

  const handleAddToCart = async (product: Product, color?: string) => {
    await addItem(product, color);
    setIsCartOpen(true);
  };

  const currentCategoryObj = ECOMMERCE_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header */}
      <EcommerceHeader
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
      />

      {/* 2. Breadcrumb & Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-purple-400 font-semibold">Collections</span>
            {activeCategory !== 'all' && currentCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white font-bold">{currentCategoryObj.name}</span>
              </>
            )}
          </nav>

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Curated Ecommerce Catalog</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
                {activeCategory === 'all'
                  ? 'All Product Collections'
                  : currentCategoryObj?.name || 'Curated Products'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Explore custom merchandise, personalized apparel, corporate giftings, high-end packaging, and accessories built with factory-grade craftsmanship.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified Quality</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Direct Pricing</span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'all'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Collections</span>
            </button>

            {ECOMMERCE_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                      : 'bg-white/10 hover:bg-white/15 text-slate-300'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Product Grid Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <EcommerceProductGrid
          activeCategory={activeCategory}
          onCategoryChange={(cat) => setActiveCategory(cat)}
          onAddToCart={handleAddToCart}
          onSelectProductFor3D={(product) => setSelectedProductFor3D(product)}
        />
      </main>

      {/* 4. Cart Drawer */}
      <EcommerceCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, qty) => updateItem(id, qty)}
        onRemoveItem={(id) => removeItem(id)}
      />

      {/* 5. 3D Product Viewer Modal */}
      {selectedProductFor3D && (
        <ThreeDModalViewer
          product={selectedProductFor3D}
          onClose={() => setSelectedProductFor3D(null)}
          onAddToCart={(prod) => {
            handleAddToCart(prod);
            setSelectedProductFor3D(null);
          }}
        />
      )}

      {/* 6. Bulk Quote Modal */}
      {isBulkModalOpen && (
        <BulkQuoteModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}

      {/* 7. Footer */}
      <EcommerceFooter />
    </div>
  );
}
