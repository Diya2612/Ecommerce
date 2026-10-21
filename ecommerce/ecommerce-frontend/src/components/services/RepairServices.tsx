import { Wrench, Clock, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import Image from "next/image";
import { Button } from '../ui/button';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import { REPAIR_COMMON_ISSUES, REPAIR_FEATURES } from '@/lib/data/services-data';

export function RepairServices() {
  return (
    <section id="repair" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#00C4CC] font-bold uppercase tracking-wider text-sm mb-4 block">
              Repair & Troubleshooting
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Fast & Reliable Repair Services
            </h2>
            <p className="text-lg text-[#475569] mb-8 leading-relaxed">
              Expert troubleshooting and repair services to get your water purifier back to optimal performance quickly.
            </p>

            {/* Emergency Call Box */}
            <div className="bg-linear-to-br from-[#EF4444]/10 to-[#EF4444]/5 border-2 border-[#EF4444]/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EF4444] flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0F172A] mb-1 flex items-center gap-2">
                    Emergency Repair Hotline
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#22C55E] text-white text-xs rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Available
                    </span>
                  </h4>
                  <p className="text-[#475569] text-sm mb-3">24/7 support for urgent repairs</p>
                  <a href="tel:1800-123-4567" className="text-2xl font-bold text-[#EF4444]">
                    1800-123-4567
                  </a>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              {REPAIR_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                  <span className="text-[#475569]">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/contact?reason=repair">
              <Button className="bg-[#0B1F51] hover:bg-[#0B1F51]/90 text-white h-12 px-8 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                Request Repair Service
              </Button>
            </Link>
          </motion.div>

          {/* Right: Image & Common Issues */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden aspect-square w-full">
              <Image
                src="https://images.unsplash.com/photo-1599463698367-11cb72775b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwcmVwYWlyaW5nJTIwZXF1aXBtZW50fGVufDF8fHx8MTc2NTAzNjUwN3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Repair Service"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0B1F51]/50 to-transparent" />

              {/* Quick Response Badge */}
              <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00C4CC]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#00C4CC]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#0B1F51]">&lt; 2 Hours</div>
                    <p className="text-xs text-[#475569]">Average Response Time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-[#F9FBFD] rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-[#00C4CC]" />
                <h4 className="font-bold text-[#0F172A]">Common Issues We Fix</h4>
              </div>

              <div className="space-y-4">
                {REPAIR_COMMON_ISSUES.map((item, index) => (
                  <div key={index} className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="font-bold text-[#0F172A] text-sm mb-1">{item.issue}</div>
                      <div className="text-xs text-[#475569]">{item.solution}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#00C4CC] font-medium shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
