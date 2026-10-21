import { Suspense } from "react";
import { ProfileHero } from "@/components/profile/server/ProfileHero";
import { ProfileSidebarClient } from "@/components/profile/client/ProfileSidebar";
import { ProfileSidebarSkeleton } from "@/components/profile/client/ProfileSidebarSkeleton";
import { MobileProfileWrapper } from "@/components/profile/client/MobileProfileWrapper";
import { ProfileCountsProvider } from "@/components/profile/client/ProfileCountsProvider";
import {
  getUserProfile,
  getUserWishlist,
  getUserAMCPlans,
} from "@/lib/data/profile";
import { User, ShoppingBag, Heart, Award } from "lucide-react";
import type { UserProfile } from "@/lib/data/profile/types";

import { SuspendedAccountDialog } from "@/components/auth/SuspendedAccountDialog";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user profile (still SSR for immediate display)
  let userPromise: Promise<UserProfile | null>;
  let isSuspended = false;

  try {
    userPromise = getUserProfile().catch((err: any) => {
      // Catch promise rejection if getUserProfile is async but doesn't throw immediately (it is async)
      // However, if we await it here we block. getUserProfile returns a promise.
      // We can attach a catch to the promise, but we need to know the error NOW to decide on rendering.
      // Actually, getUserProfile is called as `const userPromise = getUserProfile();`
      // Only when we `await` it later (or Suspense does) does it throw.
      // BUT, the crash log says "Application error".
      // If I want to prevent crash, I should wrap the promise.
      const status = err?.status || err?.statusCode || 500;
      if (status === 403 || err?.code === "FORBIDDEN") {
        isSuspended = true;
      }
      return null;
    });

    // We can't synchronously know if promise will reject without awaiting it.
    // If we await it, we block streaming.
    // But since the user is seeing a server error page, the error is propagating up.
    // Let's await it to be safe and handle the error gracefully.
    await userPromise;
  } catch (error: any) {
    // This catch block might not catch async promise rejections unless we await.
    // But getUserProfile() is async.
    // Let's refactor: force await to catch the error and decide layout.
    console.error("ProfileLayout Error:", error);
    isSuspended = true; // Assume worst for safety or check error code
    userPromise = Promise.resolve(null);
  }

  // Re-fetch safely for passing down (it will return null/cached from above)
  const safeUserPromise = userPromise;

  // Wishlist and AMC counts (SSR for now - these pages not yet converted)
  const wishlistPromise = getUserWishlist().catch(() => []);
  const amcPromise = getUserAMCPlans().catch(() => []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <SuspendedAccountDialog isSuspended={isSuspended} />
      {/* Wrap with ProfileCountsProvider for client-side counts */}
      <ProfileCountsProvider>
        {/* Mobile Navigation Wrapper */}
        <Suspense fallback={null}>
          <MobileProfileWrapperWithSSRCounts
            userPromise={safeUserPromise}
            wishlistPromise={wishlistPromise}
            amcPromise={amcPromise}
          >
            <main>
              {/* Profile Hero - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:block">
                <Suspense
                  fallback={
                    <div className="h-[400px] bg-slate-100 dark:bg-slate-900 animate-pulse" />
                  }
                >
                  <ProfileHeroWithSSRCounts
                    userPromise={safeUserPromise}
                    wishlistPromise={wishlistPromise}
                    amcPromise={amcPromise}
                  />
                </Suspense>
              </div>

              {/* Mobile Compact Profile Header */}
              <div className="lg:hidden bg-linear-to-br from-[#0B1F51] via-[#1a3578] to-[#00C4CC] pt-4 pb-6 px-4">
                <Suspense fallback={<div className="h-20 animate-pulse" />}>
                  <MobileProfileHeroCompact
                    userPromise={safeUserPromise}
                    wishlistPromise={wishlistPromise}
                    amcPromise={amcPromise}
                  />
                </Suspense>
              </div>

              <section className="py-2 bg-[#F9FBFD] dark:bg-slate-950 min-h-[calc(100vh-400px)] transition-colors duration-300">
                <div className="container mx-auto px-3 sm:px-4 md:px-6">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
                      {/* Sidebar Navigation - Desktop Only (Client) */}
                      <div className="hidden lg:block lg:col-span-3">
                        <Suspense fallback={<ProfileSidebarSkeleton />}>
                          <ProfileSidebarClient userPromise={safeUserPromise} />
                        </Suspense>
                      </div>

                      {/* Main Content Area */}
                      <div className="lg:col-span-9">
                        <Suspense
                          fallback={
                            <div className="h-64 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
                          }
                        >
                          {children}
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </MobileProfileWrapperWithSSRCounts>
        </Suspense>
      </ProfileCountsProvider>
    </div>
  );
}

// Wrapper to pass SSR counts to MobileProfileWrapper temporarily
// (Wishlist/AMC still SSR, Orders/Addresses from hook)
async function MobileProfileWrapperWithSSRCounts({
  userPromise,
  wishlistPromise,
  amcPromise,
  children,
}: {
  userPromise: Promise<UserProfile | null>;
  wishlistPromise: Promise<any[]>;
  amcPromise: Promise<any[]>;
  children: React.ReactNode;
}) {
  const [wishlist, amc] = await Promise.all([wishlistPromise, amcPromise]);

  // Create a hybrid counts promise for compatibility
  const countsPromise = Promise.resolve({
    orders: 0, // Will be overridden by hook
    addresses: 0, // Will be overridden by hook
    wishlist: wishlist.length,
    amc: amc.length,
  });

  return (
    <MobileProfileWrapper
      userPromise={userPromise}
      countsPromise={countsPromise}
    >
      {children}
    </MobileProfileWrapper>
  );
}

// ProfileHero wrapper with SSR wishlist/amc counts
async function ProfileHeroWithSSRCounts({
  userPromise,
  wishlistPromise,
  amcPromise,
}: {
  userPromise: Promise<UserProfile | null>;
  wishlistPromise: Promise<any[]>;
  amcPromise: Promise<any[]>;
}) {
  const [wishlist, amc] = await Promise.all([wishlistPromise, amcPromise]);

  const countsPromise = Promise.resolve({
    orders: 0, // Placeholder - hero uses real counts for orders
    addresses: 0,
    wishlist: wishlist.length,
    amc: amc.length,
  });

  return (
    <ProfileHero userPromise={userPromise} countsPromise={countsPromise} />
  );
}

// Compact mobile profile hero component
async function MobileProfileHeroCompact({
  userPromise,
  wishlistPromise,
  amcPromise,
}: {
  userPromise: Promise<UserProfile | null>;
  wishlistPromise: Promise<any[]>;
  amcPromise: Promise<any[]>;
}) {
  const [user, wishlist, amc] = await Promise.all([
    userPromise,
    wishlistPromise,
    amcPromise,
  ]);

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
        <User className="w-7 h-7 text-white" />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
          Welcome back
        </p>
        <h1 className="text-lg font-bold text-white truncate">
          {`${user.name} ${user.last_name || ""}`.trim() || "User"}
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
          <Heart className="w-4 h-4 text-white/80" />
          <span className="text-sm font-bold text-white">
            {wishlist.length}
          </span>
        </div>
      </div>
    </div>
  );
}
