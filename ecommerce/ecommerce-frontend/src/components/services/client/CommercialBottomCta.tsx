"use client";
import { ArrowRight } from 'lucide-react';
import Image from "next/image";
import { PremiumSection } from '@/components/ui/PremiumSection';
import { COMMERCIAL_BENEFITS } from '@/lib/data/services-data';

export function CommercialBottomCta() {
    return (
        <PremiumSection
            badge="Enterprise Ready"
            title="Why Choose Our Commercial Solutions?"
            highlightWord="Commercial Solutions"
            description="We deliver robust, high-capacity water purification systems designed for continuous operation and maximum efficiency."
            bullets={COMMERCIAL_BENEFITS}
            primaryCta={{
                text: "Request Enterprise Consultation",
                icon: ArrowRight,
                onClick: () => window.location.href = '/contact?reason=enterprise'
            }}
            rightContent={
                <div className="relative w-full h-full min-h-[400px]">
                    <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                            src="https://images.unsplash.com/photo-1675093022653-59233299f8ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwd2F0ZXIlMjBwbGFudCUyMGluZHVzdHJpYWx8ZW58MXx8fHwxNzY1MDM2NTA4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Commercial RO Plant"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0B1F51]/80 to-transparent" />

                        {/* Floating Stats */}
                        <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg">
                                <div className="text-2xl font-bold text-[#0B1F51]">50+</div>
                                <p className="text-xs text-[#475569]">Enterprise Clients</p>
                            </div>
                            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg">
                                <div className="text-2xl font-bold text-[#0B1F51]">99.9%</div>
                                <p className="text-xs text-[#475569]">Uptime Guaranteed</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
