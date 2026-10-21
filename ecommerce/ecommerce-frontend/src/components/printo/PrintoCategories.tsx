'use client';

import React from 'react';
import { 
  CreditCard, 
  Shirt, 
  Coffee, 
  BookOpen, 
  Megaphone, 
  Image as ImageIcon, 
  Package, 
  Gift,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PRINTO_CATEGORIES, PrintoCategory } from '@/lib/data/printoData';

// Map icon strings to Lucide components
const iconMap: Record<string, any> = {
  CreditCard,
  Shirt,
  Coffee,
  BookOpen,
  Megaphone,
  Image: ImageIcon,
  Package,
  Gift,
};

interface PrintoCategoriesProps {
  onSelectCategory?: (categorySlug: string) => void;
}

export const PrintoCategories: React.FC<PrintoCategoriesProps> = ({
  onSelectCategory,
}) => {
  return (
    <section className="py-14 px-4 bg-slate-50/60" id="categories">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#700895] uppercase tracking-wider mb-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Explore Product Lines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Popular Custom Printing Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Engineered with commercial-grade 2400 DPI presses for individuals, designers & enterprises.
            </p>
          </div>

          <a 
            href="#bestsellers" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#700895] hover:text-[#5A0678] hover:underline"
          >
            <span>View all 500+ products</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* 8-Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {PRINTO_CATEGORIES.map((cat: PrintoCategory) => {
            const IconComponent = iconMap[cat.icon] || CreditCard;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory?.(cat.slug)}
                className="group relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Background Image Accent */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Floating Price Chip */}
                  <span className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-purple-950 font-black text-[11px] px-2 py-0.5 rounded-md shadow-sm">
                    Starts ₹{cat.startingPrice}
                  </span>

                  {/* Icon badge */}
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-[#700895]/90 text-white flex items-center justify-center shadow-md">
                    <IconComponent size={16} />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#700895] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Footer Strip */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                    {cat.itemCount}
                  </span>
                  <span className="text-[#700895] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[11px]">
                    Customize <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
