'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { use } from 'react';
import styles from '../../write/page.module.css';
import style from '../../../../styles/main.module.css';
import ImageUploader from '@/components/ImageUploader';

// markdown 에디터를 클라이언트 사이드에서만 로드
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
        fetch(`/api/astroinfo/${resolvedParams.id}`)
            .then(res => res.json())
            .then(data => {
                if (session?.user?.email !== data.authorEmail) {
                    router.push('/services/astroinfo');
                    return;
                }
                setTitle(data.title);
                setContent(data.content);
                setIsLoading(false);
            });
    }, [resolvedParams.id, router, session?.user?.email]);

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
            const res = await fetch(`/api/astroinfo/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });

            if (res.ok) {
                router.push(`/services/astroinfo/${resolvedParams.id}`);
            } else {
                alert('게시글 수정에 실패했습니다.');
            }
        } catch (error) {
            alert('게시글 수정에 실패했습니다.');
        }
        setIsSubmitting(false);
    };

    if (isLoading) return <div className={style.container}></div>;

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
                        {isSubmitting ? '수정 중...' : '수정하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}