// components/GNB.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const sideNavRef = useRef<HTMLDivElement>(null);

    const handleAuth = () => {
        if (session) {
            signOut({ redirect: false });
        } else {
            router.push("/login");
            setIsSideNavOpen(false); // 로그인 페이지로 이동 시 사이드 네비게이션 닫기
        }
    };

    // 스크롤에 따른 GNB 스타일 변경
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsTransparent(false);
            } else {
                setIsTransparent(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // 초기 로드 시 스크롤 위치 확인
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 사이드네비가 열렸을 때 body 스크롤 방지
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

    // URL이 변경될 때 사이드네비 닫기
    useEffect(() => {
        setIsSideNavOpen(false);
    }, [pathname]);

    // 바깥 영역 클릭 시 사이드네비 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sideNavRef.current && 
                !sideNavRef.current.contains(event.target as Node) &&
                isSideNavOpen
            ) {
                setIsSideNavOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSideNavOpen]);

    const toggleSideNav = () => {
        setIsSideNavOpen(!isSideNavOpen);
    };

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
                                        <span className={`${styles.userName} ${isTransparent ? '' : styles.solidUserName}`}>
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
                                stroke={isTransparent ? "black" : "white"}
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
                onClick={() => setIsSideNavOpen(false)}
            ></div>

            {/* 사이드 네비게이션 - 오른쪽에서 나오도록 변경 */}
            <div 
                ref={sideNavRef} 
                className={`${styles.sideNav} ${isSideNavOpen ? styles.sideNavOpen : ''}`}
            >
                <div className={styles.sideNavHeader}>
                    <Link href="/" onClick={() => setIsSideNavOpen(false)}>
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
                        onClick={() => setIsSideNavOpen(false)}
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
