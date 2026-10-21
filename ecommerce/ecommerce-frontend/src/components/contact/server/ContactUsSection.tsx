import * as motion from "motion/react-client";
import {
  Phone,
  MessageCircle,
  Mail,
  Headphones,
  MapPin,
  Clock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getContactChannels,
  getOfficeLocations,
  getSocialLinks,
  getBusinessHours,
} from "@/lib/data/contact";
import { ContactChannelsCarousel } from "../client/ContactChannelsCarousel";
import { OfficeLocationsMobile } from "../client/OfficeLocationsMobile";
import { SocialLinksClient } from "../client/SocialLinksClient";
import type {
  ContactChannel,
  OfficeLocation,
  BusinessHours,
} from "@/types/contact";

/**
 * Icon mapping for contact channels (desktop grid)
 */
const channelIconMap = {
  Phone,
  MessageCircle,
  Mail,
  Headphones,
} as const;

/**
 * ContactUsSection - Server Component
 *
 * Server-rendered contact section with:
 * - SSR-compatible motion animations for header
 * - CSS-only hover for desktop grids (no JS needed)
 * - Client islands for mobile carousels and social links
 * - Semantic HTML with tel/mailto links for SEO
 *
 * MAINTAINS EXACT SAME UI as original ContactUsSection.tsx
 */
export async function ContactUsSection() {
  // Parallel data fetching
  const [channels, offices, socialLinks, businessHours] = await Promise.all([
    getContactChannels(),
    getOfficeLocations(),
    getSocialLinks(),
    getBusinessHours(),
  ]);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header - Server Rendered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[36px] md:text-[48px] font-semibold text-[#0B1F51] mb-4 tracking-[-0.01em] leading-[120%]">
            Multiple Ways to Reach Us
          </h2>
          <p className="text-[18px] text-gray-600 leading-[150%] max-w-3xl mx-auto">
            Choose the communication channel that works best for you
          </p>
        </motion.div>

        {/* Contact Channels - Desktop Grid (CSS-only hover) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {channels.map((channel, index) => (
            <ContactChannelCard
              key={channel.id}
              channel={channel}
              index={index}
            />
          ))}
        </div>

        {/* Contact Channels - Mobile Carousel (Client Island) */}
        <ContactChannelsCarousel channels={channels} />

        {/* Office Locations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-[28px] md:text-[36px] font-semibold text-[#0B1F51] mb-8 text-center tracking-[-0.01em]">
            Visit Our Regional Offices
          </h3>

          {/* Desktop Grid (CSS-only hover) */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {offices.map((office, index) => (
              <OfficeCard key={office.id} office={office} index={index} />
            ))}
          </div>

          {/* Mobile Carousel (Client Island) */}
          <OfficeLocationsMobile offices={offices} />

          {/* View All Locations Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Button
              variant="outline"
              className="border-2 border-[#0B1F51] text-[#0B1F51] hover:bg-[#0B1F51] hover:text-white rounded-input px-8 h-14 text-[16px] font-semibold"
            >
              <Globe className="w-5 h-5 mr-2" aria-hidden="true" />
              Find Nearest Service Center
            </Button>
          </motion.div>
        </motion.div>

        {/* Social Media & Business Hours */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-linear-to-br from-[#0B1F51] via-[#0d2564] to-[#0B1F51] rounded-[28px] p-12 md:p-16 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C4CC] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C4CC] opacity-10 rounded-full blur-2xl" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            {/* Social Media */}
            <div>
              <h3 className="text-[28px] font-semibold text-white mb-6 tracking-[-0.01em]">
                Connect With Us
              </h3>
              <p className="text-[16px] text-white/90 mb-6 leading-[150%]">
                Follow us on social media for updates, tips, and exclusive
                offers
              </p>
              {/* Social Links - Client Island for hover/tap */}
              <SocialLinksClient socialLinks={socialLinks} />
            </div>

            {/* Business Hours - Server Rendered */}
            <div>
              <h3 className="text-[28px] font-semibold text-white mb-6 tracking-[-0.01em]">
                Business Hours
              </h3>
              <div className="space-y-4">
                {businessHours.map((hours) => (
                  <BusinessHoursCard key={hours.id} hours={hours} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * ContactChannelCard - Server-rendered with CSS hover
 */
function ContactChannelCard({
  channel,
  index,
}: {
  channel: ContactChannel;
  index: number;
}) {
  const Icon = channelIconMap[channel.iconKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-linear-to-br ${channel.bgColorFrom} ${channel.bgColorTo} border border-black/6 rounded-card p-6 transition-all duration-500 group hover:-translate-y-2 hover:shadow-xl min-w-0 overflow-hidden`}
    >
      <div
        className={`w-14 h-14 ${channel.iconBg} rounded-input flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
      >
        <Icon className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#0B1F51] mb-2">
        {channel.title}
      </h3>
      {channel.actionHref?.startsWith("tel:") ? (
        <a
          href={channel.actionHref}
          className="text-[16px] font-bold text-[#00C4CC] mb-1 block hover:underline"
        >
          {channel.primary}
        </a>
      ) : channel.actionHref?.startsWith("mailto:") ? (
        <a
          href={channel.actionHref}
          className="text-[16px] font-bold text-[#00C4CC] mb-1 block hover:underline truncate max-w-full"
          title={channel.primary}
        >
          {channel.primary}
        </a>
      ) : (
        <p 
          className="text-[16px] font-bold text-[#00C4CC] mb-1 truncate"
          title={channel.primary}
        >
          {channel.primary}
        </p>
      )}
      <p className="text-[14px] text-gray-600 mb-3">{channel.secondary}</p>
      <p className="text-[14px] text-gray-700 mb-4 leading-[150%]">
        {channel.description}
      </p>
      <Button
        variant="ghost"
        className="w-full bg-white/50 hover:bg-white text-[#0B1F51] rounded-input font-semibold text-[14px] h-11"
        asChild={!!channel.actionHref}
      >
        {channel.actionHref ? (
          <a href={channel.actionHref}>{channel.action}</a>
        ) : (
          <span>{channel.action}</span>
        )}
      </Button>
    </motion.div>
  );
}

/**
 * OfficeCard - Server-rendered with CSS hover
 */
function OfficeCard({
  office,
  index,
}: {
  office: OfficeLocation;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-linear-to-br from-[#F9FBFD] to-white border border-black/6 rounded-card p-8 hover:shadow-lg transition-all duration-300 min-w-0 overflow-hidden"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#0B1F51] rounded-input flex items-center justify-center shrink-0">
          <MapPin className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <address className="flex-1 not-italic">
          <h4 className="text-[22px] font-semibold text-[#0B1F51] mb-3">
            {office.city}
          </h4>
          <div className="space-y-2">
            <p className="text-[16px] text-gray-700 leading-[150%] flex items-start gap-2">
              <MapPin
                className="w-4 h-4 text-[#00C4CC] mt-1 shrink-0"
                aria-hidden="true"
              />
              {office.address}
            </p>
            <p className="text-[16px] text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
              <a
                href={`tel:${office.phone.replace(/\s/g, "")}`}
                className="hover:text-[#00C4CC] transition-colors"
              >
                {office.phone}
              </a>
            </p>
            <p className="text-[16px] text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
              <a
                href={`mailto:${office.email}`}
                className="hover:text-[#00C4CC] transition-colors truncate block"
                title={office.email}
              >
                {office.email}
              </a>
            </p>
          </div>
        </address>
      </div>
    </motion.div>
  );
}

/**
 * BusinessHoursCard - Server-rendered
 */
function BusinessHoursCard({ hours }: { hours: BusinessHours }) {
  const isEmergency = hours.isEmergency;

  return (
    <div
      className={`flex items-start gap-4 backdrop-blur-xs border rounded-input p-4 ${isEmergency
        ? "bg-[#22C55E]/20 border-[#22C55E]/30"
        : "bg-white/10 border-white/20"
        }`}
    >
      {isEmergency ? (
        <Headphones
          className="w-6 h-6 text-[#22C55E] shrink-0 mt-0.5"
          aria-hidden="true"
        />
      ) : (
        <Clock
          className="w-6 h-6 text-[#00C4CC] shrink-0 mt-0.5"
          aria-hidden="true"
        />
      )}
      <div>
        <p className="text-[16px] font-semibold text-white mb-1">
          {hours.days}
        </p>
        <p className="text-[14px] text-white/80">{hours.hours}</p>
      </div>
    </div>
  );
}
