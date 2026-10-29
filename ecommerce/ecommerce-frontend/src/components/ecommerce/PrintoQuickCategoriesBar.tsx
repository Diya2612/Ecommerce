'use client';

import React from 'react';
import Image from 'next/image';

interface QuickLinkItem {
  id: string;
  name: string;
  tag: string;
  image: string;
  link: string;
  emoji: string;
}

const QUICK_CATEGORY_ICONS: QuickLinkItem[] = [
  {
    id: 'vc',
    name: 'Visiting Cards',
    tag: 'From ₹1.99',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '🪪',
  },
  {
    id: 'apparel',
    name: 'Polo & T-Shirts',
    tag: 'From ₹349',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '👕',
  },
  {
    id: 'boxes',
    name: 'Packaging Boxes',
    tag: 'From ₹29',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '📦',
  },
  {
    id: 'drink',
    name: 'Mugs & Tumblers',
    tag: 'From ₹199',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '☕',
  },
  {
    id: 'signs',
    name: 'Standees & Signs',
    tag: 'Ready in 24h',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '🪧',
  },
  {
    id: 'photo',
    name: 'Acrylic Frames',
    tag: '44% Off',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '🖼️',
  },
  {
    id: 'stickers',
    name: 'Custom Labels',
    tag: 'From ₹0.85',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '🏷️',
  },
  {
    id: 'corporate',
    name: 'Bulk ID & Swag',
    tag: 'GST Billing',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
    emoji: '🎁',
  },
];

export const PrintoQuickCategoriesBar: React.FC = () => {
  return (
    <section
      style={{
        paddingBlock: 'clamp(40px, 5vw, 64px)',
        background: 'var(--sv-bg)',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* Section heading */}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginBottom: '1.6rem', flexWrap: 'wrap', gap: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--sv-serif)', fontWeight: 600,
                fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
                color: 'var(--sv-ink)', lineHeight: 1.12, margin: 0,
              }}
            >
              Browse Categories
            </h2>
            <p style={{ color: 'var(--sv-muted)', marginTop: '.4rem', fontSize: '.95rem' }}>
              From keepsakes to bulk corporate swag — find it all here.
            </p>
          </div>
          <a
            href="#trending-products"
            style={{
              color: 'var(--sv-gold)', textDecoration: 'none',
              fontWeight: 600, fontSize: '.92rem',
              transition: 'color .2s',
            }}
            className="hover:text-[--sv-gold-2]"
          >
            View all →
          </a>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }}
          className="sm:grid-cols-4"
        >
          {QUICK_CATEGORY_ICONS.map((cat) => (
            <a
              key={cat.id}
              href={cat.link}
              style={{
                display: 'grid', gap: '.5rem', alignContent: 'start',
                textDecoration: 'none',
                padding: '1.3rem 1.2rem',
                border: '1px solid var(--sv-line-soft)',
                borderRadius: '16px',
                background: 'var(--sv-bg-2)',
                transition: 'border-color .2s, background .2s, transform .2s',
              }}
              className="group hover:border-[--sv-gold] hover:bg-[--sv-bg-3] hover:-translate-y-0.5"
            >
              {/* Image tile */}
              <div
                style={{
                  width: '100%', aspectRatio: '1',
                  borderRadius: '10px', overflow: 'hidden',
                  position: 'relative',
                  background: 'var(--sv-bg-3)',
                  border: '1px solid var(--sv-line-soft)',
                  marginBottom: '.4rem',
                  fontSize: 'clamp(2rem, 6vw, 3rem)',
                  display: 'grid', placeItems: 'center',
                }}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="200px"
                    className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <span className="relative z-10">{cat.emoji}</span>
                )}
                {/* Emoji overlay */}
                <span
                  style={{
                    position: 'absolute', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                    zIndex: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.4))',
                  }}
                >
                  {cat.emoji}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--sv-sans)', fontWeight: 600,
                  fontSize: '1.1rem', color: 'var(--sv-ink)',
                  margin: 0, lineHeight: 1.3,
                }}
              >
                {cat.name}
              </h3>
              <p style={{ fontSize: '.85rem', color: 'var(--sv-muted)', margin: 0, lineHeight: 1.4 }}>
                {cat.tag}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
