import { WishlistItem } from '@/contexts/ProfileContext';
import { WishlistManager } from '../client/WishlistManager';

interface WishlistTabProps {
    wishlist: WishlistItem[];
}

export function WishlistTab({ wishlist }: WishlistTabProps) {
    return (
        <WishlistManager initialWishlist={wishlist} />
    );
}
