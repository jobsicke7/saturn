'use client';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import styles from './TranslateButton.module.css';

interface TranslateButtonProps {
  onTranslate: (language: string) => void;
  isTranslated: boolean;
}

export default function TranslateButton({ onTranslate, isTranslated }: TranslateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'original', name: '원문' },
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
  ];

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (langCode: string) => {
    onTranslate(langCode);
    setIsOpen(false);
  };

  return (
    <div className={styles.translateContainer}>
      <button 
        onClick={handleClick} 
        className={`${styles.translateButton} ${isTranslated ? styles.active : ''}`}
      >
        <Globe size={18} />
        {isTranslated ? '번역됨' : '번역'}
      </button>
      {isOpen && (
        <div className={styles.languageDropdown}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={styles.languageOption}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}