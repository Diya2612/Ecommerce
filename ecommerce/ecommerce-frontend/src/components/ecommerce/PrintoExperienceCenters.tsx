'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Store,
  Navigation,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

interface StoreLocation {
  id: string;
  city: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  pickupReady: string;
  isFlagship?: boolean;
}

const STORES: StoreLocation[] = [
  {
    id: 'blr-1',
    city: 'Bengaluru',
    name: 'Koramangala 80ft Road (Flagship Store)',
    address: 'No. 32, 80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    hours: 'Open Today: 9:00 AM – 9:30 PM',
    phone: '+91 80 6900 6901',
    pickupReady: '⚡ Ready in 2 Hours',
    isFlagship: true,
  },
  {
    id: 'blr-2',
    city: 'Bengaluru',
    name: 'Indiranagar 100ft Road Experience Hub',
    address: '772, 100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    hours: 'Open Today: 9:30 AM – 9:00 PM',
    phone: '+91 80 6900 6902',
    pickupReady: '⚡ Ready in 2 Hours',
  },
  {
    id: 'blr-3',
    city: 'Bengaluru',
    name: 'Electronic City Phase 1 Mega Production Facility',
    address: 'Near Lords Plaza, 2nd Cross, Electronic City Phase 1, Bengaluru 560100',
    hours: 'Open 24/7 for Enterprise Dispatch',
    phone: '+91 80 6900 6900',
    pickupReady: '⚡ Ready in 1 Hour',
    isFlagship: true,
  },
  {
    id: 'mum-1',
    city: 'Mumbai',
    name: 'Bandra Kurla Complex (BKC) Business Center',
    address: 'Ground Floor, The Capital Building, G Block BKC, Bandra East, Mumbai 400051',
    hours: 'Open Today: 9:00 AM – 8:30 PM',
    phone: '+91 22 6900 6910',
    pickupReady: '⚡ Ready in 3 Hours',
    isFlagship: true,
  },
  {
    id: 'mum-2',
    city: 'Mumbai',
    name: 'Lower Parel High Street Phoenix Hub',
    address: 'Unit 12, Senapati Bapat Marg, Lower Parel, Mumbai 400013',
    hours: 'Open Today: 10:00 AM – 9:00 PM',
    phone: '+91 22 6900 6912',
    pickupReady: '⚡ Ready in 3 Hours',
  },
  {
    id: 'del-1',
    city: 'Delhi NCR',
    name: 'Connaught Place Regal Building Hub',
    address: 'Block E, Inner Circle, Connaught Place, New Delhi, Delhi 110001',
    hours: 'Open Today: 9:30 AM – 8:30 PM',
    phone: '+91 11 6900 6920',
    pickupReady: '⚡ Ready in 3 Hours',
    isFlagship: true,
  },
  {
    id: 'del-2',
    city: 'Delhi NCR',
    name: 'DLF Cyber City Building 10 Hub',
    address: 'Tower B, DLF CyberHub, Phase 2, Gurugram, Haryana 122002',
    hours: 'Open Today: 9:00 AM – 9:00 PM',
    phone: '+91 124 690 6925',
    pickupReady: '⚡ Ready in 2 Hours',
  },
  {
    id: 'hyd-1',
    city: 'Hyderabad',
    name: 'Hitech City Mindspace Tech Hub',
    address: 'Inorbit Mall Rd, Vittal Rao Nagar, Madhapur, Hyderabad, Telangana 500081',
    hours: 'Open Today: 9:30 AM – 9:00 PM',
    phone: '+91 40 6900 6930',
    pickupReady: '⚡ Ready in 3 Hours',
    isFlagship: true,
  },
];

export const PrintoExperienceCenters: React.FC = () => {
  const [activeCity, setActiveCity] = useState('Bengaluru');

  const cities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad'];
  const filteredStores = STORES.filter((s) => s.city === activeCity);

  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 mb-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>30+ Physical Retail Experience Centers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Visit a Store or Pick Up in 2 Hours
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Inspect physical paper swatches, touch luxury finishes, consult with resident designers, or collect online orders with express 2-hour pickup.
            </p>
          </div>

          {/* City selector pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCity === city
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Store Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredStores.map((store) => (
            <ThreeDCard
              key={store.id}
              maxTilt={12}
              scale={1.02}
              className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-purple-400 transition-colors"
            >
              <div>
                {/* Header Tag */}
                <div
                  style={{ transform: 'translateZ(25px)' }}
                  className="flex items-center justify-between mb-3"
                >
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {store.pickupReady}
                  </span>
                  {store.isFlagship && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      ★ Flagship Experience
                    </span>
                  )}
                </div>

                <div style={{ transform: 'translateZ(15px)' }}>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">
                    {store.name}
                  </h3>
                  <div className="flex items-start gap-2 text-xs text-slate-500 mt-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                </div>

                <div
                  style={{ transform: 'translateZ(20px)' }}
                  className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium">{store.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <a
                  href={`tel:${store.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold text-center transition-colors"
                >
                  Call Store
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-md shadow-purple-600/30"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </ThreeDCard>
          ))}
        </div>
      </div>
    </section>
  );
};
