"use client";
import { Button } from '@/components/ui/button';
import { Phone, Download, ChevronRight } from 'lucide-react';

interface AmcActionsProps {
    planId: string;
}

export function AmcActions({ planId }: AmcActionsProps) {
    return (
        <div className="flex flex-wrap gap-3">
            <Button
                className="bg-[#0B1F51] text-white hover:bg-[#00C4CC] rounded-input h-11 px-6 text-[15px] font-semibold"
            >
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
            </Button>
            <Button
                variant="outline"
                className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-input h-11 px-6 text-[15px] font-semibold"
            >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
            </Button>
            <Button
                variant="outline"
                className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-input h-11 px-6 text-[15px] font-semibold"
            >
                View Full Details
                <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    );
}
