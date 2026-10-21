'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Eye,
  Check,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Flame,
} from 'lucide-react';
import { Product } from './EcommerceData';

interface ThreeDProductViewerProps {
  product: Product;
  onAddToCart?: (product: Product, color?: string) => void;
}

export const ThreeDProductViewer: React.FC<ThreeDProductViewerProps> = ({
  product,
  onAddToCart,
}) => {
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || 'Standard'
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [added, setAdded] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startRotationRef = useRef<{ y: number; x: number }>({ y: 0, x: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-spin animation
  useEffect(() => {
    if (!isAutoSpinning || isDragging) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.35) % 360);
    }, 20);
    return () => clearInterval(interval);
  }, [isAutoSpinning, isDragging]);

  // Color change updates image
  const handleColorSelect = (colorName: string, imageSrc?: string) => {
    setSelectedColor(colorName);
    if (imageSrc) {
      const idx = product.images.indexOf(imageSrc);
      if (idx !== -1) setActiveImageIndex(idx);
    }
  };

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startRotationRef.current = { y: rotationY, x: rotationX };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Rotate Y horizontally, subtle pitch X vertically
      const newRotY = startRotationRef.current.y + deltaX * 0.7;
      const newRotX = Math.max(
        -25,
        Math.min(25, startRotationRef.current.x - deltaY * 0.4)
      );

      setRotationY(newRotY);
      setRotationX(newRotX);
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipCard = () => {
    setIsAutoSpinning(false);
    setIsFlipped((prev) => !prev);
    setRotationY((prev) => (prev + 180) % 360);
    if (product.images.length > 1) {
      setActiveImageIndex((prev) => (prev === 0 ? 1 : 0));
    }
  };

  const handleResetView = () => {
    setRotationY(0);
    setRotationX(0);
    setIsAutoSpinning(true);
    setActiveHotspot(null);
    setIsFlipped(false);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2200);

    if (onAddToCart) {
      onAddToCart(product, selectedColor);
    }
  };

  const currentImage =
    product.images[activeImageIndex] || product.images[0];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative rounded-2xl overflow-hidden bg-white border border-purple-100 p-3 sm:p-4 shadow-lg shadow-purple-900/5 text-slate-900 select-none"
    >
      {/* Background ambient light 3D glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of 3D stage */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Interactive 3D Stage
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              In Stock ({product.stockLeft} left)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">
            {product.name}
          </h2>
          <p className="text-xs text-slate-500">{product.tagline}</p>
        </div>

        {/* 3D Stage Controls (Auto 360, Flip Front/Back, Reset) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoSpinning((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              isAutoSpinning
                ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCcw
              className={`w-3 h-3 ${isAutoSpinning ? 'animate-spin' : ''}`}
            />
            {isAutoSpinning ? '360° Auto' : 'Pause'}
          </button>
          <button
            onClick={handleFlipCard}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1"
          >
            <span>Flip 180°</span>
          </button>
          <button
            onClick={handleResetView}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* 3D PRODUCT VIEWPORT (Left 6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          {/* Instructions tooltip */}
          <div className="absolute top-1 left-1 z-20 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] text-slate-600 flex items-center gap-1 pointer-events-none shadow-xs">
            <Maximize2 className="w-2.5 h-2.5 text-purple-600" />
            Drag horizontally to rotate 3D
          </div>

          {/* Main 3D Viewport Area - Compact & tight, no empty space */}
          <div
            onMouseDown={handleMouseDown}
            style={{ perspective: '1200px' }}
            className={`relative w-full h-[230px] sm:h-[260px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none`}
          >
            {/* 3D Pedestal Platform with shadow ring */}
            <div
              className="absolute bottom-1 w-60 sm:w-72 h-14 rounded-[50%] pointer-events-none transition-transform duration-300"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.3) 0%, rgba(99, 102, 241, 0.12) 40%, transparent 75%)',
                transform: `rotateX(75deg) rotateZ(${rotationY * 0.2}deg) scale(${
                  1 + Math.sin((rotationY * Math.PI) / 180) * 0.05
                })`,
                filter: 'blur(6px)',
              }}
            />

            {/* Pedestal Metallic Ring */}
            <div
              className="absolute bottom-3 w-52 sm:w-64 h-8 rounded-[50%] border border-purple-400/50 pointer-events-none"
              style={{
                transform: `rotateX(75deg)`,
                boxShadow: '0 0 16px rgba(168, 85, 247, 0.25)',
              }}
            />

            {/* The 3D Floating Product Image Card */}
            <div
              style={{
                transform: `rotateX(${rotationX.toFixed(
                  2
                )}deg) rotateY(${rotationY.toFixed(2)}deg) translateZ(30px)`,
                transformStyle: 'preserve-3d',
                transition: isDragging
                  ? 'none'
                  : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              className="relative w-56 h-40 sm:w-64 sm:h-44 flex items-center justify-center"
            >
              <div className="relative w-full h-full p-2 filter drop-shadow-[0_14px_18px_rgba(0,0,0,0.18)] group overflow-hidden rounded-xl">
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 240px, 280px"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  priority
                />

                {/* Tactile Metallic Foil Light Reflection (Moo / Printo style) */}
                <div
                  className="absolute inset-1 rounded-lg pointer-events-none overflow-hidden"
                  style={{
                    mixBlendMode: 'screen',
                    opacity: 0.6,
                  }}
                >
                  <div
                    className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(115deg, transparent 35%, rgba(255,215,0,0.25) 46%, rgba(255,255,255,0.6) 50%, rgba(255,215,0,0.25) 54%, transparent 65%)',
                      transform: `translateX(${((rotationY % 360) / 360) * 140 - 70}%) translateY(${rotationX * 1.5}%)`,
                      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                  />
                </div>
              </div>

              {/* 3D Interactive Hotspot Pins */}
              {product.features3D &&
                product.features3D.map((hotspot, idx) => {
                  const isActive = activeHotspot === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        top: `${hotspot.y}%`,
                        left: `${hotspot.x}%`,
                        transform: `translateZ(70px) scale(${
                          isActive ? 1.15 : 1
                        })`,
                      }}
                      className="absolute z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspot(isActive ? null : idx);
                      }}
                    >
                      <button
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${
                          isActive
                            ? 'bg-purple-600 text-white ring-4 ring-purple-200 scale-110'
                            : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50 hover:scale-110'
                        }`}
                      >
                        <span className="font-black">+</span>
                      </button>

                      {/* Hotspot Floating Tooltip */}
                      {isActive && (
                        <div
                          style={{ transform: 'translateZ(90px)' }}
                          className="absolute -top-24 left-1/2 -translate-x-1/2 w-52 p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-purple-200 text-left shadow-2xl z-40 pointer-events-auto"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">
                              3D Feature
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Spec #{idx + 1}
                            </span>
                          </div>
                          <p className="font-semibold text-xs text-slate-900">
                            {hotspot.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {hotspot.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Thumbnail Gallery selector */}
          <div className="flex items-center gap-2 mt-3 z-10">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white shadow-xs ${
                  activeImageIndex === idx
                    ? 'border-purple-600 ring-2 ring-purple-300 scale-105'
                    : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-purple-300'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="56px"
                  className="object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT DETAILS & BUY BOX (Right 6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-4 py-2">
          {/* Price & Rating */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-base text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">
                {product.discount}% OFF
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center text-amber-500">
                {'★'.repeat(Math.floor(product.rating))}
                <span className="text-slate-300">
                  {'★'.repeat(5 - Math.floor(product.rating))}
                </span>
              </div>
              <span className="font-bold text-slate-900">
                {product.rating} / 5
              </span>
              <span>•</span>
              <span>{product.reviewsCount} verified reviews</span>
            </div>
          </div>

          {/* Colorway selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Finish: <span className="text-purple-700 normal-case font-bold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleColorSelect(c.name, c.image)}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                      selectedColor === c.name
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-2 ring-purple-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clean Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleBuyClick}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart • ₹{product.price.toLocaleString('en-IN')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
