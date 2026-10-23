import Link from 'next/link';
import { ShoppingBag, Shield, Award, Truck, Sparkles } from 'lucide-react';

/**
 * Auth Layout - Professional 2-Column Design for Ecommerce
 */
const benefits = [
    {
        icon: Sparkles,
        title: 'Premium Custom Products',
        description: 'High-definition printing and custom merchandise',
    },
    {
        icon: Shield,
        title: 'Secure Checkout',
        description: '100% encrypted payments with buyer protection',
    },
    {
        icon: Award,
        title: 'Quality Guarantee',
        description: 'Superior materials and flawless finish',
    },
    {
        icon: Truck,
        title: 'Fast Nationwide Delivery',
        description: 'Tracked dispatch straight to your doorstep',
    },
];

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left Column - Ecommerce Brand & Benefits (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-[#0B1F51] via-[#1a3a7c] to-[#071333] overflow-hidden">
                {/* Animated Background Highlights */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px]" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400 rounded-full blur-[80px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
                    {/* Brand Logo Link to Storefront Home */}
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight text-white">
                                ECOMMERCE<span className="text-blue-400">STORE</span>
                            </span>
                            <span className="text-xs uppercase tracking-widest text-blue-200/70 font-semibold">
                                Modern Storefront
                            </span>
                        </div>
                    </Link>

                    {/* Center Content */}
                    <div className="flex-1 flex flex-col justify-center py-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold w-fit mb-6 border border-white/15">
                            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                            Official Customer Portal
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
                            Welcome to the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-200">
                                Ecommerce Storefront
                            </span>
                        </h1>
                        <p className="text-lg text-blue-100/80 mb-10 max-w-md">
                            Sign in to manage your orders, track shipments, and access customized shopping features.
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                                        <benefit.icon className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <h3 className="font-semibold text-white text-sm mb-1">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-xs text-blue-200/70">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex items-center gap-6 text-sm text-blue-200/60">
                        <span>© {new Date().getFullYear()} Ecommerce Storefront</span>
                        <Link href="/" className="hover:text-white transition-colors">
                            Storefront
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
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-[#0B1F51] dark:text-white">
                                Ecommerce<span className="text-blue-500">Store</span>
                            </span>
                        </Link>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 p-8 sm:p-10">
                        {children}
                    </div>

                    {/* Mobile Footer */}
                    <p className="lg:hidden text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                        <Link href="/" className="text-blue-600 hover:underline">
                            ← Back to Ecommerce Store
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
