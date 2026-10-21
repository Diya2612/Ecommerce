import React from "react";
import * as motion from "motion/react-client";
import { ChevronRight, LucideIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { BannerFeaturePill } from "../client/BannerFeaturePill";
import { BannerStatCard } from "../client/BannerStatCard";

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BannerFeature {
  icon: React.ElementType; // Kept as ElementType for API compatibility
  text: string;
}

export interface BannerStat {
  icon: React.ElementType;
  value: string;
  label: string;
}

export interface BannerCTA {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline-solid";
}

export interface PageBannerProps {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "teal" | "green" | "blue";
  breadcrumbs?: BreadcrumbItem[];
  backButton?: { label: string; href: string };
  features?: BannerFeature[];
  stats?: BannerStat[];
  ctas?: BannerCTA[];
  align?: "left" | "center";
  height?: "sm" | "md" | "lg" | "xl";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  gradient?: "navy" | "dark" | "teal" | "light";
  showDecorativeBlurs?: boolean;
  showWaveSeparator?: boolean;
  waveSeparatorType?: "wave" | "gradient";
  animate?: boolean;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Configuration
// ============================================================================

const HEIGHT_CLASSES = {
  sm: "pt-24 pb-12",
  md: "pt-28 pb-16",
  lg: "pt-32 pb-24",
  xl: "pt-36 pb-32",
};

const MAX_WIDTH_CLASSES = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  full: "max-w-full",
};

const GRADIENT_CLASSES = {
  navy: "bg-linear-to-br from-[#0B1F51] via-[#0d2564] to-[#0B1F51]",
  dark: "bg-linear-to-br from-[#0B1F51] to-[#050d1f]",
  teal: "bg-linear-to-br from-[#00C4CC] via-[#0B1F51] to-[#0B1F51]",
  light: "bg-white",
};

const BADGE_VARIANTS = {
  teal: "bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]/30",
  green: "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30",
  blue: "bg-blue-50/80 text-[#0B1F51] border-blue-100",
};

// ============================================================================
// Component
// ============================================================================

export const PageBanner: React.FC<PageBannerProps> = ({
  title,
  description,
  badge,
  badgeVariant = "teal",
  breadcrumbs,
  backButton,
  features,
  stats,
  ctas,
  align = "center",
  height = "lg",
  maxWidth = "lg",
  gradient = "navy",
  showDecorativeBlurs = false,
  showWaveSeparator = false,
  waveSeparatorType = "wave",
  animate = false,
  className,
  contentClassName,
  children,
}) => {
  // Common animation props - Compatible with motion/react-client
  const getAnimationProps = (delay = 0) =>
    animate
      ? {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
        }
      : {};

  const isLightGradient = gradient === "light";
  const backButtonColor = isLightGradient ? "text-gray-500 hover:text-[#0B1F51]" : "text-white/70 hover:text-white";
  const textColor = isLightGradient ? "text-[#0B1F51]" : "text-white";
  const descriptionColor = isLightGradient ? "text-gray-600" : "text-white/90";

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        GRADIENT_CLASSES[gradient],
        HEIGHT_CLASSES[height],
        className,
      )}
    >
      {/* Decorative Gradient Blurs */}
      {showDecorativeBlurs && (
        <>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />
        </>
      )}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div
          className={cn(
            "mx-auto",
            MAX_WIDTH_CLASSES[maxWidth],
            align === "center" ? "text-center" : "text-left",
            contentClassName,
          )}
        >
          {/* Back Button */}
          {backButton && (
            <motion.div
              {...getAnimationProps(0)}
              className={cn(
                "mb-6 flex",
                align === "center" && "justify-center"
              )}
            >
              <Link
                href={backButton.href}
                className={cn(
                  "inline-flex items-center text-[14px] font-medium transition-colors duration-200 group",
                  backButtonColor
                )}
              >
                <motion.div
                   whileHover={{ x: -4 }}
                   className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.div>
                {backButton.label}
              </Link>
            </motion.div>
          )}

          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <motion.nav
              {...getAnimationProps(0)}
              className={cn(
                "flex items-center gap-2 mb-8 text-[14px] font-medium",
                align === "center" && "justify-center",
              )}
            >
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-[#94A3B8] hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[#00C4CC]">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </motion.nav>
          )}

          {/* Badge */}
          {badge && (
            <motion.div
              {...getAnimationProps(0)}
              className={cn(
                "inline-flex items-center gap-2 backdrop-blur-xs px-6 py-2 rounded-full text-[14px] font-bold tracking-wide mb-6 border",
                BADGE_VARIANTS[badgeVariant],
              )}
            >
              {badge}
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            {...getAnimationProps(0.1)}
            className={cn(
              "text-[36px] md:text-[48px] lg:text-[64px] font-semibold mb-6 tracking-[-0.01em] leading-[120%]",
              textColor,
            )}
          >
            {title}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              {...getAnimationProps(0.2)}
              className={cn(
                "text-[18px] leading-[150%] mb-8",
                align === "center" && "max-w-3xl mx-auto",
                descriptionColor,
              )}
            >
              {description}
            </motion.p>
          )}

          {/* Feature Pills */}
          {features && features.length > 0 && (
            <motion.div
              {...getAnimationProps(0.3)}
              className={cn(
                "flex flex-wrap gap-3 mb-8",
                align === "center" && "justify-center",
              )}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <BannerFeaturePill
                    key={index}
                    icon={<Icon className="" />} // Passing rendered icon to client
                    text={feature.text}
                  />
                );
              })}
            </motion.div>
          )}

          {/* CTA Buttons */}
          {ctas && ctas.length > 0 && (
            <motion.div
              {...getAnimationProps(0.3)}
              className={cn(
                "flex flex-wrap gap-4 mb-8",
                align === "center" && "justify-center",
              )}
            >
              {ctas.map((cta, index) => {
                const buttonClasses = cn(
                  "h-14 px-8 rounded-xl text-[16px] font-semibold transition-all duration-300",
                  cta.variant === "secondary"
                    ? "bg-white text-[#0B1F51] hover:bg-gray-100"
                    : cta.variant === "outline-solid"
                      ? "border-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
                      : "bg-[#00C4CC] text-white hover:bg-[#00C4CC]/90",
                );

                if (cta.href) {
                  return (
                    <Link key={index} href={cta.href}>
                      <Button className={buttonClasses}>{cta.label}</Button>
                    </Link>
                  );
                }

                return (
                  <Button
                    key={index}
                    onClick={cta.onClick}
                    className={buttonClasses}
                  >
                    {cta.label}
                  </Button>
                );
              })}
            </motion.div>
          )}

          {/* Stats Grid */}
          {stats && stats.length > 0 && (
            <div
              className={cn(
                "grid gap-6 mt-12",
                stats.length <= 2
                  ? "grid-cols-2 max-w-md mx-auto"
                  : stats.length === 3
                    ? "grid-cols-3 max-w-2xl mx-auto"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
              )}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <BannerStatCard
                    key={index}
                    icon={<Icon className="w-6 h-6 text-white" />} // Passing rendered icon
                    value={stat.value}
                    label={stat.label}
                    delay={0.4 + index * 0.1}
                    animate={animate}
                  />
                );
              })}
            </div>
          )}

          {/* Custom Children */}
          {children}
        </div>
      </div>
      {/* Wave Separator */}
      {showWaveSeparator && waveSeparatorType === "wave" && (
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      )}
      {/* Gradient Separator */}
      {showWaveSeparator && waveSeparatorType === "gradient" && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-[#F9FBFD] to-transparent" />
      )}
      */
    </section>
  );
};
