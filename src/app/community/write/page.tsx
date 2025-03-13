'use client';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import ImageUploader from '../../../components/ImageUploader';

// markdown 에디터를 클라이언트 사이드에서만 로드
const MDEditor = dynamic(
    () => import('@uiw/react-md-editor'),
    { ssr: false }
);

export default function WritePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 로그인하지 않은 사용자 리다이렉트
    if (status !== 'loading' && !session) {
        router.push('/community');
        return null;
    }

    const handleImageUpload = useCallback((imageUrl: string) => {
        // 이미지 마크다운을 컨텐츠 끝에 추가
        const imageMarkdown = `![이미지](${imageUrl})`;
        setContent(prev => prev ? `${prev}\n${imageMarkdown}` : imageMarkdown);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    authorName: session?.user?.name,
                }),
            });

            if (res.ok) {
                router.push('/community');
            } else {
                alert('게시글 작성에 실패했습니다.');
            }
        } catch (error) {
            alert('게시글 작성에 실패했습니다.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className={styles.container}>
            <h1>새 글 작성</h1>
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
                <div className={styles.editorToolbar}>
                    <ImageUploader onImageUrl={handleImageUpload} />
                </div>
                <div className={styles.editorContainer} data-color-mode="white">
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
                        {isSubmitting ? '게시 중...' : '게시하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}