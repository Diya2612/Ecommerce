import Link from 'next/link';
import Image from 'next/image';
import { Droplets, Shield, Award, Truck } from 'lucide-react';

/**
 * Auth Layout - Professional 2-Column Design
 * 
 * Left: Brand imagery with trust signals
 * Right: Auth form
 */

const benefits = [
    {
        icon: Droplets,
        title: 'Pure Water Solutions',
        description: 'Premium water purifiers for healthy living',
    },
    {
        icon: Shield,
        title: 'Secure Shopping',
        description: '100% secure payments with buyer protection',
    },
    {
        icon: Award,
        title: 'Quality Guarantee',
        description: 'Industry-leading warranties on all products',
    },
    {
        icon: Truck,
        title: 'Free Installation',
        description: 'Professional installation at no extra cost',
    },
];

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left Column - Brand & Benefits (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-[#0B1F51] via-[#1a3a7c] to-[#0B1F51] overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-[#31CDD4] rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-[120px] animate-pulse delay-700" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-300 rounded-full blur-[80px] animate-pulse delay-1000" />
                </div>

                {/* Water Drop Pattern Overlay */}
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="water-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="2" fill="white" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#water-pattern)" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
                    {/* Logo */}
                    <Link href="/" className="inline-block">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/assets/937cb708e8b193c60b6be8546d5017b2b875e939.png"
                                alt="Anant Enterprises"
                                width={300}
                                height={200}
                                className="w-48 h-auto object-contain"
                            />
                        </div>
                    </Link>

                    {/* Center Content */}
                    <div className="flex-1 flex flex-col justify-center py-12">
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                            Welcome to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#31CDD4] to-cyan-300">
                                Pure Living
                            </span>
                        </h1>
                        <p className="text-lg text-blue-100/80 mb-12 max-w-md">
                            Join thousands of families enjoying clean, healthy water every day with our premium purification solutions.
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="group p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#31CDD4]/30 transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#31CDD4]/20 flex items-center justify-center mb-3 group-hover:bg-[#31CDD4]/30 transition-colors">
                                        <benefit.icon className="w-5 h-5 text-[#31CDD4]" />
                                    </div>
                                    <h3 className="font-semibold text-white text-sm mb-1">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-xs text-blue-200/60">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-6 text-sm text-blue-200/60">
                        <span>© {new Date().getFullYear()} Anant Enterprises</span>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            Terms
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors">
                            Support
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="flex-1 lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <Image
                                src="/assets/937cb708e8b193c60b6be8546d5017b2b875e939.png"
                                alt="Anant Enterprises"
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain"
                            />
                            <span className="text-xl font-bold text-[#0B1F51] dark:text-white">
                                Anant<span className="text-[#31CDD4]">Enterprises</span>
                            </span>
                        </Link>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 p-8 sm:p-10">
                        {children}
                    </div>

                    {/* Mobile Footer */}
                    <p className="lg:hidden text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                        © {new Date().getFullYear()} Anant Enterprises. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
