import type { Metadata } from "next";
import "@/styles/global.css";
export const metadata: Metadata = {
  title: `NEXTNOVA | 회원가입`,
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
  return <>{children}</>;
}
