'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import MoonPhase from '@/components/MoonPhase';
import MoonInfo from '@/components/MoonInfo';
import DateSelector from '@/components/DateSelector';
import { calculateMoonData } from '@/utils/moonCalculations';
import { getUserLocation } from '@/utils/locationService';
import MoonCalendar from '@/components/MoonCalendar';

// 명확한 타입 정의
interface MoonData {
    riseTime: string;
    setTime: string;
    illumination: number;
    distance: number;
    phase: string;
    magnitude: number;
    altitude: number;
    azimuth: number;
    moonAge: number;
    phaseImage: string;
  }
  
  export default function MoonPage() {
    const [date, setDate] = useState(new Date());
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [moonData, setMoonData] = useState<MoonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchLocation = async () => {
        try {
          const userLocation = await getUserLocation();
          setLocation(userLocation);
        } catch (error) {
          console.error("사용자 위치를 가져올 수 없습니다:", error);
          // 위치 정보 획득 실패 시 기본 위치 사용 (서울)
          setLocation({ latitude: 37.5665, longitude: 126.9780 });
        }
      };
  
      fetchLocation();
    }, []);
  
    useEffect(() => {
      if (location.latitude !== 0 || location.longitude !== 0) {
        setIsLoading(true);
        const data = calculateMoonData(date, location) as MoonData;
        setMoonData(data);
        setIsLoading(false);
      }
    }, [date, location]);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'ArrowLeft') {
            handlePreviousDay();
          } else if (event.key === 'ArrowRight') {
            handleNextDay();
          }
        };
    
        // 키보드 이벤트 리스너 등록
        window.addEventListener('keydown', handleKeyDown);
    
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      }, [date]); // date가 변경될 때마다 리스너를 갱신하여 최신 date 참조
    const handlePreviousDay = () => {
      const prevDay = new Date(date);
      prevDay.setDate(prevDay.getDate() - 1);
      setDate(prevDay);
    };
  
    const handleNextDay = () => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setDate(nextDay);
    };
    
    // 달력에서 날짜 선택 시 호출되는 함수
    const handleDateSelect = (selectedDate: Date) => {
      setDate(selectedDate);
    };
  
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>달 위상</h1>
  
        <DateSelector 
          date={date} 
          onPrevious={handlePreviousDay} 
          onNext={handleNextDay}
        />
  
        {isLoading ? (
          <div className={styles.loading}>달 위상 로딩 중...</div>
        ) : (
          <>
            {moonData && (
              <>
                <MoonPhase 
                  moonAge={moonData.moonAge} 
                  phaseImage={moonData.phaseImage} 
                />
                <MoonInfo moonData={moonData} />
                
                {/* 월간 달 위상 달력 추가 */}
                <MoonCalendar 
                  selectedDate={date}
                  onDateSelect={handleDateSelect}
                  location={location}
                />
              </>
            )}
          </>
        )}
      </div>
    );
  }