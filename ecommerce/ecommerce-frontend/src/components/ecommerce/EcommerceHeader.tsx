'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  Building,
  MapPin,
  Phone,
  PenTool,
  User,
  LogIn,
  ChevronRight,
  Package,
  Box,
} from 'lucide-react';
import { ECOMMERCE_CATEGORIES } from './EcommerceData';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface SearchResult {
  id: string;
  name: string;
  image?: string;
  price?: number;
  slug?: string;
}

interface EcommerceHeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenBulkModal?: () => void;
  onSearch?: (query: string) => void;
}

export const EcommerceHeader: React.FC<EcommerceHeaderProps> = ({
  cartCount = 0,
  onOpenCart,
  onOpenBulkModal,
  onSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Live search ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery.trim())}&limit=6`,
          { signal: AbortSignal.timeout(4000) },
        );
        if (res.ok) {
          const json = await res.json();
          let items: SearchResult[] = [];
          if (Array.isArray(json)) items = json as SearchResult[];
          else if (Array.isArray(json?.data)) items = json.data as SearchResult[];
          else if (Array.isArray(json?.data?.products)) items = json.data.products as SearchResult[];
          else if (Array.isArray(json?.products)) items = json.products as SearchResult[];
          setSearchResults(items.slice(0, 6));
          setShowDropdown(true);
        }
      } catch {
        // Backend unreachable — no dropdown
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSearch) onSearch(searchQuery);
    // Scroll to product grid and filter
    const gridEl = document.getElementById('trending-products');
    if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">

      {/* 1. Top Utility Bar */}
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
              <span>Support: 080-6900 6900 (9am – 9pm)</span>
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

      {/* 2. Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">

          {/* Brand Logo */}
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

          {/* Desktop Search Bar with live dropdown */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="flex w-full items-center relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Search visiting cards, custom boxes, tumblers…"
                className="w-full pl-10 pr-24 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {isSearching ? '…' : 'Search'}
              </button>
            </form>

            {/* Live Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Search Results
                  </p>
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.slug ? `/product/${result.slug}` : `/product/${result.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-purple-50 transition-colors group/item"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.name}
                            width={40}
                            height={40}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover/item:text-purple-700">
                          {result.name}
                        </p>
                        {result.price && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            ₹{result.price.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-purple-500 shrink-0" />
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-100 px-4 py-2">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    See all results for &quot;{searchQuery}&quot;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5 sm:gap-3">

            {/* Auth Button */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all hover:border-purple-300 hover:shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden lg:inline">Login</span>
            </Link>

            {/* Account (if user logged in – shows as User icon) */}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all hover:border-purple-300"
              title="My Account"
            >
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Account</span>
            </Link>

            {/* Cart Pill */}
            <button
              id="cart-button"
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

        {/* 3. Category Ribbon Bar (Desktop) */}
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

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900"
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
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2">
          {/* Auth row */}
          <div className="flex gap-2 mb-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold"
            >
              <User className="w-4 h-4" />
              Register
            </Link>
          </div>

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
            className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-purple-600"
          >
            <Sparkles className="w-4 h-4" />
            <span>3D Live Product Customizer</span>
          </a>

          <a
            href="#design-services"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-amber-600"
          >
            <PenTool className="w-4 h-4" />
            <span>Hire a Designer (₹499)</span>
          </a>

          <a
            href="#stores-section"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-slate-700"
          >
            <MapPin className="w-4 h-4" />
            <span>30+ Stores &amp; 2-Hour Pickup</span>
          </a>

          <div className="pt-2 border-t border-slate-200">
            <div className="text-[11px] uppercase font-bold text-slate-400 px-2 mb-1">
              Shop Categories
            </div>
            {ECOMMERCE_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href="#trending-products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50"
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
