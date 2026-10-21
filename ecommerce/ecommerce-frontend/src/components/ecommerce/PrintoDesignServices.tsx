'use client';

import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  CheckCircle,
  MessageSquare,
  Clock,
  ShieldCheck,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

export const PrintoDesignServices: React.FC = () => {
  const [requested, setRequested] = useState(false);

  const handleRequestDesign = () => {
    setRequested(true);
    setTimeout(() => setRequested(false), 3000);
  };

  return (
    <section className="py-8 bg-purple-50/50 border-b border-purple-100/80 text-slate-900 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text (6 cols) */}
          <div className="lg:col-span-6 space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
              <PenTool className="w-3.5 h-3.5" />
              <span>In-House Creative Studio</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Don&apos;t Have a Print Design? Let Our Experts Craft It for You.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Work 1-on-1 with experienced brand designers. Whether you need a fresh corporate identity, visiting cards, custom packaging dielines, or expo backdrops, we handle it end-to-end.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dedicated 1-on-1 Senior Designer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>24-Hour Express Proof Turnaround</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited Revisions until Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Print-Ready High-Res Source Files</span>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={handleRequestDesign}
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/20 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Hire a Designer for ₹499</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-xs text-slate-500 font-medium">
                ⭐ Rated 4.9/5 by 15,000+ businesses
              </div>
            </div>

            {requested && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                ✓ Request submitted! A designer will contact you via WhatsApp in &lt; 15 minutes.
              </div>
            )}
          </div>

          {/* Right: 3D Workflow Cards (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <ThreeDCard
              maxTilt={12}
              scale={1.02}
              className="rounded-2xl bg-white border border-purple-200/80 p-4 shadow-sm flex items-start gap-3.5"
            >
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="p-2.5 rounded-xl bg-purple-600 text-white font-black text-base shrink-0"
              >
                01
              </div>
              <div style={{ transform: 'translateZ(15px)' }}>
                <h4 className="font-bold text-sm text-slate-900">Share Your Vision or Rough Sketch</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Tell us what you want via a short form, voice note, or WhatsApp chat. Share existing logos or inspirations.
                </p>
              </div>
            </ThreeDCard>

            <ThreeDCard
              maxTilt={12}
              scale={1.02}
              className="rounded-2xl bg-white border border-purple-200/80 p-4 shadow-sm flex items-start gap-3.5"
            >
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="p-2.5 rounded-xl bg-indigo-600 text-white font-black text-base shrink-0"
              >
                02
              </div>
              <div style={{ transform: 'translateZ(15px)' }}>
                <h4 className="font-bold text-sm text-slate-900">Review Realistic 3D Proofs</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Your dedicated designer builds custom concepts and generates an interactive 3D digital mock-up for your review.
                </p>
              </div>
            </ThreeDCard>

            <ThreeDCard
              maxTilt={12}
              scale={1.02}
              className="rounded-2xl bg-white border border-purple-200/80 p-4 shadow-sm flex items-start gap-3.5"
            >
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-base shrink-0"
              >
                03
              </div>
              <div style={{ transform: 'translateZ(15px)' }}>
                <h4 className="font-bold text-sm text-slate-900">Direct Dispatch to Automated Press</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Once approved, your files route directly to high-speed HP Indigo &amp; Heidelberg presses for same-day delivery.
                </p>
              </div>
            </ThreeDCard>
          </div>
        </div>
      </div>
    </section>
  );
};
