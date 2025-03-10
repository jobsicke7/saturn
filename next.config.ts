import type { NextConfig } from "next";
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ssl.pstatic.net'],  // 네이버 이미지 도메인 허용
  },
}

export default nextConfig;
