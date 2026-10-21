'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

interface QuickLinkItem {
  id: string;
  name: string;
  tag: string;
  image: string;
  link: string;
}

const QUICK_CATEGORY_ICONS: QuickLinkItem[] = [
  {
    id: 'vc',
    name: 'Visiting Cards',
    tag: 'From ₹1.99',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
  {
    id: 'apparel',
    name: 'Polo & T-Shirts',
    tag: 'From ₹349',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
  {
    id: 'boxes',
    name: 'Packaging Boxes',
    tag: 'From ₹29',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
  {
    id: 'drink',
    name: 'Mugs & Tumblers',
    tag: 'From ₹199',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
  {
    id: 'signs',
    name: 'Standees & Signs',
    tag: 'Ready in 24h',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
  {
    id: 'photo',
    name: 'Acrylic Frames',
    tag: '44% Off',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
  {
    id: 'stickers',
    name: 'Custom Labels',
    tag: 'From ₹0.85',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
  {
    id: 'corporate',
    name: 'Bulk ID & Swag',
    tag: 'GST Billing',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=300&q=80',
    link: '#trending-products',
  },
];

interface PromoBannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bgGradient: string;
  image: string;
  ctaText: string;
  link: string;
}

const PROMO_BANNERS: PromoBannerItem[] = [
  {
    id: 'banner-1',
    title: 'Festive & Corporate Gifting 2026',
    subtitle: 'Premium laser tumblers, branded welcome kits, and luxury executive swag with instant GST invoices.',
    badge: 'UP TO 45% OFF BUNDLES',
    bgGradient: 'from-purple-950 via-indigo-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Explore Gift Kits',
    link: '#industry-packs',
  },
  {
    id: 'banner-2',
    title: 'Same-Day Superfast Printing Hub',
    subtitle: 'Need visiting cards, rollup standees, or menus today? Pick up in 2 hours or get 4-hour metro delivery.',
    badge: 'SAME DAY DELIVERY IN METROS',
    bgGradient: 'from-amber-950 via-slate-900 to-purple-950',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Check City Stores',
    link: '#stores-section',
  },
];

export const PrintoQuickCategoriesBar: React.FC = () => {
  return (
    <section className="py-5 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontal Quick-Icon Scroll / Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {QUICK_CATEGORY_ICONS.map((cat) => (
            <a
              key={cat.id}
              href={cat.link}
              className="group flex flex-col items-center text-center p-2.5 rounded-2xl bg-white border border-slate-100 hover:border-purple-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-50 mb-2 p-1 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="80px"
                  className="object-cover rounded-lg"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 mt-0.5">
                {cat.tag}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
