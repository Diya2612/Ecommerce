'use client';

import React from 'react';
import {
  MousePointerClick,
  Palette,
  Eye,
  Truck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

const STEPS = [
  {
    step: '01',
    title: 'Select Product & Specs',
    desc: 'Choose from 500+ customizable print products, paper weights (up to 400 GSM), and luxury 3D foil finishes.',
    icon: <MousePointerClick className="w-6 h-6 text-purple-400" />,
    badge: 'Step 1',
  },
  {
    step: '02',
    title: 'Customize or Upload File',
    desc: 'Use our real-time 3D brand customizer, upload print-ready files (PDF/AI), or hire an in-house designer for ₹499.',
    icon: <Palette className="w-6 h-6 text-indigo-400" />,
    badge: 'Step 2',
  },
  {
    step: '03',
    title: 'Instant 3D Proof Approval',
    desc: 'Inspect your 3D digital simulation with 300 DPI pre-flight verification, bleed checks, and zero setup surprise.',
    icon: <Eye className="w-6 h-6 text-pink-400" />,
    badge: 'Step 3',
  },
  {
    step: '04',
    title: 'Doorstep Express or 2h Pickup',
    desc: 'Shipped via air express across India with GPS tracking, or collect in 2 hours at any of our 30+ metro retail hubs.',
    icon: <Truck className="w-6 h-6 text-emerald-400" />,
    badge: 'Step 4',
  },
];

export const PrintoHowItWorks3D: React.FC = () => {
  return (
    <section className="py-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seamless E-Commerce Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How Printo Online Ordering Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Four simple steps from digital concept to tactile precision print delivered right to your doorstep.
          </p>
        </div>

        {/* 4 Steps 3D Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STEPS.map((s) => (
            <ThreeDCard
              key={s.step}
              maxTilt={12}
              scale={1.03}
              className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-purple-400 transition-colors group"
            >
              <div>
                <div
                  style={{ transform: 'translateZ(30px)' }}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <span className="text-xl font-black text-slate-300 font-mono">
                    {s.step}
                  </span>
                </div>

                <div style={{ transform: 'translateZ(15px)' }}>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>

              <div
                style={{ transform: 'translateZ(20px)' }}
                className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-purple-600"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Quality Step</span>
              </div>
            </ThreeDCard>
          ))}
        </div>
      </div>
    </section>
  );
};
