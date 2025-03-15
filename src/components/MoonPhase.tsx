import Image from 'next/image';
import styles from '@/app/services/moon/page.module.css';

interface MoonPhaseProps {
    moonAge: number;
    phaseImage: string;
  }
  
  export default function MoonPhase({ moonAge, phaseImage }: MoonPhaseProps) {
    return (
      <div className={styles.moonPhaseContainer}>
        <div className={styles.moonImageWrapper}>
          <Image 
            src={`/moon-phase/${phaseImage}`}
            alt={`달 나이 ${moonAge}일의 위상`}
            width={320}
            height={320}
            priority
            className={styles.moonImage}
          />
        </div>
        <div className={styles.phaseLabel}>
          <span className={styles.moonAge}>달의 나이: {moonAge.toFixed(1)}일</span>
        </div>
      </div>
    );
  }