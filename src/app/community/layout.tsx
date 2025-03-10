import type { Metadata } from "next";
import "@/styles/global.css";
export const metadata: Metadata = {
  title: `NEXTNOVA | 커뮤니티`,
  description: "당신만의 우주, NEXTNOVA",
  icons: {
    icon: "./favicon/favicon.ico",
  },
};
export default function CommunityPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; // <html> 및 <body> 태그 제거
}
