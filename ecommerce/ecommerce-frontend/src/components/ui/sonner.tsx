"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group border-none ring-1 ring-black/5 dark:ring-white/10 shadow-lg",
          closeButton: "!bg-gray-50 dark:!bg-slate-800 !text-gray-400 hover:!text-[#31CDD4] hover:!bg-[#31CDD4]/5 !border-gray-100 dark:!border-slate-700 !transition-all !opacity-0 group-hover:!opacity-100 !right-1 !top-1",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

