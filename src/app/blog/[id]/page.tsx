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
        if (!response.ok) {
          throw new Error('Post not found');
        }
        
        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPost();
    }
  }, [id]);
  
  useEffect(() => {
    // 관리자 여부 확인
    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        const response = await fetch(`/api/admin/check?email=${session.user.email}`);
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    };
    
    if (session) {
      checkAdminStatus();
    }
  }, [session]);
  
  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/blog');
      } else {
        const data = await response.json();
        alert(`게시글 삭제에 실패했습니다: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('오류가 발생했습니다.');
    }
  };
  
  const handleEdit = () => {
    router.push(`/blog/edit/${id}`);
  };
  
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }
  
  if (!post) {
    return <div className={styles.notFound}>게시글을 찾을 수 없습니다.</div>;
  }
  
  // 작성자이거나 관리자인 경우 수정/삭제 가능
  const canEditDelete = isAdmin || (session?.user?.email === post.author.email);
  
  return (
    <div className={styles.postDetailContainer}>
      <Link href="/blog" className={styles.backLink}>
        ← 블로그 목록으로
      </Link>
      
      <h1 className={styles.postTitle}>{post.title}</h1>
      
      <div className={styles.postMeta}>
        <span className={styles.postAuthor}>{post.author.name}</span>
        <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
        {post.updatedAt !== post.createdAt && (
          <span className={styles.postUpdated}>
            (수정됨: {formatDate(post.updatedAt)})
          </span>
        )}
      </div>
      
      {post.mainImage && (
        <div className={styles.postMainImage}>
          <Image 
            src={post.mainImage} 
            alt={post.title} 
            width={800} 
            height={400}
            className={styles.mainImage}
          />
        </div>
      )}
      
      <div className={styles.postActions}>
        <button 
          onClick={handleShare} 
          className={styles.shareButton}
          title="Share"
        >
          {copied ? '복사됨!' : '공유하기'}
        </button>
        
        {canEditDelete && (
          <>
            <button 
              onClick={handleEdit} 
              className={styles.editButton}
            >
              수정하기
            </button>
            <button 
              onClick={handleDelete} 
              className={styles.deleteButton}
            >
              삭제하기
            </button>
          </>
        )}
      </div>
      
      <div className={styles.postContent}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
