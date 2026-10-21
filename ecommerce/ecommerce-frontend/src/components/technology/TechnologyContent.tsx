"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const TECHNOLOGIES = [
  {
    id: "ro",
    title: "RO Purification",
    description: "Reverse Osmosis technology removes dissolved impurities, heavy metals, and salts, ensuring water is pure and sweet. Ideal for water with high TDS levels.",
    benefits: ["Removes heavy metals like Lead, Mercury", "Reduces TDS (Total Dissolved Solids)", "Eliminates bacteria and viruses"],
    image: "https://images.unsplash.com/photo-1546552356-3fae876a61ca?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "uv",
    title: "UV Protection",
    description: "Ultraviolet (UV-C) purification works by deactivating the DNA of biological contaminants like bacteria and viruses, making water 100% safe to drink.",
    benefits: ["Kills 99.9% of bacteria & viruses", "Chemical-free purification", "Retains natural taste of water"],
    image: "https://images.unsplash.com/photo-1625125589786-9c88905e9d45?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "alkaline",
    title: "Alkaline Boost",
    description: "Our Alkaline technology maintains the pH level of water between 7.5 and 8.5. Alkaline water helps neutralize acid in the bloodstream and boosts metabolism.",
    benefits: ["Balances body pH levels", "Improves hydration", "Contains antioxidant properties"],
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "copper",
    title: "Copper Tech",
    description: "Inspired by traditional wisdom, this technology infuses water with copper ions. Copper has antimicrobial, antioxidant, and anti-inflammatory properties.",
    benefits: ["Boosts immunity", "Aids in digestion", "Supports heart health"],
    image: "https://images.unsplash.com/photo-1606809802910-2671dfc54666?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "temp",
    title: "Hot & Cold",
    description: "Experience the convenience of instant hot and cold water dispense. Perfect for making quick beverages or getting a refreshing chilled drink anytime.",
    benefits: ["Instant hot water for tea/coffee", "Chilled water on demand", "Child lock safety for hot water"],
    image: "https://images.unsplash.com/photo-1544003484-3cd181d17917?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "uf",
    title: "UF Filtration",
    description: "Ultra Filtration uses a hollow fiber membrane to separate physical impurities. It works without electricity and does not waste any water.",
    benefits: ["Removes physical impurities", "Zero water wastage", "Works without electricity"],
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1000&auto=format&fit=crop",
  }
];

export function TechnologyContent() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12">
          {TECHNOLOGIES.map((tech, index) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-xs border border-gray-100 overflow-hidden`}
            >
              {/* Image Side */}
              <div className="w-full lg:w-1/2 h-[300px] lg:h-[400px] relative rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src={tech.image}
                  alt={tech.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-[#0B1F51]">{tech.title}</h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {tech.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-bold text-[#00C4CC] uppercase tracking-wider">Key Benefits</h3>
                  <ul className="space-y-3">
                    {tech.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-[#E0F8F9] flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#00C4CC]" />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
