import * as motion from 'motion/react-client';
import { AmcBenefitsCarousel } from './client/AmcBenefitsCarousel';
import { AmcPricingManager } from './client/AmcPricingManager';
import { AmcBottomCta } from './client/AmcBottomCta';
import { AMC_BENEFITS } from '@/lib/data/services-data';

export function AMCServices() {
  return (
    <section id="amc" className="py-24 bg-linear-to-br from-[#F9FBFD] to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C4CC]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#F5B012] font-bold uppercase tracking-wider text-sm mb-4 block">
              Annual Maintenance Contract
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Premium AMC Plans
            </h2>
            <p className="text-lg text-[#475569]">
              Keep your water purifier running at peak performance with our comprehensive maintenance plans
            </p>
          </motion.div>
        </div>

        {/* AMC Benefits - Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {AMC_BENEFITS.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#F5B012]/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-7 h-7 text-[#F5B012]" />
              </div>
              <h4 className="font-bold text-[#0F172A] mb-2">{benefit.title}</h4>
              <p className="text-sm text-[#475569]">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* AMC Benefits - Mobile Carousel */}
        <AmcBenefitsCarousel />

        {/* Pricing Cards - Manager (Desktop & Mobile) */}
        <AmcPricingManager />

        {/* Bottom CTA */}
        <AmcBottomCta />
      </div>
    </section>
  );
}
