import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/app/services/moon/page.module.css';
import { calculateMoonData } from '@/utils/moonCalculations';
interface MoonCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    location: { latitude: number; longitude: number };
  }
  
  export default function MoonCalendar({ selectedDate, onDateSelect, location }: MoonCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate));
    const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; phaseImage: string | null }>>([]);
    
    // 달력 날짜 생성 함수
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // 해당 월의
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      // 첫째 날의 요일 (0: 일요일, 6: 토요일)
      const firstDayWeekday = firstDayOfMonth.getDay();
      
      // 이전 달의 날짜들 (달력 시작 부분 채우기)
      const prevMonthDays = [];
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        prevMonthDays.push({
          date,
          phaseImage: null // 초기값, 아래에서 계산
        });
      }
      
      // 현재 달의 날짜들
      const currentMonthDays = [];
      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const date = new Date(year, month, day);
        currentMonthDays.push({
          date,
          phaseImage: null // 초기값, 아래에서 계산
        });
      }
      
      // 다음 달의 날짜들 (달력 끝 부분 채우기)
      const nextMonthDays = [];
      const totalDaysShown = 42; // 6주 표시 (6 * 7)
      const remainingDays = totalDaysShown - (prevMonthDays.length + currentMonthDays.length);
      
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        nextMonthDays.push({
          date,
          phaseImage: null // 초기값, 아래에서 계산
        });
      }
      
      // 모든 날짜 합치기
      const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
      
      // 각 날짜에 대한 달 위상 이미지 계산
      return allDays.map(dayObj => {
        const moonData = calculateMoonData(dayObj.date, location);
        return {
          ...dayObj,
          phaseImage: moonData.phaseImage
        };
      });
    };
    
    // 이전 달로 이동
    const goToPrevMonth = () => {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() - 1);
        return newDate;
      });
    };
    
    // 다음 달로 이동
    const goToNextMonth = () => {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + 1);
        return newDate;
      });
    };
    
    // 선택된 날짜가 변경될 때 현재 월 업데이트
    useEffect(() => {
      const newMonth = new Date(selectedDate);
      newMonth.setDate(1); // 월의 첫날로 설정
      setCurrentMonth(newMonth);
    }, [selectedDate]);
    
    // 현재 월이 변경될 때 달력 날짜 업데이트
    useEffect(() => {
      setCalendarDays(generateCalendarDays());
    }, [currentMonth, location]);
    
    // 날짜 형식 변환
    const formatMonth = (date: Date) => {
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    };
    
    // 날짜가 현재 월에 속하는지 확인
    const isCurrentMonth = (date: Date) => {
      return date.getMonth() === currentMonth.getMonth();
    };
    
    // 날짜가 오늘인지 확인
    const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && 
             date.getMonth() === today.getMonth() && 
             date.getFullYear() === today.getFullYear();
    };
    
    // 날짜가 선택된 날짜인지 확인
    const isSelected = (date: Date) => {
      return date.getDate() === selectedDate.getDate() && 
             date.getMonth() === selectedDate.getMonth() && 
             date.getFullYear() === selectedDate.getFullYear();
    };
    
    return (
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <h3>월간 달 위상 달력</h3>
          <div className={styles.calendarNavigation}>
            <button onClick={goToPrevMonth} className={styles.calendarNavButton}>
              ←
            </button>
            <span className={styles.calendarMonthTitle}>{formatMonth(currentMonth)}</span>
            <button onClick={goToNextMonth} className={styles.calendarNavButton}>
              →
            </button>
          </div>
        </div>
        
        <div className={styles.calendar}>
          <div className={styles.weekdays}>
            <div>일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div>토</div>
          </div>
          
          <div className={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`${styles.calendarDay} 
                           ${isCurrentMonth(day.date) ? '' : styles.otherMonth}
                           ${isToday(day.date) ? styles.today : ''}
                           ${isSelected(day.date) ? styles.selectedDay : ''}`}
                onClick={() => onDateSelect(day.date)}
              >
                <div className={styles.calendarDayNumber}>
                  {day.date.getDate()}
                </div>
                {day.phaseImage && (
                  <div className={styles.calendarMoonImage}>
                    <Image 
                      src={`/moon-phase/${day.phaseImage}`}
                      alt={`달 위상 ${day.date.getDate()}일`}
                      width={24}
                      height={24}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }