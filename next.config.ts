import type { NextConfig } from "next";
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ssl.pstatic.net','credit-cdn-internal.wakcareers.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wakcareers.com',
      },
    ],
  },
}

export default nextConfig;
