"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ShoppingCart, Menu, ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

import { useUI } from '@/contexts/ui/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { UserMenu } from '@/components/auth';
import { useQuery } from '@tanstack/react-query';
import { tierKeys, getTierHierarchy } from '@/queries';
import { SearchExpandedContent } from './components/SearchExpandedContent';
import { MegaMenuPanel } from './components/MegaMenuPanel';
import { useHeaderSearch } from './hooks/useHeaderSearch';
import { MobileMenu } from './components/MobileMenu';
import { NotificationBell } from './NotificationBell';

const logoDarkText = '/assets/10d9e162195ae525bf94f3d12e99419e24d10bb6.png';
const logoLightText = '/assets/937cb708e8b193c60b6be8546d5017b2b875e939.png';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [activeMegaMenuTier, setActiveMegaMenuTier] = useState<string | null>(null);
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);

    const searchContainerRef = useRef<HTMLDivElement>(null);

    const pathname = usePathname();
    const router = useRouter();
    const { getTotalItems } = useCart();

    const { openCart } = useUI();
    const { user } = useAuth();
    const cartItemCount = getTotalItems();

    const { data: tiers = [] } = useQuery({
        queryKey: tierKeys.hierarchy(),
        queryFn: getTierHierarchy,
        staleTime: 5 * 60 * 1000,
    });

    const {
        query,
        setQuery,
        results,
        isLoading,
        recentSearches,
        trendingSearches,
        navigateToProduct,
        navigateToResults,
        addToRecentSearches,
        recommendedProducts
    } = useHeaderSearch();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        // Check initial scroll position
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isSearchExpanded) handleSearchClose();
                if (activeMegaMenuTier) setActiveMegaMenuTier(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchExpanded, activeMegaMenuTier]);

    useEffect(() => {
        if (isSearchExpanded || activeMegaMenuTier || isSheetOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSearchExpanded, activeMegaMenuTier, isSheetOpen]);

    const handleSearchClick = () => {
        setIsSearchExpanded(true);
        setActiveMegaMenuTier(null);
    };

    const handleSearchClose = () => {
        setIsSearchExpanded(false);
        setQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
            navigateToResults();
            handleSearchClose();
        }
    };

    const handleProductClick = (productId: number | string) => {
        navigateToProduct(productId);
        handleSearchClose();
    };

    const handleTermClick = (term: string) => {
        setQuery(term);
        addToRecentSearches(term);
    };

    const headerBg = isScrolled
        ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-blue-900/5 border-white/50 dark:border-slate-800"
        : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg shadow-blue-900/5 border-white/60 dark:border-slate-700";

    return (
        <>
            {/* Backdrop Overlay */}
            <AnimatePresence>
                {(isSearchExpanded || activeMegaMenuTier || isSheetOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => {
                            handleSearchClose();
                            setActiveMegaMenuTier(null);
                            setIsSheetOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Header Container */}
            <div
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none",
                    isScrolled ? "pt-2" : "pt-6",
                    "right-0"
                )}
            >
                <motion.header
                    initial={false}
                    animate={{}}
                    className={cn(
                        "w-full max-w-[1500px] pointer-events-auto border overflow-hidden rounded-[24px] transition-colors duration-300",
                        headerBg
                    )}
                    ref={searchContainerRef}
                    onMouseLeave={() => !isSearchExpanded && setActiveMegaMenuTier(null)}
                >
                    {/* Main Top Bar */}
                    <div className={cn(
                        "relative flex items-center justify-between px-6 md:px-8",
                        isScrolled ? "py-3" : "py-4"
                    )}>
                        {/* 1. Left: Logo (Fixed Width) */}
                        <div className={cn("shrink-0 w-[180px] flex items-center z-20", isSearchExpanded && "hidden lg:flex")}>
                            <Link href="/" className="flex items-center cursor-pointer">
                                <Image
                                    src={logoDarkText}
                                    alt="Anant Enterprises"
                                    width={160}
                                    height={40}
                                    className="block dark:hidden h-8 md:h-10 w-auto object-contain"
                                />
                                <Image
                                    src={logoLightText}
                                    alt="Anant Enterprises"
                                    width={160}
                                    height={40}
                                    className="hidden dark:block h-8 md:h-10 w-auto object-contain"
                                />
                            </Link>
                        </div>

                        {/* 2. Center: Dynamic Content (Nav <-> Search) */}
                        <div className={cn("flex-1 justify-center items-center relative h-12", isSearchExpanded ? "flex" : "hidden lg:flex")}>
                            <AnimatePresence mode="wait" initial={false}>
                                {isSearchExpanded ? (
                                    <motion.div
                                        key="search-bar"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full max-w-2xl relative"
                                    >
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Search for products..."
                                            className="w-full h-12 pl-12 pr-12 bg-gray-100 dark:bg-slate-800 rounded-full text-[#1C2A54] dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#31CDD4]/50 transition-all font-medium"
                                            autoFocus
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-1">
                                            <button
                                                onClick={handleSearchClose}
                                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 dark:text-gray-500 hover:text-[#31CDD4]"
                                            >
                                                <span className="sr-only">Close</span>
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.nav
                                        key="navigation"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2 xl:gap-4"
                                        onMouseLeave={() => setHoveredNav(null)}
                                    >


                                        {tiers.map((tier) => {
                                            const isActive = hoveredNav === tier.id || (!hoveredNav && activeMegaMenuTier === tier.id);
                                            return (
                                                <button
                                                    key={tier.id}
                                                    onMouseEnter={() => {
                                                        setHoveredNav(tier.id);
                                                        if (tier.children && tier.children.length > 0) {
                                                            setActiveMegaMenuTier(tier.id);
                                                        } else {
                                                            setActiveMegaMenuTier(null);
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        router.push(`/collections?categories=${tier.code}`);
                                                        setActiveMegaMenuTier(null);
                                                    }}
                                                    className={cn(
                                                        "relative px-4 py-2 rounded-full font-medium text-sm xl:text-[15px] tracking-wide transition-colors duration-300 flex items-center gap-1 z-20",
                                                        isActive
                                                            ? "text-[#31CDD4] dark:text-[#31CDD4]"
                                                            : "text-[#1C2A54] dark:text-gray-200"
                                                    )}
                                                >
                                                    <span className="relative z-10 flex items-center gap-1">
                                                        {tier.name}
                                                        {tier.children && tier.children.length > 0 && (
                                                            <ChevronDown className={cn(
                                                                "w-4 h-4 transition-transform duration-300",
                                                                activeMegaMenuTier === tier.id ? "rotate-180" : "rotate-0",
                                                                isActive ? "text-[#31CDD4]" : "text-gray-400"
                                                            )} />
                                                        )}
                                                    </span>
                                                    {isActive && (
                                                        <motion.span
                                                            layoutId="nav-capsule"
                                                            className="absolute inset-0 bg-gray-100 dark:bg-slate-800/50 rounded-full -z-10"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.nav>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. Right: Actions */}
                        <div className="hidden lg:flex items-center justify-end gap-3 w-[280px] z-20">
                            {/* Search Toggle Button - Only visible when search is CLOSED */}
                            {!isSearchExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleSearchClick}
                                        className="w-10 h-10 rounded-full text-[#1C2A54] dark:text-white hover:text-[#31CDD4] hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
                                        title="Search"
                                    >
                                        <Search className="w-5 h-5" />
                                    </Button>
                                </motion.div>
                            )}

                            <div className="flex items-center gap-1 pl-2 border-l border-gray-200/50 dark:border-gray-700/50 ml-1">
                                {user && <NotificationBell />}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#1C2A54] dark:text-white hover:text-[#31CDD4] hover:bg-[#31CDD4]/10 dark:hover:bg-slate-800 rounded-full w-10 h-10 transition-colors relative"
                                    onClick={openCart}
                                    aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#31CDD4] text-white text-[11px] font-bold rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center px-1">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Button>
                            </div>

                            <UserMenu />

                            <Button
                                className={cn(
                                    "bg-linear-to-r from-[#1C2A54] to-[#2a458c] dark:from-blue-600 dark:to-blue-800 hover:from-[#1C2A54] hover:to-[#31CDD4] text-white font-semibold rounded-full shadow-lg shadow-blue-900/20 transition-all duration-500 hover:shadow-blue-900/30 hover:-translate-y-0.5",
                                    isScrolled ? "px-6 h-10 text-sm" : "px-8 h-11 text-base"
                                )}
                                onClick={() => router.push('/contact')}
                            >
                                Book Now
                            </Button>
                        </div>

                        {/* Mobile Toggles */}
                        <div className="lg:hidden flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={isSearchExpanded ? handleSearchClose : handleSearchClick}
                                className="text-[#1C2A54] dark:text-white hover:bg-transparent"
                            >
                                {isSearchExpanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                            </Button>

                            {!isSearchExpanded && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSheetOpen(!isSheetOpen)}
                                    className="text-[#1C2A54] dark:text-white hover:bg-transparent relative w-10 h-10"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {isSheetOpen ? (
                                            <motion.div
                                                key="close"
                                                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            >
                                                <X className="w-6 h-6" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="menu"
                                                initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                                exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            >
                                                <Menu className="w-6 h-6" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Expanded Content Area (Shared 'Stage' for Search Results or Mega Menu) */}
                    <AnimatePresence>
                        {(isSearchExpanded || activeMegaMenuTier || isSheetOpen) && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="border-t border-gray-100/50 dark:border-gray-800/50 overflow-hidden rounded-b-[24px]"
                            >
                                {isSearchExpanded ? (
                                    <div className="p-0">
                                        <SearchExpandedContent
                                            recentSearches={recentSearches}
                                            trendingSearches={trendingSearches}
                                            recommendedProducts={recommendedProducts}
                                            onTermClick={handleTermClick}
                                            onProductClick={handleProductClick}
                                            onViewAllClick={() => {
                                                navigateToResults();
                                                handleSearchClose();
                                            }}
                                            results={results}
                                            query={query}
                                            isLoading={isLoading}
                                            tiers={tiers}
                                        />
                                    </div>
                                ) : activeMegaMenuTier ? (
                                    <MegaMenuPanel
                                        key={activeMegaMenuTier}
                                        tiers={tiers}
                                        activeTierId={activeMegaMenuTier}
                                        onClose={() => setActiveMegaMenuTier(null)}
                                    />
                                ) : isSheetOpen ? (
                                    <MobileMenu
                                        isOpen={isSheetOpen}
                                        onOpenChange={setIsSheetOpen}
                                        navItems={[
                                            { name: 'Collection', href: '/collections', hasDropdown: true },
                                            { name: 'Services', href: '/services' },
                                            { name: 'About', href: '/about' }
                                        ]}
                                        pathname={pathname}
                                        cartItemCount={cartItemCount}
                                        onCartClick={openCart}
                                        onProfileClick={() => router.push('/profile/orders')}
                                        onContactClick={() => router.push('/contact')}
                                    />
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.header>
            </div>
        </>
    );
}
