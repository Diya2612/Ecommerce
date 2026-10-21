import { CheckCircle2, TrendingUp } from 'lucide-react';
import * as motion from 'motion/react-client';
import { COMMERCIAL_SOLUTIONS, COMMERCIAL_CASE_STUDIES } from '@/lib/data/services-data';
import { CommercialSolutionsCarousel, CommercialCaseStudiesCarousel } from './client/CommercialCarousels';
import { CommercialBottomCta } from './client/CommercialBottomCta';

export function CommercialServices() {
  return (
    <section id="commercial" className="py-24 bg-white">
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
              Commercial Solutions
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Commercial RO Plant Services
            </h2>
            <p className="text-lg text-[#475569]">
              Enterprise-grade water purification solutions for businesses, offices, and industrial facilities
            </p>
          </motion.div>
        </div>

        {/* Commercial Solutions - Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {COMMERCIAL_SOLUTIONS.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#F9FBFD] rounded-2xl p-6 border border-gray-100 hover:border-[#00C4CC]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0B1F51]/10 flex items-center justify-center mb-4">
                <solution.icon className="w-7 h-7 text-[#0B1F51]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">{solution.title}</h3>
              <p className="text-sm text-[#00C4CC] font-medium mb-4">{solution.capacity}</p>
              <ul className="space-y-2">
                {solution.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckCircle2 className="w-4 h-4 text-[#00C4CC] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Commercial Solutions - Mobile Carousel */}
        <CommercialSolutionsCarousel />

        {/* Main Content (Converted to Premium Section) */}
        <div className="mb-20">
          <CommercialBottomCta />
        </div>

        {/* Case Studies */}
        <div className="bg-[#F9FBFD] rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#0F172A] mb-4">Success Stories</h3>
            <p className="text-[#475569]">See how we&apos;ve helped businesses save costs and improve water quality</p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {COMMERCIAL_CASE_STUDIES.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-[#0F172A] mb-1">{study.client}</h4>
                    <p className="text-xs text-[#475569]">{study.type}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-[#475569]">Capacity</span>
                    <span className="font-bold text-[#0B1F51]">{study.capacity}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-[#475569]">Scale</span>
                    <span className="font-bold text-[#0B1F51]">{study.employees}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-[#475569]">Annual Savings</span>
                    <span className="text-xl font-bold text-[#22C55E]">{study.savings}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <CommercialCaseStudiesCarousel />
        </div>
      </div>
    </section>
  );
}
