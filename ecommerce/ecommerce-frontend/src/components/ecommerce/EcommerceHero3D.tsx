'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Package } from 'lucide-react';
import { ECOMMERCE_PRODUCTS, type Product } from './EcommerceData';
import { ThreeDProductViewer } from './ThreeDProductViewer';

const TRUST = [
  { title: '100% Handcrafted', desc: 'Premium materials, expert artisans' },
  { title: 'Same-Day Dispatch', desc: '4-hour delivery in metro cities' },
  { title: 'Zero-Risk Returns', desc: '7 day easy returns & refunds' },
];

const STATS = [
  { value: '50K+', label: 'Orders Delivered' },
  { value: '4.9★', label: 'Avg. Rating' },
  { value: '24 h', label: 'Fast Dispatch' },
  { value: '250+', label: 'Products' },
];

export const EcommerceHero3D: React.FC = () => {
  const heroProducts = ECOMMERCE_PRODUCTS.slice(0, 4);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeProduct: Product = heroProducts[activeHeroIndex] ?? heroProducts[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveHeroIndex((i) => (i + 1) % heroProducts.length);
        setIsTransitioning(false);
      }, 250);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const handleSelect = (idx: number) => {
    if (idx === activeHeroIndex) return;
    setIsTransitioning(true);
    setTimeout(() => { setActiveHeroIndex(idx); setIsTransitioning(false); }, 200);
  };

  return (
    <section
      style={{
        paddingBlock: 'clamp(40px, 7vw, 90px)',
        background: 'radial-gradient(90% 120% at 90% 0%, var(--sv-bg-3), transparent 60%), var(--sv-bg)',
        borderBottom: '1px solid var(--sv-line-soft)',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left: Text ── */}
          <div className="flex flex-col gap-6">

            {/* Badge */}
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                padding: '.4rem 1rem', borderRadius: '999px',
                border: '1px solid var(--sv-line)',
                color: 'var(--sv-gold-2)', fontSize: '.82rem', fontWeight: 600,
                width: 'fit-content',
              }}
            >
              ✦ India&apos;s Premium Custom Print Studio
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--sv-serif)', fontWeight: 600,
                fontSize: 'clamp(2.4rem, 5.6vw, 4rem)',
                lineHeight: 1.1, color: 'var(--sv-ink)',
                margin: 0,
              }}
            >
              Memories worth{' '}
              <em style={{ color: 'var(--sv-gold-2)', fontStyle: 'italic' }}>keeping,</em>
              <br />gifts worth{' '}
              <em style={{ color: 'var(--sv-gold)', fontStyle: 'italic' }}>giving.</em>
            </h1>

            {/* Subline */}
            <p style={{ color: 'var(--sv-muted)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '36rem' }}>
              Custom photo prints, large-format prints, albums, video invites and keepsake boxes — crafted with passion, delivered with care.
            </p>

            {/* CTA */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.8rem' }}>
              <a
                href="#trending-products"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                  padding: '.8rem 1.6rem', borderRadius: '999px',
                  background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                  fontWeight: 600, fontSize: '.95rem', textDecoration: 'none',
                  border: '1.5px solid var(--sv-gold)',
                  transition: 'background .2s',
                }}
                className="hover:bg-[--sv-gold-2]"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#trending-products"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                  padding: '.8rem 1.6rem', borderRadius: '999px',
                  background: 'transparent', color: 'var(--sv-gold)',
                  fontWeight: 600, fontSize: '.95rem', textDecoration: 'none',
                  border: '1.5px solid var(--sv-line)',
                  transition: 'background .2s, border-color .2s',
                }}
                className="hover:border-[--sv-gold] hover:bg-[rgba(230,185,74,.08)]"
              >
                <Package className="w-4 h-4" />
                Browse Catalog
              </a>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                borderTop: '1px solid var(--sv-line-soft)', paddingTop: '1.2rem',
                gap: '1rem',
              }}
            >
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div style={{ fontFamily: 'var(--sv-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--sv-gold-2)', lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--sv-muted)', marginTop: '.25rem' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Product switcher */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {heroProducts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(idx)}
                  style={{
                    padding: '.45rem 1rem', borderRadius: '999px', cursor: 'pointer',
                    fontSize: '.82rem', fontWeight: 600,
                    transition: 'background .2s, border-color .2s, color .2s',
                    border: `1.5px solid ${idx === activeHeroIndex ? 'var(--sv-gold)' : 'var(--sv-line)'}`,
                    background: idx === activeHeroIndex ? 'var(--sv-gold)' : 'transparent',
                    color: idx === activeHeroIndex ? 'var(--sv-on-gold)' : 'var(--sv-muted)',
                  }}
                >
                  {p.name.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>

            {/* Trust band */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem', paddingTop: '1rem',
                borderTop: '1px solid var(--sv-line-soft)',
              }}
            >
              {TRUST.map(({ title, desc }) => (
                <div key={title} style={{ borderLeft: '2px solid var(--sv-gold)', paddingLeft: '1rem' }}>
                  <p style={{ color: 'var(--sv-ink)', fontWeight: 600, fontSize: '.88rem', margin: 0 }}>{title}</p>
                  <p style={{ color: 'var(--sv-muted)', fontSize: '.78rem', marginTop: '.2rem' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: 3D Viewer ── */}
          <div
            style={{
              transition: 'opacity .2s',
              opacity: isTransitioning ? 0 : 1,
            }}
          >
            <ThreeDProductViewer product={activeProduct} />

            {/* Price strip under viewer */}
            <div
              style={{
                marginTop: '1rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '1.2rem',
              }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'baseline', gap: '.6rem',
                  padding: '.5rem 1.2rem', borderRadius: '999px',
                  background: 'var(--sv-bg-2)', border: '1px solid var(--sv-line)',
                }}
              >
                <span style={{ fontFamily: 'var(--sv-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--sv-gold-2)' }}>
                  ₹{activeProduct.price.toLocaleString('en-IN')}
                </span>
                <span style={{ color: 'var(--sv-muted)', fontSize: '.85rem', textDecoration: 'line-through' }}>
                  ₹{activeProduct.originalPrice.toLocaleString('en-IN')}
                </span>
                <span
                  style={{
                    fontSize: '.72rem', fontWeight: 800, padding: '.2rem .5rem',
                    borderRadius: '999px', background: 'var(--sv-gold)', color: 'var(--sv-on-gold)',
                  }}
                >
                  {activeProduct.discount}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
