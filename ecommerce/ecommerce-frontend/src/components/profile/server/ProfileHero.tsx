import {
  User,
  Award,
  ShoppingBag,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import * as motionClient from "motion/react-client";
import type { UserProfile } from "@/lib/data/profile/types";
import {
  ProfileEditButton,
  ProfileAvatarButton,
} from "../client/ProfileEditActions";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

interface ProfileHeroProps {
  userPromise: Promise<UserProfile | null>;
  countsPromise: Promise<{
    orders: number;
    addresses: number;
    wishlist: number;
    amc: number;
  }>;
}

// Stat card component - Compact for mobile, full for desktop
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
  delay,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
  bgColor: string;
  delay: number;
}) {
  return (
    <motionClient.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl p-3 lg:p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-slate-700"
    >
      <div className="flex items-center gap-2.5 lg:gap-4">
        <div
          className={`w-9 h-9 lg:w-12 lg:h-12 ${bgColor} rounded-lg lg:rounded-xl flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 lg:w-6 lg:h-6 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">
            {label}
          </p>
        </div>
      </div>
    </motionClient.div>
  );
}

// Mobile horizontal scroll stat pill
function MobileStatPill({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-3 py-2 shadow-sm border border-gray-100 dark:border-slate-700 shrink-0">
      <div
        className={`w-7 h-7 ${bgColor} rounded-full flex items-center justify-center`}
      >
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
          {value}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export async function ProfileHero({
  userPromise,
  countsPromise,
}: ProfileHeroProps) {
  const [user, counts] = await Promise.all([userPromise, countsPromise]);

  if (!user) return null;

  return (
    <>
      {/* Hero Section with Gradient Background */}
      <section className="relative bg-linear-to-br from-[#0B1F51] via-[#1a3578] to-[#00C4CC] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#00C4CC]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Mobile: Compact Hero */}
        <div className="lg:hidden relative z-10">
          <div className="px-4 pt-20 pb-6">
            <div className="flex items-center gap-4">
              {/* Compact Avatar */}
              <motionClient.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative shrink-0"
              >
                <div className="relative group">
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 flex items-center justify-center overflow-hidden shadow-lg">
                    {user.profile_image_url || user.avatar ? (
                      <img
                        src={user.profile_image_url || user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <ProfileAvatarButton />
                </div>
              </motionClient.div>

              {/* User Info */}
              <motionClient.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                  Welcome back
                </p>
                <h1 className="text-xl font-bold text-white truncate">
                  {`${user.name} ${user.last_name || ""}`.trim() || "User"}
                </h1>
                <p className="text-white/70 text-xs truncate flex items-center gap-1">
                  {user.email}
                  <EmailVerificationBanner />
                </p>
              </motionClient.div>

              {/* Edit Button */}
              <ProfileEditButton />
            </div>
          </div>

          {/* Mobile Stats - Horizontal Scroll */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              <MobileStatPill
                icon={ShoppingBag}
                value={counts.orders}
                label="Orders"
                color="text-blue-600"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
              />
              <MobileStatPill
                icon={Heart}
                value={counts.wishlist}
                label="Wishlist"
                color="text-pink-600"
                bgColor="bg-pink-100 dark:bg-pink-900/30"
              />
              <MobileStatPill
                icon={Award}
                value={counts.amc}
                label="AMC"
                color="text-green-600"
                bgColor="bg-green-100 dark:bg-green-900/30"
              />
              <MobileStatPill
                icon={Star}
                value="Gold"
                label="Tier"
                color="text-amber-600"
                bgColor="bg-amber-100 dark:bg-amber-900/30"
              />
            </div>
          </div>
        </div>

        {/* Desktop: Full Hero */}
        <div className="hidden lg:block container mx-auto px-4 md:px-6 pt-36 pb-10 relative z-10">
          <div className="max-w-6xl mx-auto relative">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
              {/* Left: Profile Avatar */}
              <motionClient.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative group">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-linear-to-br from-white/20 to-white/5 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl">
                    {user.profile_image_url || user.avatar ? (
                      <img
                        src={user.profile_image_url || user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-14 h-14 lg:w-18 lg:h-18 text-white" />
                    )}
                  </div>
                  <ProfileAvatarButton />
                </div>
              </motionClient.div>

              {/* Right: User Info */}
              <motionClient.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 text-center lg:text-left"
              >
                {/* Greeting */}
                <p className="text-white/60 text-sm font-medium mb-2 mt-4 uppercase tracking-wider">
                  Welcome back
                </p>

                {/* Name */}
                <div className="mb-2 text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    {user.name || "User"}
                  </h1>
                </div>

                {/* Contact Info */}
                <div className="flex items-center justify-center lg:justify-start text-white/80">
                  <span className="flex items-center gap-2 text-sm font-medium opacity-90">
                    {user.email}
                    <EmailVerificationBanner />
                  </span>
                </div>
              </motionClient.div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Stats Cards Section */}
      {/* <section className="hidden lg:block relative z-20 bg-[#F9FBFD] dark:bg-slate-950 py-6">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto -mt-12">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={ShoppingBag}
                                value={counts.orders}
                                label="Total Orders"
                                color="text-blue-600"
                                bgColor="bg-blue-100 dark:bg-blue-900/30"
                                delay={0.1}
                            />
                            <StatCard
                                icon={Heart}
                                value={counts.wishlist}
                                label="Wishlist"
                                color="text-pink-600"
                                bgColor="bg-pink-100 dark:bg-pink-900/30"
                                delay={0.15}
                            />
                            <StatCard
                                icon={Award}
                                value={counts.amc}
                                label="Active AMC"
                                color="text-green-600"
                                bgColor="bg-green-100 dark:bg-green-900/30"
                                delay={0.2}
                            />
                            <StatCard
                                icon={Star}
                                value="Gold"
                                label="Member Tier"
                                color="text-amber-600"
                                bgColor="bg-amber-100 dark:bg-amber-900/30"
                                delay={0.25}
                            />
                        </div>
                    </div>
                </div>
            </section> */}
    </>
  );
}
