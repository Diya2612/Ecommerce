"use client";
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/hooks/useCart';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function FloatingChatButton({ onClick, isOpen }: FloatingChatButtonProps) {
  const { cartItems } = useCart();
  const hasUnreadMessages = true; // Mock unread indicator

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          onClick={onClick}
          className="fixed bottom-6 right-24 z-40 w-16 h-16 bg-[#0B1F51] dark:bg-blue-600 text-white rounded-full shadow-2xl hover:shadow-[0_10px_40px_rgba(11,31,81,0.4)] dark:hover:shadow-[0_10px_40px_rgba(59,130,246,0.4)] transition-all duration-280 flex items-center justify-center group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F5B012] rounded-full border-2 border-[#0B1F51] dark:border-blue-600 animate-pulse" />
            )}
          </div>

          {/* Ripple Effect */}
          <span className="absolute inset-0 rounded-full bg-[#00C4CC] opacity-0 group-hover:opacity-20 group-hover:animate-ping" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

