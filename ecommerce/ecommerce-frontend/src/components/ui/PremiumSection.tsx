"use client";
import { motion } from 'motion/react';
import { Button } from './button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import React from 'react';

interface PremiumSectionProps {
  badge: string;
  title: string;
  highlightWord?: string;
  description: string;
  bullets?: string[];
  primaryCta: {
    text: string;
    icon?: React.ElementType;
    onClick?: () => void;
  };
  secondaryCta?: {
    text: string;
    onClick?: () => void;
  };
  ctaFooter?: React.ReactNode;
  rightContent: React.ReactNode;
  id?: string;
  className?: string;
}

export function PremiumSection({
  badge,
  title,
  highlightWord,
  description,
  bullets = [],
  primaryCta,
  secondaryCta,
  ctaFooter,
  rightContent,
  id,
  className = ""
}: PremiumSectionProps) {
  
  // Helper to split title and highlight word
  const renderTitle = () => {
    if (!highlightWord) return title;
    const parts = title.split(highlightWord);
    // Safety check in case split fails or word not found
    if (parts.length < 2) return title;
    
    return (
      <>
        {parts[0]}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00C4CC] to-[#40E0D0]">
          {highlightWord}
        </span>
        {parts[1]}
      </>
    );
  };

  const Icon = primaryCta.icon || ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      id={id}
      className={`relative bg-[#0B1F51] rounded-[32px] md:rounded-[48px] p-8 md:p-16 overflow-hidden shadow-2xl isolate w-full ${className}`}
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0B1F51] via-[#0F296D] to-[#0B1F51] z-0" />
      
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C4CC] opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00C4CC] opacity-5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Block */}
        <div className="text-left space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#00C4CC]/10 border border-[#00C4CC]/20 px-4 py-1.5 rounded-full backdrop-blur-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#00C4CC] animate-pulse" />
            <span className="text-[#00C4CC] text-sm font-bold tracking-wider uppercase">{badge}</span>
          </motion.div>

          {/* Title & Desc */}
          <div>
            <h2 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {renderTitle()}
            </h2>
            <p className="text-[16px] md:text-[18px] text-white/80 leading-relaxed max-w-lg">
              {description}
            </p>
          </div>

          {/* Bullets */}
          {bullets.length > 0 && (
            <div className="grid gap-3">
              {bullets.map((bullet, index) => (
                <div key={index} className="flex items-center gap-3 group">
                   <div className="w-6 h-6 rounded-full bg-[#00C4CC]/20 flex items-center justify-center shrink-0 border border-[#00C4CC]/20 group-hover:border-[#00C4CC]/50 transition-colors">
                     <CheckCircle className="w-3.5 h-3.5 text-[#00C4CC]" />
                   </div>
                   <span className="text-white/90 font-medium">{bullet}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
                onClick={primaryCta.onClick}
                className="w-full sm:w-fit bg-linear-to-r from-[#00C4CC] to-[#09858B] hover:from-[#00B0B8] hover:to-[#08777C] text-white border-0 rounded-full px-8 py-7 text-[16px] md:text-[18px] font-bold shadow-[0_10px_40px_-10px_rgba(0,196,204,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(0,196,204,0.6)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
                <span className="relative z-10 flex items-center">
                  {primaryCta.text}
                  <Icon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
            </Button>
            
            {secondaryCta && (
              <Button
                variant="outline"
                onClick={secondaryCta.onClick}
                className="w-full sm:w-fit bg-transparent border-2 border-white/20 hover:border-white text-white hover:bg-white/10 rounded-full px-8 py-7 text-[16px] md:text-[18px] font-semibold transition-all duration-300 backdrop-blur-xs"
              >
                {secondaryCta.text}
              </Button>
            )}
          </div>

          {ctaFooter && (
            <div className="mt-4">
              {ctaFooter}
            </div>
          )}
        </div>

        {/* Right Block */}
        <div className="relative flex items-center justify-center h-full min-h-[300px] w-full">
          {rightContent}
        </div>
      </div>
    </motion.div>
  );
}

