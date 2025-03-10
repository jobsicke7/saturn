'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from './CommentForm.module.css';

export default function CommentForm({ postId, isLoggedIn }: { postId: string, isLoggedIn: boolean }) {
    const [content, setContent] = useState('');
    const { data: session } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !isLoggedIn) return;

        await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });

        setContent('');
        window.location.reload();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!isLoggedIn}
                placeholder={isLoggedIn ? "댓글을 입력하세요" : "댓글을 달려면 로그인하세요"}
                className={styles.textarea}
            />
            <button type="submit" disabled={!isLoggedIn} className={styles.button}>
                댓글 작성
            </button>
        </form>
    );
}
