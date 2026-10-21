"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Brand } from "@/types/home";

interface BrandsCarouselClientProps {
  brand: Brand;
  index: number;
}

/**
 * BrandsCarouselClient - Client Component (Hybrid Pattern)
 *
 * Handles interactive hover states for brand cards
 * Entrance animations are handled by server component
 *
 * ✨ Phase 2: Hover interactions only (entrance on server)
 */
export function BrandsCarouselClient({
  brand,
  index,
}: BrandsCarouselClientProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-[420px] rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-500 shrink-0"
    >
      {/* Image */}
      <Image
        src={brand.logo}
        alt={brand.name}
        fill
        sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 22vw"
        className="object-contain transition-transform duration-700 group-hover:scale-110"
        priority={index < 2}
      />

      {/* Overlays - EXACT same */}
      <div className="absolute inset-0 bg-linear-to-t from-[#0A1A3F]/90 via-[#0A1A3F]/20 to-transparent" />
      <div className="absolute inset-0 bg-[#16C4DA]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

      {/* Content - EXACT same */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        <div className="group-hover:-translate-y-2 transition-transform duration-300">
          <span className="inline-block px-2 py-1 mb-2 text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md rounded border border-white/10">
            {brand.category}
          </span>

          <h3 className="text-2xl font-bold">{brand.name}</h3>

          <div className="w-12 h-1 bg-[#16C4DA] mt-3 rounded-full group-hover:w-full transition-all duration-300" />
        </div>

        {/* CTA - EXACT same */}
        <div className="mt-4">
          <Link
            href={
              brand.link ||
              `/collections?search=${encodeURIComponent(brand.name)}`
            }
            className="flex items-center gap-2 text-sm font-semibold hover:text-[#16C4DA]"
          >
            View Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Border - EXACT same */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#16C4DA]/50 transition-colors pointer-events-none" />
    </div>
  );
}
