// app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        async function logout() {
            try {
                // 세션 삭제 API 호출
                await fetch('/api/logout', { method: 'POST' });

                // 네이버 로그아웃 URL로 리다이렉트
                window.location.href = 'https://nid.naver.com/nidlogin.logout';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }

        logout();
    }, [router]);

    return (
        <div>
            <h1>로그아웃 중...</h1>
            <p>잠시만 기다려 주세요.</p>
        </div>
    );
}
