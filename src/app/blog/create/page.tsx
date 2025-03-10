'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/blog.module.css';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function CreateBlogPost() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // 로딩 중이거나 인증되지 않은 경우
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
    
    // 관리자 여부 확인
    const checkAdminStatus = async () => {
      try {
        const response = await fetch(`/api/admin/check?email=${session.user.email}`);
        const data = await response.json();
        
        if (!data.isAdmin) {
          // 관리자가 아니면 블로그 메인으로 리디렉션
          router.push('/blog');
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/blog');
      }
    };
    
    checkAdminStatus();
  }, [session, status, router]);
  
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
      
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          mainImage,
          author: {
            name: session?.user?.name || 'Anonymous',
            email: session?.user?.email,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      const data = await response.json();
      router.push(`/blog/${data.post._id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('포스트 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 관리자가 아니거나 로딩 중이면 아무것도 표시하지 않음
  if (!isAdmin && status !== 'loading') {
    return null;
  }
  
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>새 블로그 포스트 작성</h1>
      
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
          <Link href="/blog" className={styles.cancelButton}>
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

          