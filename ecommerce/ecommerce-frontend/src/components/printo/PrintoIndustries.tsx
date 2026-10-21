'use client';

import React from 'react';
import { 
  Building2, 
  Utensils, 
  Trophy, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { PRINTO_INDUSTRIES } from '@/lib/data/printoData';

const iconMap: Record<string, any> = {
  Building2,
  Utensils,
  Trophy,
  ShoppingBag,
};

interface PrintoIndustriesProps {
  onOpenBulkModal?: () => void;
}

export const PrintoIndustries: React.FC<PrintoIndustriesProps> = ({
  onOpenBulkModal,
}) => {
  return (
    <section className="py-14 px-4 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#700895]/10 text-[#700895] text-xs font-bold">
            <Sparkles size={14} />
            <span>Tailored By Sector</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Printing Solutions Crafted for Your Industry
          </h2>
          <p className="text-sm text-slate-600">
            Pre-curated bundles and brand packages designed specifically to meet your business needs.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINTO_INDUSTRIES.map((ind, i) => {
            const IconComponent = iconMap[ind.icon] || Building2;

            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Gradient Icon Badge */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${ind.color} text-white flex items-center justify-center shadow-md mb-4`}>
                    <IconComponent size={24} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {ind.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    {ind.tagline}
                  </p>

                  {/* Included Items Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {ind.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={onOpenBulkModal}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-[#700895] border border-slate-200 hover:border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Request Industry Package</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Banner Box */}
        <div className="rounded-3xl bg-gradient-to-r from-[#3C054F] via-[#700895] to-[#8C1BAE] text-white p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center lg:text-left">
            <span className="bg-amber-400 text-purple-950 font-black text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Corporate Ordering Portal
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Ordering for an Enterprise with 100+ Employees?
            </h3>
            <p className="text-sm text-purple-100 max-w-xl">
              Get customized online ordering portals, central billing with GST credits, pan-India multi-location dispatch, and a dedicated key account manager.
            </p>
          </div>

          <button
            onClick={onOpenBulkModal}
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm rounded-xl shadow-lg hover:scale-105 transition-all whitespace-nowrap"
          >
            Speak to Corporate Sales Team
          </button>
        </div>

      </div>
    </section>
  );
};
