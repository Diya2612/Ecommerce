'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  User, 
  MapPin, 
  Phone, 
  Sparkles, 
  Building2, 
  Truck, 
  CheckCircle2, 
  X,
  Menu,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PRINTO_CATEGORIES } from '@/lib/data/printoData';

interface PrintoHeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenBulkModal?: () => void;
}

export const PrintoHeader: React.FC<PrintoHeaderProps> = ({
  cartCount = 0,
  onOpenCart,
  onOpenBulkModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Bangalore (560001)');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const popularSearches = ['Visiting Cards', 'Custom Mugs', 'ID Cards', 'Cotton T-Shirts', 'Standees', 'Diary'];

  const cities = [
    'Bangalore (560001)',
    'Mumbai (400001)',
    'Delhi NCR (110001)',
    'Hyderabad (500001)',
    'Chennai (600001)',
    'Pune (411001)',
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm transition-all">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#5A0678] via-[#700895] to-[#8B1FAE] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-amber-400 text-purple-950 font-bold px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase">
              Special Offer
            </span>
            <span>
              Use Code <strong className="underline decoration-amber-400 font-bold">PRINTOFIRST</strong> for 15% OFF your first order!
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-purple-100 text-xs">
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-amber-300" /> Free Delivery on orders over ₹999
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-300" /> 100% Quality Reprint Guarantee
            </span>
            <Link href="/amc" className="hover:text-amber-300 transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo & City Picker */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-purple-900 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={24} />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#700895] to-[#9D17BE] flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                P
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#700895] transition-colors leading-none">
                  printo<span className="text-[#FFB800]">.</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#700895] leading-tight">
                  Custom Printing
                </span>
              </div>
            </Link>

            {/* City / Location Picker */}
            <div className="hidden xl:flex items-center relative text-xs">
              <button 
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
              >
                <MapPin size={14} className="text-[#700895]" />
                <span>{selectedCity.split(' ')[0]}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {isCityOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 py-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Select Delivery City</p>
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setSelectedCity(c); setIsCityOpen(false); }}
                      className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#700895] rounded-md transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar with Autocomplete Pill Suggestions */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search across 500+ customized products (e.g. Business Cards, T-shirts, Mugs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895] transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              
              <button className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#700895] hover:bg-[#5A0678] text-white text-xs font-semibold rounded-lg transition-colors">
                Search
              </button>
            </div>

            {/* Popular search chips */}
            <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600">Popular:</span>
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="hover:text-[#700895] hover:underline whitespace-nowrap transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs: Bulk Inquiries, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Corporate Bulk Quote Button */}
            <button
              onClick={onOpenBulkModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-[#700895] hover:bg-purple-100 font-semibold text-xs transition-colors"
            >
              <Building2 size={15} />
              <span>Bulk Orders</span>
              <span className="bg-[#700895] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                Save 50%
              </span>
            </button>

            {/* Store Locator */}
            <Link
              href="/contact"
              className="hidden xl:flex items-center gap-1 text-slate-600 hover:text-[#700895] text-xs font-medium px-2 py-1.5"
            >
              <Phone size={14} className="text-[#700895]" />
              <span>28+ Stores</span>
            </Link>

            {/* Account Profile / Login */}
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-[#700895] rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium"
            >
              <User size={19} className="text-slate-600" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>

            {/* Cart Trigger Button with badge */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-gradient-to-r from-[#700895] to-[#8B1FAE] hover:from-[#5A0678] hover:to-[#700895] text-white rounded-xl shadow-sm transition-all"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-purple-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search visiting cards, mugs, apparel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* 3. Horizontal Category Navigation Strip */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 text-xs font-medium text-slate-700">
            <Link 
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-[#700895] font-semibold whitespace-nowrap"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>All Products</span>
            </Link>

            {PRINTO_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.slug}`}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-[#700895] whitespace-nowrap transition-colors"
              >
                {cat.name}
              </a>
            ))}

            <Link
              href="/amc"
              className="ml-auto hidden lg:flex items-center gap-1 text-amber-600 font-bold px-3 py-1.5 hover:text-amber-700 whitespace-nowrap"
            >
              <span>Corporate Onboarding Kits</span>
              <ArrowRight size={13} />
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#700895] flex items-center justify-center text-white font-black">
                    P
                  </div>
                  <span className="text-xl font-black text-slate-900">printo.</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</p>
                <div className="space-y-1">
                  {PRINTO_CATEGORIES.map((c) => (
                    <a
                      key={c.id}
                      href={`#${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-sm text-slate-700 hover:bg-purple-50 hover:text-[#700895]"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-slate-400 font-normal">From ₹{c.startingPrice}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenBulkModal?.(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 text-[#700895] font-bold rounded-xl text-xs"
                >
                  <Building2 size={16} /> Request Bulk Quote (50% Off)
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Need Assistance?</p>
              <p>Call: +91 80 4643 4343</p>
              <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
