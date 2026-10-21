import * as motion from "motion/react-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamMemberCard, TeamCarousel } from "../client";
import { getTeamMembers } from "@/lib/data/about";

/**
 * OurTeamSection - Server Component
 *
 * Displays the leadership team.
 * Desktop grid uses client TeamMemberCard for hover interactions.
 * Mobile/tablet carousel is a client island.
 *
 * Key changes from client version:
 * - Removed "use client" directive
 * - Changed import from 'motion/react' to 'motion/react-client'
 * - Data fetched server-side via getTeamMembers()
 * - Desktop cards use TeamMemberCard client component for hover effects
 * - Mobile carousel extracted to TeamCarousel client island
 */
export async function OurTeamSection() {
  const team = await getTeamMembers();

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[36px] md:text-[48px] font-bold text-[#0B1F51] mb-6 tracking-[-0.01em]"
          >
            Meet Our Leadership
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[18px] text-gray-600 leading-[160%]"
          >
            A team of experts dedicated to revolutionizing water purification
            technology and service.
          </motion.p>
        </div>

        {/* Desktop Grid - Uses CLIENT TeamMemberCard for hover effects */}
        <div className="hidden lg:grid grid-cols-4 gap-8 contain-content">
          {team.map((member, index) => (
            <TeamMemberCard key={index} member={member} index={index} />
          ))}
        </div>

        {/* Mobile/Tablet Carousel - CLIENT ISLAND */}
        <div className="lg:hidden contain-content">
          <TeamCarousel members={team} />
        </div>

        {/* Join CTA - SERVER RENDERED */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center bg-[#F9FBFD] rounded-[32px] p-12 border border-[#00C4CC]/10"
        >
          <h3 className="text-[28px] font-bold text-[#0B1F51] mb-4">
            Join Our Growing Team
          </h3>
          <p className="text-[18px] text-gray-600 max-w-2xl mx-auto mb-8">
            We're always looking for talented individuals who share our passion
            for innovation and commitment to excellence.
          </p>
          <Link href="/careers">
            <Button className="bg-[#0B1F51] text-white hover:bg-[#00C4CC] h-12 px-8 rounded-full text-[16px] font-semibold transition-all shadow-lg hover:shadow-xl">
              View Open Positions
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
