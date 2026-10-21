'use client';

import React from 'react';
import Image from 'next/image';
import {
  Briefcase,
  Coffee,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

interface IndustryPack {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  image: string;
  badge: string;
  startingPrice: number;
  items: string[];
}

const INDUSTRY_PACKS: IndustryPack[] = [
  {
    id: 'corporate',
    name: 'Corporate & Tech Startups',
    subtitle: 'Everything needed to launch and equip team onboarding.',
    icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80',
    badge: 'Popular for Enterprises',
    startingPrice: 4999,
    items: [
      '500x Matte Laminated Visiting Cards',
      '50x RFID NFC Employee ID Cards & Lanyards',
      '25x Premium Hardcover Foil Notebooks',
      '25x Engraved Metal Executive Pens',
    ],
  },
  {
    id: 'cafe',
    name: 'Cafes, Dining & Cloud Kitchens',
    subtitle: 'Waterproof menus, takeout stickers, and tamper packaging.',
    icon: <Coffee className="w-5 h-5 text-amber-400" />,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    badge: 'Food Safe Certified',
    startingPrice: 3499,
    items: [
      '100x Spill-Proof Laminated Table Menus',
      '1,000x Branded Kraft Takeaway Stickers',
      '500x Custom Greaseproof Sandwich Wraps',
      '20x Acrylic QR Code Standees for UPI',
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Brands & D2C',
    subtitle: 'Turn unboxing into an unforgettable customer brand touchpoint.',
    icon: <Package className="w-5 h-5 text-purple-400" />,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    badge: 'Unboxing Delight',
    startingPrice: 5999,
    items: [
      '200x Custom Corrugated Mailer Boxes',
      '500x Gold Foil Thank You Cards',
      '10x Custom Water-Activated Reinforced Tapes',
      '1,000x Holographic Brand Seal Labels',
    ],
  },
  {
    id: 'events',
    name: 'Expos, Summits & Events',
    subtitle: 'High-impact trade show booth displays and attendee kits.',
    icon: <Calendar className="w-5 h-5 text-emerald-400" />,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    badge: 'Ready in 24h',
    startingPrice: 7499,
    items: [
      '2x 6ft Premium Retractable Rollup Standees',
      '200x Satin Lanyards + Badge Holders',
      '500x Gloss Promotional Flyers (170 GSM)',
      '1x Custom Fabric Backdrop Banner (8x8 ft)',
    ],
  },
];

interface ThreeDIndustryPacksProps {
  onSelectPack?: (pack: IndustryPack) => void;
  onOpenBulkModal?: () => void;
}

export const ThreeDIndustryPacks: React.FC<ThreeDIndustryPacksProps> = ({
  onSelectPack,
  onOpenBulkModal,
}) => {
  return (
    <section className="py-8 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 mb-2 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Business Packages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Industry-Specific Turnkey Suites
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Specially bundled packages designed for your business sector. Save up to 35% compared to purchasing individual items.
            </p>
          </div>

          <button
            onClick={onOpenBulkModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all flex items-center gap-2"
          >
            <span>Request Custom Enterprise Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Industry 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {INDUSTRY_PACKS.map((pack) => (
            <ThreeDCard
              key={pack.id}
              maxTilt={14}
              scale={1.03}
              onClick={() => onSelectPack && onSelectPack(pack)}
              className="cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-purple-400 transition-all p-4 flex flex-col justify-between group overflow-hidden shadow-xs hover:shadow-lg"
            >
              <div>
                {/* Image header with 3D depth */}
                <div
                  style={{ transform: 'translateZ(25px)' }}
                  className="relative h-36 w-full rounded-xl overflow-hidden mb-3"
                >
                  <Image
                    src={pack.image}
                    alt={pack.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-xs">
                    {pack.badge}
                  </span>

                  <div className="absolute bottom-2 left-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                    {pack.icon}
                  </div>
                </div>

                {/* Title & info */}
                <div style={{ transform: 'translateZ(15px)' }}>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                    {pack.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {pack.subtitle}
                  </p>
                </div>

                {/* Package items checklist */}
                <div
                  style={{ transform: 'translateZ(20px)' }}
                  className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5"
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider text-purple-700">
                    Includes Complete Set:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {pack.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & Action */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-slate-400">Bundle from</div>
                  <div className="text-base font-black text-slate-900">
                    ₹{pack.startingPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 group-hover:bg-purple-700 text-white shadow-xs flex items-center gap-1 transition-colors">
                  <span>Explore Pack</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </ThreeDCard>
          ))}
        </div>
      </div>
    </section>
  );
};
