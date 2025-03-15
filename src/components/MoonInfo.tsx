import styles from '@/app/services/moon/page.module.css';


interface MoonData {
    riseTime: string;
    setTime: string;
    illumination: number;
    distance: number;
    phase: string;
    magnitude: number;
    moonAge: number;
    phaseImage: string;
    altitude?: number;
    azimuth?: number;
  }
  
  interface MoonInfoProps {
    moonData: MoonData;
  }
  
  export default function MoonInfo({ moonData }: MoonInfoProps) {
    return (
      <div className={styles.infoContainer}>
        <div className={styles.infoCard}>
          <h2>달 정보</h2>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>월출 시간:</span>
              <span className={styles.infoValue}>{moonData.riseTime}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>월몰 시간:</span>
              <span className={styles.infoValue}>{moonData.setTime}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>가시 등급:</span>
              <span className={styles.infoValue}>{moonData.magnitude.toFixed(2)}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>달의 크기(거리):</span>
              <span className={styles.infoValue}>{Math.round(moonData.distance).toLocaleString()} km</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>달의 빛(조명):</span>
              <span className={styles.infoValue}>{(moonData.illumination * 100).toFixed(1)}%</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>달의 위상:</span>
              <span className={styles.infoValue}>{getKoreanPhaseName(moonData.phase)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 달 위상 이름을 한글로 변환하는 함수
  function getKoreanPhaseName(englishName: string): string {
    const phaseMap: {[key: string]: string} = {
      'New Moon': '보름달',
      'Waxing Crescent': '초승달',
      'First Quarter': '상현달',
      'Waxing Gibbous': '상현망간의달',
      'Full Moon': '보름달',
      'Waning Gibbous': '하현망간의달',
      'Last Quarter': '하현달',
      'Waning Crescent': '그믐달'
    };
    
    return phaseMap[englishName] || englishName;
  }