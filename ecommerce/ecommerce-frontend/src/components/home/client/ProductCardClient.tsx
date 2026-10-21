'use client';

import { toast } from 'sonner';
import { useProfile } from '@/contexts/ProfileContext';
import { useCart } from '@/hooks/useCart';
import { ProductCard, Product } from '@/components/shared/ProductCard';

interface ProductCardClientProps {
    product: Product;
    productHref?: string;
    showQuickView?: boolean;
    imageHeight?: string;
    animateEntrance?: boolean;
}

/**
 * ProductCardClient - Client Component Wrapper
 * 
 * Wraps the ProductCard component with context-based interactions
 * Handles cart and wishlist functionality client-side
 * 
 * This maintains the EXACT same UI as the original Product Card
 */
export function ProductCardClient({
    product,
    productHref = `/collections/${product.slug || product.id}`,
    showQuickView = true,
    imageHeight,
    animateEntrance = false,
}: ProductCardClientProps) {
    const { wishlist, addToWishlist, removeFromWishlist } = useProfile();
    const { addToCart: addToCartContext } = useCart();

    // Check if product is in wishlist
    const isInWishlist = wishlist.some((item) => item.id === String(product.id));

    // Handle add to cart
    const handleAddToCart = () => {
        addToCartContext({
            productId: String(product.id),
            quantity: 1,
            preventDuplicates: true,
        });

        // Toast is now handled in CartContext, but we can keep it here if context toast is disabled or for double feedback?
        // Context has toast.success("Added to cart").
        // I will remove the toast here to avoid duplicate if I keep context toast.
        // Actually, let's keep specific toast here if context one is generic.
        // But context toast handles errors.
        // Let's remove this toast call and rely on context or update context to not toast if silent.
        // Context is "Added to cart". This one is "{name} has been added...".
        // I'll keep the context one simpler and rely on it.
    };

    // Handle wishlist toggle
    const handleNotifyMe = (product: Product) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Registering your request...',
                success: `We'll notify you when ${product.name} is back in stock!`,
                error: 'Something went wrong',
            }
        );
    };

    const handleWishlistToggle = () => {
        if (isInWishlist) {
            removeFromWishlist(String(product.id));
        } else {
            addToWishlist({
                ...product,
                id: String(product.id),
                inStock: true,
                rating: product.rating || 0,
                reviews: product.reviews || 0,
                originalPrice: product.originalPrice || product.price,
            });
        }
    };

    return (
        <ProductCard
            product={product}
            isInWishlist={isInWishlist}
            onAddToCart={handleAddToCart}
            onNotifyMe={handleNotifyMe}
            onWishlistToggle={handleWishlistToggle}
            productHref={productHref}
            showQuickView={showQuickView}
            imageHeight={imageHeight}
            animateEntrance={animateEntrance}
        />
    );
}
