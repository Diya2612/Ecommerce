import * as motion from "motion/react-client";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTAQuickInfoCarousel, CTAContactMethodsCarousel } from "../client";
import {
  getQuickContactInfo,
  getQuickContactInfoSerializable,
  getContactMethods,
  getContactMethodsSerializable,
} from "@/lib/data/about";

/**
 * AboutCTASection - Server Component
 *
 * Displays the contact CTA section with quick info and contact methods.
 * Desktop views are server-rendered with actual icon components.
 * Mobile carousels receive serializable data (icon names as strings).
 */
export async function AboutCTASection() {
  // For server-rendered desktop: use regular data with icon components
  const quickContactInfo = await getQuickContactInfo();
  const contactMethods = await getContactMethods();
  // For client island mobile: use serializable data with icon names
  const quickContactInfoSerializable = await getQuickContactInfoSerializable();
  const contactMethodsSerializable = await getContactMethodsSerializable();

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main CTA */}
        <div className="relative bg-linear-to-br from-[#0B1F51] via-[#0d2564] to-[#0B1F51] rounded-[28px] px-4 py-8 md:p-16 overflow-hidden shadow-2xl mb-16 w-full max-w-full">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C4CC] opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00C4CC] opacity-10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center w-full max-w-full">
            {/* Left: Content */}
            <div className="min-w-0 w-full max-w-full">
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block bg-[#00C4CC]/20 backdrop-blur-xs text-[#00C4CC] px-6 py-2 rounded-full text-[14px] font-bold tracking-wide mb-6 border border-[#00C4CC]/30"
              >
                GET IN TOUCH
              </motion.div>

              <h2 className="text-[30px] md:text-[48px] font-semibold text-white mb-6 tracking-[-0.01em] leading-[120%] break-words w-full">
                Ready to Experience Pure Water?
              </h2>

              <p className="text-[18px] text-white/90 mb-8 leading-[150%] break-words">
                Let our experts help you find the perfect water purification
                solution for your needs. Get a free consultation and exclusive
                offers today.
              </p>

              <div className="flex flex-wrap gap-4 w-full max-w-full">
                <Link
                  href="/contact?reason=callback"
                  className="w-full sm:w-auto min-w-0"
                >
                  <Button className="w-full sm:w-auto bg-white text-[#0B1F51] hover:bg-white/90 rounded-input px-6 md:px-8 h-14 text-[16px] font-semibold shadow-xl truncate">
                    <Phone className="w-5 h-5 mr-2 shrink-0" />
                    <span className="truncate">Request Callback</span>
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto bg-white text-[#0B1F51] hover:bg-white/90 rounded-input px-6 md:px-8 h-14 text-[16px] font-semibold shadow-xl min-w-0 truncate">
                  <span className="truncate">Schedule Visit</span>
                </Button>
              </div>
            </div>

            {/* Right: Quick Contact Info - Desktop (SERVER RENDERED) */}
            <div className="hidden md:block space-y-6">
              {quickContactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-card p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 ${info.iconBg} rounded-input flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[18px] font-semibold text-white">
                          {info.title}
                        </h4>
                        <p className="text-[14px] text-white/80">
                          {info.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-[16px] text-white/90 leading-[150%] whitespace-pre-line">
                      {info.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right: Quick Contact Info - Mobile Carousel (CLIENT ISLAND) */}
            <div className="min-w-0 w-full max-w-full overflow-hidden">
              <CTAQuickInfoCarousel items={quickContactInfoSerializable} />
            </div>
          </div>
        </div>

        {/* Contact Methods - Desktop (SERVER RENDERED) */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-linear-to-br ${method.bg} rounded-card p-8 border border-black/6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group text-center`}
              >
                <div
                  className={`w-16 h-16 ${method.iconBg} rounded-input flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-[22px] font-semibold text-[#0B1F51] mb-2 tracking-[-0.01em]">
                  {method.title}
                </h3>
                <p className="text-[18px] font-bold text-[#00C4CC] mb-2">
                  {method.value}
                </p>
                <p className="text-[14px] text-gray-600">
                  {method.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Methods - Mobile Carousel (CLIENT ISLAND) */}
        <div className="min-w-0 w-full max-w-full overflow-hidden">
          <CTAContactMethodsCarousel methods={contactMethodsSerializable} />
        </div>
      </div>
    </section>
  );
}
