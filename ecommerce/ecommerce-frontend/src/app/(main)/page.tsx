'use client';

import React, { useState } from 'react';
import { EcommerceHeader } from '@/components/ecommerce/EcommerceHeader';
import { EcommerceHero3D } from '@/components/ecommerce/EcommerceHero3D';
import { PrintoQuickCategoriesBar } from '@/components/ecommerce/PrintoQuickCategoriesBar';
import { EcommerceProductGrid } from '@/components/ecommerce/EcommerceProductGrid';
import { ThreeDTestimonials } from '@/components/ecommerce/ThreeDTestimonials';
import { BulkQuoteModal } from '@/components/ecommerce/BulkQuoteModal';
import { EcommerceCartDrawer } from '@/components/ecommerce/EcommerceCartDrawer';
import { ThreeDModalViewer } from '@/components/ecommerce/ThreeDModalViewer';
import { EcommerceFooter } from '@/components/ecommerce/EcommerceFooter';
import type { Product } from '@/components/ecommerce/EcommerceData';
import { useCartSync } from '@/hooks/useCartSync';

export default function Ecommerce3DHomePage() {
  const {
    cartItems,
    cartCount,
    addItem,
    updateItem,
    removeItem,
  } = useCartSync();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedProductFor3D, setSelectedProductFor3D] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleAddToCart = async (product: Product, color?: string) => {
    await addItem(product, color);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateItem(productId, quantity);
  };

  const handleRemoveCartItem = (productId: string) => {
    removeItem(productId);
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    const gridEl = document.getElementById('trending-products');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* 1. Header */}
      <EcommerceHeader
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
      />

      {/* Main Storefront Flow */}
      <main className="flex-1">
        {/* 2. Showstopper 3D Hero Stage */}
        <div className="bg-slate-50/40 pb-4">
          <EcommerceHero3D />
        </div>

        {/* Section Divider 1 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 border border-slate-200 rounded-full py-0.5 shadow-xs">
              Quick Browse
            </span>
          </div>
        </div>

        {/* 3. Quick Categories Strip */}
        <div className="py-2">
          <PrintoQuickCategoriesBar />
        </div>

        {/* Section Divider 2 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
            <span className="absolute bg-white px-5 text-xs font-bold uppercase tracking-wider text-purple-700 border border-purple-200 rounded-full py-1 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Featured Catalog
            </span>
          </div>
        </div>

        {/* 4. Full Product Catalog — now connected to API */}
        <div className="py-2">
          <EcommerceProductGrid
            activeCategory={activeCategory}
            onCategoryChange={(cat) => setActiveCategory(cat)}
            onSelectProductFor3D={(p) => setSelectedProductFor3D(p)}
            onAddToCart={(p) => handleAddToCart(p)}
          />
        </div>

        {/* Section Divider 3 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 border border-slate-200 rounded-full py-0.5 shadow-xs">
              Customer Reviews &amp; Trust
            </span>
          </div>
        </div>

        {/* 5. Verified Customer Reviews */}
        <div className="bg-slate-50/70 border-t border-slate-200/80">
          <ThreeDTestimonials />
        </div>
      </main>

      {/* Footer */}
      <EcommerceFooter />

      {/* Slide-over Cart Drawer — now synced with backend */}
      <EcommerceCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
      />

      {/* 3D Product Interactive Modal Viewer */}
      <ThreeDModalViewer
        product={selectedProductFor3D}
        onClose={() => setSelectedProductFor3D(null)}
        onAddToCart={(p, color) => handleAddToCart(p, color)}
      />

      {/* Bulk Order Enterprise Quote Modal */}
      <BulkQuoteModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
}
