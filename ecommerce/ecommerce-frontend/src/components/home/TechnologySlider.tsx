"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/utils/utils";
import Link from "next/link";

const TECHNOLOGIES = [
  {
    id: "ro",
    title: "RO Purification",
    description:
      "Removes heavy metals, salts, and impurities for pure, safe water.",
    image:
      "https://images.unsplash.com/photo-1546552356-3fae876a61ca?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "uv",
    title: "UV Protection",
    description:
      "Advanced UV-C technology kills 99.9% of harmful bacteria and viruses instantly.",
    image: "/technology/uvc_water.webp",
  },
  {
    id: "alkaline",
    title: "Alkaline Boost",
    description:
      "Balances pH levels (7.5-8.5) to support better hydration and body wellness.",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "copper",
    title: "Copper Tech",
    description:
      "Infused with essential copper goodness to boost immunity and digestion.",
    image: "/technology/copper_tech.webp",
  },
  {
    id: "temp",
    title: "Hot & Cold",
    description:
      "Instant access to piping hot water for tea or chilled water for refreshment.",
    image:
      "https://images.unsplash.com/photo-1544003484-3cd181d17917?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "uf",
    title: "UF Filtration",
    description:
      "Crystal clear clarity without electricity, retaining natural minerals.",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1000&auto=format&fit=crop",
  },
];

export function TechnologySlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, isHovered]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % TECHNOLOGIES.length);
  };

  const prevSlide = () => {
    setActiveIndex(
      (prev) => (prev - 1 + TECHNOLOGIES.length) % TECHNOLOGIES.length,
    );
  };

  const getModIndex = (i: number) => {
    return (i + TECHNOLOGIES.length) % TECHNOLOGIES.length;
  };

  // We render a window of positions: -1 (left exit), 0 (left), 1 (center), 2 (right), 3 (right enter)
  // To simplify the mapping:
  // The "Center" slot is always the activeIndex.
  // We need to map the relative positions to the actual items.

  // Let's iterate through the fixed visual slots and find which item belongs there
  const slots = [-2, -1, 0, 1, 2]; // -2=FarLeft, -1=Left, 0=Center, 1=Right, 2=FarRight

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1C2A54] mb-3 tracking-tight">
            Advanced Purification
          </h2>
          <p className="text-gray-500 text-lg">
            Discover the technology behind pure, healthy water.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative w-full max-w-[1400px] mx-auto h-[400px] md:h-[500px] flex justify-center items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Nav Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 z-40 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#1C2A54] hover:bg-white hover:scale-110 transition-all"
            aria-label="Previous technology"
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 z-40 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#1C2A54] hover:bg-white hover:scale-110 transition-all"
            aria-label="Next technology"
          >
            <ChevronRight className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Cards Track */}
          <div className="relative w-full h-full max-w-[1200px]">
            <AnimatePresence initial={false}>
              {slots.map((offset) => {
                const itemIndex = getModIndex(activeIndex + offset);
                const item = TECHNOLOGIES[itemIndex];

                // Layout Logic
                const isCenter = offset === 0;
                const isLeft = offset === -1;
                const isRight = offset === 1;
                const isVisible = offset >= -1 && offset <= 1;

                // Gap Configuration
                // Center is always 50% width, positioned at 25% left (centered)
                // We add a 2.5% gap on each side.
                // Left card: Ends at 22.5%. Width 22.5%. Left 0%.
                // Right card: Starts at 77.5%. Width 22.5%. Left 77.5%.

                // Responsive Layout Logic
                const isMobile =
                  typeof window !== "undefined" && window.innerWidth < 768;

                let leftPos = "25%";
                let width = "50%";
                let zIndex = 0;
                let opacity = 1;

                if (isMobile) {
                  // Mobile Layout (Single dominant card)
                  if (isCenter) {
                    leftPos = "5%"; // Centered with margin
                    width = "90%";
                    zIndex = 20;
                  } else if (isLeft) {
                    leftPos = "-95%"; // Off-screen left
                    width = "90%";
                    zIndex = 10;
                    opacity = 0; // Hide side cards on mobile for clean focus
                  } else if (isRight) {
                    leftPos = "105%"; // Off-screen right
                    width = "90%";
                    zIndex = 10;
                    opacity = 0;
                  } else {
                    // Far off items
                    leftPos = offset < 0 ? "-200%" : "200%";
                    width = "90%";
                    opacity = 0;
                  }
                } else {
                  // Desktop Layout (Standard 50/25/25 split)
                  if (isCenter) {
                    leftPos = "25%";
                    width = "50%";
                    zIndex = 20;
                  } else if (isLeft) {
                    leftPos = "0%";
                    width = "22.5%";
                    zIndex = 10;
                  } else if (isRight) {
                    leftPos = "77.5%";
                    width = "22.5%";
                    zIndex = 10;
                  } else if (offset < -1) {
                    leftPos = "-25%";
                    width = "22.5%";
                    zIndex = 0;
                    opacity = 0;
                  } else if (offset > 1) {
                    leftPos = "102.5%";
                    width = "22.5%";
                    zIndex = 0;
                    opacity = 0;
                  }
                }

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={false}
                    animate={{
                      left: leftPos,
                      width: width,
                      zIndex: zIndex,
                      opacity: opacity,
                      height: isCenter ? "100%" : "80%",
                      top: isCenter ? "0%" : "10%",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.25, 1, 0.5, 1],
                    }}
                    className={cn(
                      "absolute rounded-[28px] overflow-hidden bg-white shadow-xl border border-gray-100",
                      isVisible ? "cursor-pointer" : "pointer-events-none",
                      isCenter ? "shadow-2xl" : "shadow-md",
                    )}
                    onClick={() => {
                      if (offset === -1) prevSlide();
                      if (offset === 1) nextSlide();
                    }}
                  >
                    <div className="flex flex-col h-full w-full">
                      {/* Image Container */}
                      <motion.div
                        className="relative overflow-hidden w-full bg-gray-100"
                        animate={{
                          height: isCenter ? "60%" : "55%",
                        }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <motion.img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          animate={{ scale: isCenter ? 1.05 : 1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-50" />
                      </motion.div>

                      {/* Content Container */}
                      <div className="flex-1 bg-white relative p-4 md:p-8 flex flex-col justify-center w-full">
                        <motion.h3
                          className="font-bold text-[#1C2A54] mb-2 leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
                          animate={{
                            fontSize: isCenter
                              ? isMobile
                                ? "1.5rem"
                                : "2rem"
                              : "1.25rem",
                          }}
                        >
                          {item.title}
                        </motion.h3>

                        <motion.p
                          className="text-gray-500 mb-4 line-clamp-2"
                          animate={{
                            fontSize: isCenter ? "1rem" : "0.875rem",
                            opacity: 1,
                          }}
                        >
                          {item.description}
                        </motion.p>

                        <Link href="/technology" className="w-fit">
                          <motion.button
                            className="flex items-center font-medium text-[#31CDD4] group hover:underline w-fit"
                            animate={{
                              fontSize: isCenter
                                ? isMobile
                                  ? "0.9rem"
                                  : "1rem"
                                : "0.8rem",
                            }}
                          >
                            Explore Technology{" "}
                            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 mt-8">
          {TECHNOLOGIES.map((tech, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "rounded-full transition-all duration-500",
                activeIndex === idx
                  ? "w-8 h-2.5 bg-[#1C2A54]"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400",
              )}
              aria-label={`Go to ${tech.title}`}
              aria-current={activeIndex === idx ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselCard({
  item,
  offset,
  onClick,
}: {
  item: any;
  offset: number;
  onClick: () => void;
}) {
  const isCenter = offset === 0;
  const isLeft = offset === -1;
  const isRight = offset === 1;
  const isVisible = offset >= -1 && offset <= 1;

  // Define layout states
  // We use percentages for responsiveness

  // Desktop Layout (>768px)
  // Center: 50% width, Left/Right: 25% width

  let leftPos = "50%";
  let width = "50%";
  let zIndex = 0;
  let opacity = 1;

  if (offset === 0) {
    // Center
    leftPos = "25%"; // Starts at 25%, ends at 75% (width 50%)
    width = "50%";
    zIndex = 20;
  } else if (offset === -1) {
    // Left
    leftPos = "0%"; // Starts at 0%, ends at 25% (width 25%)
    width = "25%";
    zIndex = 10;
  } else if (offset === 1) {
    // Right
    leftPos = "75%"; // Starts at 75%, ends at 100% (width 25%)
    width = "25%";
    zIndex = 10;
  } else if (offset < -1) {
    // Far Left (Exit)
    leftPos = "-25%";
    width = "25%";
    zIndex = 0;
    opacity = 0;
  } else if (offset > 1) {
    // Far Right (Enter)
    leftPos = "100%";
    width = "25%";
    zIndex = 0;
    opacity = 0;
  }

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        left: leftPos,
        width: width,
        zIndex: zIndex,
        opacity: opacity,
        height: isCenter ? "100%" : "80%", // Height scale: Center 100% (of container), Side 80%
        top: isCenter ? "0%" : "10%", // Center vertically
      }}
      transition={{
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1], // Cubic bezier for smooth "gadget" feel
      }}
      className={cn(
        "absolute rounded-[28px] overflow-hidden bg-white shadow-xl border border-gray-100",
        isVisible ? "cursor-pointer" : "pointer-events-none",
        isCenter ? "shadow-2xl" : "shadow-md",
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full w-full">
        {/* Image Container */}
        <motion.div
          className="relative overflow-hidden w-full bg-gray-100"
          animate={{
            height: isCenter ? "60%" : "55%", // Morph container ratio
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            animate={{ scale: isCenter ? 1.05 : 1 }} // Subtle zoom on active
            transition={{ duration: 0.6 }}
          />
          {/* Gradient for text contrast on Hero if needed, or aesthetic */}
          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-50" />
        </motion.div>

        {/* Content Container */}
        <div className="flex-1 bg-white relative p-4 md:p-8 flex flex-col justify-center w-full">
          <motion.h3
            className="font-bold text-[#1C2A54] mb-2 leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
            animate={{
              fontSize: isCenter ? "2rem" : "1.25rem", // 32px vs 20px
            }}
          >
            {item.title}
          </motion.h3>

          <motion.p
            className="text-gray-500 mb-4 line-clamp-2"
            animate={{
              fontSize: isCenter ? "1rem" : "0.875rem", // 16px vs 14px
              opacity: isCenter ? 1 : 0.9, // Keep visible but maybe slightly muted? Prompt says NO opacity changes for inactive. OK.
            }}
            style={{ opacity: 1 }} // Force full opacity per prompt
          >
            {item.description}
          </motion.p>

          <motion.button
            className="flex items-center font-medium text-[#31CDD4] group hover:underline w-fit"
            animate={{
              fontSize: isCenter ? "1rem" : "0.8rem", // Scale CTA
            }}
          >
            Explore Technology{" "}
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
