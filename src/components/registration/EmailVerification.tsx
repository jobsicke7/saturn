'use client';

import { useState } from 'react';
import styles from '@/styles/EmailVerification.module.css';

interface EmailVerificationProps {
    email: string;
    onComplete: () => void;
    onBack: () => void;
}

export default function EmailVerification({ email, onComplete, onBack }: EmailVerificationProps) {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/register/verify-email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    verificationToken: verificationCode,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            onComplete();
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <p className={styles.instruction}>
                {email}로 전송된 인증 코드를 입력해주세요
            </p>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증 코드 6자리"
                    required
                />
            </div>
            <div className={styles.buttonGroup}>
                <button type="button" onClick={onBack} className={styles.backButton}>
                    이전
                </button>
                <button type="submit" className={styles.verifyButton}>
                    인증 완료
                </button>
            </div>
        </form>
    );
}