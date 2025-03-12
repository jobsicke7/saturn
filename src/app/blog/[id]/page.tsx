'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '@/styles/blog.module.css';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  mainImage: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/posts/${id}`);
        if (!response.ok) throw new Error('Post not found');
        
        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchPost();
  }, [id]);
  
  useEffect(() => {
    if (!session?.user?.email) return;
    
    const checkAdminStatus = async () => {
      const response = await fetch(`/api/admin/check?email=${session.user.email}`);
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    };
    
    checkAdminStatus();
  }, [session]);
  
  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' });
      
      if (response.ok) router.push('/blog');
      else alert(`게시글 삭제에 실패했습니다: ${(await response.json()).error}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('오류가 발생했습니다.');
    }
  };
  
  const handleEdit = () => router.push(`/blog/edit/${id}`);
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(console.error);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (!post) return <div className={styles.notFound}>게시글을 찾을 수 없습니다.</div>;
  
  const canEditDelete = isAdmin || (session?.user?.email === post.author.email);
  
  return (
    <div className={styles.postDetailContainer}>
      <Link href="/blog" className={styles.backLink}>← 블로그 목록으로</Link>
      
      <h1 className={styles.postTitle1}>{post.title}</h1>
      
      <div className={styles.postMeta}>
        <span className={styles.postAuthor}>{post.author.name}</span>
        <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
        {/* {post.updatedAt !== post.createdAt && (
          <span className={styles.postUpdated}>(수정됨: {formatDate(post.updatedAt)})</span>
        )} */}
      </div>
      
      {post.mainImage && (
        <div className={styles.postMainImage}>
          <Image src={post.mainImage} alt={post.title} width={800} height={400} className={styles.mainImage} />
        </div>
      )}
      
      <div className={styles.postActions}>
        <button onClick={handleShare} className={styles.shareButton}>{copied ? '복사됨!' : '공유하기'}</button>
        {canEditDelete && (
          <>
            <button onClick={handleEdit} className={styles.editButton}>수정하기</button>
            <button onClick={handleDelete} className={styles.deleteButton}>삭제하기</button>
          </>
        )}
      </div>
      
      <div className={styles.postContent}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
}
