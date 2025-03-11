import type { NextConfig } from "next";
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ssl.pstatic.net', 'wakcareers.com', 'credit-cdn-internal.wakcareers.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'credit-cdn-internal.wakcareers.com',
      },
    ],
  },
}

export default nextConfig;
