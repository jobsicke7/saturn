// components/PasswordModal.tsx
import { useState } from 'react';
import styles from '../styles/PasswordModal.module.css';

interface PasswordModalProps {
    onVerify: (password: string) => Promise<boolean>;
}

export default function PasswordModal({ onVerify }: PasswordModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setError('');

        try {
            const verified = await onVerify(password);
            if (!verified) {
                setError('비밀번호가 일치하지 않습니다.');
            }
        } catch (error) {
            setError('검증 중 오류가 발생했습니다.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>편집 접근 권한</h2>
                <p>문서 편집을 위해 비밀번호를 입력해주세요.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호 입력"
                        className={styles.input}
                        disabled={isVerifying}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isVerifying}
                    >
                        {isVerifying ? '확인 중...' : '확인'}
                    </button>
                </form>
            </div>
        </div>
    );
}
