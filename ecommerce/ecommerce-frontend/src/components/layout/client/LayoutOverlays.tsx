"use client";

import { FloatingCartButton } from "@/components/cart/FloatingCartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { useChat } from "@/contexts/ChatContext";
import { useUI } from "@/contexts/ui/UIContext";
import type { CartProduct, UpsellProduct } from "@/lib/data/cart/types";

interface LayoutOverlaysProps {
    recommendedProducts: CartProduct[];
    upsellProducts: UpsellProduct[];
}

export function LayoutOverlays({ recommendedProducts, upsellProducts }: LayoutOverlaysProps) {
    const { isCartOpen, closeCart, openCart } = useUI();
    const { isChatOpen, openChat, closeChat } = useChat();

    return (
        <>
            <FloatingCartButton onClick={openCart} />
            <CartDrawer
                isOpen={isCartOpen}
                onClose={closeCart}
                recommendedProducts={recommendedProducts}
                upsellProducts={upsellProducts}
            />
            {/* <FloatingChatButton onClick={openChat} isOpen={isChatOpen} />
            <ChatDrawer isOpen={isChatOpen} onClose={closeChat} /> */}
        </>
    );
}
