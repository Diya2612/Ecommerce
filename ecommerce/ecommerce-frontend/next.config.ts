import type { NextConfig } from "next";

// Security Headers for improved Lighthouse Best Practices score
// const securityHeaders = [
//   // DNS Prefetch Control - allows browsers to perform DNS resolution in background
//   {
//     key: "X-DNS-Prefetch-Control",
//     value: "on",
//   },
//   // HSTS - Force HTTPS connections with long max-age (1 year)
//   {
//     key: "Strict-Transport-Security",
//     value: "max-age=31536000; includeSubDomains; preload",
//   },
//   // Prevent clickjacking by denying iframe embedding
//   {
//     key: "X-Frame-Options",
//     value: "DENY",
//   },
//   // Prevent MIME type sniffing
//   {
//     key: "X-Content-Type-Options",
//     value: "nosniff",
//   },
//   // Controls referrer information sent with requests
//   {
//     key: "Referrer-Policy",
//     value: "strict-origin-when-cross-origin",
//   },
//   // Cross-Origin-Opener-Policy for origin isolation
//   {
//     key: "Cross-Origin-Opener-Policy",
//     value: "same-origin",
//   },
//   // Cross-Origin-Resource-Policy to protect against spectre attacks
//   {
//     key: "Cross-Origin-Resource-Policy",
//     value: "same-origin",
//   },
//   // Permissions-Policy to control browser features
//   {
//     key: "Permissions-Policy",
//     value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
//   },
//   // XSS Protection (legacy but still useful for older browsers)
//   {
//     key: "X-XSS-Protection",
//     value: "1; mode=block",
//   },
//   {
//     key: "Content-Security-Policy",
//     value: [
//       "default-src 'self'",
//       "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com",
//       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
//       "font-src 'self' https://fonts.gstatic.com data:",
//       "img-src 'self' data: blob: https://images.unsplash.com https://api.dicebear.com https://via.placeholder.com https:",
//       "connect-src 'self' https: http://localhost:8000 http://192.168.1.15:8000 https://api.razorpay.com https://lumberjack.razorpay.com",
//       "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
//       "frame-ancestors 'none'",
//       "base-uri 'self'",
//       "form-action 'self'",
//     ].join("; "),
//   },
// ];

const nextConfig: NextConfig = {
  // Enable React Strict Mode for catching potential issues
  reactStrictMode: true,

  // Experimental features for better performance
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: ["lucide-react", "motion/react"],
    mcpServer: true,
  },

  // Image optimization settings
  images: {
    // Enable modern image formats for smaller file sizes
    formats: ["image/avif", "image/webp"],

    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Supabase storage for product images from backend API
        protocol: "https",
        hostname: "olrbnzxjieogvqauhfwe.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "irnyfhmqwiblbilfmgxk.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "seeklogo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logodix.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "brandfetch.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.seeklogo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.stickpng.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.pureitwater.com",
        pathname: "/**",
      },
    ],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable gzip/brotli compression
  compress: true,

  // Powered by header removal
  poweredByHeader: false,

  // Add security headers to all routes
  // async headers() {
  //   // Disable strict security headers in development to prevent issues with local testing (e.g. Razorpay CSP)
  //   if (process.env.NODE_ENV === "development") {
  //     return [];
  //   }

  //   return [
  //     {
  //       // Apply security headers to all routes
  //       source: "/:path*",
  //       headers: 'securityHeaders',
  //     },
  //   ];
  // },

  async redirects() {
    return [
      {
        source: '/products',
        destination: '/collections',
        permanent: true,
      },
      {
        source: '/products/:slug',
        destination: '/collections/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
