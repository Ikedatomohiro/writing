import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "writing-taupe.vercel.app",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://partner.googleadservices.com https://tpc.googlesyndication.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://images.unsplash.com https://*.public.blob.vercel-storage.com https://pagead2.googlesyndication.com data:",
              "connect-src 'self' https://*.supabase.co https://pagead2.googlesyndication.com",
              "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "font-src 'self' data:",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
