// components/GNB.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/gnb.module.css';
import { useSession, signIn, signOut } from "next-auth/react";

// 인터페이스 정의
interface NavItem {
    label: string;
    href: string;
}

interface GNBProps {
    logo: {
        src: string;
        alt: string;
        width: number;
        height: number;
    };
    navItems: NavItem[];
}

export default function GNB({ logo, navItems }: GNBProps) {
    const [isTransparent, setIsTransparent] = useState(true);
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleAuth = () => {
        if (session) {
            signOut({ redirect: false });
        } else {
            router.push("/login");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsTransparent(false);
            } else {
                setIsTransparent(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isSideNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isSideNavOpen]);

    const toggleSideNav = () => {
        setIsSideNavOpen(!isSideNavOpen);
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    return (
        <>
            <nav className={`${styles.navbar} ${isTransparent ? styles.transparent : styles.solid}`}>
                <div className={styles.container}>
                    <div className={styles.navContent}>
                        <Link href="/" className={styles.logo}>
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={logo.width}
                                height={logo.height}
                                priority
                            />
                        </Link>

                        <div className={styles.navLinks}>
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`${styles.navItem} ${isTransparent ? styles.transparentLink : styles.solidLink}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            
                            <div className={styles.authSection}>
                                {session ? (
                                    <div className={styles.userProfile}>
                                        <span className={styles.userName}>
                                            {session.user?.name || '사용자'}
                                        </span>
                                        <button 
                                            className={`${styles.loginButton} ${styles.logoutButton}`} 
                                            onClick={handleAuth}
                                        >
                                            로그아웃
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        className={styles.loginButton} 
                                        onClick={handleAuth}
                                    >
                                        로그인
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 모바일 메뉴 버튼 */}
                        <button
                            className={styles.mobileMenuButton}
                            onClick={toggleSideNav}
                            aria-label="메뉴 열기"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={isTransparent ? "white" : "#333"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* 오버레이 */}
            <div
                className={`${styles.overlay} ${isSideNavOpen ? styles.overlayVisible : ''}`}
                onClick={toggleSideNav}
            ></div>

            {/* 사이드 네비게이션 */}
            <div className={`${styles.sideNav} ${isSideNavOpen ? styles.sideNavOpen : ''}`}>
                <div className={styles.sideNavHeader}>
                    <Link href="/" onClick={toggleSideNav}>
                        <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={logo.width * 0.8}
                            height={logo.height * 0.8}
                            priority
                        />
                    </Link>
                    <button
                        className={styles.closeButton}
                        onClick={toggleSideNav}
                        aria-label="메뉴 닫기"
                    >
                        ✕
                    </button>
                </div>
                <div className={styles.sideNavContent}>
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={styles.sideNavItem}
                            onClick={toggleSideNav}
                        >
                            {item.label}
                        </Link>
                    ))}
                    
                    {/* 모바일 사이드 네비게이션의 로그인/로그아웃 버튼 */}
                    <div className={styles.mobileSideAuthSection}>
                        {session ? (
                            <div className={styles.mobileUserProfile}>
                                <div className={styles.mobileUserInfo}>
                                    <span className={styles.mobileUserName}>
                                        {session.user?.name || '사용자'}
                                    </span>
                                    <button 
                                        className={`${styles.loginButton} ${styles.logoutButton}`} 
                                        onClick={handleAuth}
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                className={styles.loginButton} 
                                onClick={handleAuth}
                            >
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
