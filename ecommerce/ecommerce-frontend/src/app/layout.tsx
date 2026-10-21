import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { CartAuthSync } from "@/components/cart/CartAuthSync";
import { NuqsAdapter } from 'nuqs/adapters/next/app'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Printo | Online Printing Services & Custom Corporate Gifts",
  description: "India's largest custom printing platform. Visiting cards, custom t-shirts, mugs, stationery, packaging and corporate gifts with 2400 DPI print quality.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
