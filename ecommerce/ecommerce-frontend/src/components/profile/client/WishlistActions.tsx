"use client";
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

import { useProfile } from '@/contexts/ProfileContext';

interface WishlistActionsProps {
    item: any;
}

export function WishlistActions({ item }: WishlistActionsProps) {
    const { addToCart } = useCart();
    const { removeFromWishlist } = useProfile();

    // Check if item is in stock based on total_stock or inStock flag
    const isInStock = item.inStock && (item.total_stock === undefined || item.total_stock > 0);

    const handleAddToCart = () => {
        addToCart({
            productId: String(item.id),
            quantity: 1,
        });
        // Note: useCart handles the success toast
    };

    return (
        <div className="flex gap-2">
            {isInStock ? (
                <Button
                    onClick={handleAddToCart}
                    className="flex-1 h-9 bg-[#0B1F51] text-white hover:bg-[#00C4CC] text-[13px]"
                >
                    <ShoppingCart className="w-3 h-3 mr-2" />
                    Add to Cart
                </Button>
            ) : (
                <Button disabled variant="outline" className="flex-1 h-9 text-[13px] border-dashed">
                    Out of Stock
                </Button>
            )}
            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100"
                onClick={() => removeFromWishlist(item.id)}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}
