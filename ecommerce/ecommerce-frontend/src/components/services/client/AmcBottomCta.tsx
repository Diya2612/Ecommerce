"use client";
import { Mail, Gift } from 'lucide-react';
import { PremiumSection } from '@/components/ui/PremiumSection';

export function AmcBottomCta() {
    return (
        <PremiumSection
            badge="Enterprise"
            title="Need a custom plan?"
            highlightWord="custom plan"
            description="Looking for commercial solutions or bulk AMC for your office complex? We provide tailored solutions."
            bullets={["Dedicated Account Manager", "Priority GST Invoicing", "Custom SLA Agreements"]}
            primaryCta={{ text: "Contact for Custom Plan", icon: Mail, onClick: () => window.location.href = '/contact?reason=custom_amc' }}
            rightContent={
                <div className="relative w-full h-full min-h-[250px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#F5B012] opacity-10 blur-3xl rounded-full" />
                    <Gift className="w-40 h-40 text-[#F5B012] drop-shadow-[0_0_20px_rgba(245,176,18,0.3)]" />
                </div>
            }
        />
    );
}
