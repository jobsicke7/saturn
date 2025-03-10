'use client';
import { useEffect, useState } from 'react';
import styles from './CommentList.module.css';
import { Comment } from '../lib/types';

export default function CommentList({ postId }: { postId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        fetch(`/api/posts/${postId}/comments`)
            .then(res => res.json())
            .then(data => setComments(data));
    }, [postId]);

    return (
        <div className={styles.container}>
            <h3>댓글 {comments.length}개</h3>
            <ul className={styles.commentList}>
                {comments.map(comment => (
                    <li key={comment._id} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                            <span className={styles.author}>{comment.authorName}</span>
                            <span className={styles.date}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={styles.content}>{comment.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}