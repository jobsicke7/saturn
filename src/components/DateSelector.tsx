import styles from '@/app/services/moon/page.module.css';

interface DateSelectorProps {
    date: Date;
    onPrevious: () => void;
    onNext: () => void;
  }
  
  export default function DateSelector({ date, onPrevious, onNext }: DateSelectorProps) {
    // 한국어 날짜 포맷 사용
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
    
    return (
      <div className={styles.dateSelector}>
        <button 
          className={styles.navigationButton} 
          onClick={onPrevious}
          aria-label="이전 날짜"
        >
          ←
        </button>
        
        <h2 className={styles.dateHeading}>{formattedDate}</h2>
        
        <button 
          className={styles.navigationButton} 
          onClick={onNext}
          aria-label="다음 날짜"
        >
          →
        </button>
      </div>
    );
  }