// app/terms/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordModal from '@/components/PasswordModal';
import DocEditor from '@/components/DocEditor';

export default function TermsEditPage() {
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 문서 내용 가져오기
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/docs?type=terms');
                const data = await response.json();
                setContent(data.content || '');
            } catch (error) {
                console.error('Failed to fetch document:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, []);

    const handleVerifyPassword = async (password: string) => {
        if (password === 'jslove0619qq@@') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const handleSave = async (newContent: string) => {
        try {
            const response = await fetch('/api/docs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'terms',
                    content: newContent,
                    password: 'jslove0619qq@@', // 저장할 때도 비밀번호 검증
                }),
            });
            router.push('/terms');
            if (!response.ok) {
                throw new Error('Failed to save document');
            }
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    };

    if (isLoading) {
        return <div></div>;
    }

    if (!isAuthenticated) {
        return <PasswordModal onVerify={handleVerifyPassword} />;
    }

    return (
        <main>
            <DocEditor
                initialContent={content}
                docType="terms"
                onSave={handleSave}
            />
        </main>
    );
}
