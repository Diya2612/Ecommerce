'use client';

import React from 'react';
import Image from 'next/image';
import {
  Headphones,
  Watch,
  Footprints,
  Laptop,
  Sparkles,
  Gamepad2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { ECOMMERCE_CATEGORIES } from './EcommerceData';
import { ThreeDCard } from './ThreeDCard';

const iconMap: Record<string, React.ReactNode> = {
  Headphones: <Headphones className="w-5 h-5" />,
  Watch: <Watch className="w-5 h-5" />,
  Footprints: <Footprints className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
};

interface EcommerceCategoriesProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
}

export const EcommerceCategories: React.FC<EcommerceCategoriesProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              Explore Collections
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curated collections featuring top tier design, premium materials, and verified ratings.
            </p>
          </div>

          <button
            onClick={() => onSelectCategory && onSelectCategory('all')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 3D Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {ECOMMERCE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <ThreeDCard
                key={cat.id}
                maxTilt={14}
                scale={1.03}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className={`cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-purple-500 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-slate-200 bg-white hover:border-purple-300 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Image container with 3D depth */}
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                    {/* Icon Pill floating with 3D transform */}
                    <div
                      style={{ transform: 'translateZ(30px)' }}
                      className="absolute top-2 left-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md"
                    >
                      {iconMap[cat.icon] || <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Text meta */}
                  <div
                    style={{ transform: 'translateZ(20px)' }}
                    className="p-3 flex flex-col justify-between flex-1"
                  >
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {cat.itemCount}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-purple-600">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </ThreeDCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
