'use client';

import { useState } from 'react';
import style from '@/styles/main.module.css';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
                setError('');
            } else {
                setError(data.error || '입력하신 이메일로 가입된 계정이 없어요');
                setMessage('');
            }
        } catch (error) {
            setError('오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className={style.container}>
            <div className={styles.forgotPasswordBox}>
                <h1 className={styles.title}>비밀번호 찾기</h1>
                <br></br>
                <br></br>
                <form onSubmit={handleSubmit}>
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
                    {error && <p className={styles.error}>{error}</p>}
                    {message && <p className={styles.success}>{message}</p>}
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <button type="submit" className={styles.submitButton}>
                        비밀번호 재설정 링크 받기
                    </button>
                </form>
            </div>
        </div>
    );
}