import { Droplets, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Image from "next/image";
import Link from 'next/link';
import { Button } from '../ui/button';
import * as motion from 'motion/react-client';
import { FILTER_TYPES, FILTER_WARNING_SIGNS } from '@/lib/data/services-data';
import { FilterSubscriptionBox } from './client/FilterSubscriptionBox';

export function FilterReplacement() {
  return (
    <section id="filter" className="py-24 bg-[#F9FBFD]">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#00C4CC] font-bold uppercase tracking-wider text-sm mb-4 block">
              Filter Replacement
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Genuine Filter Replacement Services
            </h2>
            <p className="text-lg text-[#475569]">
              Keep your water purifier performing at its best with timely filter replacements using only genuine parts
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left: Filter Types */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-[#0F172A] mb-8">Available Filter Types</h3>

            <div className="grid gap-4">
              {FILTER_TYPES.map((filter, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#00C4CC]/30 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[#00C4CC]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Droplets className="w-5 h-5 text-[#00C4CC]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#0F172A] mb-1">{filter.name}</h4>
                        <p className="text-xs text-[#475569] mb-2">{filter.function}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-[#475569]" />
                          <span className="text-[#475569]">Replace every {filter.lifespan}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-[#0B1F51]">{filter.price}</div>
                      <Link href="/collections">
                        <Button size="sm" variant="outline" className="mt-2 h-8 text-xs rounded-lg border-[#00C4CC] text-[#00C4CC] hover:bg-[#00C4CC]/10">
                          Order Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subscription Box (Client Island) */}
            <FilterSubscriptionBox />
          </motion.div>

          {/* Right: Warning Signs & Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1662647344507-3c22aa88397d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGZpbHRlciUyMHJlcGxhY2VtZW50fGVufDF8fHx8MTc2NTAzNjUwOHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Filter Replacement"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0B1F51]/60 to-transparent" />

              {/* Stats Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xs p-5 rounded-2xl shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-[#0B1F51]">5000+</div>
                    <p className="text-xs text-[#475569]">Filters Replaced</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#0B1F51]">100%</div>
                    <p className="text-xs text-[#475569]">Genuine Parts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Signs */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#F59E0B]/20 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">When to Replace Filters?</h3>
              </div>

              <p className="text-[#475569] mb-6">Watch out for these warning signs:</p>

              <div className="space-y-3">
                {FILTER_WARNING_SIGNS.map((sign, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-[#F9FBFD] border border-gray-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-2 shrink-0" />
                    <span className="text-sm text-[#475569]">{sign}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-[#475569] mb-4">
                  Not sure which filter needs replacement? Get a free water quality test
                </p>
                <Link href="/contact?reason=water_test" className="w-full">
                  <Button variant="outline" className="w-full border-2 border-[#00C4CC] text-[#00C4CC] hover:bg-[#00C4CC]/10 h-11 rounded-xl">
                    Schedule Free Test
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
