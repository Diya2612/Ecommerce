'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Twitter, Linkedin } from 'lucide-react';
import { ECOMMERCE_CATEGORIES } from './EcommerceData';

/* ── Suvarna brand mark ─────────────────────────────────────── */
const SuvarnaIcon = () => (
  <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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

const SOCIAL = [
  { name: 'Instagram', Icon: Instagram, url: 'https://www.instagram.com/' },
  { name: 'Facebook',  Icon: Facebook,  url: '' },
  { name: 'YouTube',   Icon: Youtube,   url: '' },
  { name: 'Twitter/X', Icon: Twitter,   url: '' },
  { name: 'LinkedIn',  Icon: Linkedin,  url: '' },
];

export const EcommerceFooter: React.FC = () => {
  return (
    <footer
      style={{
        background: '#070f27',
        borderTop: '1px solid var(--sv-line-soft)',
        paddingBlock: '48px 40px',
        fontFamily: 'var(--sv-sans)',
      }}
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* Trust badges row */}
        <div
          style={{
            display: 'grid', gap: '1.5rem',
            gridTemplateColumns: 'repeat(3, 1fr)',
            marginBottom: '3rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--sv-line-soft)',
          }}
          className="sm:grid-cols-3"
        >
          {[
            { title: 'Free Express Shipping', desc: 'Orders over ₹999 get free expedited delivery' },
            { title: '7 Days Easy Return',    desc: 'Hassle-free instant refund & pickup' },
            { title: '24/7 Dedicated Support', desc: 'Live chat & phone assistance anytime' },
          ].map(({ title, desc }) => (
            <div key={title} style={{ borderLeft: '2px solid var(--sv-gold)', paddingLeft: '1rem' }}>
              <p style={{ color: 'var(--sv-ink)', fontWeight: 600, fontSize: '.95rem', margin: 0 }}>{title}</p>
              <p style={{ color: 'var(--sv-muted)', fontSize: '.82rem', marginTop: '.25rem' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Links grid */}
        <div
          style={{ display: 'grid', gap: '2rem', marginBottom: '2.5rem' }}
          className="grid-cols-1 sm:grid-cols-3 md:grid-cols-[1.5fr_1fr_1fr]"
        >
          {/* Brand */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <SuvarnaIcon />
              <span style={{ font: '600 1.5rem var(--sv-round)', color: 'var(--sv-gold)' }}>
                Suvarna
              </span>
            </div>
            <p style={{ color: 'var(--sv-muted)', fontSize: '.88rem', lineHeight: 1.6, maxWidth: '26rem' }}>
              India&apos;s premier custom printing &amp; corporate merchandising studio. Order business cards, personalized gifts, corporate apparel, and marketing essentials.
            </p>
            <p style={{ color: 'var(--sv-muted)', fontSize: '.82rem' }}>
              <span style={{ color: 'var(--sv-ink)', fontWeight: 500 }}>Payments:</span> UPI • Cards • NetBanking • EMI
            </p>

            {/* Social */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
              {SOCIAL.filter((s) => s.url).map(({ name, Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                    padding: '.4rem .8rem', borderRadius: '999px',
                    border: '1px solid var(--sv-line)',
                    color: 'var(--sv-ink)', textDecoration: 'none',
                    fontSize: '.82rem', transition: 'border-color .2s, color .2s',
                  }}
                  className="hover:border-[--sv-gold] hover:text-[--sv-gold-2]"
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--sv-gold)' }} />
                  {name}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 style={{ font: '600 1rem var(--sv-sans)', margin: '0 0 .9rem', color: 'var(--sv-ink)' }}>
              Shop Collections
            </h4>
            <div style={{ display: 'grid', gap: '.45rem' }}>
              {ECOMMERCE_CATEGORIES.map((c) => (
                <a
                  key={c.id}
                  href="#trending-products"
                  style={{ color: 'var(--sv-muted)', textDecoration: 'none', fontSize: '.88rem', transition: 'color .2s' }}
                  className="hover:text-[--sv-gold-2]"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </div>

          {/* Help & Company */}
          <div style={{ display: 'grid', gap: '1.8rem', alignContent: 'start' }}>
            <div>
              <h4 style={{ font: '600 1rem var(--sv-sans)', margin: '0 0 .9rem', color: 'var(--sv-ink)' }}>
                Help &amp; Support
              </h4>
              <div style={{ display: 'grid', gap: '.45rem' }}>
                {['Track Your Order', 'Shipping Rates & Policies', 'Returns & Exchanges', 'Artwork Proof Guidelines', 'Contact Support'].map((link) => (
                  <a key={link} href="#" style={{ color: 'var(--sv-muted)', textDecoration: 'none', fontSize: '.88rem', transition: 'color .2s' }} className="hover:text-[--sv-gold-2]">
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ font: '600 1rem var(--sv-sans)', margin: '0 0 .9rem', color: 'var(--sv-ink)' }}>
                About Us
              </h4>
              <div style={{ display: 'grid', gap: '.45rem' }}>
                {['Our Story', 'Experience Centers', 'Sustainability & Paper Stocks', 'Corporate & Enterprise Bulk', 'Careers'].map((link) => (
                  <a key={link} href="#" style={{ color: 'var(--sv-muted)', textDecoration: 'none', fontSize: '.88rem', transition: 'color .2s' }} className="hover:text-[--sv-gold-2]">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--sv-line-soft)',
            paddingTop: '1.2rem',
            display: 'flex', flexDirection: 'column', gap: '.8rem',
            color: 'var(--sv-muted)', fontSize: '.82rem',
          }}
          className="sm:flex-row sm:items-center sm:justify-between"
        >
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Suvarna Custom. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Security'].map((link) => (
              <a key={link} href="#" style={{ color: 'var(--sv-muted)', textDecoration: 'none', transition: 'color .2s' }} className="hover:text-[--sv-ink]">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
