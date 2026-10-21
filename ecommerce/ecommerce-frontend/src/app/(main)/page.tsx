'use client';

import React, { useState } from 'react';
import { EcommerceHeader } from '@/components/ecommerce/EcommerceHeader';
import { EcommerceHero3D } from '@/components/ecommerce/EcommerceHero3D';
import { PrintoQuickCategoriesBar } from '@/components/ecommerce/PrintoQuickCategoriesBar';


import { EcommerceProductGrid } from '@/components/ecommerce/EcommerceProductGrid';
import { ThreeDTestimonials } from '@/components/ecommerce/ThreeDTestimonials';
import { BulkQuoteModal } from '@/components/ecommerce/BulkQuoteModal';
import {
  EcommerceCartDrawer,
  CartItem,
} from '@/components/ecommerce/EcommerceCartDrawer';
import { ThreeDModalViewer } from '@/components/ecommerce/ThreeDModalViewer';
import { EcommerceFooter } from '@/components/ecommerce/EcommerceFooter';
import {
  ECOMMERCE_PRODUCTS,
  Product,
} from '@/components/ecommerce/EcommerceData';

export default function Ecommerce3DHomePage() {
  // Cart state initialized with Printo flagship items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: ECOMMERCE_PRODUCTS[0], // Royal 3D Gold Foil Luxury Visiting Cards
      quantity: 1,
      selectedColor: 'Metallic Gold on Velvet Black',
    },
    {
      product: ECOMMERCE_PRODUCTS[3], // AeroThermal Stainless Steel Laser-Engraved Tumbler
      quantity: 1,
      selectedColor: 'Matte Obsidian Black',
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedProductFor3D, setSelectedProductFor3D] =
    useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleAddToCart = (product: Product, color?: string) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (!color || item.selectedColor === color)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      }

      return [
        {
          product,
          quantity: 1,
          selectedColor:
            color || product.colors?.[0]?.name || 'Standard',
        },
        ...prev,
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
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
      {/* 1. Header with Support phone, 30+ stores, bulk inquiry & search */}
      <EcommerceHeader
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
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

        {/* 3. Clean Quick Categories Strip */}
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

        {/* 4. Full Product Catalog & Filterable Grid */}
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
              Customer Reviews & Trust
            </span>
          </div>
        </div>

        {/* 5. Verified Customer Reviews & Trusted Brand Logos */}
        <div className="bg-slate-50/70 border-t border-slate-200/80">
          <ThreeDTestimonials />
        </div>
      </main>

      {/* 17. Footer with 24/7 Support, Return Policies & Genuine Security */}
      <EcommerceFooter />

      {/* Slide-over Cart Drawer */}
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
