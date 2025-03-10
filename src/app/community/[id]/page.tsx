// app/community/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Share } from 'lucide-react';
import { use } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import CommentForm from '../../../components/CommentForm';
import CommentList from '../../../components/CommentList';
import { Post } from '../../../lib/types';
import router from 'next/router';
import Link from 'next/link';
import style from '../../../styles/main.module.css';
import { format } from 'date-fns';
// markdown preview를 클라이언트 사이드에서만 로드
const MarkdownPreview = dynamic(
    () => import('@uiw/react-markdown-preview'),
    { ssr: false }
);

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: session } = useSession();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        fetch(`/api/posts/${resolvedParams.id}`)
            .then((res) => res.json())
            .then((data) => setPost(data));
    }, [resolvedParams.id]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert('링크가 복사되었습니다!');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'yyyy-MM-dd HH:mm:ss'); // date-fns로 포맷팅
    };

    if (!post) return <div className={style.container}></div>;

    const handleDelete = async () => {
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/posts/${resolvedParams.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/community');
                alert('게시글을 삭제했습니다');
            } else {
                router.push('/community');
                alert('게시글을 삭제했습니다');
            }
        } catch (error) {
            window.location.href = '/community';
            alert('게시글을 삭제했습니다');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.postHeader}>
                <h1>{post.title}</h1>
                <div className={styles.postInfo}>
                    <span>작성자: {post.authorName}</span>
                    <span>조회수: {post.views}</span>
                    <span>작성일: {formatDate(post.createdAt)}</span>
                    <button onClick={handleShare} className={styles.shareButton}>
                        <Share size={20} />
                    </button>
                    {session?.user?.email === post.authorEmail && (
                        <div className={styles.postActions}>
                            <Link
                                href={`/community/edit/${post._id}`}
                                className={styles.editButton}
                            >
                                수정
                            </Link>
                            <button
                                onClick={handleDelete}
                                className={styles.deleteButton}
                            >
                                삭제
                            </button>
                        </div>
                    )}
                    {(session?.user?.email !== post.authorEmail &&
                        session?.user?.email === 'kr.nextnova@gmail.com') && (
                            <div className={styles.postActions}>
                                <button
                                    onClick={handleDelete}
                                    className={styles.deleteButton}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                </div>
            </div>
            <div className={styles.content} data-color-mode="dark">
                <MarkdownPreview source={post.content} />
            </div>
            <CommentForm postId={resolvedParams.id} isLoggedIn={!!session} />
            <CommentList postId={resolvedParams.id} />
        </div>
    );
}