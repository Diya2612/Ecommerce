'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Phone,
  User,
  LogIn,
  ChevronRight,
  Package,
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

/* ── Suvarna brand mark (sun/constellation) ─────────────────────── */
const SuvarnaIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="6" stroke="#E6B94A" strokeWidth="2" fill="none"/>
    <circle cx="24" cy="3.6"  r="3.4" fill="#E6B94A"/>
    <circle cx="24" cy="44.4" r="3.4" fill="#E6B94A"/>
    <circle cx="41.7" cy="13.8" r="3.4" fill="#E6B94A"/>
    <circle cx="41.7" cy="34.2" r="3.4" fill="#E6B94A"/>
    <circle cx="6.3"  cy="34.2" r="3.4" fill="#E6B94A"/>
    <circle cx="6.3"  cy="13.8" r="3.4" fill="#E6B94A"/>
    <path d="M24 18V7M24 30v11M29.2 21l9.5-5.5M29.2 27l9.5 5.5M18.8 27l-9.5 5.5M18.8 21l-9.5-5.5"
          stroke="#E6B94A" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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

  /* live search */
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
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 320);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

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
    const gridEl = document.getElementById('trending-products');
    if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      style={{
        background: 'rgba(10,20,48,.96)',
        borderBottom: '1px solid rgba(243,235,218,.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      className="sticky top-0 z-50"
    >
      {/* ── Top utility strip ── */}
      <div
        style={{ background: 'var(--sv-gold)', color: 'var(--sv-on-gold)' }}
        className="text-center text-xs font-semibold py-1.5 px-4"
      >
        Store preview — Custom photo prints, albums, video invites &amp; keepsake boxes
      </div>

      {/* ── Main header row ── */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 py-3 flex-wrap">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline group" aria-label="Suvarna Custom, home">
            <SuvarnaIcon />
            <span
              style={{ font: '600 1.55rem var(--sv-round)', color: 'var(--sv-gold)' }}
              className="group-hover:opacity-90 transition-opacity"
            >
              Suvarna
            </span>
          </Link>

          {/* Desktop Search */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-[520px] mx-auto relative" style={{ order: 0 }}>
            <form onSubmit={handleSearchSubmit} className="flex w-full items-center relative">
              <Search className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{ color: 'var(--sv-muted)' }} />
              <input
                type="search"
                id="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Search prints, albums, invites, gifts"
                aria-label="Search products"
                style={{
                  width: '100%', paddingLeft: '2.6rem', paddingRight: '6rem',
                  paddingBlock: '.65rem',
                  background: 'var(--sv-bg-2)',
                  border: '1px solid var(--sv-line-soft)',
                  borderRadius: '999px',
                  color: 'var(--sv-ink)',
                  font: '400 .95rem var(--sv-sans)',
                  outline: 'none',
                }}
                className="focus:ring-2 focus:ring-[--sv-gold-2] focus:border-[--sv-gold] transition-all"
              />
              <button
                type="submit"
                style={{
                  position: 'absolute', right: '4px', top: '4px', bottom: '4px',
                  paddingInline: '1rem', borderRadius: '999px',
                  background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                  font: '600 .88rem var(--sv-sans)', border: 'none', cursor: 'pointer',
                }}
              >
                {isSearching ? '…' : 'Search'}
              </button>
            </form>

            {/* Live dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: 'var(--sv-bg-2)',
                  border: '1px solid var(--sv-line)',
                  borderRadius: '16px', zIndex: 50, overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,.5)',
                }}
              >
                <div className="p-2">
                  <p style={{ color: 'var(--sv-muted)', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }} className="px-2 py-1">
                    Search Results
                  </p>
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.slug ? `/product/${result.slug}` : `/product/${result.id}`}
                      onClick={() => setShowDropdown(false)}
                      style={{ color: 'var(--sv-ink)', textDecoration: 'none' }}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[--sv-bg-3] transition-colors group/item"
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--sv-bg-3)', border: '1px solid var(--sv-line-soft)' }} className="shrink-0 overflow-hidden flex items-center justify-center">
                        {result.image ? (
                          <Image src={result.image} alt={result.name} width={40} height={40} className="object-contain" unoptimized />
                        ) : (
                          <Package className="w-4 h-4" style={{ color: 'var(--sv-muted)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '.88rem', fontWeight: 600 }} className="truncate group-hover/item:text-[--sv-gold-2]">{result.name}</p>
                        {result.price && (
                          <p style={{ fontSize: '.78rem', color: 'var(--sv-gold-2)', fontWeight: 600 }}>₹{result.price.toLocaleString('en-IN')}</p>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--sv-muted)' }} />
                    </Link>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--sv-line-soft)', padding: '.5rem 1rem' }}>
                  <button onClick={handleSearchSubmit} style={{ color: 'var(--sv-gold-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <Search className="w-3 h-3" />
                    See all results for &ldquo;{searchQuery}&rdquo;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Phone */}
            <a
              href="tel:08069006900"
              style={{ color: 'var(--sv-muted)', textDecoration: 'none', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: '.35rem' }}
              className="hidden xl:flex hover:text-[--sv-gold] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              080-6900 6900
            </a>

            {/* Bulk order */}
            <button
              onClick={onOpenBulkModal}
              style={{
                background: 'transparent',
                border: '1.5px solid var(--sv-line)',
                borderRadius: '999px',
                padding: '.45rem .9rem',
                color: 'var(--sv-gold)',
                font: '600 .82rem var(--sv-sans)',
                cursor: 'pointer',
                transition: 'border-color .2s, background .2s',
              }}
              className="hidden sm:block hover:border-[--sv-gold] hover:bg-[rgba(230,185,74,.08)]"
            >
              Bulk / B2B
            </button>

            {/* Login */}
            <Link
              href="/login"
              style={{
                display: 'flex', alignItems: 'center', gap: '.4rem',
                padding: '.45rem .9rem', borderRadius: '999px',
                border: '1.5px solid var(--sv-line)',
                color: 'var(--sv-ink)', textDecoration: 'none',
                font: '600 .82rem var(--sv-sans)',
                transition: 'border-color .2s',
              }}
              className="hidden sm:flex hover:border-[--sv-gold] hover:text-[--sv-gold]"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Link>

            {/* Account */}
            <Link
              href="/profile"
              style={{
                display: 'flex', alignItems: 'center', gap: '.4rem',
                padding: '.45rem .9rem', borderRadius: '999px',
                border: '1.5px solid var(--sv-line)',
                color: 'var(--sv-ink)', textDecoration: 'none',
                font: '600 .82rem var(--sv-sans)',
                transition: 'border-color .2s',
              }}
              className="hidden sm:flex hover:border-[--sv-gold] hover:text-[--sv-gold]"
              title="My Account"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Account</span>
            </Link>

            {/* Cart */}
            <button
              id="cart-button"
              onClick={onOpenCart}
              aria-label="Open cart"
              style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                padding: '.5rem .9rem', borderRadius: '999px',
                border: '1.5px solid var(--sv-line)',
                color: 'var(--sv-ink)',
                font: '500 .92rem var(--sv-sans)',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'border-color .2s',
              }}
              className="hover:border-[--sv-gold]"
            >
              <ShoppingBag className="w-4 h-4" style={{ color: 'var(--sv-gold)' }} />
              <span className="hidden sm:inline">Cart</span>
              <span
                style={{
                  background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                  borderRadius: '999px', minWidth: '1.35rem', height: '1.35rem',
                  display: 'grid', placeItems: 'center',
                  fontSize: '.76rem', fontWeight: 800, paddingInline: '.25rem',
                }}
              >
                {cartCount}
              </span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sv-ink)', padding: '.4rem' }}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--sv-muted)' }} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              style={{
                width: '100%', paddingLeft: '2.6rem', paddingRight: '5rem', paddingBlock: '.65rem',
                background: 'var(--sv-bg-2)', border: '1px solid var(--sv-line-soft)',
                borderRadius: '999px', color: 'var(--sv-ink)', font: '400 .88rem var(--sv-sans)', outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute', right: '4px', top: '4px', bottom: '4px',
                paddingInline: '.9rem', borderRadius: '999px',
                background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                font: '600 .82rem var(--sv-sans)', border: 'none', cursor: 'pointer',
              }}
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* ── Category nav bar ── */}
      <nav style={{ borderTop: '1px solid var(--sv-line-soft)' }} aria-label="Categories">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex gap-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {ECOMMERCE_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href="#trending-products"
                style={{
                  whiteSpace: 'nowrap', textDecoration: 'none',
                  color: 'var(--sv-muted)', fontSize: '.9rem',
                  paddingBlock: '.6rem',
                  borderBottom: '2px solid transparent',
                  display: 'inline-block',
                  transition: 'color .2s, border-color .2s',
                }}
                className="hover:text-[--sv-gold-2] hover:border-b-[--sv-gold]"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileMenuOpen && (
        <div
          style={{ background: 'var(--sv-bg-2)', borderTop: '1px solid var(--sv-line-soft)', padding: '1rem' }}
          className="md:hidden space-y-2"
        >
          <div className="flex gap-2 mb-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                padding: '.65rem', borderRadius: '999px',
                border: '1.5px solid var(--sv-line)', color: 'var(--sv-ink)',
                textDecoration: 'none', font: '600 .88rem var(--sv-sans)',
              }}
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                padding: '.65rem', borderRadius: '999px',
                background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                textDecoration: 'none', font: '600 .88rem var(--sv-sans)', border: 'none',
              }}
            >
              <User className="w-4 h-4" /> Register
            </Link>
          </div>
          <button
            onClick={() => { setMobileMenuOpen(false); if (onOpenBulkModal) onOpenBulkModal(); }}
            style={{
              width: '100%', padding: '.65rem', borderRadius: '999px',
              background: 'rgba(230,185,74,.12)', border: '1.5px solid var(--sv-gold)',
              color: 'var(--sv-gold)', font: '600 .9rem var(--sv-sans)', cursor: 'pointer',
            }}
          >
            Order in Bulk / Enterprise Quote
          </button>
          <div style={{ borderTop: '1px solid var(--sv-line-soft)', paddingTop: '.8rem', marginTop: '.8rem' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--sv-muted)', marginBottom: '.5rem', paddingInline: '.5rem' }}>
              Shop Categories
            </p>
            {ECOMMERCE_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href="#trending-products"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '.5rem', borderRadius: '10px',
                  color: 'var(--sv-ink)', textDecoration: 'none', fontSize: '.88rem', fontWeight: 500,
                }}
                className="hover:bg-[rgba(230,185,74,.08)] hover:text-[--sv-gold]"
              >
                <span>{cat.name}</span>
                <span style={{ fontSize: '.75rem', color: 'var(--sv-muted)' }}>{cat.itemCount}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
