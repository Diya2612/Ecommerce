"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContactChannel } from "@/types/contact";

/**
 * Icon mapping for contact channels
 */
const iconMap = {
  Phone,
  MessageCircle,
  Mail,
  Headphones,
} as const;

interface ContactChannelsCarouselProps {
  channels: ContactChannel[];
}

/**
 * ContactChannelsCarousel - Client Component (Mobile Only)
 *
 * Mobile carousel for contact channels with swipe and state.
 * Desktop version uses CSS-only hover in server component.
 *
 * MAINTAINS EXACT SAME UI as original ContactUsSection.tsx mobile view
 */
export function ContactChannelsCarousel({
  channels,
}: ContactChannelsCarouselProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  return (
    <div className="md:hidden relative mb-20">
      <div className="relative overflow-hidden pb-2">
        <motion.div
          className="flex "
          animate={{ x: `-${carouselIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {channels.map((channel) => {
            const Icon = iconMap[channel.iconKey];
            return (
              <div key={channel.id} className="w-full shrink-0 px-2">
                <div
                  className={`bg-linear-to-br ${channel.bgColorFrom} ${channel.bgColorTo} border border-black/6 rounded-card p-8 shadow-xs text-center min-w-0 overflow-hidden`}
                >
                  <div
                    className={`w-20 h-20 ${channel.iconBg} rounded-input flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  >
                    <Icon className="w-10 h-10 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-[24px] font-semibold text-[#0B1F51] mb-3 tracking-[-0.01em]">
                    {channel.title}
                  </h3>
                  <p className="text-[18px] font-bold text-[#00C4CC] mb-2 truncate max-w-full" title={channel.primary}>
                    {channel.primary}
                  </p>
                  <p className="text-[14px] text-gray-600 mb-4">
                    {channel.secondary}
                  </p>
                  <p className="text-[16px] text-gray-700 mb-6 leading-[150%]">
                    {channel.description}
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full bg-white/70 hover:bg-white text-[#0B1F51] rounded-input font-semibold text-[16px] h-12"
                    asChild={!!channel.actionHref}
                  >
                    {channel.actionHref ? (
                      <a href={channel.actionHref}>{channel.action}</a>
                    ) : (
                      <span>{channel.action}</span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
        onClick={() =>
          setCarouselIndex((prev) =>
            prev === 0 ? channels.length - 1 : prev - 1,
          )
        }
        aria-label="Previous contact channel"
      >
        <ChevronLeft className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
        onClick={() =>
          setCarouselIndex((prev) =>
            prev === channels.length - 1 ? 0 : prev + 1,
          )
        }
        aria-label="Next contact channel"
      >
        <ChevronRight className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
      </Button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {channels.map((channel, index) => (
          <button
            key={channel.id}
            className={`h-2 rounded-full transition-all duration-300 ${index === carouselIndex
              ? "w-8 bg-[#00C4CC]"
              : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            onClick={() => setCarouselIndex(index)}
            aria-label={`Go to ${channel.title}`}
            aria-current={index === carouselIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}
