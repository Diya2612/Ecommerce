'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Heart,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Box,
  Flame,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  PenTool,
  Clock,
  Truck,
} from 'lucide-react';
import { ECOMMERCE_CATEGORIES } from './EcommerceData';

interface EcommerceHeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenBulkModal?: () => void;
  onSearch?: (query: string) => void;
}

export const EcommerceHeader: React.FC<EcommerceHeaderProps> = ({
  cartCount = 2,
  onOpenCart,
  onOpenBulkModal,
  onSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      {/* 1. Printo Utility Bar (Topmost) - Pure Light Theme */}
      <div className="bg-purple-50/70 text-slate-700 text-[11px] font-medium py-1 px-4 border-b border-purple-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Same-Day Dispatch &amp; 4-Hour Delivery in Metros
            </span>
            <span className="hidden lg:inline text-slate-300">|</span>
            <a
              href="tel:08069006900"
              className="hidden lg:flex items-center gap-1 text-slate-600 hover:text-purple-700 transition-colors"
            >
              <Phone className="w-3 h-3 text-purple-600" />
              <span>Support: 080-6900 6900 (9am - 9pm)</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href="#stores-section"
              className="hidden sm:flex items-center gap-1 text-slate-600 hover:text-purple-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>30+ Stores &amp; 2h Pickup</span>
            </a>
            <a
              href="#design-services"
              className="hidden md:flex items-center gap-1 text-amber-700 hover:text-amber-800 transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Hire a Designer (₹499)</span>
            </a>
            <button
              onClick={onOpenBulkModal}
              className="flex items-center gap-1 text-purple-700 hover:text-purple-900 transition-colors font-bold"
            >
              <Building className="w-3.5 h-3.5 text-purple-600" />
              <span>Order in Bulk (B2B)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Search & Brand Header - Compact Height */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Brand Logo with 3D gradient emblem */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:rotate-12 transition-transform duration-300">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                PRINTO<span className="text-purple-600">COMMERCE</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 block -mt-1">
                India&apos;s Premium 3D Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visiting cards, custom mailer boxes, tumblers, polo shirts, standees..."
              className="w-full pl-10 pr-24 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5 sm:gap-3">


            {/* Cart Pill */}
            <button
              onClick={onOpenCart}
              aria-label="Shopping Cart"
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="w-5 h-5 rounded-full bg-white text-purple-700 text-xs flex items-center justify-center font-black">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 3. Secondary Category Ribbon Bar (Desktop) - Sleek & Compact */}
        <div className="hidden lg:flex items-center justify-between border-t border-slate-100 py-2 text-xs font-semibold text-slate-700 overflow-x-auto scrollbar-none">
          {ECOMMERCE_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href="#trending-products"
              className="hover:text-purple-600 whitespace-nowrap transition-colors flex items-center gap-1 px-2"
            >
              <span>{cat.name}</span>
            </a>
          ))}
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenBulkModal) onOpenBulkModal();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 mb-2"
          >
            <Building className="w-4 h-4" />
            <span>Order in Bulk / Enterprise Quote</span>
          </button>

          <a
            href="#3d-customizer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>3D Live Product Customizer</span>
          </a>

          <a
            href="#design-services"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400"
          >
            <PenTool className="w-4 h-4" />
            <span>Hire a Designer (₹499)</span>
          </a>

          <a
            href="#stores-section"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            <MapPin className="w-4 h-4" />
            <span>30+ Stores &amp; 2-Hour Pickup</span>
          </a>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] uppercase font-bold text-slate-400 px-2 mb-1">
              Shop Categories
            </div>
            {ECOMMERCE_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href="#trending-products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-slate-400">{cat.itemCount}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
