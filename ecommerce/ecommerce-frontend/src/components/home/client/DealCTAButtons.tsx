'use client';

import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import Link from 'next/link';

interface DealCTAButtonsProps {
    ctaText: string;
}

/**
 * DealCTAButtons - Client Component
 * 
 * Handles CTA button clicks with chat integration
 * Maintains EXACT same UI as original DealOfTheDay buttons
 */
export function DealCTAButtons({ ctaText }: DealCTAButtonsProps) {
    const { openChat } = useChat();

    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
                onClick={openChat}
                className="bg-[#00C4CC] hover:bg-[#00b2b9] text-white shadow-lg shadow-[#00C4CC]/20 rounded-card h-[52px] px-8 text-[15px] font-bold border-none flex-1 sm:flex-none"
            >
                {ctaText}
            </Button>
            <Link href="/services">
                <Button className="bg-white/10 hover:bg-white/20 text-white rounded-card h-[52px] px-8 text-[15px] font-bold border border-white/20 flex-1 sm:flex-none w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Book Now
                </Button>
            </Link>
        </div>
    );
}
