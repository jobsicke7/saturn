import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '@/styles/blog.module.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className={styles.markdownEditor}>
      <div className={styles.editorHeader}>
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`${styles.editorTab} ${!isPreview ? styles.activeTab : ''}`}
        >
          작성
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`${styles.editorTab} ${isPreview ? styles.activeTab : ''}`}
        >
          미리보기
        </button>
      </div>
      
      <div className={styles.editorContent}>
        {isPreview ? (
          <div className={styles.preview}>
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className={styles.placeholder}>내용이 없습니다</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={styles.textarea}
            rows={15}
          />
        )}
      </div>
      
      <div className={styles.editorFooter}>
        <p className={styles.markdownHint}>
          마크다운 형식을 지원합니다. # 제목, ** 굵게 **, * 기울임 *, [링크](url), ![이미지](url) 등
        </p>
      </div>
    </div>
  );
}
