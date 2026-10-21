"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Clock,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  QuickContactInfoSerializable,
  ContactIconName,
} from "@/types/about";

// Icon mapping for resolving icon names to components
const CONTACT_ICONS: Record<
  ContactIconName,
  React.ComponentType<{ className?: string }>
> = {
  MapPin,
  Clock,
  Headphones,
  Phone: MapPin, // Placeholder - not used in this carousel
  MessageCircle: MapPin, // Placeholder - not used in this carousel
  Mail: MapPin, // Placeholder - not used in this carousel
};

interface CTAQuickInfoCarouselProps {
  items: QuickContactInfoSerializable[];
}

/**
 * CTAQuickInfoCarousel - Client Island Component
 *
 * Mobile carousel for quick contact info cards in the CTA section.
 * Displays location, hours, and support information.
 * Resolves icon names to actual icon components.
 */
export function CTAQuickInfoCarousel({ items }: CTAQuickInfoCarouselProps) {
  return (
    <div className="md:hidden relative">
      <div
        className="flex overflow-x-scroll snap-x snap-mandatory gap-4 pb-4 no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {items.map((info, index) => {
          const Icon = CONTACT_ICONS[info.iconName];
          return (
            <div
              key={index}
              className="w-[80vw] shrink-0 snap-center first:pl-2 last:pr-2"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-card p-6 h-full flex flex-col items-center justify-center text-center">
                <div
                  className={`w-14 h-14 ${info.iconBg} rounded-input flex items-center justify-center shadow-lg mb-4`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-[18px] font-semibold text-white mb-1">
                    {info.title}
                  </h4>
                  <p className="text-[14px] text-white/80 mb-3">
                    {info.subtitle}
                  </p>
                  <p className="text-[15px] text-white/90 leading-[140%] whitespace-pre-line">
                    {info.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Visual hint for scrolling */}
      <div className="flex justify-center gap-1 mt-2">
        <div className="w-16 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
}
