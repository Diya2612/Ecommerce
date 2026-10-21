import * as motion from 'motion/react-client';
import { ServiceCategoriesCarousel } from './client/ServiceCategoriesCarousel';
import { SERVICE_CATEGORIES } from '@/lib/data/services-data';

export function ServiceCategories() {
  return (
    <section className="py-24 bg-[#F9FBFD]">
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
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Complete Water Purification Solutions
            </h2>
            <p className="text-lg text-[#475569]">
              From installation to maintenance, we provide end-to-end services for all your water purification needs
            </p>
          </motion.div>
        </div>

        {/* Desktop Grid View (md and above) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICE_CATEGORIES.map((category, index) => (
            <motion.a
              key={index}
              href={category.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-3xl p-8 shadow-xs hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#00C4CC]/20 hover:-translate-y-1 cursor-pointer"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl ${category.lightBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className={`w-8 h-8 ${category.color.replace('bg-', 'text-')}`} />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-[#0F172A] mb-3 group-hover:text-[#00C4CC] transition-colors">
                {category.title}
              </h3>
              <p className="text-[#475569] leading-relaxed">
                {category.description}
              </p>

              {/* Hover Arrow */}
              <div className="mt-6 flex items-center gap-2 text-[#00C4CC] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Learn More</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Decorative Corner */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${category.lightBg} rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.a>
          ))}
        </div>

        {/* Mobile Carousel View (below md) */}
        <ServiceCategoriesCarousel />
      </div>
    </section>
  );
}
