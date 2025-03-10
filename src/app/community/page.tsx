'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import { Post } from '../../lib/types';

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const { data: session } = useSession();

    useEffect(() => {
        fetch('/api/posts')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Sort your posts
                const sortedPosts = data.sort((a: Post, b: Post) => {
                    const isANotice = a.authorEmail === 'kr.nextnova@gmail.com';
                    const isBNotice = b.authorEmail === 'kr.nextnova@gmail.com';
    
                    if (isANotice && !isBNotice) return -1;
                    if (!isANotice && isBNotice) return 1;
                    if (isANotice && isBNotice) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setPosts(sortedPosts);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                // Optionally set an error state to display to the user
            });
    }, []);
    

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>커뮤니티</h1>
                {session && (
                    <Link href="/community/write" className={styles.writeButton}>
                        글쓰기
                    </Link>
                )}
            </div>
            <ul className={styles.postList}>
                {posts.map(post => (
                    <li key={post._id} className={styles.postItem}>
                        <Link href={`/community/${post._id}`}>
                            {post.authorEmail === 'kr.nextnova@gmail.com' && (
                                <span className={styles.noticeTag}>공지</span>
                            )}
                            <span className={styles.postTitle}>{post.title}</span>
                            <div className={styles.postMeta}>
                                <span className={styles.author}>{post.authorName}</span>
                                <span className={styles.viewCount}>조회수: {post.views}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}