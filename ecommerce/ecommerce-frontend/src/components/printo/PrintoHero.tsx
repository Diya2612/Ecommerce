'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Truck, 
  ChevronLeft, 
  ChevronRight,
  Calculator,
  Gift
} from 'lucide-react';

interface PrintoHeroProps {
  onScrollToCalculator?: () => void;
  onOpenBulkModal?: () => void;
}

export const PrintoHero: React.FC<PrintoHeroProps> = ({
  onScrollToCalculator,
  onOpenBulkModal,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: '⚡ Same Day & 24H Dispatch Available',
      title: 'Custom Printing & Corporate Gifting, Perfected.',
      description: 'Turn your brand identity into premium physical merchandise with crisp 2400 DPI print fidelity and zero minimum orders.',
      bgGradient: 'from-[#2A0237] via-[#4A0562] to-[#700895]',
      highlightText: 'Starting at ₹149',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
      primaryCta: 'Explore Bestsellers',
      secondaryCta: 'Instant Price Calculator',
    },
    {
      badge: '🏢 Corporate Gifting Solutions',
      title: 'Employee Welcome Kits & Executive Hampers',
      description: 'Customized diaries, thermal bottles, cotton hoodies & metal pens in customized rigid magnetic boxes. Multi-location doorstep dispatch.',
      bgGradient: 'from-[#140224] via-[#33084C] to-[#5D0A7D]',
      highlightText: 'Up to 50% Volume Discount',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
      primaryCta: 'Request Bulk Quote',
      secondaryCta: 'View Welcome Kits',
    },
    {
      badge: '🎯 Events & Exhibition Signage',
      title: 'Standees, Banners & Promotional Collateral',
      description: 'Heavy aluminum roll-up standees, vinyl banners, glossy flyers, and custom lanyard badges printed and shipped in 24 hours.',
      bgGradient: 'from-[#3C054F] via-[#630A84] to-[#8C1BAE]',
      highlightText: '100% Quality Reprint Guarantee',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
      primaryCta: 'Shop Event Materials',
      secondaryCta: 'Upload Your Artwork',
    },
  ];

  // Auto advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full overflow-hidden bg-slate-900 text-white">
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`min-w-full relative flex items-center bg-gradient-to-r ${slide.bgGradient} py-12 lg:py-20 px-4 sm:px-8`}
          >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Text Column */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{slide.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-base text-purple-100 max-w-xl font-normal leading-relaxed">
                  {slide.description}
                </p>

                {/* Price or guarantee highlight */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-purple-200">Starting from:</span>
                  <span className="bg-amber-400 text-purple-950 px-2.5 py-1 rounded-lg text-xs font-black shadow">
                    {slide.highlightText}
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#bestsellers"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm shadow-lg hover:shadow-amber-400/20 hover:scale-105 transition-all"
                  >
                    <span>{slide.primaryCta}</span>
                    <ArrowRight size={16} />
                  </a>

                  <button
                    onClick={onScrollToCalculator}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-bold text-sm transition-all"
                  >
                    <Calculator size={16} className="text-amber-300" />
                    <span>Instant Price Calculator</span>
                  </button>
                </div>
              </div>

              {/* Image Mockup Column */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/15 bg-purple-950/40 group">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md font-semibold">
                      HD Color Proofing
                    </span>
                    <span className="bg-[#700895] px-2.5 py-1 rounded-md font-bold text-amber-300">
                      Printo Guarantee
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-colors z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-colors z-20"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === i ? 'w-8 bg-amber-400' : 'w-2 bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Value Pillars Bar */}
      <div className="bg-[#170120] border-t border-purple-900/60 py-3.5 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-purple-200">
          <div className="flex items-center gap-2.5 justify-center">
            <Clock size={18} className="text-amber-400 shrink-0" />
            <span>24 - 48 Hour Fast Dispatch</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span>100% Quality Reprint Guarantee</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center">
            <Truck size={18} className="text-cyan-400 shrink-0" />
            <span>Free Shipping Over ₹999</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center">
            <Gift size={18} className="text-pink-400 shrink-0" />
            <span>No Minimum Order Quantity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
