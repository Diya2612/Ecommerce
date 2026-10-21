import { Award } from 'lucide-react';
import * as motion from 'motion/react-client';
import { StatsCarousel, ReasonsCarousel, CertificationsCarousel } from './client/WhyChooseUsCarousels';
import { SERVICE_STATS, SERVICE_REASONS, SERVICE_CERTIFICATIONS } from '@/lib/data/services-data';

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-linear-to-b from-white to-[#F9FBFD]">
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
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Your Trusted Water Purification Partner
            </h2>
            <p className="text-lg text-[#475569]">
              Experience excellence in service with India&apos;s most trusted water purification service provider
            </p>
          </motion.div>
        </div>

        {/* Stats Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {SERVICE_STATS.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`bg-linear-to-br ${stat.color} rounded-3xl p-8 text-white shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-6">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="text-5xl font-bold mb-2">{stat.value}</div>
                  <p className="text-white/90 font-medium">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Carousel - Mobile */}
        <StatsCarousel />

        {/* Reasons Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {SERVICE_REASONS.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xs border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-[#00C4CC]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#00C4CC]/20 transition-all duration-300">
                <reason.icon className="w-8 h-8 text-[#00C4CC]" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#0F172A] mb-3 group-hover:text-[#00C4CC] transition-colors">
                {reason.title}
              </h3>
              <p className="text-[#475569] leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Reasons Carousel - Mobile */}
        <ReasonsCarousel />

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Certified & Recognized</h3>
            <p className="text-[#475569]">Trusted certifications and industry recognition</p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 items-center justify-items-center">
            {SERVICE_CERTIFICATIONS.map((cert, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 rounded-full bg-[#0B1F51]/10 flex items-center justify-center mb-3 mx-auto">
                  <Award className="w-10 h-10 text-[#0B1F51]" />
                </div>
                <div className="font-bold text-[#0F172A] text-sm">{cert.name}</div>
                <div className="text-xs text-[#475569]">{cert.desc}</div>
              </div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <CertificationsCarousel />
        </motion.div>
      </div>
    </section>
  );
}
