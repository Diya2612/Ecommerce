"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  User,
  Home,
  ShoppingBag,
  Menu,
  X,
  Search,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/data/profile/types";
import { triggerHaptic } from "@/hooks/gestures/useHaptic";

interface MobileProfileHeaderProps {
  user: UserProfile | null;
}

const PAGE_TITLES: Record<string, string> = {
  "/profile": "Profile",
  "/profile/orders": "My Orders",
  "/profile/addresses": "Addresses",
  "/profile/wishlist": "Wishlist",
  "/profile/amc": "AMC Plans",
  "/profile/account": "Account",
};

// Quick navigation links
const QUICK_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/collections", label: "Products", icon: Grid3X3 },
];

export function MobileProfileHeader({ user }: MobileProfileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine page title from path
  const getPageTitle = () => {
    // Check for exact match first
    if (PAGE_TITLES[pathname]) {
      return PAGE_TITLES[pathname];
    }

    // Check for order detail page
    if (pathname.startsWith("/profile/orders/")) {
      return "Order Details";
    }

    // Fallback
    return "Profile";
  };

  // Check if we're on a detail page (need back button)
  const isDetailPage =
    pathname.startsWith("/profile/orders/") && pathname !== "/profile/orders";

  const handleBack = () => {
    triggerHaptic("light");
    if (isDetailPage) {
      router.push("/profile/orders");
    } else {
      router.push("/");
    }
  };

  const toggleMenu = () => {
    triggerHaptic("light");
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100/50 dark:border-slate-800/50"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Back Button or Home Link */}
          <div className="flex items-center gap-2 min-w-[80px]">
            {isDetailPage ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 -ml-1"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            ) : (
              <Link
                href="/"
                className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0B1F51] to-[#00C4CC] flex items-center justify-center shadow-lg shadow-[#0B1F51]/20"
                onClick={() => triggerHaptic("light")}
              >
                <Home className="w-4 h-4 text-white" />
              </Link>
            )}
          </div>

          {/* Center: Page Title */}
          <motion.h1
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-base font-semibold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2"
          >
            {getPageTitle()}
          </motion.h1>

          {/* Right: Quick Nav + Menu */}
          <div className="flex items-center gap-1 min-w-[80px] justify-end">
            {/* Quick Products Link */}
            <Link
              href="/collections"
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => triggerHaptic("light")}
            >
              <ShoppingBag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </Link>

            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 -mr-1"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <Menu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Dropdown Quick Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100 dark:border-slate-800"
            >
              <div className="p-3 space-y-1 bg-gray-50/80 dark:bg-slate-800/50">
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-1">
                  Quick Navigation
                </p>
                {QUICK_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      triggerHaptic("light");
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-[#00C4CC]/10">
                      <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-[#00C4CC]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {item.label}
                    </span>
                  </Link>
                ))}

                {/* User info */}
                {user && (
                  <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0B1F51] to-[#00C4CC] flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {`${user.name} ${user.last_name || ""}`.trim() ||
                            "User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
