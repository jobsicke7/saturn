'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Share, Calendar, Eye, User, ArrowLeft } from 'lucide-react';
import { use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import TranslateButton from '@/components/TranslateButton';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

// Load markdown preview on client side only
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/astroinfo/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setOriginalPost(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching post:', error);
        setIsLoading(false);
      });
  }, [resolvedParams.id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy년 MM월 dd일 HH:mm');
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/astroinfo/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/services/astroinfo');
        alert('게시글을 삭제했습니다');
      } else {
        alert('게시글 삭제에 실패했습니다');
      }
    } catch (error) {
      alert('게시글 삭제 중 오류가 발생했습니다');
    }
  };

  const handleTranslate = async (language: string) => {
    if (!post) return;

    if (language === 'original') {
      setPost(originalPost);
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);

    try {
      // 제목 번역
      const titleResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.title, targetLanguage: language }),
      });
      const titleData = await titleResponse.json();
      
      // 본문 내용 번역
      const contentResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalPost?.content || '', targetLanguage: language }),
      });
      const contentData = await contentResponse.json();

      // 번역된 내용으로 포스트 업데이트
      setPost({
        ...post,
        title: titleData.translatedText,
        content: contentData.translatedText,
      });
      setIsTranslated(true);
    } catch (error) {
      console.error('Translation error:', error);
      alert('번역 중 오류가 발생했습니다');
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading) return (
    <div className={styles.container}>
      <div className={styles.loadingContainer}>
        <p>게시글을 불러오는 중...</p>
      </div>
    </div>
  );

  if (!post) return (
    <div className={styles.container}>
      <div className={styles.errorContainer}>
        <p>게시글을 찾을 수 없습니다</p>
        <Link href="/services/astroinfo" className={styles.backButton}>
          <ArrowLeft size={16} />
          커뮤니티로 돌아가기
        </Link>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <Link href="/services/astroinfo" className={styles.backButton}>
          <ArrowLeft size={16} />
          목록으로
        </Link>
      </div>
      <div className={styles.postHeader}>
        <h1>{post.title}</h1>
        <div className={styles.postInfo}>
          <span className={styles.infoItem}>
            <User size={16} className={styles.infoIcon} />
            {post.authorName}
          </span>
          <span className={styles.infoItem}>
            <Eye size={16} className={styles.infoIcon} />
            조회수 {post.views}
          </span>
          <span className={styles.infoItem}>
            <Calendar size={16} className={styles.infoIcon} />
            {formatDate(post.createdAt)}
          </span>
          <button onClick={handleShare} className={styles.shareButton}>
            <Share size={18} />
          </button>
          
          <TranslateButton 
            onTranslate={handleTranslate} 
            isTranslated={isTranslated} 
          />
          
          {session?.user?.email === post.authorEmail && (
            <div className={styles.postActions}>
              <Link
                href={`/services/astroinfo/edit/${post._id}`}
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
      
      <div className={styles.content} data-color-mode="light">
        {isTranslating ? (
          <div className={styles.translatingIndicator}>번역 중...</div>
        ) : (
          <MarkdownPreview source={post.content} />
        )}
      </div>
      
      <CommentForm postId={resolvedParams.id} isLoggedIn={!!session} />
      <CommentList postId={resolvedParams.id} />
    </div>
  );
}