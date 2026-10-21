"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Phone,
  MessageCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContactMethodSerializable, ContactIconName } from "@/types/about";

// Icon mapping for resolving icon names to components
const CONTACT_METHOD_ICONS: Record<
  ContactIconName,
  React.ComponentType<{ className?: string }>
> = {
  Phone,
  MessageCircle,
  Mail,
  MapPin: Phone, // Placeholder - not used in this carousel
  Clock: Phone, // Placeholder - not used in this carousel
  Headphones: Phone, // Placeholder - not used in this carousel
};

interface CTAContactMethodsCarouselProps {
  methods: ContactMethodSerializable[];
}

/**
 * CTAContactMethodsCarousel - Client Island Component
 *
 * Mobile carousel for contact method cards in the CTA section.
 * Displays call, chat, and email contact options.
 * Resolves icon names to actual icon components.
 */
export function CTAContactMethodsCarousel({
  methods,
}: CTAContactMethodsCarouselProps) {
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
        {methods.map((method, index) => {
          const Icon = CONTACT_METHOD_ICONS[method.iconName];
          return (
            <div
              key={index}
              className="w-[80vw] shrink-0 snap-center first:pl-4 last:pr-4"
            >
              <div
                className={`bg-linear-to-br ${method.bg} rounded-card p-6 border border-black/6 shadow-xs text-center h-full flex flex-col items-center justify-center`}
              >
                <div
                  className={`w-16 h-16 ${method.iconBg} rounded-input flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#0B1F51] mb-2 tracking-[-0.01em]">
                  {method.title}
                </h3>
                <p className="text-[18px] font-bold text-[#00C4CC] mb-2 break-all">
                  {method.value}
                </p>
                <p className="text-[14px] text-gray-600 leading-[140%]">
                  {method.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Visual hint for scrolling */}
      <div className="flex justify-center gap-1 mt-2">
        <div className="w-16 h-1 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
