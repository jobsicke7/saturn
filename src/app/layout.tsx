// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GNB from '../components/gnb';
import FNB from '../components/fnb';
import styles from '../styles/Layout.module.css';
import { AuthProvider } from '../components/AuthProvider';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Saturn',
  description: 'Created with Next.js 15',
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // GNB 구성 정보
  const gnbProps = {
    logo: {
      src: '/icon.svg',
      alt: 'logo',
      width: 120,
      height: 40
    },
    navItems: [
      { label: '서비스', href: '/services' },
      { label: '블로그', href: '/blog' },
      { label: '커뮤니티', href: '/community' },
    ]
  };

  // FNB 구성 정보
  const fnbProps = {
    sections: [
      {
        title: '회사',
        links: [
          { label: '소개', href: '/about' },
          { label: '팀', href: '/team' }
        ]
      },
      {
        title: '지원',
        links: [
          { label: 'FAQ', href: '/faq' },
          { label: '문의하기', href: '/contact' },
        ]
      },
      {
        title: '법적 고지',
        links: [
          { label: '개인정보 처리방침', href: '/privacy' },
          { label: '이용약관', href: '/terms' }
        ]
      },
    ],
    copyright: '© 2025 Saturn. All rights reserved.'
  };

  return (
    <html lang="ko">
      <AuthProvider>
      <body className={inter.className}>
        <div className={styles.pageContainer}>
          <GNB {...gnbProps} />
          <main className={styles.mainContent}>
            {children}
          </main>
          <FNB {...fnbProps} />
        </div>
      </body>
      </AuthProvider>
    </html>
  );
}
