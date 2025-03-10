'use client';

import { useState, useRef } from 'react';
import styles from '@/styles/ProfileSetup.module.css';

interface ProfileSetupProps {
    onNext: (data: { image?: string; birthDate: string }) => void;
    onBack: () => void;
}

export default function ProfileSetup({ onNext, onBack }: ProfileSetupProps) {
    const [birthDate, setBirthDate] = useState('');
    const [image, setimage] = useState<string>();
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            if (!res.ok) throw new Error('이미지 업로드 실패');

            const data = await res.json();
            setimage(data.imageUrl);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({ image, birthDate });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.imageUpload}>
                {image ? (
                    <img src={image} alt="Profile" className={styles.preview} />
                ) : (
                    <div className={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
                        프로필 이미지 업로드
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="birthDate">생년월일</label>
                <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                />
            </div>
            <div className={styles.buttonGroup}>
                <button type="button" onClick={onBack} className={styles.backButton}>
                    이전
                </button>
                <button type="submit" className={styles.nextButton}>
                    다음
                </button>
            </div>
        </form>
    );
}

