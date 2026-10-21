'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const MAJOR_HUBS = [
  { city: 'Bengaluru', pincode: '560001', speed: 'Same Day (4 Hours)', status: 'Lightning Dispatch' },
  { city: 'Mumbai', pincode: '400001', speed: 'Next Day Delivery', status: 'Priority Hub' },
  { city: 'Delhi NCR', pincode: '110001', speed: 'Next Day Delivery', status: 'Priority Hub' },
  { city: 'Hyderabad', pincode: '500081', speed: '24 - 48 Hours', status: 'Active Hub' },
  { city: 'Chennai', pincode: '600001', speed: '24 - 48 Hours', status: 'Active Hub' },
  { city: 'Pune', pincode: '411001', speed: 'Next Day Delivery', status: 'Priority Hub' },
];

export const DeliveryPincodeChecker: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<{
    valid: boolean;
    city: string;
    deliveryTime: string;
    expressAvailable: boolean;
  } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();

    if (cleanPin.length !== 6 || isNaN(Number(cleanPin))) {
      setResult({
        valid: false,
        city: 'Invalid PIN',
        deliveryTime: 'Please enter a valid 6-digit Indian Postal Code',
        expressAvailable: false,
      });
      return;
    }

    if (cleanPin.startsWith('56')) {
      setResult({
        valid: true,
        city: 'Bengaluru Metro Hub',
        deliveryTime: '⚡ Today / Within 4 Hours via HyperLocal Express',
        expressAvailable: true,
      });
    } else if (cleanPin.startsWith('40') || cleanPin.startsWith('41')) {
      setResult({
        valid: true,
        city: 'Mumbai / Pune Region',
        deliveryTime: '🚀 Tomorrow by 2:00 PM via Air Express',
        expressAvailable: true,
      });
    } else if (cleanPin.startsWith('11') || cleanPin.startsWith('12') || cleanPin.startsWith('20')) {
      setResult({
        valid: true,
        city: 'Delhi NCR Hub',
        deliveryTime: '🚀 Tomorrow by 4:00 PM via Air Express',
        expressAvailable: true,
      });
    } else {
      setResult({
        valid: true,
        city: 'Pan-India Express Network',
        deliveryTime: '📦 Delivered within 24 to 48 Hours via Bluedart / Delhivery',
        expressAvailable: true,
      });
    }
  };

  const handleSelectHub = (hub: typeof MAJOR_HUBS[0]) => {
    setPincode(hub.pincode);
    if (hub.city === 'Bengaluru') {
      setResult({
        valid: true,
        city: 'Bengaluru Metro Hub',
        deliveryTime: '⚡ Today / Within 4 Hours via HyperLocal Express',
        expressAvailable: true,
      });
    } else {
      setResult({
        valid: true,
        city: `${hub.city} Metro Hub`,
        deliveryTime: `🚀 ${hub.speed} via Priority Air Cargo`,
        expressAvailable: true,
      });
    }
  };

  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Info (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              <Truck className="w-3.5 h-3.5" />
              <span>Pan-India Fulfillment Grid</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Check Instant Delivery &amp; Same-Day Dispatch
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We operate 12+ automated manufacturing &amp; fulfillment hubs across India with integrated air logistics partners. Check delivery timelines for your doorstep.
            </p>

            {/* Quick Hub Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Major Hub:
              </span>
              <div className="flex flex-wrap gap-2">
                {MAJOR_HUBS.map((hub) => (
                  <button
                    key={hub.city}
                    onClick={() => handleSelectHub(hub)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Building2 className="w-3 h-3 text-purple-600" />
                    <span>{hub.city}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Input Box (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md space-y-4">
            <form onSubmit={handleCheck} className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Enter Your 6-Digit Delivery Pincode:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560001, 110001, 400001"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 font-mono text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-md shadow-purple-600/30 flex items-center gap-2 shrink-0"
                >
                  <span>Check Speed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Results Display */}
            {result && (
              <div
                className={`p-4 rounded-2xl border transition-all ${result.valid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                  }`}
              >
                <div className="flex items-start gap-3">
                  {result.valid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-sm">{result.city}</div>
                    <div className="text-xs">{result.deliveryTime}</div>
                    {result.valid && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>All orders inspected and sealed with tamper-proof packaging.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3 Trust pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Live GPS Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Zero Transit Damage Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>GST Tax Invoices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
