import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Hanken_Grotesk, Quicksand } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "@/styles/suvarna.css";
import { Providers } from "@/components/Providers";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { CartAuthSync } from "@/components/cart/CartAuthSync";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

/* ── Suvarna Custom Fonts ────────────────────────────────────── */
const cormorant = Cormorant_Garamond({
  variable: "--sv-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--sv-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--sv-round",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Suvarna Custom: store preview",
  description: "Custom photo prints, large-format prints, albums, video invites and keepsake boxes. Store preview.",
  icons: {
    icon: "/assets/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Hanken+Grotesk:wght@400;500;600&family=Quicksand:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${hanken.variable} ${quicksand.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <NuqsAdapter>
            <CartAuthSync />
            <ScrollToTop />
            {/* Razorpay Checkout Script */}
            <Script
              id="razorpay-checkout"
              src="https://checkout.razorpay.com/v1/checkout.js"
              strategy="afterInteractive"
            />
            {children}
          </NuqsAdapter>
        </Providers>
      </body>
    </html>
  );
}
