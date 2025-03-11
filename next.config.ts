import type { NextConfig } from "next";
const nextConfig = {
  reactStrictMode: true,
  images: {
    ddomains: ['ssl.pstatic.net', 'wakcareers.com', 'credit-cdn-internal.wakcareers.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wakcareers.com',
      },
    ],
  },
}

export default nextConfig;
