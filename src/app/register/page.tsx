'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/register.module.css';

interface FormData {
    email: string;
    password: string;
    name: string;
    image?: string;
    birthDate?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formStep, setFormStep] = useState<'initial' | 'profile' | 'verify'>("initial");
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        name: '',
        image: '',
        birthDate: '',
    });
    const [error, setError] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const handleInitialSubmit = async (e: React.FormEvent) => {
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
                throw new Error(data.error || '이메일 인증 요청 실패');
            }

            setFormStep('profile');
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.birthDate) {
            setError('생년월일을 입력해주세요');
            return;
        }

        setFormStep('verify');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/register/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('이미지 업로드 실패');
            }

            const data = await res.json();
            setFormData(prev => ({ ...prev, image: data.imageUrl }));
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleVerificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const verifyRes = await fetch('/api/register/verify-email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    verificationToken: verificationCode,
                }),
            });

            if (!verifyRes.ok) {
                const data = await verifyRes.json();
                throw new Error(data.error || '인증 실패');
            }

            // 최종 회원가입 요청
            const registerRes = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!registerRes.ok) {
                const data = await registerRes.json();
                throw new Error(data.error || '회원가입 실패');
            }

            router.push('/login?success=회원가입이 완료되었습니다');
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.registerBox}>
                <h1 className={styles.title}>회원가입</h1>

                <div className={styles.progressBar}>
                    <div className={`${styles.progressStep} ${formStep === 'initial' ? styles.active : ''} ${formStep !== 'initial' ? styles.completed : ''}`}>1</div>
                    <div className={`${styles.progressStep} ${formStep === 'profile' ? styles.active : ''} ${formStep === 'verify' ? styles.completed : ''}`}>2</div>
                    <div className={`${styles.progressStep} ${formStep === 'verify' ? styles.active : ''}`}>3</div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {formStep === 'initial' && (
                    <form onSubmit={handleInitialSubmit} className={styles.form}>
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
                        <button type="submit" className={styles.nextButton}>다음</button>
                    </form>
                )}

                {formStep === 'profile' && (
                    <form onSubmit={handleProfileSubmit} className={styles.form}>
                        <div className={styles.imageUpload}>
                            {formData.image ? (
                                <img
                                    src={formData.image}
                                    alt="Profile"
                                    className={styles.preview}
                                />
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <label htmlFor="image" className={styles.uploadLabel}>
                                        프로필 이미지 업로드
                                    </label>
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="birthDate">생년월일</label>
                            <input
                                id="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={() => setFormStep('initial')}
                                className={styles.nextButton}
                            >
                                이전
                            </button>
                            <button type="submit" className={styles.nextButton}>다음</button>
                        </div>
                    </form>
                )}

                {formStep === 'verify' && (
                    <form onSubmit={handleVerificationSubmit} className={styles.form}>
                        <p className={styles.instruction}>
                            {formData.email}로 전송된 인증 코드를 입력해주세요
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
                            <button
                                type="button"
                                onClick={() => setFormStep('profile')}
                                className={styles.nextButton}
                            >
                                이전
                            </button>
                            <button type="submit" className={styles.nextButton}>가입 완료</button>
                        </div>
                    </form>
                )}

                <div className={styles.loginLink}>
                    <Link href="/login">이미 계정이 있으신가요? 로그인</Link>
                </div>
            </div>
        </div>
    );
}