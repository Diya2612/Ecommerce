"use client";
import {
   CheckCircle,
   ArrowRight,
   Calendar,
   ShieldCheck,
   Users,
   Star,
   Instagram,
   Facebook,
   Linkedin,
   Youtube,
   MapPin,
   Phone,
   Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PremiumSection } from '../ui/PremiumSection';

const logoLightText = '/assets/937cb708e8b193c60b6be8546d5017b2b875e939.png';

export function CallToAction() {
   const router = useRouter();

   return (
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
         <div className="container mx-auto px-4 md:px-6">
            <PremiumSection
               badge="Free Consultation"
               title="Ready for Pure Water?"
               highlightWord="Pure Water"
               description="Our experts will visit your location, test your water quality, and recommend the perfect purification solution tailored to your needs."
               bullets={[
                  "Free TDS Water Level Check",
                  "Professional Consultation",
                  "Transparent Pricing - No Hidden Costs",
                  "Expert Technician Visit"
               ]}
               primaryCta={{
                  text: "Book Free Demo",
                  icon: Calendar,
                  onClick: () => router.push('/contact')
               }}
               secondaryCta={{
                  text: "Contact Support",
                  onClick: () => router.push('/contact')
               }}
               rightContent={
                  <div className="relative h-full flex items-center justify-center w-full">
                     <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-3 border border-white/10 transform rotate-3 shadow-2xl max-w-[320px] md:max-w-[400px]">
                        <Image
                           src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop"
                           alt="Technician"
                           width={400}
                           height={320}
                           className="rounded-2xl w-full h-auto"
                        />
                     </div>
                     {/* Floating Card */}
                     <div className="absolute bottom-4 left-0 md:left-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-bounce-slow">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                           <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Status</div>
                           <div className="font-bold text-[#1C2A54] dark:text-white">Technician Available</div>
                        </div>
                     </div>
                  </div>
               }
            />
         </div>
      </section>
   );
}

export function Footer() {
   const companyLinks = [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/about#story' },
      { name: 'Careers', href: '/contact?reason=careers' },
      { name: 'Contact', href: '/contact' },
   ];

   const supportLinks = [
      { name: 'Book Service', href: '/services' },
      { name: 'AMC Plans', href: '/amc' },
      { name: 'Request Callback', href: '/contact?reason=callback' },
      { name: 'Track Service', href: '/contact?reason=track' },
      { name: 'Contact Support', href: '/contact' },
   ];

   return (
      <footer className="bg-[#0F172A] dark:bg-slate-950 text-white pt-24 pb-12 border-t border-white/5 transition-colors duration-300 relative">
         {/* Safety Zone for Chat Bubble */}
         <div className="pointer-events-none absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 z-0" />

         <div className="container mx-auto px-4 md:px-6 relative z-10">
            {/* Grid Layout: 12 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">

               {/* Brand Column (4 Cols) */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="space-y-6">
                     <Image
                        src={logoLightText}
                        alt="Anant Enterprises"
                        width={160}
                        height={40}
                        className="h-10 w-auto object-contain"
                     />
                     <p className="text-gray-400 leading-relaxed text-[15px] max-w-sm">
                        Your trusted local water purification experts. We are dedicated to delivering pure, healthy water to homes across the region with prompt service, genuine care, and transparent support.
                     </p>

                     {/* Trust Badges */}
                     <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                           <ShieldCheck className="w-4 h-4 text-[#00C4CC]" />
                           <span className="text-xs font-medium text-gray-300">ISO Certified</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                           <Users className="w-4 h-4 text-[#00C4CC]" />
                           <span className="text-xs font-medium text-gray-300">10k+ Happy Homes</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                           <Star className="w-4 h-4 text-[#F5B012] fill-[#F5B012]" />
                           <span className="text-xs font-medium text-gray-300">4.8/5 Rated</span>
                        </div>
                     </div>

                     {/* Social Icons */}
                     <div className="flex gap-3 pt-2">
                        {[
                           { icon: Instagram, href: '#', label: 'Follow us on Instagram' },
                           { icon: Facebook, href: '#', label: 'Follow us on Facebook' },
                           { icon: Linkedin, href: '#', label: 'Connect with us on LinkedIn' },
                           { icon: Youtube, href: '#', label: 'Subscribe to our YouTube channel' }
                        ].map((Social, i) => (
                           <a
                              key={i}
                              href={Social.href}
                              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#00C4CC]/20 hover:text-[#00C4CC] hover:shadow-[0_0_15px_rgba(0,196,204,0.3)] transition-all duration-300 border border-white/10"
                              aria-label={Social.label}
                           >
                              <Social.icon className="w-5 h-5" aria-hidden="true" />
                           </a>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Company Links (2 Cols) */}
               <div className="lg:col-span-2 pt-2">
                  <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
                  <ul className="space-y-3">
                     {companyLinks.map(item => (
                        <li key={item.name}>
                           <Link href={item.href} className="text-gray-400 hover:text-[#00C4CC] hover:translate-x-1 transition-all duration-300 block text-[15px]">
                              {item.name}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Support Links (2 Cols) */}
               <div className="lg:col-span-2 pt-2">
                  <h4 className="font-bold text-lg mb-6 text-white">Support</h4>
                  <ul className="space-y-3">
                     {supportLinks.map(item => (
                        <li key={item.name}>
                           <Link href={item.href} className="text-gray-400 hover:text-[#00C4CC] hover:translate-x-1 transition-all duration-300 block text-[15px]">
                              {item.name}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Newsletter (4 Cols) */}
               <div className="lg:col-span-4 pt-2">
                  <h4 className="font-bold text-lg mb-6 text-white">Stay Connected</h4>
                  <p className="text-gray-400 mb-6 text-[15px]">
                     Join our community for maintenance tips, exclusive offers, and healthy water guides.
                  </p>

                  <form
                     className="relative group max-w-sm"
                     onSubmit={(e) => {
                        e.preventDefault();
                        toast.success("Subscribed successfully", {
                           description: "Thank you for joining our community!"
                        });
                     }}
                  >
                     <div className="relative">
                        <input
                           type="email"
                           id="newsletter-email"
                           required
                           className="peer w-full bg-white/5 border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-hidden focus:border-[#00C4CC] focus:ring-1 focus:ring-[#00C4CC]/50 transition-all h-[56px]"
                           placeholder="Enter your email"
                        />
                        <label
                           htmlFor="newsletter-email"
                           className="absolute left-4 top-4 text-gray-500 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#00C4CC]"
                        >
                           Enter your email address
                        </label>

                        <Button
                           type="submit"
                           size="icon"
                           className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-[#00C4CC] hover:bg-[#00b2b9] text-[#0B1F51] rounded-lg shadow-lg hover:shadow-[#00C4CC]/25 transition-all"
                           aria-label="Subscribe to newsletter"
                        >
                           <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </Button>
                     </div>
                     <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" />
                        We respect your privacy. No spam.
                     </p>
                  </form>
               </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
               <p className="text-center md:text-left order-2 md:order-1">
                  &copy; {new Date().getFullYear()} Anant Enterprises. All rights reserved.
               </p>

               <div className="flex items-center gap-6 order-1 md:order-2">
                  <Link href="/privacy" className="hover:text-[#00C4CC] transition-colors">Privacy Policy</Link>
                  <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                  <Link href="/terms" className="hover:text-[#00C4CC] transition-colors">Terms of Service</Link>
                  <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                  <Link href="/privacy#cookies" className="hover:text-[#00C4CC] transition-colors">Cookie Policy</Link>
               </div>
            </div>
         </div>

         {/* Extra bottom spacing for mobile to clear any bottom nav/chat if needed */}
         <div className="h-16 md:h-0"></div>
      </footer>
   );
}

