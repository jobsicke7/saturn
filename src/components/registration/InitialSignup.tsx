'use client';

import { useState } from 'react';
import styles from '@/styles/register.module.css';

interface InitialSignupProps {
    onNext: (data: { email: string; password: string; name: string }) => void;
}

export default function InitialSignup({ onNext }: InitialSignupProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/register/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            onNext(formData);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.inputGroup}>
                <label htmlFor="email">이메일</label>
                <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="name">이름</label>
                <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="password">비밀번호</label>
                <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
            </div>
            <button type="submit" className={styles.nextButton}>
                다음
            </button>
        </form>
    );
}