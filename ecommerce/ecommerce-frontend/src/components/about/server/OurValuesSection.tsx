import * as motion from "motion/react-client";
import { ValuesCardsMobile } from "../client/ValuesCardsMobile";
import { getValues, getValuesSerializable } from "@/lib/data/about";

/**
 * OurValuesSection - Server Component
 *
 * Displays core company values in a grid.
 * Desktop grid is server-rendered with actual icon components.
 * Mobile carousel receives serializable data (icon names as strings).
 */
export async function OurValuesSection() {
  // For server-rendered desktop: use regular values with icon components
  const values = await getValues();
  // For client island mobile: use serializable values with icon names
  const valuesSerializable = await getValuesSerializable();

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[36px] md:text-[48px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em] leading-[120%]">
            Our Core Values
          </h2>
          <p className="text-[18px] text-gray-600 leading-[150%] max-w-3xl mx-auto">
            The principles that define who we are and how we serve you
          </p>
        </motion.div>

        {/* Desktop Grid - SERVER RENDERED with actual icon components */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 contain-content">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-black/6 rounded-card p-8 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 group"
              >
                <div
                  className={`w-14 h-14 ${value.bg} rounded-input flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-7 h-7 ${value.color}`} />
                </div>

                <h3 className="text-[22px] font-semibold text-[#0B1F51] mb-3 tracking-[-0.01em]">
                  {value.title}
                </h3>

                <p className="text-[16px] text-gray-700 leading-[150%]">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Carousel - CLIENT ISLAND with serializable data */}
        <div className="md:hidden contain-content">
          <ValuesCardsMobile values={valuesSerializable} />
        </div>

        {/* Additional Message - SERVER RENDERED */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-linear-to-br from-[#F9FBFD] to-white border border-black/6 rounded-[28px] p-12 text-center"
        >
          <p className="text-[20px] text-gray-700 leading-[150%] max-w-4xl mx-auto">
            These values aren't just words on a page - they're the foundation of
            every decision we make, every product we design, and every customer
            interaction we have. They make us who we are:
            <span className="font-semibold text-[#0B1F51]">
              {" "}
              a company you can trust with your family's health.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
