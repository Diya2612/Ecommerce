'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useProfile } from '@/contexts/ProfileContext';
import { fetchAvailableStock, canAddToCart, getMaxOrderQuantity } from '@/lib/inventory/stock-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Shield,
    Truck,
    RefreshCw,
    Award,
    Minus,
    Plus,
    Droplets,
    Settings,
    Lightbulb,
    FlaskConical,
    Leaf,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import type { ProductDetail, ProductBundle, ProductHeroClientProps, ProductVariant } from '@/types/product';
import { ProductBundlesClient } from './ProductBundlesClient';
import { VariantSelector } from './VariantSelector';


// Icon mapping for features
const iconMap: Record<string, React.ElementType> = {
    Shield,
    Truck,
    RefreshCw,
    Award,
    Droplets,
    Settings,
    Lightbulb,
    FlaskConical,
    Leaf,
};

/**
 * ProductHeroClient - Client Island
 * 
 * Handles all interactive elements:
 * - Image gallery with thumbnails
 * - Color selection
 * - Quantity controls
 * - Add to cart / Buy now
 * - Wishlist toggle
 * - Features carousel (mobile)
 */
export function ProductHeroClient({ product, bundles }: ProductHeroClientProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariantId, setSelectedVariantId] = useState<string | number | null>(null);
    const [availableStock, setAvailableStock] = useState<number | null>(null);
    const [isCheckingStock, setIsCheckingStock] = useState(false);
    const stockFetchedRef = useRef(false);
    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useProfile();
    const router = useRouter();

    // Get active variants
    const activeVariants = product.has_variants && product.variants
        ? product.variants.filter(v => !v.is_deleted)
        : [];

    // Find the selected variant or default variant
    const selectedVariant = activeVariants.find(v => String(v.id) === String(selectedVariantId))
        || null;

    // Initialize selected variant on mount - REMOVED to show base product by default
    // useEffect(() => {
    //     if (activeVariants.length > 0 && !selectedVariantId) {
    //         const defaultVariant = activeVariants.find(v => v.is_default) || activeVariants[0];
    //         if (defaultVariant) {
    //             setSelectedVariantId(defaultVariant.id);
    //         }
    //     }
    // }, [activeVariants, selectedVariantId]);

    // Calculate current price based on selected variant or product price
    const currentPrice = selectedVariant
        ? Number(selectedVariant.selling_price)
        : product.price;

    const currentOriginalPrice = selectedVariant
        ? (selectedVariant.compare_at_price ? Number(selectedVariant.compare_at_price) : null)
        : product.originalPrice;

    const currentDiscount = currentOriginalPrice && currentOriginalPrice > currentPrice
        ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
        : product.discount;

    // Calculate stock based on selected variant or product stock
    const currentStock = selectedVariant && selectedVariant.inventory_quantity !== undefined
        ? selectedVariant.inventory_quantity
        : product.total_stock;

    const isInStock = currentStock !== undefined && currentStock !== null
        ? currentStock > 0
        : product.inStock;

    // Debug: Log product stock data


    // Check if product is in wishlist
    const isLiked = wishlist.some(item => String(item.id) === String(product.id));

    // Fetch available stock on mount
    useEffect(() => {
        // Prevent duplicate calls in React 18 StrictMode
        if (stockFetchedRef.current) return;
        stockFetchedRef.current = true;

        const loadAvailableStock = async () => {
            try {
                const stockData = await fetchAvailableStock(String(product.id));
                setAvailableStock(stockData.availableStock);
            } catch (error) {
                console.error('Failed to fetch available stock:', error);
                // Fall back to total_stock
                setAvailableStock(product.total_stock ?? 0);
            }
        };
        loadAvailableStock();
    }, [product.id, product.total_stock]);

    // Calculate max quantity based on available stock (no artificial limits)
    // availableStock from backend already accounts for reservations
    const maxQuantity = availableStock !== null && availableStock > 0
        ? availableStock
        : (currentStock !== undefined && currentStock > 0
            ? currentStock
            : 0);

    // Get images from product or use fallback
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.image];

    // If variant has image, prepend it to the images array
    useEffect(() => {
        if (selectedVariant?.image_url) {
            // Reset to first image when variant changes
            setSelectedImage(0);
        }
    }, [selectedVariant?.image_url]);

    const displayImages = selectedVariant?.image_url
        ? [selectedVariant.image_url, ...images.filter(img => img !== selectedVariant.image_url)]
        : images;

    // Features for the features strip
    const features = [
        { icon: Shield, text: "5 Year Warranty" },
        { icon: Truck, text: "Free Installation" },
        { icon: RefreshCw, text: "1 Year AMC Free" },
        { icon: Award, text: "ISI Certified" }
    ];

    // Key features - use product features if available, otherwise use defaults
    const keyFeatures = product.features && product.features.length > 0
        ? product.features.map(f => ({
            icon: iconMap[f.icon] || Shield,
            title: f.title,
            desc: f.description
        }))
        : [
            { icon: Shield, title: "Multi-stage", desc: "RO+UV+UF Tech" },
            { icon: Droplets, title: "10L Capacity", desc: "Large Storage" },
            { icon: Settings, title: "TDS Control", desc: "Mineral Guard" },
            { icon: Lightbulb, title: "Smart LED", desc: "Filter Alerts" },
            { icon: FlaskConical, title: "Copper Boost", desc: "Active Health" },
            { icon: Leaf, title: "Eco Mode", desc: "Power Saving" }
        ];

    const toggleLike = () => {
        if (isLiked) {
            removeFromWishlist(String(product.id));
        } else {
            addToWishlist({
                id: String(product.id),
                name: product.name,
                image: product.image,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                inStock: product.inStock,
                total_stock: product.total_stock,
                rating: product.rating,
                url: `/collections/${product.slug || product.id}`,
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.subtitle,
                    url: window.location.href,
                });
            } catch {
                toast("Link copied to clipboard!");
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast("Link copied to clipboard!");
        }
    };

    const handleAddToCart = async (showToast = true) => {
        // Note: Base product (selectedVariantId = null) is a valid selection
        // Users can add either the base product or a specific variant to cart

        // Fetch fresh stock data before adding
        setIsCheckingStock(true);
        try {
            const stockData = await fetchAvailableStock(String(product.id));

            if (!canAddToCart(stockData.availableStock)) {
                toast.error('This item is currently out of stock');
                return;
            }

            // Update available stock display
            setAvailableStock(stockData.availableStock);

            // Add to cart - the useCart hook will handle stock validation and auto-correction
            await addToCart({
                productId: String(product.id),
                quantity: quantity,
                variant: selectedVariant ? `${selectedVariant.option_name}: ${selectedVariant.option_value}` : undefined,
                variantId: selectedVariantId ? String(selectedVariantId) : undefined,
                productDetails: {
                    name: product.name,
                    image: product.image,
                    price: currentPrice
                }
            });

            if (showToast) {
                toast.success(`${quantity} item(s) added to cart`);
            }
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            // Error handling is done by useCart hook
        } finally {
            setIsCheckingStock(false);
        }
    };

    const handleBuyNow = () => {
        handleAddToCart(false);
        router.push('/checkout');
    };

    // TEMPORARILY HIDDEN - Features carousel functions
    // const handlePrevFeature = () => {
    //     setFeaturesCarouselIndex((prev) => (prev === 0 ? keyFeatures.length - 1 : prev - 1));
    // };

    // const handleNextFeature = () => {
    //     setFeaturesCarouselIndex((prev) => (prev === keyFeatures.length - 1 ? 0 : prev + 1));
    // };

    return (
        <>
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Left: Image Gallery */}
                <div className="space-y-6 h-fit">
                    {/* Main Image */}
                    <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative bg-linear-to-br from-gray-50 to-white rounded-card border border-black/6 overflow-hidden aspect-square flex items-center justify-center"
                    >
                        {/* Stock Badge - Check both conditions with proper null/undefined handling */}
                        {!isInStock ? (
                            <Badge className="absolute top-4 left-4 z-10 bg-red-500 text-white border-2 border-white px-4 py-1.5 rounded-[6px] text-[12px] font-bold tracking-wide shadow-lg">
                                OUT OF STOCK
                            </Badge>
                        ) : (
                            <Badge className="absolute top-4 left-4 z-10 bg-[#22C55E] text-white border-2 border-white px-4 py-1.5 rounded-[6px] text-[12px] font-bold tracking-wide shadow-lg">
                                IN STOCK
                            </Badge>
                        )}
                        <div className="absolute top-6 right-6 flex gap-2 z-10">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleLike}
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isLiked ? "bg-[#EF4444] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShare}
                                className="w-11 h-11 rounded-full bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-all duration-300 shadow-lg"
                                aria-label="Share this product"
                            >
                                <Share2 className="w-5 h-5" aria-hidden="true" />
                            </motion.button>
                        </div>
                        <Image
                            src={displayImages[selectedImage]}
                            alt={product.name}
                            fill
                            className="object-cover mix-blend-multiply"
                            priority
                        />
                    </motion.div>

                    {/* Thumbnail Gallery */}
                    <div className="grid grid-cols-4 gap-4">
                        {displayImages.map((image, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedImage(index)}
                                className={`relative aspect-square rounded-input border-2 overflow-hidden transition-all duration-300 ${selectedImage === index
                                    ? "border-[#0B1F51] shadow-lg ring-2 ring-offset-1 ring-[#0B1F51]/20"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                                aria-label={`View image ${index + 1} of ${displayImages.length}`}
                                aria-current={selectedImage === index ? 'true' : undefined}
                            >
                                <Image src={image} alt="" fill className="object-cover" />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Right: Product Details */}
                <div className="space-y-6">
                    {/* Product Title & Rating */}
                    <div>
                        <h1 className="text-[48px] font-semibold text-[#0B1F51] mb-2 tracking-[-0.01em] leading-[120%]">
                            {product.name}
                        </h1>
                        <p className="text-[18px] text-gray-600 mb-4 leading-[150%]">{product.subtitle}</p>

                        <div className="flex items-center gap-3 mb-4">
                            {/* TEMPORARILY HIDDEN - Rating Section */}
                            {/* <span className="text-[20px] font-bold text-[#0B1F51]">{product.rating}</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-[#F5B012] text-[#F5B012]" : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div> */}
                            {/* TEMPORARILY HIDDEN - Reviews Section */}
                            {/* <span className="text-[14px] text-gray-400">({product.reviews} reviews)</span>
                            <button
                                onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-[14px] font-medium text-[#00C4CC] hover:underline ml-1"
                            >
                                View Reviews
                            </button> */}
                        </div>

                        {/* TEMPORARILY HIDDEN - SKU Section */}
                        {/* {product.sku && (
                            <div className="text-[14px] text-gray-500">
                                SKU: <span className="font-medium text-gray-700">{product.sku}</span>
                            </div>
                        )} */}
                    </div>

                    {/* Price */}
                    <div className="bg-linear-to-br from-[#F9FBFD] to-white border border-black/6 rounded-card p-6">
                        <div className="flex items-end gap-4 mb-2">
                            <span className="text-[48px] font-bold text-[#0B1F51] leading-[120%]">
                                ₹{currentPrice?.toLocaleString() ?? 'N/A'}
                            </span>
                            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                                <span className="text-[24px] text-gray-400 line-through mb-2">
                                    ₹{currentOriginalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {currentDiscount && currentOriginalPrice && (
                                <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-none px-3 py-1 rounded-[6px] text-[14px] font-bold">
                                    Save {currentDiscount}% (₹{((currentOriginalPrice) - currentPrice).toLocaleString()})
                                </Badge>
                            )}
                            <span className="text-[14px] text-gray-600">Inclusive of all taxes</span>
                        </div>

                        {/* Delivery Info */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[14px] text-gray-700">
                                <Truck className="w-4 h-4 text-[#00C4CC]" />
                                <span>Delivery within 24–48 hrs</span>
                            </div>
                            <div className="flex items-center gap-2 text-[14px] text-gray-500">
                                <Settings className="w-4 h-4 text-gray-400" />
                                <span>Installation scheduled after delivery</span>
                            </div>
                        </div>

                        {/* Stock Warning */}
                        {availableStock !== null && availableStock > 0 && availableStock < 5 && (
                            <div className="mt-3 px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg text-orange-700 text-sm font-medium flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Hurry! Only {availableStock} units available (after reservations).
                            </div>
                        )}
                        {!isInStock && (
                            <div className="mt-3 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm font-medium">
                                Currently out of stock
                            </div>
                        )}
                    </div>

                    {/* Variant Selection - Show if product has variants */}
                    {product.has_variants && activeVariants.length > 0 && (
                        <VariantSelector
                            variants={activeVariants}
                            selectedVariantId={selectedVariantId}
                            onVariantSelect={setSelectedVariantId}
                        />
                    )}



                    {/* Quantity Selector */}
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-3">
                            Quantity
                            {maxQuantity > 0 && maxQuantity <= 10 && (
                                <span className="ml-2 text-sm font-normal text-amber-600">
                                    (Only {maxQuantity} available)
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-input border-2 border-gray-200 text-gray-600 hover:border-[#00C4CC] hover:text-[#00C4CC] hover:bg-teal-50 shadow-xs active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="w-5 h-5" aria-hidden="true" />
                                </button>
                                <span className="w-16 h-12 flex items-center justify-center text-[18px] font-bold text-[#0B1F51]" aria-live="polite">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(q + 1, maxQuantity))}
                                    disabled={maxQuantity === 0 || quantity >= maxQuantity}
                                    className="w-12 h-12 flex items-center justify-center rounded-input border-2 border-gray-200 text-gray-600 hover:border-[#00C4CC] hover:text-[#00C4CC] hover:bg-teal-50 shadow-xs active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={() => handleAddToCart(true)}
                            disabled={!isInStock || isCheckingStock}
                            className="flex-1 bg-[#0B1F51] hover:bg-[#152C6B] text-white h-16 rounded-input text-[16px] font-semibold shadow-xl shadow-blue-900/10 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            {isCheckingStock ? 'Checking Stock...' : !isInStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        <Button
                            onClick={handleBuyNow}
                            disabled={!isInStock || isCheckingStock}
                            className="flex-1 bg-[#00C4CC] hover:bg-[#00B0B8] text-white h-16 rounded-input text-[16px] font-semibold shadow-xl shadow-teal-500/10 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {isCheckingStock ? 'Checking...' : 'Buy Now'}
                        </Button>
                    </div>

                    {/* Product Description */}
                    {product.description && (
                        <div className="bg-white border border-black/6 rounded-card p-6">
                            <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-4">Product Description</h3>
                            <div
                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Product Bundles Section */}
            {/* TEMPORARILY HIDDEN - Bundle Deals Section */}
            {/* {bundles && bundles.length > 0 && (
                <ProductBundlesClient mainProduct={product} bundles={bundles} />
            )} */}

            {/* TEMPORARILY HIDDEN - Key Product Features Section */}
            {/*
            <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="mb-6">
                    <h3 className="text-[16px] font-bold text-[#0B1F51] uppercase tracking-wide">Key Product Features</h3>
                    <p className="text-[14px] text-gray-500">Core technologies and performance benefits</p>
                </div>

                <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-4">
                    {keyFeatures.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="flex flex-col items-start group cursor-default">
                                <div className="mb-3 text-[#00C4CC] group-hover:scale-110 transition-transform duration-300">
                                    <Icon size={28} strokeWidth={1.5} />
                                </div>
                                <h4 className="font-semibold text-[#0B1F51] text-[14px] leading-tight mb-1">{item.title}</h4>
                                <p className="text-[12px] text-gray-500 leading-tight">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="sm:hidden relative">
                    <div className="relative overflow-hidden pb-2">
                        <motion.div
                            className="flex"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {keyFeatures.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="w-full shrink-0 px-4">
                                        <div className="bg-white border border-black/6 rounded-card p-8 text-center shadow-xs">
                                            <div className="mb-4 text-[#00C4CC] flex justify-center">
                                                <Icon size={48} strokeWidth={1.5} />
                                            </div>
                                            <h4 className="font-bold text-[#0B1F51] text-[18px] leading-tight mb-2">{item.title}</h4>
                                            <p className="text-[14px] text-gray-600 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                        aria-label="Previous feature"
                    >
                        <ChevronLeft className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                        aria-label="Next feature"
                    >
                        <ChevronRight className="w-5 h-5 text-[#0B1F51]" aria-hidden="true" />
                    </Button>

                    <div className="flex justify-center gap-2 mt-6">
                        {keyFeatures.map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${index === featuresCarouselIndex
                                    ? "w-8 bg-[#0B1F51]"
                                    : "w-2 bg-gray-300 hover:bg-gray-400"
                                    }`}
                                onClick={() => setFeaturesCarouselIndex(index)}
                                aria-label={`Go to feature ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            */}
        </>
    );
}
