'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Heart,
  CreditCard,
} from 'lucide-react';
import { ECOMMERCE_CATEGORIES } from './EcommerceData';

export const EcommerceFooter: React.FC = () => {
  return (
    <footer className="bg-slate-50 text-slate-800 border-t border-slate-200 pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Perks 4-Column Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 mb-8 border-b border-slate-200">
          <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Free Express Shipping</h4>
              <p className="text-xs text-slate-500 mt-0.5">Orders over ₹999 get free expedited delivery</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">7 Days Easy Return</h4>
              <p className="text-xs text-slate-500 mt-0.5">Hassle-free instant refund & pickup</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">100% Genuine Certified</h4>
              <p className="text-xs text-slate-500 mt-0.5">Direct from authorized brand partners</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">Live chat & phone assistance anytime</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Info (2 cols on md) */}
          <div className="col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                PRINTO<span className="text-purple-600">COMMERCE</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              India&apos;s premier online custom printing & corporate merchandising marketplace. Order business cards, personalized gifts, corporate apparel, and marketing essentials with instant real-time 3D inspection.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Accepted Payments:</span>
              <span className="font-semibold text-slate-700">UPI • Cards • NetBanking • EMI</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-purple-700 mb-3">
              Shop Collections
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              {ECOMMERCE_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <a href="#trending-products" className="hover:text-purple-600 transition-colors">
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-purple-700 mb-3">
              Help & Support
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Shipping Rates & Policies</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Artwork Proof Guidelines</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-purple-700 mb-3">
              About Us
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Experience Centers</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Sustainability & Paper Stocks</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Corporate & Enterprise Bulk</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Printo Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PrintoCommerce Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
