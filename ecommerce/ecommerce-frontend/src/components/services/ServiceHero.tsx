import { Shield, Clock, Award, CheckCircle } from 'lucide-react';
import Image from "next/image";
import { Button } from '../ui/button';
import Link from 'next/link';
import * as motion from 'motion/react-client';

export function ServiceHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden pt-32 pb-16">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[60%] h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[800px] h-[800px] bg-[#00C4CC]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#E9FBFF] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="max-w-2xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-[#0B1F51] mb-8">
                <Shield className="w-4 h-4 text-[#00C4CC]" />
                <span className="text-xs font-bold tracking-wider uppercase">Expert Services</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
                <span className="text-[#0B1F51] block">Professional Water</span>
                <span className="text-[#00C4CC]">Purifier Services.</span>
              </h1>

              {/* Subtext */}
              <p className="text-xl text-[#475569] leading-relaxed max-w-lg">
                Complete installation, maintenance, and repair solutions for all your water purification needs. Expert service guaranteed.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link href="/contact">
                <Button className="bg-[#0B1F51] hover:bg-[#0B1F51]/90 text-white h-14 px-8 rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Book Service Now
                </Button>
              </Link>
              <Link href="/amc">
                <Button variant="outline" className="h-14 px-8 rounded-xl border-2 border-[#00C4CC]/30 text-[#0B1F51] hover:bg-[#00C4CC]/5 hover:border-[#00C4CC] transition-all duration-300">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              {[
                { icon: Clock, label: '24/7 Support' },
                { icon: Award, label: 'ISO Certified' },
                { icon: CheckCircle, label: '5-Star Rated' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#00C4CC]/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#00C4CC]" />
                  </div>
                  <span className="text-sm text-[#475569] font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Image */}
          <div className="relative h-full min-h-[500px] flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 w-full max-w-[550px]"
            >
              <div className="relative group aspect-square w-full">
                {/* Glow behind image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-linear-to-tr from-[#00C4CC]/20 to-transparent blur-3xl rounded-full opacity-60" />

                <Image
                  src="https://images.unsplash.com/photo-1750749761538-3aea36066a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobmljaWFuJTIwaW5zdGFsbGluZyUyMHdhdGVyJTIwZmlsdGVyfGVufDF8fHx8MTc2NTAzNjUwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Professional Technician"
                  fill
                  className="relative drop-shadow-2xl rounded-3xl object-cover"
                />

                {/* Floating Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute -left-6 bottom-20 bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                >
                  <div className="text-3xl font-bold text-[#0B1F51] mb-1">10,000+</div>
                  <p className="text-sm text-[#475569]">Happy Customers Served</p>
                </motion.div>

                {/* Active Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -right-4 top-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-xs font-bold text-[#0B1F51] uppercase tracking-wider">Available Now</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

