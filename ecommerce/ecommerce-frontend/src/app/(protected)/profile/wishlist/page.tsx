import { WishlistTab } from '@/components/profile/server/WishlistTab';
import { getUserWishlist } from '@/lib/data/profile';

import { PageContainer } from '@/components/profile/client/PageContainer';

import type { WishlistItem } from '@/lib/data/profile/types';

export default async function WishlistPage() {
    let wishlist: WishlistItem[] = [];

    try {
        wishlist = await getUserWishlist();
    } catch (error) {
        console.error('Wishlist page fetch error:', error);
    }

    return (
        <PageContainer
            title="Wishlist"
            description="Your saved items"
            iconName="Heart"
            color="text-pink-600"
            bgColor="bg-pink-50 dark:bg-pink-900/20"
        >
            <WishlistTab wishlist={wishlist} />
        </PageContainer>
    );
}
