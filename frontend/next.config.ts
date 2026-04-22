import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@clerk/nextjs'],
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const connectSrc = isDev
      ? "connect-src * 'self' blob: data: gap:; "
      : "connect-src 'self' capacitor://localhost http://localhost https://api.clerk.com https://*.clerk.accounts.dev https://api.openai.com; ";

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' capacitor://localhost http://localhost; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://api.clerk.com https://*.clerk.accounts.dev; " +
              "worker-src 'self' blob:; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' blob: data: https:; " +
              connectSrc +
              "frame-ancestors 'none'"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
