'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import style from '@/styles/main.module.css';
import styles from './reset-password.module.css';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [userInfo, setUserInfo] = useState({ email: '', name: '' });
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            try {
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await fetch('/api/auth/validate-reset-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                const data = await response.json();

                if (!response.ok) {
                    router.push('/login');
                    return;
                }

                setUserInfo({ email: data.email, name: data.name });
            } catch (error) {
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            if (response.ok) {
                router.push('/login');
            } else {
                setError('유효하지 않거나 만료된 토큰입니다.');
            }
        } catch (error) {
            setError('오류가 발생했습니다.');
        }
    };

    // 로딩 상태 추가
    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <Suspense fallback={<div>..</div>}>
        <div className={style.container}>
            <div className={styles.resetPasswordBox}>
                <h1 className={styles.title}>비밀번호 재설정</h1>
                <br></br>
                <br></br>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword">새 비밀번호</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <button type="submit" className={styles.submitButton}>
                        비밀번호 변경
                    </button>
                </form>
            </div>
        </div>
        </Suspense>
    );
    
}
