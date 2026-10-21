"use client";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating button when scrolled down more than 300px
      setIsVisible(window.scrollY > 300 || true);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && cartItemCount > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClick}
          className="fixed bottom-8 mb-10 right-6 z-40 w-16 h-16 bg-linear-to-r from-[#0B1F51] to-[#00C4CC] rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-shadow duration-280"
          aria-label="Open cart"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[24px] h-[24px] bg-[#F5B012] text-white text-xs font-bold rounded-full border-3 border-white flex items-center justify-center px-1.5 shadow-lg"
            >
              {cartItemCount}
            </motion.span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
