'use client';

import React from 'react';
import Image from 'next/image';
import { Star, CheckCircle, Quote, Sparkles, Award } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

const CLIENT_BRANDS = [
  { name: 'Razorpay', symbol: 'RZP' },
  { name: 'CRED', symbol: 'CRED' },
  { name: 'Swiggy', symbol: 'SWIGGY' },
  { name: 'Flipkart', symbol: 'FK' },
  { name: 'PhonePe', symbol: 'PE' },
  { name: 'Zomato', symbol: 'ZOMATO' },
  { name: 'Zoho', symbol: 'ZOHO' },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ananya Deshmukh',
    role: 'Head of Brand & Design',
    company: 'Fintech Studio',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    title: 'The 3D texture preview was 100% true to life',
    comment:
      'We ordered 2,500 gold foil cards and unboxing kits. Being able to inspect the 3D finish in real-time online before ordering gave our team complete confidence. The print precision is unmatched.',
  },
  {
    id: 2,
    name: 'Vikramaditya Sengupta',
    role: 'Founder & CEO',
    company: 'Roast & Brew Coffee Labs',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    title: 'Delivered in 4 hours for our cafe grand opening',
    comment:
      'We ran short of table QR menus right before our opening event in Indiranagar. Printo delivered the complete package within 4 hours. Exceptional speed and crisp lamination quality.',
  },
  {
    id: 3,
    name: 'Rohan Mehra',
    role: 'Operations VP',
    company: 'HyperScale Logistics',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    title: 'Best bulk enterprise pricing with GST invoicing',
    comment:
      'Our team regularly orders electronics and customized welcome swag across 5 city offices. The centralized dashboard and instant GST tax credits saved our finance team endless hassle.',
  },
];

export const ThreeDTestimonials: React.FC = () => {
  return (
    <section className="py-8 bg-slate-50 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted Brands Row */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-3">
            Trusted by 50,000+ Fast-Growing Companies &amp; Individuals Across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 opacity-80">
            {CLIENT_BRANDS.map((b) => (
              <div
                key={b.name}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-black tracking-wider text-slate-700"
              >
                {b.name}
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>4.9 / 5 Rating on Google &amp; Trustpilot</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Verified Customer Stories
          </h2>
        </div>

        {/* 3D Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map((t) => (
            <ThreeDCard
              key={t.id}
              maxTilt={12}
              scale={1.02}
              className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-purple-400 transition-colors"
            >
              <div>
                {/* Rating stars & Quote */}
                <div
                  style={{ transform: 'translateZ(25px)' }}
                  className="flex items-center justify-between mb-3"
                >
                  <div className="flex items-center text-amber-500">
                    {'★'.repeat(t.rating)}
                  </div>
                  <Quote className="w-5 h-5 text-purple-400/30" />
                </div>

                <div style={{ transform: 'translateZ(15px)' }}>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 mb-1.5">
                    &ldquo;{t.title}&rdquo;
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.comment}
                  </p>
                </div>
              </div>

              {/* Author Info */}
              <div
                style={{ transform: 'translateZ(20px)' }}
                className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-400">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{t.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.role} • {t.company}
                  </div>
                </div>
              </div>
            </ThreeDCard>
          ))}
        </div>
      </div>
    </section>
  );
};
