'use client';

import React from 'react';
import { 
  UploadCloud, 
  Eye, 
  Truck, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Quote, 
  CheckCircle2 
} from 'lucide-react';
import { PRINTO_REVIEWS } from '@/lib/data/printoData';

export const PrintoHowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Pick Product & Upload Artwork',
      description: 'Choose your cardstock, apparel size or drinkware model. Upload your print-ready PDF/AI file or customize from 1,000+ free designer templates.',
      icon: UploadCloud,
      color: 'from-purple-600 to-indigo-600',
    },
    {
      step: '02',
      title: 'Digital 3D Proof & Approval',
      description: 'Review color accuracy, bleed margins, and text alignment on our real-time interactive preview. Your order only prints when you are 100% satisfied.',
      icon: Eye,
      color: 'from-amber-500 to-orange-500',
    },
    {
      step: '03',
      title: 'High-Def 2400 DPI Print & Delivery',
      description: 'Produced on cutting-edge HP Indigo and Heidelberg digital presses. Carefully packaged and express-delivered right to your doorstep across India.',
      icon: Truck,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section className="py-16 px-4 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Step-by-Step Flow */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#700895]/10 text-[#700895] text-xs font-bold">
              <Sparkles size={14} />
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              From Screen to Doorstep in 24-48 Hours
            </h2>
            <p className="text-sm text-slate-500">
              No technical design skills required. Fast, seamless and backed by our print guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, i) => {
              const Icon = st.icon;

              return (
                <div
                  key={i}
                  className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-purple-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center shadow-lg`}>
                        <Icon size={26} />
                      </div>
                      <span className="text-4xl font-black text-slate-200 select-none">
                        {st.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {st.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {st.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#700895]">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Free Pre-Flight File Check</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Testimonials & Trust Badges */}
        <div className="pt-8 border-t border-slate-100 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
                <span className="ml-2 font-black text-slate-900 text-sm">4.8 / 5 Rating</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Loved by 1 Million+ Satisfied Customers
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              From unicorn startups to local bakeries, see what our verified clients have to say about Printo's speed and fidelity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRINTO_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                    <span className="text-[10px] text-slate-500">{rev.company}</span>
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
