'use client';

import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

/**
 * ChatButton - Client Island for ProductCTA
 * 
 * Small client component that handles the chat interaction
 * Keeps the server component as lean as possible
 */
export function ChatButton() {
    const { openChat } = useChat();

    return (
        <Button
            onClick={openChat}
            className="bg-[#00C4CC] hover:bg-[#00B0B8] text-white h-14 px-8 rounded-xl text-lg font-semibold shadow-xl shadow-teal-500/20"
        >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat with a Water Expert
        </Button>
    );
}
