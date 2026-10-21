import * as motion from "motion/react-client";
import { Target, Eye, Lightbulb } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { MissionCardsMobile } from "../client/MissionCardsMobile";
import { getMissionItems, getMissionItemsSerializable } from "@/lib/data/about";

/**
 * OurMissionSection - Server Component
 *
 * Displays mission, vision, and philosophy cards.
 * Desktop grid is server-rendered with actual icon components.
 * Mobile carousel receives serializable data (icon names as strings).
 */
export async function OurMissionSection() {
  // For server-rendered desktop: use regular items with icon components
  const items = await getMissionItems();
  // For client island mobile: use serializable items with icon names
  const itemsSerializable = await getMissionItemsSerializable();

  return (
    <section className="py-24 bg-[#F9FBFD]">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          title="What Drives Us"
          description="Our mission, vision, and philosophy guide everything we do"
          align="center"
          spacing="relaxed"
        />

        {/* Desktop Grid - SERVER RENDERED with actual icon components */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 contain-content">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`bg-linear-to-br ${item.gradient} border border-black/6 rounded-[28px] p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500`}
              >
                <div
                  className={`w-16 h-16 ${item.color} rounded-input flex items-center justify-center mb-6 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-[28px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em]">
                  {item.title}
                </h3>

                <p className="text-[16px] text-gray-700 leading-[150%]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Carousel - CLIENT ISLAND with serializable data */}
        <div className="md:hidden contain-content">
          <MissionCardsMobile items={itemsSerializable} />
        </div>

        {/* Commitment Section - SERVER RENDERED */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-linear-to-br from-[#0B1F51] via-[#0d2564] to-[#0B1F51] rounded-[28px] p-12 md:p-16 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h3 className="text-[36px] font-semibold text-white mb-6 tracking-[-0.01em] leading-[120%]">
              Our Commitment to You
            </h3>
            <p className="text-[18px] text-white/90 leading-[150%]">
              We promise to deliver not just products, but comprehensive water
              solutions backed by expert service, genuine parts, and a team that
              truly cares about your health and wellbeing. Every decision we
              make, every innovation we pursue, is guided by one question: How
              can we serve you better?
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
