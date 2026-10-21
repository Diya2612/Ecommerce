'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Award, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PRINTO_CATEGORIES } from '@/lib/data/printoData';

export const PrintoFooter: React.FC = () => {
  return (
    <footer className="bg-[#120119] text-slate-300 text-xs border-t border-purple-950">
      
      {/* 1. Value Guarantee Header Strip */}
      <div className="border-b border-purple-900/40 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-amber-400 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">2400 DPI HD Quality</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">High-definition industrial printing presses</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Print Guarantee</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Free reprints if you're not fully satisfied</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-cyan-400 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Express 24-48h Dispatch</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Delivered to 19,000+ pincodes in India</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-pink-400 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">28+ Retail Stores</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">In Bangalore, Delhi, Hyderabad, Pune & Chennai</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#700895] to-[#9D17BE] flex items-center justify-center text-white font-black text-lg shadow-md">
              P
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              printo<span className="text-amber-400">.</span>
            </span>
          </div>

          <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
            Printo is India's premier personalized printing and customized corporate gifting platform. We make customized merchandise effortless for individuals, designers, startups, and multinational enterprises.
          </p>

          <div className="space-y-1.5 pt-2 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-amber-400" />
              <span>Customer Care: +91 80 4643 4343 (Mon-Sat, 9am - 8pm)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-amber-400" />
              <span>orders@printo.in / care@printo.in</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-amber-400" />
              <span>Electronic City Phase-I, Bangalore, Karnataka - 560100</span>
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Product Range</h4>
          <ul className="space-y-2 text-slate-400">
            {PRINTO_CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.id}>
                <a href={`#${c.slug}`} className="hover:text-amber-300 transition-colors">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support & Policies */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Customer Support</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link href="/amc" className="hover:text-amber-300 transition-colors">
                Track Your Shipment
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-300 transition-colors">
                Store Locator & Addresses
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-amber-300 transition-colors">
                Print Quality & Reprint Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-amber-300 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-amber-300 transition-colors">
                Artwork Design Guidelines
              </Link>
            </li>
          </ul>
        </div>

        {/* Corporate & Newsletter */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Get 10% Off Your Order</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Subscribe for exclusive coupon drops, bulk pricing deals & corporate design templates.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-xs bg-purple-950/40 border border-purple-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Subscribe & Claim 10%</span>
              <ArrowRight size={13} />
            </button>
          </form>

          <div className="pt-2 text-[10px] text-slate-500">
            GST Registration: 29AABCP1234F1Z9
          </div>
        </div>

      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="border-t border-purple-900/30 py-4 px-4 bg-[#0a000e] text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Printo Custom Printing Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Secure 256-Bit SSL Checkout</span>
            <span>•</span>
            <span>Razorpay, UPI, Cards, NetBanking Supported</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
