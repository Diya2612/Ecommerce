import { CheckCircle2 } from 'lucide-react';
import Image from "next/image";
import { Button } from '../ui/button';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import { INSTALLATION_FEATURES, INSTALLATION_STEPS } from '@/lib/data/services-data';
import { InstallationProcessCarousel } from './client/InstallationProcessCarousel';

export function InstallationServices() {
  return (
    <section id="installation" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-square w-full">
              <Image
                src="https://images.unsplash.com/photo-1750749761538-3aea36066a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobmljaWFuJTIwaW5zdGFsbGluZyUyMHdhdGVyJTIwZmlsdGVyfGVufDF8fHx8MTc2NTAzNjUwNnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Installation Service"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0B1F51]/60 to-transparent" />

              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 bg-white p-5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#0B1F51]">2000+</div>
                    <p className="text-sm text-[#475569]">Installations Done</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#00C4CC] font-bold uppercase tracking-wider text-sm mb-4 block">
              Installation Services
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Professional Water Purifier Installation
            </h2>
            <p className="text-lg text-[#475569] mb-8 leading-relaxed">
              Get your water purifier installed by certified experts. We ensure proper setup, optimal performance, and complete safety compliance.
            </p>

            {/* Features Grid */}
            <div className="grid gap-6 mb-8">
              {INSTALLATION_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00C4CC]/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-[#00C4CC]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] mb-1">{feature.title}</h4>
                    <p className="text-[#475569] text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/contact?reason=installation">
              <Button className="bg-[#0B1F51] hover:bg-[#0B1F51]/90 text-white h-12 px-8 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                Book Installation
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Installation Process */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
              Our Installation Process
            </h3>
            <p className="text-lg text-[#475569]">
              A systematic approach to ensure perfect installation every time
            </p>
          </div>

          {/* Desktop Grid View (md and above) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {INSTALLATION_STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connecting Line */}
                {index < INSTALLATION_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-linear-to-r from-[#00C4CC] to-transparent" />
                )}

                <div className="relative bg-[#F9FBFD] rounded-2xl p-6 border border-gray-100 hover:border-[#00C4CC]/30 hover:shadow-md transition-all duration-300">
                  {/* Step Number */}
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#0B1F51] to-[#00C4CC] flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>

                  <h4 className="text-xl font-bold text-[#0F172A] mb-2">
                    {step.title}
                  </h4>
                  <p className="text-[#475569] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel View (below md) */}
          <InstallationProcessCarousel />
        </div>
      </div>
    </section>
  );
}
