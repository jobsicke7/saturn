'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from '@/styles/blog.module.css';
import { uploadImage, deleteImage } from '@/utils/imageUploader';


interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [isCalloutMenuOpen, setIsCalloutMenuOpen] = useState(false);
  const [isCodeBlockMenuOpen, setIsCodeBlockMenuOpen] = useState(false);
  const [isHeadingMenuOpen, setIsHeadingMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const calloutMenuRef = useRef<HTMLDivElement>(null);
  const codeBlockMenuRef = useRef<HTMLDivElement>(null);
  const headingMenuRef = useRef<HTMLDivElement>(null);

  // 텍스트에 삽입하는 헬퍼 함수
  const insertText = (textToInsert: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    
    // 선택된 텍스트
    const selectedText = value.substring(start, end);
    
    // 선택된 텍스트가 있으면 그것을 대체, 없으면 그냥 삽입
    let newText;
    let newCursorPos;
    
    if (selectedText && textToInsert.includes('$1')) {
      // $1을 선택한 텍스트로 대체
      newText = before + textToInsert.replace('$1', selectedText) + after;
      newCursorPos = start + textToInsert.indexOf('$1') + selectedText.length;
    } else if (selectedText && (
      textToInsert.includes('**') || 
      textToInsert.includes('*') || 
      textToInsert.includes('`') ||
      textToInsert.includes('# ')
    )) {
      // 선택된 텍스트를 포맷팅 (굵게, 기울임, 코드, 제목 등)
      if (textToInsert === '**굵게**') {
        newText = before + '**' + selectedText + '**' + after;
        newCursorPos = start + selectedText.length + 4;
      } else if (textToInsert === '*기울임*') {
        newText = before + '*' + selectedText + '*' + after;
        newCursorPos = start + selectedText.length + 2;
      } else if (textToInsert === '`코드`') {
        newText = before + '`' + selectedText + '`' + after;
        newCursorPos = start + selectedText.length + 2;
      } else if (textToInsert.startsWith('# ')) {
        const headerLevel = textToInsert.split(' ')[0];
        newText = before + headerLevel + ' ' + selectedText + after;
        newCursorPos = start + selectedText.length + headerLevel.length + 1;
      } else {
        newText = before + textToInsert + after;
        newCursorPos = start + textToInsert.length;
      }
    } else {
      // 일반 삽입
      newText = before + textToInsert + after;
      newCursorPos = start + textToInsert.length;
    }
    
    onChange(newText);
    
    // 커서 위치 업데이트를 다음 렌더링 사이클에서 처리
    setCursorPosition(newCursorPos);
  };

  // 선택된 텍스트에 적용
  const applyFormatToSelection = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // 텍스트가 선택되었는지 확인
    if (start === end) {
      insertText(format);
      return;
    }
    
    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    
    let newText;
    let newCursorPos;
    
    switch (format) {
      case 'bold':
        newText = before + '**' + selectedText + '**' + after;
        newCursorPos = end + 4;
        break;
      case 'italic':
        newText = before + '*' + selectedText + '*' + after;
        newCursorPos = end + 2;
        break;
      case 'code':
        newText = before + '`' + selectedText + '`' + after;
        newCursorPos = end + 2;
        break;
      case 'strikethrough':
        newText = before + '~~' + selectedText + '~~' + after;
        newCursorPos = end + 4;
        break;
      case 'h1':
        newText = before + '# ' + selectedText + after;
        newCursorPos = end + 2;
        break;
      case 'h2':
        newText = before + '## ' + selectedText + after;
        newCursorPos = end + 3;
        break;
      case 'h3':
        newText = before + '### ' + selectedText + after;
        newCursorPos = end + 4;
        break;
      default:
        return;
    }
    
    onChange(newText);
    setCursorPosition(newCursorPos);
  };

  // 클릭 이벤트 리스너 추가
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 콜아웃 메뉴 외부 클릭 감지
      if (calloutMenuRef.current && !calloutMenuRef.current.contains(event.target as Node)) {
        setIsCalloutMenuOpen(false);
      }
      
      // 코드 블록 메뉴 외부 클릭 감지
      if (codeBlockMenuRef.current && !codeBlockMenuRef.current.contains(event.target as Node)) {
        setIsCodeBlockMenuOpen(false);
      }
      
      // 제목 메뉴 외부 클릭 감지
      if (headingMenuRef.current && !headingMenuRef.current.contains(event.target as Node)) {
        setIsHeadingMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 커서 위치 복원 처리
  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [cursorPosition]);

  // 줄넘김 처리 개선 (Enter 키 이벤트 처리)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const before = value.substring(0, start);
      const after = value.substring(start);
      
      // 목록 자동 계속
      const lastLine = before.split('\n').pop() || '';
      
      // 숫자 목록 확인
      const numberedListMatch = lastLine.match(/^(\d+)\.\s(.*)$/);
      if (numberedListMatch) {
        const num = parseInt(numberedListMatch[1]);
        
        // 현재 줄이 빈 목록이면 목록 끝내기
        if (numberedListMatch[2].trim() === '') {
          const withoutLastLine = before.substring(0, before.length - lastLine.length);
          onChange(withoutLastLine + '\n' + after);
          setCursorPosition(withoutLastLine.length + 1);
        } else {
          // 다음 숫자로 목록 계속
          const nextItem = `\n${num + 1}. `;
          onChange(before + nextItem + after);
          setCursorPosition(start + nextItem.length);
        }
        e.preventDefault();
        return;
      }
      
      // 글머리 기호 목록 확인
      const bulletListMatch = lastLine.match(/^([*\-+])\s(.*)$/);
      if (bulletListMatch) {
        // 현재 줄이 빈 목록이면 목록 끝내기
        if (bulletListMatch[2].trim() === '') {
          const withoutLastLine = before.substring(0, before.length - lastLine.length);
          onChange(withoutLastLine + '\n' + after);
          setCursorPosition(withoutLastLine.length + 1);
        } else {
          // 같은 글머리 기호로 계속
          const nextItem = `\n${bulletListMatch[1]} `;
          onChange(before + nextItem + after);
          setCursorPosition(start + nextItem.length);
        }
        e.preventDefault();
        return;
      }
      
      // 체크리스트 확인
      const checklistMatch = lastLine.match(/^([\-*]) \[([ x])\]\s(.*)$/);
      if (checklistMatch) {
        // 현재 줄이 빈 체크리스트면 목록 끝내기
        if (checklistMatch[3].trim() === '') {
          const withoutLastLine = before.substring(0, before.length - lastLine.length);
          onChange(withoutLastLine + '\n' + after);
          setCursorPosition(withoutLastLine.length + 1);
        } else {
          // 같은 타입으로 체크리스트 계속
          const nextItem = `\n${checklistMatch[1]} [ ] `;
          onChange(before + nextItem + after);
          setCursorPosition(start + nextItem.length);
        }
        e.preventDefault();
        return;
      }
      
      // 일반 Enter 키 처리
      if (!before.endsWith('\n') && !after.startsWith('\n')) {
        onChange(before + '\n' + after);
        e.preventDefault();
        setCursorPosition(start + 1);
      }
    }
    
    // Tab 키 처리
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // 여러 줄이 선택되었는지 확인
      if (start !== end && value.substring(start, end).includes('\n')) {
        // 여러 줄 들여쓰기 처리
        const selectedText = value.substring(start, end);
        const before = value.substring(0, start);
        const after = value.substring(end);
        
        // Shift + Tab : 내어쓰기, Tab만 : 들여쓰기
        const newSelectedText = e.shiftKey 
          ? selectedText.replace(/^(\t|  )/gm, '') // 탭이나 두 칸 공백 제거
          : selectedText.replace(/^/gm, '  '); // 각 줄 시작에 두 칸 공백 추가
          
        onChange(before + newSelectedText + after);
        
        // 선택 영역 유지, 수정된 텍스트의 길이를 고려하여 위치 조정
        textarea.setSelectionRange(
          start,
          start + newSelectedText.length
        );
      } else {
        // 단일 위치 또는 한 줄 선택일 경우
        insertText('  '); // 두 칸 공백 삽입
      }
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  // 파일 변경 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // 이미지 업로드 처리
      const imageUrl = await uploadImage(file);
      
      // 마크다운 이미지 문법 삽입
      const imageMarkdown = `![${file.name}](${imageUrl})`;
      insertText(imageMarkdown);
      
      // 업로드된 이미지 URL 추적
      setUploadedImages(prev => [...prev, imageUrl]);
      
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  // 사용되지 않는 이미지 관리
  useEffect(() => {
    // 컴포넌트 언마운트 시 사용되지 않는 이미지 삭제
    return () => {
      // 현재 편집기에 사용되고 있는 이미지 URL 추출
      const usedImages = (value.match(/!\[.*?\]\((.*?)\)/g) || [])
        .map(match => {
          const url = match.match(/!\[.*?\]\((.*?)\)/)?.[1];
          return url;
        })
        .filter(Boolean) as string[];
      
      // 업로드되었지만       // 업로드되었지만 사용되지 않는 이미지 찾기
      const unusedImages = uploadedImages.filter(url => !usedImages.includes(url));
      
      // 사용하지 않는 이미지 삭제
      unusedImages.forEach(imageUrl => {
        deleteImage(imageUrl).catch(console.error);
      });
    };
  }, [value, uploadedImages]);

  // 콜아웃 박스 삽입 함수
  const insertCallout = (type: 'info' | 'warning' | 'error' | 'success') => {
    const calloutSymbols = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    };
    
    const calloutTemplate = `
> ${calloutSymbols[type]} **${type.toUpperCase()}**
> 
> 여기에 ${type} 내용을 작성하세요.
`;
    insertText(calloutTemplate);
    // 콜아웃 메뉴 닫기
    setIsCalloutMenuOpen(false);
  };

  // 코드 블록 삽입 함수
  const insertCodeBlock = (language: string) => {
    const codeTemplate = `\`\`\`${language}
// ${language} 코드를 여기에 작성하세요
\`\`\``;
    insertText(codeTemplate);
    // 코드 블록 메뉴 닫기
    setIsCodeBlockMenuOpen(false);
  };

  // 구분선 삽입
  const insertDivider = () => {
    insertText('\n---\n');
  };

  // 체크박스 삽입
  const insertCheckbox = () => {
    insertText('\n- [ ] 할 일');
  };

  // 글머리 기호 목록 삽입
  const insertBulletList = () => {
    insertText('\n- 목록 항목');
  };

  // 번호 목록 삽입
  const insertNumberedList = () => {
    insertText('\n1. 목록 항목');
  };

  // 표 삽입
  const insertTable = () => {
    const tableTemplate = `
| 제목 1 | 제목 2 | 제목 3 |
|--------|--------|--------|
| 내용 1 | 내용 2 | 내용 3 |
| 내용 4 | 내용 5 | 내용 6 |
`;
    insertText(tableTemplate);
  };

  // 인용구 삽입
  const insertQuote = () => {
    insertText('\n> 인용구를 여기에 작성하세요.\n');
  };

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
      
      {!isPreview && (
        <div className={styles.editorToolbar}>
          {/* 텍스트 스타일 버튼 */}
          <div className={styles.toolbarGroup}>
            <button 
              type="button" 
              onClick={() => applyFormatToSelection('bold')}
              className={styles.toolbarButton}
              title="굵게 (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button 
              type="button" 
              onClick={() => applyFormatToSelection('italic')}
              className={styles.toolbarButton}
              title="기울임 (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button 
              type="button" 
              onClick={() => applyFormatToSelection('strikethrough')}
              className={styles.toolbarButton}
              title="취소선"
            >
              <span style={{ textDecoration: 'line-through' }}>S</span>
            </button>
            <button 
              type="button" 
              onClick={() => applyFormatToSelection('code')}
              className={styles.toolbarButton}
              title="인라인 코드"
            >
              <code>{'<>'}</code>
            </button>
          </div>
          
          {/* 제목 버튼 */}
          <div className={styles.toolbarGroup} ref={headingMenuRef}>
            <button 
              type="button" 
              onClick={() => setIsHeadingMenuOpen(!isHeadingMenuOpen)}
              className={styles.toolbarButton}
              title="제목"
            >
              <span className={styles.headingIcon}>H</span>
            </button>
            {isHeadingMenuOpen && (
              <div className={styles.menuDropdown}>
                <button onClick={() => { applyFormatToSelection('h1'); setIsHeadingMenuOpen(false); }} className={styles.menuItem}>
                  <span className={styles.heading1}>제목 1</span>
                </button>
                <button onClick={() => { applyFormatToSelection('h2'); setIsHeadingMenuOpen(false); }} className={styles.menuItem}>
                  <span className={styles.heading2}>제목 2</span>
                </button>
                <button onClick={() => { applyFormatToSelection('h3'); setIsHeadingMenuOpen(false); }} className={styles.menuItem}>
                  <span className={styles.heading3}>제목 3</span>
                </button>
              </div>
            )}
          </div>
          
          {/* 목록 버튼 */}
          <div className={styles.toolbarGroup}>
            <button 
              type="button" 
              onClick={insertBulletList}
              className={styles.toolbarButton}
              title="글머리 기호 목록"
            >
              • 목록
            </button>
            <button 
              type="button" 
              onClick={insertNumberedList}
              className={styles.toolbarButton}
              title="번호 목록"
            >
              1. 목록
            </button>
            <button 
              type="button" 
              onClick={insertCheckbox}
              className={styles.toolbarButton}
              title="체크박스"
            >
              ☐ 체크박스
            </button>
          </div>
          
          {/* 기타 요소 버튼 */}
          <div className={styles.toolbarGroup}>
            <button 
              type="button" 
              onClick={() => insertText('[링크 텍스트](URL)')}
              className={styles.toolbarButton}
              title="링크"
            >
              🔗
            </button>
            <button 
              type="button" 
              onClick={handleImageUpload}
              className={styles.toolbarButton}
              title="이미지 업로드"
            >
              🖼️
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              onClick={insertQuote}
              className={styles.toolbarButton}
              title="인용구"
            >
              ""
            </button>
            <button 
              type="button" 
              onClick={insertTable}
              className={styles.toolbarButton}
              title="표"
            >
              📊
            </button>
            <button 
              type="button" 
              onClick={insertDivider}
              className={styles.toolbarButton}
              title="구분선"
            >
              ―
            </button>
          </div>
          
          {/* 콜아웃 버튼 */}
          <div className={styles.toolbarGroup} ref={calloutMenuRef}>
            <button 
              type="button" 
              onClick={() => setIsCalloutMenuOpen(!isCalloutMenuOpen)}
              className={styles.toolbarButton}
              title="콜아웃 박스"
            >
              💬 콜아웃
            </button>
            {isCalloutMenuOpen && (
              <div className={styles.menuDropdown}>
                <button onClick={() => insertCallout('info')} className={styles.menuItem}>
                  ℹ️ 정보
                </button>
                <button onClick={() => insertCallout('warning')} className={styles.menuItem}>
                  ⚠️ 경고
                </button>
                <button onClick={() => insertCallout('error')} className={styles.menuItem}>
                  ❌ 오류
                </button>
                <button onClick={() => insertCallout('success')} className={styles.menuItem}>
                  ✅ 성공
                </button>
              </div>
            )}
          </div>
          
          {/* 코드 블록 버튼 */}
          <div className={styles.toolbarGroup} ref={codeBlockMenuRef}>
            <button 
              type="button" 
              onClick={() => setIsCodeBlockMenuOpen(!isCodeBlockMenuOpen)}
              className={styles.toolbarButton}
              title="코드 블록"
            >
              {'</>'}
            </button>
            {isCodeBlockMenuOpen && (
              <div className={styles.menuDropdown}>
                <button onClick={() => insertCodeBlock('javascript')} className={styles.menuItem}>JavaScript</button>
                <button onClick={() => insertCodeBlock('typescript')} className={styles.menuItem}>TypeScript</button>
                <button onClick={() => insertCodeBlock('python')} className={styles.menuItem}>Python</button>
                <button onClick={() => insertCodeBlock('java')} className={styles.menuItem}>Java</button>
                <button onClick={() => insertCodeBlock('c')} className={styles.menuItem}>C</button>
                <button onClick={() => insertCodeBlock('cpp')} className={styles.menuItem}>C++</button>
                <button onClick={() => insertCodeBlock('csharp')} className={styles.menuItem}>C#</button>
                <button onClick={() => insertCodeBlock('go')} className={styles.menuItem}>Go</button>
                <button onClick={() => insertCodeBlock('php')} className={styles.menuItem}>PHP</button>
                <button onClick={() => insertCodeBlock('ruby')} className={styles.menuItem}>Ruby</button>
                <button onClick={() => insertCodeBlock('rust')} className={styles.menuItem}>Rust</button>
                <button onClick={() => insertCodeBlock('swift')} className={styles.menuItem}>Swift</button>
                <button onClick={() => insertCodeBlock('kotlin')} className={styles.menuItem}>Kotlin</button>
                <button onClick={() => insertCodeBlock('jsx')} className={styles.menuItem}>JSX</button>
                <button onClick={() => insertCodeBlock('tsx')} className={styles.menuItem}>TSX</button>
                <button onClick={() => insertCodeBlock('html')} className={styles.menuItem}>HTML</button>
                <button onClick={() => insertCodeBlock('css')} className={styles.menuItem}>CSS</button>
                <button onClick={() => insertCodeBlock('scss')} className={styles.menuItem}>SCSS</button>
                <button onClick={() => insertCodeBlock('sql')} className={styles.menuItem}>SQL</button>
                <button onClick={() => insertCodeBlock('bash')} className={styles.menuItem}>Bash</button>
                <button onClick={() => insertCodeBlock('json')} className={styles.menuItem}>JSON</button>
                <button onClick={() => insertCodeBlock('yaml')} className={styles.menuItem}>YAML</button>
                <button onClick={() => insertCodeBlock('markdown')} className={styles.menuItem}>Markdown</button>
                <button onClick={() => insertCodeBlock('plaintext')} className={styles.menuItem}>일반 텍스트</button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={styles.editorContent}>
        {isPreview ? (
          <div className={styles.preview}>
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => (
                    <div className={styles.responsiveImageContainer}>
                      <img className={styles.responsiveImage} {...props} loading="lazy" />
                    </div>
                  ),
                  blockquote: ({ node, children }) => {
                    // 콜아웃 스타일을 적용하기 위한 로직
                    let className = styles.blockquote;
                    const content = String(children);
                    
                    if (content.includes('ℹ️ **INFO**')) {
                      className = `${styles.blockquote} ${styles.calloutInfo}`;
                    } else if (content.includes('⚠️ **WARNING**')) {
                      className = `${styles.blockquote} ${styles.calloutWarning}`;
                    } else if (content.includes('❌ **ERROR**')) {
                      className = `${styles.blockquote} ${styles.calloutError}`;
                    } else if (content.includes('✅ **SUCCESS**')) {
                      className = `${styles.blockquote} ${styles.calloutSuccess}`;
                    }
                    
                    return <blockquote className={className}>{children}</blockquote>;
                  },
                  
                  h1: ({ node, children }) => (
                    <h1 className={styles.h1}>{children}</h1>
                  ),
                  h2: ({ node, children }) => (
                    <h2 className={styles.h2}>{children}</h2>
                  ),
                  h3: ({ node, children }) => (
                    <h3 className={styles.h3}>{children}</h3>
                  ),
                  h4: ({ node, children }) => (
                    <h4 className={styles.h4}>{children}</h4>
                  ),
                  h5: ({ node, children }) => (
                    <h5 className={styles.h5}>{children}</h5>
                  ),
                  h6: ({ node, children }) => (
                    <h6 className={styles.h6}>{children}</h6>
                  ),
                  table: ({ node, children }) => (
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>{children}</table>
                    </div>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className={styles.ul} {...props} />
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className={styles.ol} {...props} />
                  ),
                  li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement> & { children?: React.ReactNode }) => {
                    if (typeof children === 'string') {
                      const checkboxMatch = children.match(/^\[([ x])\] (.*)/);
                      
                      if (checkboxMatch) {
                        return (
                          <li className={styles.checklistItem}>
                            <input
                              type="checkbox"
                              disabled
                              checked={checkboxMatch[1] === 'x'}
                              className={styles.checkbox}
                            />
                            <span>{checkboxMatch[2]}</span>
                          </li>
                        );
                      }
                    }
                    
                    return <li className={styles.li} {...props}>{children}</li>;
                  },                  
                  hr: () => <hr className={styles.hr} />,
                  a: ({ node, ...props }) => (
                    <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className={styles.placeholder}>내용이 없습니다.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.textarea}
            rows={15}
          />
        )}
      </div>
      
      <div className={styles.editorFooter}>
        <p className={styles.markdownHint}>
          마크다운 형식을 지원합니다. 자세한 문법은 도구 모음에서 확인하세요.
        </p>
      </div>
    </div>
  );
}
