"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
import { useProfile } from "@/hooks/queries/useUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SuspendedAccountDialog({
  isSuspended = false,
}: {
  isSuspended?: boolean;
}) {
  const { error } = useProfile();
  const [isOpen, setIsOpen] = useState(isSuspended);

  useEffect(() => {
    if (isSuspended) {
      setIsOpen(true);
      return;
    }

    // Check if error is 403 Forbidden
    if (error) {
      const isForbidden =
        // @ts-ignore - checking various error shapes
        error?.status === 403 ||
        // @ts-ignore
        error?.statusCode === 403 ||
        // @ts-ignore
        error?.code === "FORBIDDEN" ||
        // @ts-ignore
        error?.message?.includes("suspended") ||
        // @ts-ignore
        error?.message?.includes("inactive");

      if (isForbidden) {
        setIsOpen(true);
      }
    }
  }, [error, isSuspended]);

  const handleLogout = async () => {
    try {
      // Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Sign out from Supabase to clear cookies/session
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Logout cleanup error:", e);
    } finally {
      // Force redirect to register page
      window.location.href = "/register";
    }
  };

  const handleSupport = () => {
    window.location.href = "mailto:support@anant-enterprises.com";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-red-600">
            Account Suspended
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 pt-2">
            Your account has been suspended due to policy violations or security
            concerns. You cannot access your profile or make purchases at this
            time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800">
            <p className="font-medium">What happens now?</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-red-700">
              <li>Access to your account is restricted</li>
              <li>Ongoing orders may be paused</li>
              <li>Please contact support for resolution</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSupport}
              className="w-full bg-[#0B1F51] hover:bg-[#00C4CC]"
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full gap-2 text-gray-600"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
