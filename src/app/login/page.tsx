'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import style from '@/styles/main.module.css';
import styles from './login.module.css';
import { signIn, signOut, useSession } from 'next-auth/react';
export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (result?.error) {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else {
                router.push('/');
            }
        } catch (error) {
            setError('로그인 중 오류가 발생했습니다.');
        }
    };

    if (session) {
        return (
            <div className={style.container}>
                <p>환영합니다, {session.user?.name}님!</p>
                <p>이메일: {session.user?.email}</p>
                <p>ID: {session.user?.id}</p>
                {/* <img src={session.user?.image ?? ''} alt="프로필" style={{ width: 100 }} />
                <button onClick={() => signOut()}>로그아웃</button> */}
            </div>
        );
    }

    return (
        <div className={style.container}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>로그인</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">이메일</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.loginButton}>
                        로그인
                    </button>
                </form>
                <div className={styles.registerLink}>
                    <Link href="/register">계정이 없으신가요? 회원가입</Link>
                    <br />
                    <Link href="/forgot-password" className={styles.forgotPassword}>
                        비밀번호를 잊으셨나요?
                    </Link>
                </div>
            </div>
            {/* <button onClick={() => signIn('naver')} className={styles.oauthButton}>
                네이버로 로그인
            </button> */}
        </div>
    );
}