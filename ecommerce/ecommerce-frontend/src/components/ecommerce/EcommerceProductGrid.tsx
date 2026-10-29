'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
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
  <div
    style={{
      borderRadius: '16px',
      background: 'var(--sv-bg-2)',
      border: '1px solid var(--sv-line-soft)',
      padding: '1rem',
      display: 'flex', flexDirection: 'column', gap: '.75rem',
    }}
    className="animate-pulse"
  >
    <div style={{ height: '1.2rem', width: '60%', background: 'var(--sv-bg-3)', borderRadius: '999px' }} />
    <div style={{ aspectRatio: '1', width: '100%', background: 'var(--sv-bg-3)', borderRadius: '10px' }} />
    <div style={{ height: '1rem', width: '80%', background: 'var(--sv-bg-3)', borderRadius: '999px' }} />
    <div style={{ height: '.8rem', width: '100%', background: 'var(--sv-bg-3)', borderRadius: '999px' }} />
    <div style={{ height: '2.2rem', width: '100%', background: 'var(--sv-bg-3)', borderRadius: '999px', marginTop: '.5rem' }} />
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
      colors: ['#E6B94A', '#F6DB8E', '#AEB7D0'],
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);

    if (onAddToCart) onAddToCart(product);
  }, [onAddToCart]);

  return (
    <section
      id="trending-products"
      style={{
        paddingBlock: 'clamp(40px, 6vw, 80px)',
        background: 'var(--sv-bg)',
        borderBottom: '1px solid var(--sv-line-soft)',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* Section Header */}
        <div
          style={{
            display: 'flex', flexDirection: 'column', gap: '1rem',
            marginBottom: '1.6rem',
          }}
          className="md:flex-row md:items-end md:justify-between"
        >
          <div>
            {/* Live badge */}
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                padding: '.3rem .9rem', borderRadius: '999px',
                border: '1px solid var(--sv-line)',
                color: 'var(--sv-gold-2)', fontSize: '.78rem', fontWeight: 600,
                marginBottom: '.6rem',
              }}
            >
              {isFromAPI && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--sv-gold)' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--sv-gold)' }} />
                </span>
              )}
              {isFromAPI ? 'Live Catalog' : 'Featured Collection'}
            </div>

            <h2
              style={{
                fontFamily: 'var(--sv-serif)', fontWeight: 600,
                fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
                color: 'var(--sv-ink)', lineHeight: 1.12, margin: 0,
              }}
            >
              Featured Products &amp; Innovations
            </h2>
            <p style={{ color: 'var(--sv-muted)', marginTop: '.4rem', fontSize: '.88rem' }}>
              {isFromAPI
                ? `${products.length} products from live catalog`
                : 'Click any product to experience interactive 3D rotation and real-time colors.'}
            </p>
          </div>

          {/* Sort + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            {/* API indicator */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '.4rem',
                padding: '.35rem .8rem', borderRadius: '999px',
                border: '1px solid var(--sv-line-soft)',
                color: isFromAPI ? 'var(--sv-gold)' : 'var(--sv-muted)',
                fontSize: '.76rem', fontWeight: 600,
              }}
              className="hidden sm:flex"
            >
              {isFromAPI ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isFromAPI ? 'Live API' : 'Offline / Static'}
            </div>

            {isError && (
              <button
                onClick={() => refetch()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  padding: '.35rem .8rem', borderRadius: '999px',
                  background: 'rgba(230,185,74,.12)', border: '1px solid var(--sv-gold)',
                  color: 'var(--sv-gold)', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ color: 'var(--sv-muted)', fontSize: '.82rem' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                style={{
                  background: 'var(--sv-bg-2)',
                  border: '1px solid var(--sv-line-soft)',
                  borderRadius: '10px',
                  padding: '.45rem .7rem',
                  color: 'var(--sv-ink)',
                  fontSize: '.82rem', fontWeight: 600,
                  outline: 'none',
                  colorScheme: 'dark',
                }}
              >
                <option value="featured">Featured &amp; Popular</option>
                <option value="rating">Highest Rated (★)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            overflowX: 'auto', paddingBottom: '.5rem',
            marginBottom: '1.4rem', scrollbarWidth: 'none',
          }}
        >
          {/* "All" chip */}
          <button
            onClick={() => handleCategoryClick('all')}
            style={{
              padding: '.45rem 1rem', borderRadius: '999px',
              fontSize: '.82rem', fontWeight: 600, whiteSpace: 'nowrap',
              cursor: 'pointer', transition: 'background .2s, border-color .2s, color .2s',
              border: `1px solid ${currentCategory === 'all' ? 'var(--sv-gold)' : 'var(--sv-line)'}`,
              background: currentCategory === 'all' ? 'var(--sv-gold)' : 'transparent',
              color: currentCategory === 'all' ? 'var(--sv-on-gold)' : 'var(--sv-muted)',
            }}
          >
            All ({products.length})
          </button>
          {ECOMMERCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                padding: '.45rem 1rem', borderRadius: '999px',
                fontSize: '.82rem', fontWeight: 600, whiteSpace: 'nowrap',
                cursor: 'pointer', transition: 'background .2s, border-color .2s, color .2s',
                border: `1px solid ${currentCategory === cat.id ? 'var(--sv-gold)' : 'var(--sv-line)'}`,
                background: currentCategory === cat.id ? 'var(--sv-gold)' : 'transparent',
                color: currentCategory === cat.id ? 'var(--sv-on-gold)' : 'var(--sv-muted)',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', paddingBlock: '4rem', color: 'var(--sv-muted)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
            <p style={{ fontWeight: 500 }}>No products found</p>
            <button
              onClick={() => handleCategoryClick('all')}
              style={{
                marginTop: '1rem', padding: '.6rem 1.4rem', borderRadius: '999px',
                background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                border: 'none', fontWeight: 600, cursor: 'pointer',
              }}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => {
              const isAdded = addedIds[product.id];
              const primaryImage = product.images?.[0];

              return (
                <ThreeDCard
                  key={product.id}
                  maxTilt={10}
                  scale={1.02}
                  onClick={() => onSelectProductFor3D && onSelectProductFor3D(product)}
                  className="sv-card cursor-pointer"
                  style={{
                    display: 'grid', gap: '.55rem', textDecoration: 'none', alignContent: 'start',
                    borderRadius: '16px',
                    background: 'var(--sv-bg-2)',
                    border: '1px solid var(--sv-line-soft)',
                    padding: '1rem',
                    transition: 'border-color .2s, transform .2s',
                  } as React.CSSProperties}
                >
                  {/* Top: Badge & Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {product.badge ? (
                      <span
                        style={{
                          padding: '.2rem .7rem', borderRadius: '999px',
                          fontSize: '.72rem', fontWeight: 700,
                          background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                        }}
                      >
                        {product.badge}
                      </span>
                    ) : (
                      <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--sv-muted)' }}>
                        {product.categoryName}
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.78rem', color: 'var(--sv-gold)', fontWeight: 700 }}>
                      <Star className="w-3 h-3 fill-current" />
                      {product.rating?.toFixed(1) ?? '4.5'}
                      {product.reviewsCount > 0 && (
                        <span style={{ color: 'var(--sv-muted)', fontSize: '.68rem', fontWeight: 400 }}>
                          ({product.reviewsCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Image tile — sv-tile style */}
                  <div
                    className="sv-tile group/tile"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain transition-transform duration-500 group-hover/tile:scale-110 opacity-90"
                        unoptimized={primaryImage.startsWith('http')}
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12" style={{ color: 'var(--sv-gold)' }} />
                    )}

                    {/* Hover overlay */}
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(10,20,48,.55)',
                        opacity: 0, transition: 'opacity .25s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)',
                      }}
                      className="group-hover:opacity-100"
                    >
                      <span
                        style={{
                          display: 'flex', alignItems: 'center', gap: '.4rem',
                          padding: '.45rem 1rem', borderRadius: '999px',
                          background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                          fontSize: '.78rem', fontWeight: 700,
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" /> Quick 3D View
                      </span>
                    </div>
                  </div>

                  {/* Product info */}
                  <div style={{ transform: 'translateZ(10px)' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--sv-sans)', fontWeight: 600,
                        fontSize: '.98rem', color: 'var(--sv-ink)',
                        lineHeight: 1.3, margin: 0,
                      }}
                      className="line-clamp-1 group-hover:text-[--sv-gold-2]"
                    >
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '.78rem', color: 'var(--sv-muted)', marginTop: '.25rem', lineHeight: 1.4 }} className="line-clamp-1">
                      {product.tagline}
                    </p>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '.5rem' }}>
                        {product.colors.map((c) => (
                          <span
                            key={c.name}
                            title={c.name}
                            style={{
                              width: 10, height: 10, borderRadius: '50%',
                              background: c.hex,
                              border: '1px solid var(--sv-line)',
                            }}
                          />
                        ))}
                        <span style={{ fontSize: '.68rem', color: 'var(--sv-muted)' }}>{product.colors.length} colors</span>
                      </div>
                    )}

                    {/* Stock warning */}
                    {product.stockLeft > 0 && product.stockLeft <= 20 && (
                      <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#f87171', marginTop: '.4rem' }}>
                        Only {product.stockLeft} left!
                      </p>
                    )}
                  </div>

                  {/* Bottom bar: price + add */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderTop: '1px solid var(--sv-line-soft)', paddingTop: '.75rem',
                      transform: 'translateZ(15px)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.4rem' }}>
                        <span style={{ fontFamily: 'var(--sv-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--sv-gold-2)' }}>
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > product.price && (
                          <span style={{ fontSize: '.78rem', color: 'var(--sv-muted)', textDecoration: 'line-through' }}>
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {product.originalPrice > product.price && (
                        <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--sv-gold)' }}>
                          Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={!product.inStock}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '.35rem',
                        padding: '.5rem 1rem', borderRadius: '999px',
                        fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'background .2s, border-color .2s',
                        border: `1.5px solid ${isAdded ? '#34d399' : 'var(--sv-gold)'}`,
                        background: isAdded ? 'rgba(52,211,153,.15)' : 'var(--sv-gold)',
                        color: isAdded ? '#34d399' : 'var(--sv-on-gold)',
                        opacity: product.inStock ? 1 : 0.5,
                      }}
                    >
                      {isAdded ? (
                        <><Check className="w-3.5 h-3.5" /> Added</>
                      ) : (
                        <><ShoppingBag className="w-3.5 h-3.5" />{product.inStock ? 'Add' : 'OOS'}</>
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
