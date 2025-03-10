'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { use } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../write/page.module.css';

const MDEditor = dynamic(
    () => import('@uiw/react-md-editor'),
    { ssr: false }
);

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/posts/${resolvedParams.id}`)
            .then(res => res.json())
            .then(data => {
                if (session?.user?.email !== data.authorEmail) {
                    router.push('/community');
                    return;
                }
                setTitle(data.title);
                setContent(data.content);
                setIsLoading(false);
            });
    }, [resolvedParams.id, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });

            if (res.ok) {
                router.push(`/community/${resolvedParams.id}`);
            } else {
                alert('게시글 수정에 실패했습니다.');
            }
        } catch (error) {
            alert('게시글 수정에 실패했습니다.');
        }
        setIsSubmitting(false);
    };

    if (status !== 'loading' && !session) {
        router.push('/community');
        return null;
    }

    if (isLoading) return <div>로딩중...</div>;

    return (
        <div className={styles.container}>
            <h1>게시글 수정</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.titleContainer}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className={styles.titleInput}
                        required
                    />
                </div>
                <div className={styles.editorContainer} data-color-mode="dark">
                    <MDEditor
                        value={content}
                        onChange={(val) => setContent(val || '')}
                        height={400}
                        preview="edit"
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.cancelButton}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitButton}
                    >
                        {isSubmitting ? '수정 중...' : '수정하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}