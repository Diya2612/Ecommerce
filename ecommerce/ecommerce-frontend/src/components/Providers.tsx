"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartDiscountProvider } from "@/contexts/CartDiscountContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { UIProvider } from "@/contexts/ui/UIContext";
import { Toaster } from "@/components/ui/sonner";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "./SessionProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <ProfileProvider>
            <SessionProvider>
              <NotificationProvider>
                <CartDiscountProvider>
                  <UIProvider>
                    <ChatProvider>
                      {children}
                      <Toaster position="top-right" />
                    </ChatProvider>
                  </UIProvider>
                </CartDiscountProvider>
              </NotificationProvider>
            </SessionProvider>
          </ProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
