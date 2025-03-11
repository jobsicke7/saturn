'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/blog.module.css';
import SearchBar from '@/components/SearchBar';

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
}

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch blog posts
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog/posts');
        const data = await response.json();
        setPosts(data.posts);
        setFilteredPosts(data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
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
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength = 150) => {
    // HTML 태그 제거
    const textContent = content.replace(/<[^>]*>?/gm, '');
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to highlight search query in title
  const highlightTitle = (title: string) => {
    if (!searchQuery.trim()) return title;
    
    const parts = title.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? 
            <span key={i} className={styles.highlight}>{part}</span> : part
        )}
      </>
    );
  };
  
  return (
    <div className={styles.blogContainer}>
      <div className={styles.banner}>
        <Image 
          src="/images/BannerBackground.webp" 
          alt="Blog Banner" 
          width={1200} 
          height={300} 
          className={styles.bannerImage}
        />
      </div>
      
      <SearchBar onSearch={handleSearch} />
      
      <div className={styles.blogHeader}>
        <h1>Blog</h1>
        {isAdmin && (
          <Link href="/blog/create" className={styles.createButton}>
            작성하기
          </Link>
        )}
      </div>
      
      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : filteredPosts.length > 0 ? (
        <div className={styles.postsGrid}>
          {filteredPosts.map(post => (
            <Link href={`/blog/${post._id}`} key={post._id} className={styles.postCard}>
              {post.mainImage && (
                <div className={styles.postImageContainer}>
                  <Image 
                    src={post.mainImage} 
                    alt={post.title} 
                    width={300} 
                    height={200}
                    className={styles.postThumbnail}
                  />
                </div>
              )}
              <div className={styles.postInfo}>
                <h2 className={styles.postTitle}>
                  <Link href={`/blog/${post._id}`}>
                    {highlightTitle(post.title)}
                  </Link>
                </h2>
                <p className={styles.postDate}>
                  {formatDate(post.createdAt)} · {post.author.name}
                </p>
                <p className={styles.postExcerpt}>
                  {truncateContent(post.content)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
