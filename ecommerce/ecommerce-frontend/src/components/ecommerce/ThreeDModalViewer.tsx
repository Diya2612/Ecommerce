'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Product } from './EcommerceData';
import { ThreeDProductViewer } from './ThreeDProductViewer';

interface ThreeDModalViewerProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, color?: string) => void;
}

export const ThreeDModalViewer: React.FC<ThreeDModalViewerProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Dark overlay backdrop with blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl z-10 max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
        {/* Close Button floating */}
        <button
          onClick={onClose}
          aria-label="Close 3D View"
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 transition-all hover:scale-110 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The 3D Product Viewer */}
        <ThreeDProductViewer
          product={product}
          onAddToCart={(p, color) => {
            if (onAddToCart) onAddToCart(p, color);
          }}
        />
      </div>
    </div>
  );
};
