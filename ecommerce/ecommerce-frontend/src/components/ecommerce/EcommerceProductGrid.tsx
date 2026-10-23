'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShoppingBag,
  Star,
  Check,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ECOMMERCE_CATEGORIES, type Product } from './EcommerceData';
import { ThreeDCard } from './ThreeDCard';
import { useProductsFromAPI } from '@/hooks/useProductsFromAPI';

interface EcommerceProductGridProps {
  onSelectProductFor3D?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-5 w-24 bg-slate-100 rounded-full" />
      <div className="h-5 w-12 bg-slate-100 rounded-full" />
    </div>
    <div className="h-48 w-full bg-slate-100 rounded-xl" />
    <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
    <div className="h-3 w-full bg-slate-100 rounded-full" />
    <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
      <div className="h-6 w-20 bg-slate-100 rounded-full" />
      <div className="h-9 w-20 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const EcommerceProductGrid: React.FC<EcommerceProductGridProps> = ({
  onSelectProductFor3D,
  onAddToCart,
  activeCategory = 'all',
  onCategoryChange,
}) => {
  const [currentCategory, setCurrentCategory] = useState(activeCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const { products, isLoading, isError, isFromAPI, refetch } = useProductsFromAPI({
    category: currentCategory,
    search: searchQuery,
    sort: sortBy,
  });

  const handleCategoryClick = (catId: string) => {
    setCurrentCategory(catId);
    setSearchQuery('');
    if (onCategoryChange) onCategoryChange(catId);
  };

  const handleQuickAdd = useCallback((e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ['#8b5cf6', '#3b82f6', '#ec4899'],
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);

    if (onAddToCart) onAddToCart(product);
  }, [onAddToCart]);

  return (
    <section id="trending-products" className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending Collection</span>
              {/* Live indicator */}
              {isFromAPI && (
                <span className="flex items-center gap-1 ml-1 text-emerald-700 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Products &amp; Innovations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isFromAPI
                ? `${products.length} products from live catalog`
                : 'Click any product to experience interactive 3D rotation, real-time colors, and engineering specs.'}
            </p>
          </div>

          {/* Sort + Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* API connection indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isFromAPI
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {isFromAPI ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isFromAPI ? 'Live API' : 'Offline / Static'}
            </div>

            {isError && (
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="featured">Featured &amp; Popular</option>
                <option value="rating">Highest Rated (★)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              currentCategory === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({products.length})
          </button>
          {ECOMMERCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid or Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-slate-500 font-medium">No products found</p>
            <button
              onClick={() => handleCategoryClick('all')}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => {
              const isAdded = addedIds[product.id];
              const primaryImage = product.images?.[0];

              return (
                <ThreeDCard
                  key={product.id}
                  maxTilt={12}
                  scale={1.02}
                  onClick={() => onSelectProductFor3D && onSelectProductFor3D(product)}
                  className="cursor-pointer rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between hover:border-purple-400 transition-all group shadow-xs hover:shadow-lg"
                >
                  <div>
                    {/* Top Bar with Badge & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      {product.badge ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {product.badge}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {product.categoryName}
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{product.rating?.toFixed(1) ?? '4.5'}</span>
                        {product.reviewsCount > 0 && (
                          <span className="text-slate-400 text-[10px] font-normal">
                            ({product.reviewsCount.toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3D Product Image Container */}
                    <div
                      style={{ transform: 'translateZ(30px)' }}
                      className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-50 p-4 mb-3 flex items-center justify-center"
                    >
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-110"
                          unoptimized={primaryImage.startsWith('http')}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-purple-300" />
                        </div>
                      )}

                      {/* Shimmer Overlay */}
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                      </div>

                      {/* Hover 3D Stage Prompt */}
                      <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <span className="px-3.5 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform">
                          <Eye className="w-3.5 h-3.5 text-purple-600" />
                          Quick 3D View
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div style={{ transform: 'translateZ(15px)' }}>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {product.tagline}
                      </p>

                      {/* Color Swatches */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {product.colors.map((c) => (
                            <span
                              key={c.name}
                              title={c.name}
                              className="w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {product.colors.length} colors
                          </span>
                        </div>
                      )}

                      {/* Stock indicator */}
                      {product.stockLeft > 0 && product.stockLeft <= 20 && (
                        <div className="mt-1.5 text-[10px] font-bold text-rose-600">
                          Only {product.stockLeft} left!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Price & Add to Cart */}
                  <div
                    style={{ transform: 'translateZ(20px)' }}
                    className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-slate-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={!product.inStock}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30 hover:scale-105'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {product.inStock ? 'Add' : 'OOS'}
                        </>
                      )}
                    </button>
                  </div>
                </ThreeDCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
