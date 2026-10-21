import { cache } from 'react';
import { FileText, Shield, User, CreditCard, AlertTriangle } from 'lucide-react';
import type { TermsSection } from '@/types/terms';

/**
 * Fetches terms sections for the Terms & Conditions page
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getTermsSections = cache(async (): Promise<TermsSection[]> => {
    try {
        // Simulating API call - replace with actual fetch when backend is ready
        // const response = await fetch(`${process.env.API_URL}/terms/sections`, {
        //     next: { revalidate: 86400 } // Cache for 24 hours
        // });

        return [
            {
                id: 'agreement',
                number: 1,
                icon: FileText,
                iconBg: 'bg-blue-100',
                title: 'Agreement to Terms',
                content: 'These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Anant Enterprises ("we," "us" or "our"), concerning your access to and use of the Anant Web App website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site"). You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.',
            },
            {
                id: 'services',
                number: 2,
                icon: Shield,
                iconBg: 'bg-cyan-100',
                title: 'Services & AMC',
                content: 'We provide water purification products, installation services, and Annual Maintenance Contracts (AMC).',
                highlight: {
                    title: 'AMC Coverage',
                    items: [
                        'Our AMC plans generally cover periodic filter replacements, service visits, and breakdown support as per the specific plan purchased.',
                        'Spare parts coverage is subject to the specific terms of the Plan chosen (Comprehensive vs. Non-Comprehensive).',
                        'Service visits must be scheduled within working hours (9 AM - 6 PM).',
                    ],
                },
            },
            {
                id: 'accounts',
                number: 3,
                icon: User,
                iconBg: 'bg-purple-100',
                title: 'User Accounts',
                content: 'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for any activities or actions under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to comply with this section.',
            },
            {
                id: 'payments',
                number: 4,
                icon: CreditCard,
                iconBg: 'bg-green-100',
                title: 'Payments & Refunds',
                content: 'We accept payments via credit cards, debit cards, UPI, and net banking.',
                twoColumn: {
                    left: {
                        title: 'Pricing',
                        content: 'All prices are subject to change without notice. We reserve the right to modify or discontinue the Service (or any part or content thereof) without notice at any time.',
                    },
                    right: {
                        title: 'Refunds',
                        content: 'Refunds for products are processed if returned within 7 days in original condition. AMC cancellations are pro-rated based on months used, subject to a cancellation fee.',
                    },
                },
            },
            {
                id: 'liability',
                number: 5,
                icon: AlertTriangle,
                iconBg: 'bg-amber-100',
                title: 'Limitation of Liability',
                content: 'In no event shall Anant Enterprises, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.',
            },
        ];
    } catch (error) {
        console.error('Error fetching terms sections:', error);
        return [];
    }
});
