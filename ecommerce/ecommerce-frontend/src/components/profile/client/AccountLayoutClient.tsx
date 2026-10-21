"use client";

import { useProfile } from "@/hooks/queries/useUser";
import { AccountLayout } from "@/components/profile/server/AccountLayout";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Client wrapper for AccountLayout that fetches user profile via React Query.
 * No SSR props needed - fully client-side.
 */
export function AccountLayoutClient() {
  const { user, isLoading, error, refetch } = useProfile();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading profile...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load profile
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {error?.message || "Unable to fetch your account details"}
        </p>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }



  return <AccountLayout user={user} />;
}
