// app/components/DocViewer.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/DocViewer.module.css';

interface DocViewerProps {
    content: string;
    title: string;
}

export default function DocViewer({ content, title }: DocViewerProps) {
    const [parsedContent, setParsedContent] = useState<any>(null);

    useEffect(() => {
        if (!content) {
            setParsedContent(null);
            return;
        }

        try {
            // JSON 형식으로 파싱 시도
            const data = JSON.parse(content);
            setParsedContent(data);
        } catch (e) {
            // 일반 텍스트로 취급
            setParsedContent({
                blocks: [
                    {
                        type: 'paragraph',
                        data: {
                            text: content
                        }
                    }
                ]
            });
        }
    }, [content]);

    if (!parsedContent) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.empty}>내용이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.content}>
                {parsedContent.blocks?.map((block: any, index: number) => {
                    switch (block.type) {
                        case 'header':
                            // 동적 태그 대신 조건부 렌더링 사용
                            const level = block.data.level || 2;
                            return level === 1 ? (
                                <h1 key={index} className={styles.header}>{block.data.text}</h1>
                            ) : level === 2 ? (
                                <h2 key={index} className={styles.header}>{block.data.text}</h2>
                            ) : level === 3 ? (
                                <h3 key={index} className={styles.header}>{block.data.text}</h3>
                            ) : level === 4 ? (
                                <h4 key={index} className={styles.header}>{block.data.text}</h4>
                            ) : level === 5 ? (
                                <h5 key={index} className={styles.header}>{block.data.text}</h5>
                            ) : (
                                <h6 key={index} className={styles.header}>{block.data.text}</h6>
                            );

                        case 'paragraph':
                            return <p key={index} className={styles.paragraph} dangerouslySetInnerHTML={{ __html: block.data.text }}></p>;

                        case 'list':
                            if (block.data.style === 'ordered') {
                                return (
                                    <ol key={index} className={styles.list}>
                                        {block.data.items.map((item: string, i: number) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: item }}></li>
                                        ))}
                                    </ol>
                                );
                            } else {
                                return (
                                    <ul key={index} className={styles.list}>
                                        {block.data.items.map((item: string, i: number) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: item }}></li>
                                        ))}
                                    </ul>
                                );
                            }

                        case 'checklist':
                            return (
                                <div key={index} className={styles.checklist}>
                                    {block.data.items.map((item: any, i: number) => (
                                        <div key={i} className={styles.checklistItem}>
                                            <input type="checkbox" checked={item.checked} readOnly className={styles.checkbox} />
                                            <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                                        </div>
                                    ))}
                                </div>
                            );

                        case 'quote':
                            return (
                                <blockquote key={index} className={styles.quote}>
                                    <p dangerouslySetInnerHTML={{ __html: block.data.text }}></p>
                                    {block.data.caption && <cite>{block.data.caption}</cite>}
                                </blockquote>
                            );

                        case 'delimiter':
                            return <hr key={index} className={styles.delimiter} />;

                        default:
                            return <div key={index}>{JSON.stringify(block.data)}</div>;
                    }
                })}
            </div>
        </div>
    );
}
