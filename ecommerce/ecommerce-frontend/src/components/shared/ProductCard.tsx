"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Star, ShoppingCart, Eye, Heart, Check, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { formatPrice, calculateDiscount } from "@/lib/utils/formatters";
import { colors } from "@/lib/constants/colors";
import { fetchAvailableStock, canAddToCart } from "@/lib/inventory/stock-utils";
import { QuickViewDialog } from "./QuickViewDialog";

// ============================================================================
// Types
// ============================================================================

export type BadgeVariant =
  | "new"
  | "bestseller"
  | "premium"
  | "sale"
  | "custom"
  | "outofstock"
  | "lowstock";

export interface ProductBadge {
  text: string;
  variant?: BadgeVariant;
}

export interface Product {
  id: number | string;
  slug?: string;
  name: string;
  tags?: string[]; // Optional to match types/home.ts
  rating?: number; // Optional to match types/home.ts
  reviews?: number; // Optional to match types/home.ts
  price: number;
  originalPrice?: number | null; // Allow null from backend APIs
  image: string;
  isNew?: boolean;
  label?: string;
  category?: string;
  technologies?: string[];
  inStock?: boolean;
  total_stock?: number;
}

export interface ProductCardProps {
  /** Product data object */
  product: Product;

  /** Called when notify me button is clicked for OOS items */
  onNotifyMe?: (product: Product) => void;

  /** Custom badge override (if not provided, will be auto-determined from product) */
  badge?: ProductBadge;

  /** Called when add to cart button is clicked */
  onAddToCart?: (product: Product) => void;

  /** Called when wishlist button is toggled */
  onWishlistToggle?: (product: Product) => void;

  /** Called when Quick View is opened */
  onQuickView?: (product: Product) => void;

  /** Called when product card/name is clicked */
  onProductClick?: (product: Product) => void;

  /** Whether product is in user's wishlist */
  isInWishlist?: boolean;

  /** Whether to show the Quick View button */
  showQuickView?: boolean;

  /** Image container height (e.g., "320px", "280px", or "aspect-square") */
  imageHeight?: string;

  /** Link to product detail page */
  productHref?: string;

  /** Additional CSS classes for the card container */
  className?: string;

  /** Whether to animate card entrance */
  animateEntrance?: boolean;
}

// ============================================================================
// Badge Configuration
// ============================================================================

const BADGE_CONFIGS: Record<BadgeVariant, { bg: string; text: string }> = {
  new: { bg: "bg-[#D0F4F0]", text: "text-[#115E59]" },
  bestseller: { bg: "bg-[#FFF4C2]", text: "text-[#854D0E]" },
  premium: { bg: "bg-[#E8D9FF]", text: "text-[#6B21A8]" },
  sale: { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]" },
  custom: { bg: "bg-gray-100", text: "text-gray-700" },
  outofstock: { bg: "bg-red-100", text: "text-red-700" },
  lowstock: { bg: "bg-orange-100", text: "text-orange-700" },
};

const BADGE_LABELS: Record<string, BadgeVariant> = {
  "NEW ARRIVAL": "new",
  NEW: "new",
  BESTSELLER: "bestseller",
  PREMIUM: "premium",
  SALE: "sale",
};

/**
 * Determines badge configuration from product attributes
 */
function getBadgeFromProduct(product: Product): ProductBadge | null {
  // Check stock status first
  if (product.total_stock === 0 || product.inStock === false) {
    return { text: "OUT OF STOCK", variant: "outofstock" };
  }

  if (
    product.total_stock !== undefined &&
    product.total_stock > 0 &&
    product.total_stock < 5
  ) {
    return { text: `ONLY ${product.total_stock} LEFT`, variant: "lowstock" };
  }

  // If product has explicit label, use it
  if (product.label) {
    const variant = BADGE_LABELS[product.label.toUpperCase()] || "custom";
    return { text: product.label, variant };
  }

  // Auto-determine based on product attributes
  if (product.isNew) {
    return { text: "NEW ARRIVAL", variant: "new" };
  }

  if (product.rating && product.rating >= 4.9) {
    return { text: "BESTSELLER", variant: "bestseller" };
  }

  // Default to premium for high-quality products
  return { text: "PREMIUM", variant: "premium" };
}

// ============================================================================
// ProductCard Component
// ============================================================================

/**
 * ProductCard - Unified, reusable product card component
 *
 * @description
 * A comprehensive product card component that consolidates functionality from
 * FeaturedProducts, RelatedProducts, and ProductGrid implementations.
 *
 * @example Basic usage
 * ```tsx
 * <ProductCard
 *   product={{
 *     id: 1,
 *     name: "Anant Pure X1",
 *     tags: ["RO", "UV", "UF"],
 *     rating: 4.8,
 *     reviews: 124,
 *     price: 12999,
 *     originalPrice: 18999,
 *     image: "/products/x1.jpg",
 *     isNew: true,
 *   }}
 *   onAddToCart={(product) => console.log('Add to cart', product)}
 *   onWishlistToggle={(product) => console.log('Toggle wishlist', product)}
 * />
 * ```
 *
 * @example With custom badge and link
 * ```tsx
 * <ProductCard
 *   product={product}
 *   badge={{ text: 'SALE', variant: 'sale' }}
 *   productHref={`/product/${product.id}`}
 *   isInWishlist={wishlist.includes(product.id)}
 *   onAddToCart={handleAddToCart}
 *   onWishlistToggle={handleWishlistToggle}
 *   imageHeight="aspect-square"
 *   showQuickView={true}
 * />
 * ```
 *
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  badge: badgeProp,
  onNotifyMe,
  onAddToCart,
  onWishlistToggle,
  onQuickView,
  onProductClick,
  isInWishlist = false,
  showQuickView = true,
  imageHeight = "h-[320px]",
  productHref,
  className,
  animateEntrance = true,
}) => {
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [availableStock, setAvailableStock] = React.useState<number | null>(null);
  const [isCheckingStock, setIsCheckingStock] = React.useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);

  // Determine badge config
  const badge = badgeProp || getBadgeFromProduct(product);
  const badgeConfig = badge ? BADGE_CONFIGS[badge.variant || "custom"] : null;

  // Discount calculation
  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPercent =
    hasDiscount && product.originalPrice
      ? calculateDiscount(product.originalPrice, product.price)
      : 0;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (product.total_stock === 0 || product.inStock === false) {
      return;
    }

    // Fetch real-time available stock before adding
    setIsCheckingStock(true);
    try {
      const stockData = await fetchAvailableStock(String(product.id));

      if (!canAddToCart(stockData.availableStock)) {
        toast.error('This item is currently out of stock');
        return;
      }

      // Update local available stock for display
      setAvailableStock(stockData.availableStock);

      setIsAddingToCart(true);
      onAddToCart?.(product);
      // Note: Success toast is handled by the useCart hook to avoid duplicates

      // Reset animation after delay
      setTimeout(() => setIsAddingToCart(false), 1500);
    } catch (error) {
      console.error('Failed to check stock:', error);
      toast.error('Failed to check stock availability. Please try again.');
    } finally {
      setIsCheckingStock(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onWishlistToggle?.(product);
  };

  const handleProductClick = () => {
    onProductClick?.(product);
  };

  const handleQuickView = () => {
    onQuickView?.(product);
  };

  // ========================================================================
  // Render Helpers
  // ========================================================================

  const targetHref = productHref || `/collections/${product.slug || product.id}`;

  const ProductName = (
    <h3
      onClick={handleProductClick}
      className="font-semibold text-[13px] md:text-[20px] text-[#0B1F51] group-hover:text-[#00C4CC] transition-colors cursor-pointer line-clamp-2 md:line-clamp-1 tracking-[-0.01em] leading-tight md:leading-normal"
    >
      {product.name}
    </h3>
  );

  // ========================================================================
  // Card Wrapper Setup
  // ========================================================================

  const cardClasses = cn(
    "group relative bg-white rounded-card border border-black/6 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col overflow-hidden hover:-translate-y-1 isolate transform-gpu backface-hidden",
    className,
  );

  const CardWrapper = animateEntrance ? motion.div : "div";
  const cardMotionProps = animateEntrance
    ? {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
    }
    : {};

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <>
      <CardWrapper {...cardMotionProps} className={cardClasses}>


        {/* Image Container */}
        <div
          className={cn(
            "relative bg-white overflow-hidden",
            imageHeight === "aspect-square" ? "aspect-square" : imageHeight,
          )}
        >
          {/* Badge */}
          {badge && badgeConfig && (
            <Badge
              className={cn(
                "absolute top-2 left-2 md:top-4 md:left-4 z-10 border-none px-2 py-1 md:px-4 md:py-1.5 rounded-[4px] md:rounded-[6px] text-[10px] md:text-[12px] font-bold tracking-wide shadow-lg",
                badgeConfig.bg,
                badgeConfig.text,
              )}
            >
              {badge.text}
            </Badge>
          )}

          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-2 right-2 md:top-4 md:right-4 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs",
              isInWishlist
                ? "bg-white text-[#EF4444] shadow-md"
                : "bg-white/90 text-gray-400 hover:text-[#EF4444] hover:bg-white",
            )}
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart className={cn("w-5 h-5", isInWishlist && "fill-current")} />
          </motion.button>

          {/* Product Image */}
          <div className="w-full h-full flex items-center justify-center relative">
            <Image
              src={product.image || "/assets/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>

          {/* Quick View Overlay */}
          {showQuickView && (
            <div className="hidden md:flex absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center pb-6 pointer-events-none z-10">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsQuickViewOpen(true);
                  handleQuickView();
                }}
                className="pointer-events-auto bg-white text-[#0B1F51] hover:bg-[#0B1F51] hover:text-white rounded-input px-6 font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100"
              >
                Quick View <Eye className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 md:p-6 relative flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1 md:mb-2 text-left">
              <div className="flex-1 min-w-0 mr-2">
                {/* Category/Tag */}
                {product.tags && product.tags.length > 0 && (
                  <p className="text-[10px] md:text-[12px] font-bold text-[#00C4CC] uppercase tracking-wider mb-1">
                    {product.tags[0]}
                  </p>
                )}
                {/* Product Name */}
                {ProductName}
              </div>
            </div>
          </div>

          {/* Price and Cart */}
          <div className="flex items-center justify-between mt-2 pt-2 md:mt-4 md:pt-4 border-t border-gray-100">
            {/* Price Display */}
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-gray-400 text-[10px] md:text-[14px] line-through">
                  {formatPrice(product.originalPrice ?? 0)}
                </span>
              )}
              <span className="text-sm md:text-[18px] font-bold text-[#0B1F51]">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Add to Cart / Notify Me Button */}
            {product.total_stock === 0 || product.inStock === false ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onNotifyMe?.(product);
                }}
                className="relative z-20 w-auto h-8 px-3 md:h-11 md:px-4 shrink-0 rounded-full md:rounded-input flex items-center justify-center transition-all duration-300 shadow-sm md:shadow-lg bg-white text-[#0B1F51] border border-[#0B1F51] hover:bg-[#0B1F51] hover:text-white"
                aria-label="Notify me when available"
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Bell className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  <span className="text-[10px] md:text-[13px] font-bold">
                    Notify Me
                  </span>
                </div>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={isAddingToCart || isCheckingStock}
                className={cn(
                  "relative z-20 w-8 h-8 md:w-11 md:h-11 shrink-0 rounded-full md:rounded-input flex items-center justify-center transition-all duration-300 shadow-sm md:shadow-lg",
                  isAddingToCart
                    ? "bg-[#00C4CC] text-white scale-110"
                    : "bg-[#0B1F51] text-white hover:bg-[#00C4CC]",
                  isCheckingStock && "opacity-50 cursor-wait"
                )}
                aria-label={isAddingToCart ? "Added to cart" : isCheckingStock ? "Checking stock" : "Add to cart"}
              >
                {isAddingToCart ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                ) : (
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Card Overlay Link */}
        <Link
          href={targetHref}
          onClick={handleProductClick}
          className="absolute inset-0 z-[5]"
          aria-label={`View ${product.name}`}
        />
      </CardWrapper>

      {/* Premium Quick View Dialog */}
      <QuickViewDialog
        product={{
          ...product,
          tags: product.tags || [],
          originalPrice: product.originalPrice ?? product.price,
        }}
        isOpen={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        onAddToCart={() => onAddToCart?.(product)}
        onToggleWishlist={() => onWishlistToggle?.(product)}
        isAddingToCart={isAddingToCart}
        isWishlisted={isInWishlist}
      />
    </>
  );
};

export default ProductCard;
