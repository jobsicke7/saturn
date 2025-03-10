'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/blog.module.css';
import MarkdownEditor from '@/components/MarkdownEditor';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  mainImage: string;
}

export default function EditBlogPost() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status } = useSession();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    // 로딩 중이거나 인증되지 않은 경우
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
    
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/posts/${id}`);
        
        if (!response.ok) {
          throw new Error('Post not found');
        }
        
        const data = await response.json();
        setPost(data.post);
        setTitle(data.post.title);
        setContent(data.post.content);
        setMainImage(data.post.mainImage || '');
        
        // 권한 확인 (관리자이거나 글 작성자인 경우)
        if (session.user?.email === data.post.author.email) {
          setIsAuthorized(true);
        } else {
          // 관리자 확인
          const adminCheckResponse = await fetch(`/api/admin/check?email=${session.user?.email}`);
          const adminData = await adminCheckResponse.json();
          
          if (adminData.isAdmin) {
            setIsAuthorized(true);
          } else {
            router.push('/blog');
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        router.push('/blog');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, router, session, status]);
  
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 이미지 파일 타입 검증
    if (!file.type.includes('image')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
      
      const data = await response.json();
      setMainImage(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          mainImage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      router.push(`/blog/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('포스트 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }
  
  if (!isAuthorized || !post) {
    return null;
  }
  
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>블로그 포스트 수정</h1>
      
      <form onSubmit={handleSubmit} className={styles.postForm}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.titleInput}
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="mainImage" className={styles.label}>대표 이미지</label>
          <div className={styles.imageUploadContainer}>
            <label className={styles.uploadButton}>
              이미지 선택
              <input
                type="file"
                id="mainImage"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.hiddenInput}
                disabled={uploading}
              />
            </label>
            
            {uploading && <p>업로드 중...</p>}
            
            {mainImage && (
              <div className={styles.imagePreview}>
                <Image
                  src={mainImage}
                  alt="Preview"
                  width={300}
                  height={200}
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>내용</label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="내용을 입력하세요 (마크다운 형식을 지원합니다)"
          />
        </div>
        
        <div className={styles.formActions}>
          <Link href={`/blog/${id}`} className={styles.cancelButton}>
            취소
          </Link>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || uploading}
          >
            {submitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
