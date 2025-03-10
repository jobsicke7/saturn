'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Navbar.module.css';
import { Button } from '@/components/ui/Button';

export default function AdminNavbar() {
  const { data: session } = useSession();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.logo}>
          <Link href="/admin">
            어드민 대시보드
          </Link>
        </div>
        
        <div className={styles.userMenu}>
          {session?.user ? (
            <div className={styles.userInfo}>
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className={styles.userAvatar}
                />
              )}
              <span className={styles.userName}>{session.user.name || session.user.email}</span>
              <Button 
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="outline"
                size="small"
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <Link href="/api/auth/signin">
              <Button>로그인</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
