'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Pencil, FileText } from 'lucide-react';
import styles from './page.module.css';
import { Post } from '@/lib/types';
import dynamic from 'next/dynamic';
const MarkdownPreview = dynamic(
    () => import('@uiw/react-markdown-preview'),
    { ssr: false }
);
export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/astroinfo')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Sort posts - notices first, then by date
                const sortedPosts = data.sort((a: Post, b: Post) => {
                    const isANotice = a.authorEmail === 'kr.nextnova@gmail.com';
                    const isBNotice = b.authorEmail === 'kr.nextnova@gmail.com';
    
                    if (isANotice && !isBNotice) return -1;
                    if (!isANotice && isBNotice) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setPosts(sortedPosts);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                setIsLoading(false);
            });
    }, []);

    // Format date to a more readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    const recentPost = posts[0];
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>최근 소식</h1>
            </div>
            {recentPost ? (
                <div className={styles.recentPost} data-color-mode="white">
                    <Link href={`/astroinfo/${recentPost._id}`}>
                        <h2 className={styles.recentPostTitle}>{recentPost.title}</h2>
                        <MarkdownPreview source={recentPost.content} />
                        <span className={styles.recentPostMeta}>
                            작성자: {recentPost.authorName}
                        </span>
                    </Link>
                </div>
            ) : (
                <p></p>
            )}
            <div className={styles.header}>
                <h1>커뮤니티</h1>
                {session && (
                    <Link href="/services/astroinfo/write" className={styles.writeButton}>
                        <Pencil size={16} />
                        글쓰기
                    </Link>
                )}
            </div>
            
            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <p>게시글을 불러오는 중...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className={styles.emptyContainer}>
                     <p>게시판이 텅 비었어요. 지금 첫 번째 글을 작성해보세요!</p>
                </div>
            ) : (
                <ul className={styles.postList}>
                    {posts.map(post => (
                        <li key={post._id} className={styles.postItem}>
                            <Link href={`/services/astroinfo/${post._id}`}>
                                <div>
                                    {post.authorEmail === 'kr.nextnova@gmail.com' && (
                                        <span className={styles.noticeTag}>공지</span>
                                    )}
                                    <span className={styles.postTitle}>{post.title}</span>
                                </div>
                                <div className={styles.postMeta}>
                                    <span className={styles.author}>{post.authorName}</span>
                                    <div>
                                        <span className={styles.date}>{formatDate(post.createdAt)}</span>
                                        <span className={styles.viewCount}>· 조회수 {post.views}</span>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}