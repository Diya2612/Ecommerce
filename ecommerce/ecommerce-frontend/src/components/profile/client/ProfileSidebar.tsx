"use client";

import { User, HelpCircle } from "lucide-react";
import { SidebarNavigation } from "./SidebarNavigation";
import { SignOutButton } from "./SignOutButton";
import { useProfileCountsContext } from "./ProfileCountsProvider";
import type { UserProfile } from "@/lib/data/profile/types";
import type { TabConfig } from "./SidebarNavigation";
import { use, Suspense } from "react";

interface ProfileSidebarClientProps {
  userPromise: Promise<UserProfile | null>;
}

const TABS: TabConfig[] = [
  {
    path: "/profile/orders",
    id: "orders",
    label: "My Orders",
    description: "Track, return, or buy things again",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    path: "/profile/addresses",
    id: "addresses",
    label: "Addresses",
    description: "Manage your shipping addresses",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    path: "/profile/wishlist",
    id: "wishlist",
    label: "Wishlist",
    description: "Your saved items",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    path: "/profile/notifications",
    id: "notifications",
    label: "Notifications",
    description: "Your notifications and alerts",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    path: "/profile/account",
    id: "account",
    label: "Account",
    description: "Profile, password & preferences",
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-800",
  },
];

// Inner component that uses the promise
function SidebarContent({
  userPromise,
}: {
  userPromise: Promise<UserProfile | null>;
}) {
  const user = use(userPromise);
  const { counts } = useProfileCountsContext();

  if (!user) return null;

  return (
    <div className="sticky top-24 space-y-4">
      {/* User Mini Card - Mobile */}
      <div className="lg:hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-[#0B1F51] to-[#00C4CC] rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {`${user.name} ${user.last_name || ""}`.trim() || "User"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Account
          </h3>
        </div>

        <SidebarNavigation tabs={TABS} counts={counts} />

        <SignOutButton />
      </div>

      {/* Help Card */}
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-blue-100 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              Need Help?
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              24/7 customer support
            </p>
            <a
              href="tel:+919876543210"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 inline-block hover:underline"
            >
              Call Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSidebarClient({
  userPromise,
}: ProfileSidebarClientProps) {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarContent userPromise={userPromise} />
    </Suspense>
  );
}

// Skeleton for loading state
function SidebarSkeleton() {
  return (
    <div className="sticky top-24 space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800">
          <div className="h-6 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="p-2 space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
