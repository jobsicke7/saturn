// components/DocEditor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/DocEditor.module.css';

// 클라이언트 사이드에서만 로드되도록 동적 임포트
const EditorJS = dynamic(() => import('@editorjs/editorjs'), {
    ssr: false,
    loading: () => <p>에디터 로딩 중...</p>
});

interface DocEditorProps {
    initialContent: string;
    docType: 'privacy' | 'terms';
    onSave: (content: string) => Promise<void>;
}

export default function DocEditor({ initialContent, docType, onSave }: DocEditorProps) {
    const editorRef = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 서버 사이드 렌더링 시 실행 방지
        if (typeof window === 'undefined') return;

        // Editor.js 관련 모듈 동적 로드
        const initEditor = async () => {
            const EditorJS = (await import('@editorjs/editorjs')).default;
            const Header = (await import('@editorjs/header')).default;
            const List = (await import('@editorjs/list')).default;
            const Checklist = (await import('@editorjs/checklist')).default;
            const Quote = (await import('@editorjs/quote')).default;
            const Delimiter = (await import('@editorjs/delimiter')).default;
            const Marker = (await import('@editorjs/marker')).default;
            const Paragraph = (await import('@editorjs/paragraph')).default;

            try {
                // JSON 파싱 시도 (JSON 형식이 아니면 텍스트로 처리)
                let parsedContent;
                try {
                    parsedContent = initialContent ? JSON.parse(initialContent) : {};
                } catch (e) {
                    // JSON이 아니면 텍스트로 처리
                    parsedContent = {
                        blocks: [
                            {
                                type: 'paragraph',
                                data: {
                                    text: initialContent || ''
                                }
                            }
                        ]
                    };
                }

                if (editorRef.current) {
                    editorRef.current.destroy();
                }

                editorRef.current = new EditorJS({
                    holder: 'editorjs',
                    tools: {
                        header: {
                            class: Header,
                            inlineToolbar: true,
                        },
                        list: {
                            class: List,
                            inlineToolbar: true,
                        },
                        checklist: {
                            class: Checklist,
                            inlineToolbar: true,
                        },
                        quote: {
                            class: Quote,
                            inlineToolbar: true,
                        },
                        delimiter: Delimiter,
                        marker: Marker,
                        paragraph: {
                            class: Paragraph,
                            inlineToolbar: true,
                        }
                    },
                    data: parsedContent,
                    placeholder: '내용을 입력하세요...',
                    onChange: () => {
                        // onChange 로직 추가
                    }
                });

                setIsLoaded(true);
            } catch (error) {
                console.error('Editor initialization error:', error);
            }
        };

        initEditor();

        // 컴포넌트 언마운트 시 에디터 인스턴스 제거
        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
            }
        };
    }, [initialContent]);

    const handleSave = async () => {
        if (!editorRef.current) return;

        setIsSaving(true);
        try {
            const savedData = await editorRef.current.save();
            await onSave(JSON.stringify(savedData));
            alert('저장되었습니다.');
        } catch (error) {
            console.error('Save error:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.editorContainer}>
            <div className={styles.toolbar}>
                <h1>{docType === 'privacy' ? '개인정보처리방침' : '이용약관'} 편집</h1>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSaving || !isLoaded}
                >
                    {isSaving ? '저장 중...' : '저장'}
                </button>
            </div>
            <div id="editorjs" className={styles.editor}></div>
        </div>
    );
}
